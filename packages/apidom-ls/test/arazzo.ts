import fs from 'node:fs';
import path from 'node:path';
import { assert } from 'chai';
import { TextDocument } from 'vscode-languageserver-textdocument';
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
});
