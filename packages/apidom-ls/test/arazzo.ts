import fs from 'node:fs';
import path from 'node:path';
import { assert } from 'chai';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { options as referenceOptions, mergeOptions } from '@swagger-api/apidom-reference';
import { DiagnosticSeverity, Position } from 'vscode-languageserver-types';
import { fileURLToPath } from 'node:url';

import getLanguageService from '../src/apidom-language-service.ts';
import {
  CompletionContext,
  LanguageService,
  LanguageServiceContext,
  ValidationContext,
} from '../src/apidom-language-types.ts';
import { metadata } from './metadata.ts';
import { logPerformance, logLevel } from './test-utils.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name: string): string =>
  fs.readFileSync(path.join(__dirname, 'fixtures', 'arazzo', name)).toString();

describe('apidom-ls-arazzo', function () {
  const context: LanguageServiceContext = {
    metadata: metadata(),
    performanceLogs: logPerformance,
    logLevel,
  };
  const languageService: LanguageService = getLanguageService(context);
  const validationContext: ValidationContext = {
    comments: DiagnosticSeverity.Error,
    maxNumberOfProblems: 100,
    relatedInformation: false,
  };

  const validate = async (name: string, languageId: string) => {
    const doc = TextDocument.create(`foo://bar/${name}`, languageId, 0, fixture(name));
    return languageService.doValidation(doc, validationContext);
  };

  after(function () {
    languageService.terminate();
  });

  it('accepts a valid 1.0.1 YAML document', async function () {
    this.timeout(10000);
    assert.deepEqual(await validate('valid-1.0.1.yaml', 'yaml'), []);
  });

  it('accepts a valid 1.1.0 JSON document using 1.1 fields', async function () {
    this.timeout(10000);
    assert.deepEqual(await validate('valid-1.1.0.json', 'json'), []);
  });

  it('accepts the 1.1.0 AsyncAPI sample', async function () {
    this.timeout(10000);
    assert.deepEqual(await validate('valid-1.1.0-asyncapi.yaml', 'yaml'), []);
  });

  it('rejects the asyncapi source description type below 1.1', async function () {
    this.timeout(10000);
    const result = await validate('invalid-1.0.1-asyncapi-source.yaml', 'yaml');
    assert.deepEqual(
      result.map((d) => d.message),
      ["'type' must be one of allowed values: openapi, arazzo"],
    );
  });

  it('does not apply parameter and action rules to Reusable Objects or valid references', async function () {
    this.timeout(10000);
    assert.deepEqual(await validate('reusable-objects.yaml', 'yaml'), []);
  });

  it('reports missing required fields', async function () {
    this.timeout(10000);
    const messages = (await validate('missing-required.yaml', 'yaml')).map((d) => d.message);
    ["should always have a 'version' field", "should always have a 'url' field"].forEach((m) =>
      assert.include(messages, m),
    );
    assert.include(messages, "should always have a 'workflowId' field");
    assert.include(messages, "should always have a 'stepId' field");
  });

  it('reports not-allowed fields and enum violations', async function () {
    this.timeout(10000);
    const messages = (await validate('invalid-fields.yaml', 'yaml')).map((d) => d.message);
    assert.include(messages, 'Object includes not allowed fields');
    assert.include(messages, "'type' must be one of allowed values: openapi, arazzo");
    assert.include(messages, "'in' must be one of allowed values: path, query, header, cookie");
  });

  it('rejects 1.1-only fields in a 1.0.1 document', async function () {
    this.timeout(10000);
    const result = await validate('version-gated-1.0.1.yaml', 'yaml');
    const notAllowed = result.filter((d) => d.message === 'Object includes not allowed fields');
    // root ($self) and step (timeout)
    assert.lengthOf(notAllowed, 2);
  });

  it('reports broken cross references and duplicate ids', async function () {
    this.timeout(10000);
    const result = await validate('cross-references.yaml', 'yaml');
    const count = (m: string) => result.filter((d) => d.message === m).length;
    assert.equal(count("'stepId' does not match any step in this workflow"), 1);
    assert.equal(count("'workflowId' does not match any workflow in this document"), 2);
    assert.equal(count("'stepId' must be unique within the workflow"), 2);
    assert.equal(count("'workflowId' must be unique among all workflows"), 2);
    assert.equal(count("'name' must be unique among all source descriptions"), 2);
  });

  it('offers field completion in a step', async function () {
    this.timeout(10000);
    const text =
      'arazzo: 1.0.1\nworkflows:\n  - workflowId: a\n    steps:\n      - stepId: s\n        \n';
    const doc = TextDocument.create('foo://bar/c.yaml', 'yaml', 0, text);
    const completionContext: CompletionContext = {
      maxNumberOfItems: 100,
      enableLSPFilter: false,
    };
    const result = await languageService.doCompletion(
      doc,
      { textDocument: doc, position: Position.create(5, 8) },
      completionContext,
    );
    const labels = result!.items.map((i) => i.label);
    assert.include(labels, 'operationId');
    assert.notInclude(labels, 'timeout');
  });

  it('shows hover documentation for a fixed field', async function () {
    this.timeout(10000);
    const doc = TextDocument.create('foo://bar/h.yaml', 'yaml', 0, fixture('valid-1.0.1.yaml'));
    const result = await languageService.doHover(doc, Position.create(0, 2));
    assert.isDefined(result);
    assert.match(JSON.stringify(result), /arazzo/i);
  });

  it('completes declared step outputs as runtime expressions', async function () {
    const text =
      'arazzo: 1.1.0\nworkflows:\n  - workflowId: w\n    steps:\n      - stepId: first\n        operationId: op\n        outputs:\n          token: $response.body\n      - stepId: second\n        operationId: op\n        parameters:\n          - name: token\n            in: header\n            value: $steps.first.outputs.\n';
    const document = TextDocument.create('foo://bar/expressions.yaml', 'yaml', 0, text);
    const position = document.positionAt(
      text.indexOf('$steps.first.outputs.') + '$steps.first.outputs.'.length,
    );
    const result = await languageService.doCompletion(document, position);
    const item = result!.items.find(
      (candidate) => candidate.label === '$steps.first.outputs.token',
    );
    assert.isDefined(item);
    assert.deepEqual(item!.textEdit, {
      range: { start: { line: 13, character: 19 }, end: { line: 13, character: 40 } },
      newText: '$steps.first.outputs.token',
    });
  });

  it('completes and hovers source operations through the shared resolver', async function () {
    const service = getLanguageService({
      ...context,
      sourceDocuments: async () => ({
        openapi: '3.1.0',
        paths: { '/resolved': { $ref: '#/components/pathItems/Resolved' } },
        components: {
          pathItems: {
            Resolved: { get: { operationId: 'resolvedOperation', summary: 'Resolved operation' } },
          },
        },
      }),
    });
    const text =
      'arazzo: 1.1.0\nsourceDescriptions:\n  - name: api\n    url: https://example.com/api.json\n    type: openapi\nworkflows:\n  - workflowId: w\n    steps:\n      - stepId: s\n        operationId: $sourceDescriptions.api.\n';
    try {
      const document = TextDocument.create('foo://bar/targets.yaml', 'yaml', 0, text);
      const result = await service.doCompletion(
        document,
        document.positionAt(
          text.indexOf('$sourceDescriptions.api.') + '$sourceDescriptions.api.'.length,
        ),
      );
      const item = result!.items.find(
        (candidate) => candidate.label === '$sourceDescriptions.api.resolvedOperation',
      );
      assert.isDefined(item);
      assert.equal(item!.detail, 'GET /resolved');
      const complete = text.replace(
        '$sourceDescriptions.api.',
        '$sourceDescriptions.api.resolvedOperation',
      );
      const hoverDocument = TextDocument.create('foo://bar/target-hover.yaml', 'yaml', 0, complete);
      const hover = await service.doHover(
        hoverDocument,
        hoverDocument.positionAt(complete.indexOf('resolvedOperation') + 3),
      );
      assert.match(JSON.stringify(hover), /GET \/resolved/);
      assert.match(JSON.stringify(hover), /Resolved operation/);
    } finally {
      service.terminate();
    }
  });

  it('completes source targets inside JSON strings without replacing quotes', async function () {
    const service = getLanguageService({
      ...context,
      sourceDocuments: async () => ({
        openapi: '3.1.0',
        paths: { '/pets': { get: { operationId: 'listPets', summary: 'List pets' } } },
      }),
    });
    const prefix = '$sourceDescriptions.api.';
    const text = JSON.stringify({
      arazzo: '1.1.0',
      sourceDescriptions: [{ name: 'api', url: 'https://example.com/api.json', type: 'openapi' }],
      workflows: [{ workflowId: 'w', steps: [{ stepId: 's', operationId: prefix }] }],
    });
    const document = TextDocument.create('foo://bar/target-completion.json', 'json', 0, text);
    const offset = text.indexOf(prefix);
    try {
      const result = await service.doCompletion(
        document,
        document.positionAt(offset + prefix.length),
      );
      assert.deepEqual(
        result!.items.find((item) => item.label === `${prefix}listPets`),
        {
          label: `${prefix}listPets`,
          kind: 18,
          detail: 'GET /pets',
          documentation: 'List pets',
          textEdit: {
            range: {
              start: document.positionAt(offset),
              end: document.positionAt(offset + prefix.length),
            },
            newText: `${prefix}listPets`,
          },
        },
      );
    } finally {
      service.terminate();
    }
  });

  it('keeps runtime step completion scoped to its enclosing workflow', async function () {
    const text =
      'arazzo: 1.1.0\nworkflows:\n  - workflowId: first\n    steps:\n      - stepId: private\n        operationId: op\n  - workflowId: second\n    steps:\n      - stepId: local\n        operationId: op\n        outputs:\n          next: $steps.\n';
    const document = TextDocument.create('foo://bar/scoped.yaml', 'yaml', 0, text);
    const result = await languageService.doCompletion(
      document,
      document.positionAt(text.indexOf('$steps.') + 7),
    );
    assert.deepEqual(
      result!.items.filter((item) => item.label.startsWith('$steps.')).map((item) => item.label),
      ['$steps.local.outputs.', '$steps.local.outputs.next'],
    );
  });

  it('resolves relative source and path-item refs using the supplied base URI', async function () {
    const requests: string[] = [];
    const service = getLanguageService({
      ...context,
      referenceOptions: mergeOptions(referenceOptions, {
        resolve: { baseURI: 'https://example.com/specs/workflow.yaml' },
      }),
      sourceDocuments: async ({ url }) => {
        requests.push(url);
        if (url === 'https://example.com/specs/api.json')
          return { openapi: '3.1.0', paths: { '/relative': { $ref: './items/path.json' } } };
        if (url === 'https://example.com/specs/items/path.json')
          return { get: { operationId: 'relativeOperation' } };
        return undefined;
      },
    });
    const prefix = '$sourceDescriptions.api.';
    const text = `arazzo: 1.1.0\nsourceDescriptions:\n  - name: api\n    url: ./api.json\n    type: openapi\nworkflows:\n  - workflowId: w\n    steps:\n      - stepId: s\n        operationId: ${prefix}\n`;
    const document = TextDocument.create('foo://bar/relative.yaml', 'yaml', 0, text);
    try {
      const result = await service.doCompletion(
        document,
        document.positionAt(text.indexOf(prefix) + prefix.length),
      );
      assert.include(
        result!.items.map((item) => item.label),
        `${prefix}relativeOperation`,
      );
      assert.deepEqual(requests, [
        'https://example.com/specs/api.json',
        'https://example.com/specs/items/path.json',
      ]);
    } finally {
      service.terminate();
    }
  });
});
