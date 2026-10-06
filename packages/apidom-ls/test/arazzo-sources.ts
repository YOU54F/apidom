import { assert } from 'chai';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DiagnosticSeverity } from 'vscode-languageserver-types';

import getLanguageService from '../src/apidom-language-service.ts';
import {
  LanguageService,
  LanguageServiceContext,
  SourceDocumentProvider,
  ValidationContext,
} from '../src/apidom-language-types.ts';
import ApilintCodes from '../src/config/codes.ts';
import { metadata } from './metadata.ts';
import { logPerformance, logLevel } from './test-utils.ts';

/**
 * Source checks: operationId / operationPath / channelPath / workflowId are resolved against the
 * Source Description documents supplied by the `sourceDocuments` provider. Nothing is reported for a
 * source that is not loaded (no provider, unknown document, throwing provider, unparsable text).
 */

const OPENAPI = JSON.stringify({
  openapi: '3.0.3',
  info: { title: 'Pets', version: '1' },
  paths: {
    '/pet/findByStatus': { get: { operationId: 'findPetsByStatus', responses: {} } },
    '/pet': { post: { operationId: 'addPet', responses: {} } },
  },
});

const ASYNCAPI2 = `
asyncapi: 2.6.0
info: {title: Chat, version: '1'}
channels:
  chat/messages:
    publish:
      operationId: sendMessage
      message: {payload: {type: string}}
`;

const ASYNCAPI3 = `
asyncapi: 3.0.0
info: {title: Chat, version: '1'}
channels:
  messages:
    address: chat/messages
operations:
  sendMessage:
    action: send
    channel: {$ref: '#/channels/messages'}
`;

const ARAZZO_SRC = `
arazzo: 1.0.1
info: {title: Other, version: '1'}
sourceDescriptions:
  - {name: api, url: https://example.com/o.json, type: openapi}
workflows:
  - workflowId: login
    steps:
      - stepId: s
        operationId: $sourceDescriptions.api.x
`;

const OPENAPI_REFS = JSON.stringify({
  openapi: '3.0.3',
  info: { title: 'Refs', version: '1' },
  paths: {
    '/local': { $ref: '#/components/pathItems/Local' },
    '/remote': { $ref: 'paths/remote.json' },
    '/gone': { $ref: 'paths/gone.json' },
    '/dangling': { $ref: '#/components/pathItems/Nope' },
  },
  components: {
    pathItems: { Local: { get: { operationId: 'localOp', responses: {} } } },
  },
});

const OPENAPI_QS = JSON.stringify({
  openapi: '3.2.0',
  info: { title: 'QS', version: '1' },
  paths: {
    '/search': {
      get: {
        operationId: 'search',
        parameters: [
          { name: 'q', in: 'querystring', content: { 'application/x-www-form-urlencoded': {} } },
        ],
        responses: {},
      },
    },
    '/data': {
      get: {
        operationId: 'data',
        parameters: [{ name: 'q', in: 'querystring', content: { 'application/json': {} } }],
        responses: {},
      },
    },
    '/plain': {
      get: {
        operationId: 'plain',
        parameters: [{ name: 'a', in: 'query', schema: { type: 'string' } }],
        responses: {},
      },
    },
  },
});

const DOCS: Record<string, string> = {
  'https://example.com/refs.json': OPENAPI_REFS,
  'https://example.com/paths/remote.json': JSON.stringify({
    get: { operationId: 'remoteOp', responses: {} },
  }),
  'https://example.com/qs.json': OPENAPI_QS,
  'https://example.com/openapi.json': OPENAPI,
  'https://example.com/asyncapi2.yaml': ASYNCAPI2,
  'https://example.com/asyncapi3.yaml': ASYNCAPI3,
  'https://example.com/other.arazzo.yaml': ARAZZO_SRC,
  'https://example.com/broken.yaml': '{ not: [valid',
};

const src = (name: string, url: string, type: string) =>
  `  - name: ${name}\n    url: ${url}\n    type: ${type}\n`;

