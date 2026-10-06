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

const DOCS: Record<string, string> = {
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