const arazzo = (sources: string, steps: string) =>
  `arazzo: 1.1.0\ninfo:\n  title: T\n  version: 1.0.0\nsourceDescriptions:\n${sources}workflows:\n  - workflowId: wf\n    steps:\n${steps
    .split('\n')
    .map((l) => `      ${l}`)
    .join('\n')}\n`;

const OA = src('pets', 'https://example.com/openapi.json', 'openapi');
const AA2 = src('chat2', 'https://example.com/asyncapi2.yaml', 'asyncapi');
const AA3 = src('chat3', 'https://example.com/asyncapi3.yaml', 'asyncapi');
const REFS = src('refs', 'https://example.com/refs.json', 'openapi');
const QS = src('qs', 'https://example.com/qs.json', 'openapi');
const AZ = src('other', 'https://example.com/other.arazzo.yaml', 'arazzo');

describe('apidom-ls-arazzo-sources', function () {
  const context: LanguageServiceContext = {
    metadata: metadata(),
    performanceLogs: logPerformance,
    logLevel,
    sourceDocuments: async ({ url }) => DOCS[url],
  };
  const languageService: LanguageService = getLanguageService(context);
  const validationContext: ValidationContext = {
    comments: DiagnosticSeverity.Error,
    maxNumberOfProblems: 100,
    relatedInformation: false,
  };
  let counter = 0;
  const validate = async (text: string, service: LanguageService = languageService) => {
    counter += 1;
    return service.doValidation(
      TextDocument.create(`foo://bar/sources-${counter}.yaml`, 'yaml', 0, text),
      validationContext,
    );
  };
  const codes = async (text: string, service?: LanguageService) =>
    (await validate(text, service)).map((d) => Number(d.code));

  after(function () {
    languageService.terminate();
  });

  describe('OpenAPI source', function () {
    it('accepts a known operationId via $sourceDescriptions', async function () {
      const text = arazzo(
        OA,
        '- stepId: s1\n  operationId: $sourceDescriptions.pets.findPetsByStatus',
      );
      assert.deepEqual(await validate(text), []);
    });
    it('accepts a bare operationId with a single source', async function () {
      assert.deepEqual(await validate(arazzo(OA, '- stepId: s1\n  operationId: addPet')), []);
    });
    it('reports an unknown operationId', async function () {
      const diagnostics = await validate(
        arazzo(OA, '- stepId: s1\n  operationId: $sourceDescriptions.pets.nope'),
      );
      assert.include(
        diagnostics.map((d) => Number(d.code)),
        ApilintCodes.ARAZZO1_SOURCE_OPERATION_ID_NOT_FOUND,
      );
      const d = diagnostics.find(
        (x) => Number(x.code) === ApilintCodes.ARAZZO1_SOURCE_OPERATION_ID_NOT_FOUND,
      )!;
      assert.equal(d.severity, DiagnosticSeverity.Error);
      assert.equal(d.range.start.line, 12);
    });
    it('reports an unknown bare operationId with a single source', async function () {
      assert.include(
        await codes(arazzo(OA, '- stepId: s1\n  operationId: nope')),
        ApilintCodes.ARAZZO1_SOURCE_OPERATION_ID_NOT_FOUND,
      );
    });
    it('does not guess for a bare operationId with several sources', async function () {
      assert.deepEqual(await validate(arazzo(OA + AA3, '- stepId: s1\n  operationId: nope')), []);
    });
    it('accepts an operationPath JSON pointer into the source', async function () {
      const text = arazzo(
        OA,
        "- stepId: s1\n  operationPath: '{$sourceDescriptions.pets.url}#/paths/~1pet~1findByStatus/get'",
      );
      assert.deepEqual(await validate(text), []);
    });
    it('reports an operationPath that does not resolve', async function () {
      const text = arazzo(
        OA,
        "- stepId: s1\n  operationPath: '{$sourceDescriptions.pets.url}#/paths/~1pet~1missing/get'",
      );
      assert.include(await codes(text), ApilintCodes.ARAZZO1_SOURCE_OPERATION_PATH_NOT_FOUND);
    });
  });

  describe('AsyncAPI sources', function () {
    it('accepts a v2 operationId and a v3 operation key', async function () {
      assert.deepEqual(
        await validate(
          arazzo(
            AA2 + AA3,
            '- stepId: s1\n  operationId: $sourceDescriptions.chat2.sendMessage\n- stepId: s2\n  operationId: $sourceDescriptions.chat3.sendMessage',
          ),
        ),
        [],
      );
    });
    it('reports an unknown AsyncAPI operationId', async function () {
      assert.include(
        await codes(
          arazzo(AA2 + AA3, '- stepId: s1\n  operationId: $sourceDescriptions.chat3.missing'),
        ),
        ApilintCodes.ARAZZO1_SOURCE_OPERATION_ID_NOT_FOUND,
      );
      assert.include(
        await codes(
          arazzo(AA2 + AA3, '- stepId: s1\n  operationId: $sourceDescriptions.chat2.missing'),
        ),
        ApilintCodes.ARAZZO1_SOURCE_OPERATION_ID_NOT_FOUND,
      );
    });
    it('accepts and rejects channelPath pointers (v2 and v3)', async function () {
      const ok = arazzo(
        AA2 + AA3,
        "- stepId: s1\n  channelPath: '{$sourceDescriptions.chat2.url}#/channels/chat~1messages'\n  action: send\n- stepId: s2\n  channelPath: '{$sourceDescriptions.chat3.url}#/channels/messages'\n  action: send",
      );
      assert.notInclude(await codes(ok), ApilintCodes.ARAZZO1_SOURCE_CHANNEL_PATH_NOT_FOUND);
      const bad = arazzo(
        AA2 + AA3,
        "- stepId: s1\n  channelPath: '{$sourceDescriptions.chat3.url}#/channels/unknown'\n  action: send",
      );
      assert.include(await codes(bad), ApilintCodes.ARAZZO1_SOURCE_CHANNEL_PATH_NOT_FOUND);
    });
  });

  describe('Arazzo source', function () {
    it('accepts a workflowId defined in the other document', async function () {
      assert.deepEqual(
        await validate(arazzo(AZ, '- stepId: s1\n  workflowId: $sourceDescriptions.other.login')),
        [],
      );
    });
    it('reports a workflowId missing from the other document', async function () {
      assert.include(
        await codes(arazzo(AZ, '- stepId: s1\n  workflowId: $sourceDescriptions.other.logout')),
        ApilintCodes.ARAZZO1_SOURCE_WORKFLOW_ID_NOT_FOUND,
      );
    });
  });

  describe('$ref inside source documents', function () {
    const op = (id: string) =>
      arazzo(REFS, `- stepId: s1\n  operationId: $sourceDescriptions.refs.${id}`);
    const nf = ApilintCodes.ARAZZO1_SOURCE_OPERATION_ID_NOT_FOUND;
    it('follows a local fragment path-item $ref', async function () {
      assert.deepEqual(await validate(op('localOp')), []);
    });
    it('follows a relative path-item $ref supplied by the provider', async function () {
      assert.deepEqual(await validate(op('remoteOp')), []);
    });
    it('still reports an operationId that is nowhere', async function () {
      // `paths/gone.json` is not available: the index is incomplete, so stay silent
      assert.notInclude(await codes(op('nope')), nf);
    });
    it('is silent when a $ref cannot be followed', async function () {
      assert.notInclude(await codes(op('inGoneDoc')), nf);
    });
    it('reports when every $ref resolved and the id is missing', async function () {
      const service = getLanguageService({
        ...context,
        sourceDocuments: async ({ url }) =>
          url === 'https://example.com/refs.json'
            ? JSON.stringify({
                openapi: '3.0.3',
                info: { title: 'r', version: '1' },
                paths: { '/a': { $ref: '#/components/pathItems/A' } },
                components: { pathItems: { A: { get: { operationId: 'a', responses: {} } } } },
              })
            : DOCS[url],
      });
      try {
        assert.include(await codes(op('missing'), service), nf);
        assert.deepEqual(await validate(op('a'), service), []);
      } finally {
        service.terminate();
      }
    });
    it('passes referencedFrom for a relative $ref', async function () {
      const seen: Array<[string, string | undefined]> = [];
      const service = getLanguageService({
        ...context,
        sourceDocuments: async (request) => {
          seen.push([request.url, request.referencedFrom]);
          return DOCS[request.url];
        },
      });
      try {
        await validate(op('remoteOp'), service);
        assert.deepInclude(seen, [
          'https://example.com/paths/remote.json',
          'https://example.com/refs.json',
        ]);
      } finally {
        service.terminate();
      }
    });
    it('stays silent for cyclic path-item references', async function () {
      const service = getLanguageService({
        ...context,
        sourceDocuments: async () => ({
          openapi: '3.1.0',
          paths: { '/cycle': { $ref: '#/paths/~1cycle' } },
        }),
      });
      try {
        assert.deepEqual(await validate(op('unknown'), service), []);
      } finally {
        service.terminate();
      }
    });
  });

  describe('querystring parameters', function () {
    const step = (id: string, value: string, extra = '') =>
      arazzo(
        QS,
        `- stepId: s1\n  operationId: $sourceDescriptions.qs.${id}\n  parameters:\n    - name: q\n      in: querystring\n      value: ${value}\n${extra}`,
      );
    const mismatch = ApilintCodes.ARAZZO1_SOURCE_QUERYSTRING_MEDIA_TYPE_MISMATCH;
    const notDefined = ApilintCodes.ARAZZO1_SOURCE_QUERYSTRING_NOT_DEFINED;
    it('resolves path-item parameters relative to their own document', async function () {
      const service = getLanguageService({
        ...context,
        sourceDocuments: async ({ url }) => {
          if (url === 'https://example.com/qs.json') {
            return {
              openapi: '3.2.0',
              paths: {
                '/search': {
                  parameters: [{ $ref: '#/components/parameters/query' }],
                  get: { $ref: 'operations/search.json' },
                },
              },
              components: {
                parameters: {
                  query: { in: 'querystring', content: { 'application/json': {} } },
                },
              },
            };
          }
          if (url === 'https://example.com/operations/search.json') {
            return { operationId: 'search', responses: {} };
          }
          return undefined;
        },
      });
      try {
        const text = step('search', 'a=1');
        const document = TextDocument.create('foo://bar/range.yaml', 'yaml', 0, text);
        const offset = text.indexOf('a=1');
        assert.deepEqual(await validate(text, service), [
          {
            range: {
              start: document.positionAt(offset),
              end: document.positionAt(offset + 3),
            },
            message:
              "'querystring' value is not valid JSON (the operation's parameter content is application/json)",
            severity: DiagnosticSeverity.Warning,
            code: mismatch,
            source: 'apilint',
          },
        ]);
      } finally {
        service.terminate();
      }
    });
    it('accepts a value matching the media type', async function () {
      assert.notInclude(await codes(step('search', 'a=1&b=2')), mismatch);
      assert.notInclude(await codes(step('data', '\'{"a": 1}\'')), mismatch);
    });
    it('checks querystring content addressed through operationPath', async function () {
      const text = step('data', '\'{"a": 1}\'').replace(
        'operationId: $sourceDescriptions.qs.data',
        "operationPath: '{$sourceDescriptions.qs.url}#/paths/~1data/get'",
      );
      assert.deepEqual(await validate(text), []);
    });
    it('reports JSON text for a form-urlencoded querystring', async function () {
      const found = await validate(step('search', '\'{"a": 1}\''));
      const d = found.find((x) => Number(x.code) === mismatch);
      assert.isDefined(d);
      assert.equal(d!.severity, DiagnosticSeverity.Warning);
    });
    it('reports invalid JSON for a JSON querystring', async function () {
      assert.include(await codes(step('data', 'a=1')), mismatch);
    });
    it('does not judge runtime expressions', async function () {
      assert.notInclude(await codes(step('data', '$inputs.q')), mismatch);
    });
    it('reports a querystring parameter the operation does not define', async function () {
      assert.include(await codes(step('plain', 'a=1')), notDefined);
    });
    it('is silent when the operation is not resolved', async function () {
      const service = getLanguageService({ ...context, sourceDocuments: async () => undefined });
      try {
        const found = await codes(step('search', '\'{"a": 1}\''), service);
        assert.notInclude(found, mismatch);
        assert.notInclude(found, notDefined);
      } finally {
        service.terminate();
      }
    });
  });

  describe('bare workflowId referring to an Arazzo source', function () {
    it('requires the runtime expression form', async function () {
      assert.include(
        await codes(arazzo(AZ, '- stepId: s1\n  workflowId: login')),
        ApilintCodes.ARAZZO1_SOURCE_WORKFLOW_ID_EXPRESSION_REQUIRED,
      );
    });
    it('accepts a bare workflowId of the document itself', async function () {
      assert.notInclude(
        await codes(arazzo(AZ, '- stepId: s1\n  workflowId: wf')),
        ApilintCodes.ARAZZO1_SOURCE_WORKFLOW_ID_EXPRESSION_REQUIRED,
      );
    });
    it('stays silent when the other document is not loaded', async function () {
      const service = getLanguageService({ ...context, sourceDocuments: async () => undefined });
      try {
        assert.notInclude(
          await codes(arazzo(AZ, '- stepId: s1\n  workflowId: login'), service),
          ApilintCodes.ARAZZO1_SOURCE_WORKFLOW_ID_EXPRESSION_REQUIRED,
        );
      } finally {
        service.terminate();
      }
    });
  });

  describe('sources that are not loaded', function () {
    const bad = arazzo(OA, '- stepId: s1\n  operationId: $sourceDescriptions.pets.nope');
    const sourceCodes = [
      ApilintCodes.ARAZZO1_SOURCE_OPERATION_ID_NOT_FOUND,
      ApilintCodes.ARAZZO1_SOURCE_OPERATION_PATH_NOT_FOUND,
      ApilintCodes.ARAZZO1_SOURCE_CHANNEL_PATH_NOT_FOUND,
      ApilintCodes.ARAZZO1_SOURCE_WORKFLOW_ID_NOT_FOUND,
    ];
    const withProvider = (provider?: SourceDocumentProvider) =>
      getLanguageService({ ...context, sourceDocuments: provider });
    const assertNoSourceDiagnostics = async (provider?: SourceDocumentProvider) => {
      const service = withProvider(provider);
      try {
        const found = await codes(bad, service);
        assert.deepEqual(
          found.filter((c) => sourceCodes.includes(c)),
          [],
        );
      } finally {
        service.terminate();
      }
    };
    it('no provider configured', async function () {
      await assertNoSourceDiagnostics(undefined);
    });
    it('provider has no such document', async function () {
      await assertNoSourceDiagnostics(async () => undefined);
    });
    it('provider throws (unreachable source)', async function () {
      await assertNoSourceDiagnostics(async () => {
        throw new Error('ECONNREFUSED');
      });
    });
    it('provider returns unparsable content', async function () {
      await assertNoSourceDiagnostics(async () => DOCS['https://example.com/broken.yaml']);
    });
    it('provider returns an already parsed object', async function () {
      const service = withProvider(async () => JSON.parse(OPENAPI));
      try {
        assert.include(await codes(bad, service), sourceCodes[0]);
      } finally {
        service.terminate();
      }
    });
    it('an unreachable source does not hide checks against a loaded one', async function () {
      const service = withProvider(async ({ name }) => {
        if (name === 'chat3') throw new Error('unreachable');
        return DOCS['https://example.com/openapi.json'];
      });
      try {
        const found = await codes(
          arazzo(
            OA + AA3,
            '- stepId: s1\n  operationId: $sourceDescriptions.pets.nope\n- stepId: s2\n  operationId: $sourceDescriptions.chat3.nope',
          ),
          service,
        );
        assert.equal(found.filter((c) => c === sourceCodes[0]).length, 1);
      } finally {
        service.terminate();
      }
    });
  });
});
