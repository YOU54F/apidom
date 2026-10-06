import { assert } from 'chai';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DiagnosticSeverity } from 'vscode-languageserver-types';

import getLanguageService from '../src/apidom-language-service.ts';
import {
  LanguageService,
  LanguageServiceContext,
  ValidationContext,
} from '../src/apidom-language-types.ts';
import ApilintCodes from '../src/config/codes.ts';
import { metadata } from './metadata.ts';
import { logPerformance, logLevel } from './test-utils.ts';

/**
 * Conformance table for the normative rules of the Arazzo 1.0.0 / 1.0.1 / 1.1.0 specification
 * that the language service checks. Every rule has a document that must produce no diagnostic
 * at all and a document that must produce the rule's code.
 *
 * Resolving `operationId`, `operationPath`, `channelPath` and `workflowId` against the loaded
 * source documents is covered separately (test/arazzo-sources.ts); it only reports when a source
 * document has been supplied. A missing `arazzo` field cannot be reported (without it the document
 * is not recognised as Arazzo); a malformed or unknown value is detected by shape (`arazzo` plus
 * `sourceDescriptions` / `workflows`) and reported as an unknown-version warning.
 */

interface DocOptions {
  ver?: string;
  arazzo?: string | null;
  info?: string;
  srcs?: string;
  top?: string;
  wf?: string;
  steps?: string;
  wfs?: string;
}

const indent = (text: string, n: number): string =>
  text
    .split('\n')
    .map((l) => (l.length > 0 ? ' '.repeat(n) + l : l))
    .join('\n');

const DEFAULT_STEPS = '- stepId: s1\n  operationId: op';

const doc = (o: DocOptions = {}): string => {
  const arazzoLine = o.arazzo === null ? '' : `arazzo: ${o.arazzo ?? o.ver ?? '1.0.1'}\n`;
  const info = o.info ?? 'info:\n  title: T\n  version: 1.0.0\n';
  const srcs =
    o.srcs ??
    'sourceDescriptions:\n  - name: api\n    url: https://example.com/openapi.json\n    type: openapi\n';
  const wf = o.wf ? `${indent(o.wf, 4)}\n` : '';
  const wfs =
    o.wfs ??
    `workflows:\n  - workflowId: wf\n${wf}    steps:\n${indent(o.steps ?? DEFAULT_STEPS, 6)}\n`;
  return `${arazzoLine}${info}${srcs}${o.top ?? ''}${wfs}`;
};

/** a document whose only step is `s1` with the given extra properties */
const step = (body: string, o: DocOptions = {}): string =>
  doc({ ...o, steps: `- stepId: s1\n${indent(body, 2)}` });

interface Rule {
  rule: string;
  code: number;
  valid: string;
  invalid: string;
}

const rules: Rule[] = [];
const rule = (name: string, code: number, valid: string, invalid: string) =>
  rules.push({ rule: name, code, valid, invalid });

const C = ApilintCodes;
const OP = 'operationId: op';
const ONE_STEP_WITH = (extra: string, o: DocOptions = {}) => step(`${OP}\n${extra}`, o);
const V11: DocOptions = { ver: '1.1.0' };
/** a step targeting an AsyncAPI channel */
const CH = (extra: string, o: DocOptions = {}) =>
  doc({ ...o, steps: `- stepId: s1\n  channelPath: ch\n${indent(extra, 2)}` });
const ASYNC_SRC = '  - name: ev\n    url: https://example.com/asyncapi.json\n    type: asyncapi';

// ---------------------------------------------------------------- required fields
rule(
  'Arazzo Object: info is required',
  C.ARAZZO1_ARAZZO_SPECIFICATION_FIELD_INFO_REQUIRED,
  doc(),
  doc({ info: '' }),
);
rule(
  'Arazzo Object: sourceDescriptions is required',
  C.ARAZZO1_ARAZZO_SPECIFICATION_FIELD_SOURCE_DESCRIPTIONS_REQUIRED,
  doc(),
  doc({ srcs: '' }),
);
rule(
  'Arazzo Object: workflows is required',
  C.ARAZZO1_ARAZZO_SPECIFICATION_FIELD_WORKFLOWS_REQUIRED,
  doc(),
  doc({ wfs: '' }),
);
rule(
  'Info Object: title is required',
  C.ARAZZO1_INFO_FIELD_TITLE_REQUIRED,
  doc(),
  doc({ info: 'info:\n  version: 1.0.0\n' }),
);
rule(
  'Info Object: version is required',
  C.ARAZZO1_INFO_FIELD_VERSION_REQUIRED,
  doc(),
  doc({ info: 'info:\n  title: T\n' }),
);
rule(
  'Source Description Object: name is required',
  C.ARAZZO1_SOURCE_DESCRIPTION_FIELD_NAME_REQUIRED,
  doc(),
  doc({ srcs: 'sourceDescriptions:\n  - url: https://example.com/a.json\n' }),
);
rule(
  'Source Description Object: url is required',
  C.ARAZZO1_SOURCE_DESCRIPTION_FIELD_URL_REQUIRED,
  doc(),
  doc({ srcs: 'sourceDescriptions:\n  - name: api\n' }),
);
rule(
  'Workflow Object: workflowId is required',
  C.ARAZZO1_WORKFLOW_FIELD_WORKFLOW_ID_REQUIRED,
  doc(),
  doc({ wfs: `workflows:\n  - steps:\n      - stepId: s1\n        ${OP}\n` }),
);
rule(
  'Workflow Object: steps is required',
  C.ARAZZO1_WORKFLOW_FIELD_STEPS_REQUIRED,
  doc(),
  doc({ wfs: 'workflows:\n  - workflowId: wf\n' }),
);
rule(
  'Step Object: stepId is required',
  C.ARAZZO1_STEP_FIELD_STEP_ID_REQUIRED,
  doc(),
  doc({ steps: `- ${OP}` }),
);
rule(
  'Parameter Object: name is required',
  C.ARAZZO1_PARAMETER_FIELD_NAME_REQUIRED,
  ONE_STEP_WITH('parameters:\n  - name: p\n    in: query\n    value: v'),
  ONE_STEP_WITH('parameters:\n  - in: query\n    value: v'),
);
rule(
  'Parameter Object: value is required',
  C.ARAZZO1_PARAMETER_FIELD_VALUE_REQUIRED,
  ONE_STEP_WITH('parameters:\n  - name: p\n    in: query\n    value: v'),
  ONE_STEP_WITH('parameters:\n  - name: p\n    in: query'),
);
rule(
  'Success Action Object: name is required',
  C.ARAZZO1_SUCCESS_ACTION_FIELD_NAME_REQUIRED,
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: end'),
  ONE_STEP_WITH('onSuccess:\n  - type: end'),
);
rule(
  'Success Action Object: type is required',
  C.ARAZZO1_SUCCESS_ACTION_FIELD_TYPE_REQUIRED,
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: end'),
  ONE_STEP_WITH('onSuccess:\n  - name: a'),
);
rule(
  'Failure Action Object: name is required',
  C.ARAZZO1_FAILURE_ACTION_FIELD_NAME_REQUIRED,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: end'),
  ONE_STEP_WITH('onFailure:\n  - type: end'),
);
rule(
  'Failure Action Object: type is required',
  C.ARAZZO1_FAILURE_ACTION_FIELD_TYPE_REQUIRED,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: end'),
  ONE_STEP_WITH('onFailure:\n  - name: a'),
);
rule(
  'Criterion Object: condition is required',
  C.ARAZZO1_CRITERION_FIELD_CONDITION_REQUIRED,
  ONE_STEP_WITH('successCriteria:\n  - condition: $statusCode == 200'),
  ONE_STEP_WITH('successCriteria:\n  - context: $response.body'),
);
rule(
  'Request Body Object: payload replacement target is required',
  C.ARAZZO1_PAYLOAD_REPLACEMENT_FIELD_TARGET_REQUIRED,
  ONE_STEP_WITH('requestBody:\n  replacements:\n    - target: /a\n      value: v'),
  ONE_STEP_WITH('requestBody:\n  replacements:\n    - value: v'),
);
rule(
  'Request Body Object: payload replacement value is required',
  C.ARAZZO1_PAYLOAD_REPLACEMENT_FIELD_VALUE_REQUIRED,
  ONE_STEP_WITH('requestBody:\n  replacements:\n    - target: /a\n      value: v'),
  ONE_STEP_WITH('requestBody:\n  replacements:\n    - target: /a'),
);
rule(
  'Selector Object (1.1): context is required',
  C.ARAZZO1_SELECTOR_INCOMPLETE,
  ONE_STEP_WITH(
    'outputs:\n  o:\n    context: $response.body\n    selector: /a\n    type: jsonpath',
    V11,
  ),
  ONE_STEP_WITH('outputs:\n  o:\n    selector: /a', V11),
);
const COMP0 =
  'components:\n  parameters:\n    p:\n      name: p\n      in: query\n      value: v\n';
rule(
  'Reusable Object: reference is required',
  C.ARAZZO1_REFERENCE_FIELD_REFERENCE_REQUIRED,
  ONE_STEP_WITH('parameters:\n  - reference: $components.parameters.p', { top: COMP0 }),
  ONE_STEP_WITH('parameters:\n  - value: v\n    $ref: x'),
);

const COMP = 'components:\n  parameters:\n    p:\n      name: p\n      in: query\n      value: v\n';
const PARAM = (extra = '') => `parameters:\n  - name: p\n    in: query\n    value: v${extra}`;
const srcsOf = (...lines: string[]) => `sourceDescriptions:\n${lines.join('\n')}\n`;
const API = '  - name: api\n    url: https://example.com/openapi.json\n    type: openapi';
const wfsOf = (...wfs: string[]) => `workflows:\n${wfs.join('\n')}\n`;
const WF = (id: string, extra = '') =>
  `  - workflowId: ${id}\n${extra}    steps:\n      - stepId: s1\n        ${OP}`;

// the reusable object needs its component
rule(
  'Reusable Object: reference is required (component declared)',
  C.ARAZZO1_REFERENCE_FIELD_REFERENCE_REQUIRED,
  ONE_STEP_WITH('parameters:\n  - reference: $components.parameters.p', { top: COMP }),
  ONE_STEP_WITH('parameters:\n  - value: v', { top: COMP }).replace(
    '- value: v',
    '- $ref: x\n    value: v',
  ),
);

// ---------------------------------------------------------------- enums
rule(
  'Source Description Object: type is openapi or arazzo',
  C.ARAZZO1_SOURCE_DESCRIPTION_FIELD_TYPE_ENUM,
  doc({ srcs: srcsOf('  - name: a\n    url: https://e.com/a.yaml\n    type: arazzo') }),
  doc({ srcs: srcsOf('  - name: a\n    url: https://e.com/a.yaml\n    type: soap') }),
);
rule(
  'Source Description Object: asyncapi type requires 1.1.0',
  C.ARAZZO1_SOURCE_DESCRIPTION_FIELD_TYPE_ENUM,
  doc({
    ver: '1.1.0',
    srcs: srcsOf('  - name: a\n    url: https://e.com/a.yaml\n    type: asyncapi'),
  }),
  doc({ srcs: srcsOf('  - name: a\n    url: https://e.com/a.yaml\n    type: asyncapi') }),
);
rule(
  'Step Object (1.1): action is send or receive',
  C.ARAZZO1_STEP_FIELD_ACTION_ENUM,
  CH('action: send', V11),
  CH('action: publish', V11),
);
rule(
  'Parameter Object: in is path, query, header or cookie',
  C.ARAZZO1_PARAMETER_FIELD_IN_ENUM,
  ONE_STEP_WITH('parameters:\n  - name: p\n    in: cookie\n    value: v'),
  ONE_STEP_WITH('parameters:\n  - name: p\n    in: body\n    value: v'),
);
rule(
  'Success Action Object: type is end or goto',
  C.ARAZZO1_SUCCESS_ACTION_FIELD_TYPE_ENUM,
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: goto\n    stepId: s1'),
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: retry'),
);
rule(
  'Failure Action Object: type is end, goto or retry',
  C.ARAZZO1_FAILURE_ACTION_FIELD_TYPE_ENUM,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: retry'),
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: ignore'),
);
rule(
  'Criterion Object: type is simple, regex, jsonpath or xpath',
  C.ARAZZO1_CRITERION_FIELD_TYPE_ENUM,
  ONE_STEP_WITH('successCriteria:\n  - condition: ^2\n    context: $statusCode\n    type: regex'),
  ONE_STEP_WITH('successCriteria:\n  - condition: ^2\n    context: $statusCode\n    type: glob'),
);
rule(
  'Criterion Object: type may be an Expression Type Object',
  C.ARAZZO1_CRITERION_FIELD_TYPE_ENUM,
  ONE_STEP_WITH(
    'successCriteria:\n  - condition: $[0]\n    context: $response.body\n    type:\n      type: jsonpath\n      version: draft-goessner-dispatch-jsonpath-00',
  ),
  ONE_STEP_WITH('successCriteria:\n  - condition: $[0]\n    context: $response.body\n    type: 5'),
);
rule(
  'Criterion Object: context is required when type is specified',
  C.ARAZZO1_CRITERION_FIELD_CONTEXT_REQUIRED_WITH_TYPE,
  ONE_STEP_WITH('successCriteria:\n  - condition: ^2\n    context: $statusCode\n    type: regex'),
  ONE_STEP_WITH('successCriteria:\n  - condition: ^2\n    type: regex'),
);
const ET = (body: string, o: DocOptions = {}) =>
  ONE_STEP_WITH(
    `successCriteria:\n  - condition: $[0]\n    context: $response.body\n    type:\n${indent(body, 6)}`,
    o,
  );
rule(
  'Expression Type Object: type is jsonpath or xpath',
  C.ARAZZO1_EXPRESSION_TYPE_FIELD_TYPE_ENUM,
  ET('type: xpath\nversion: xpath-30'),
  ET('type: regex\nversion: xpath-30'),
);
rule(
  'Expression Type Object: jsonpath only has version draft-goessner-dispatch-jsonpath-00',
  C.ARAZZO1_EXPRESSION_TYPE_FIELD_VERSION_ENUM,
  ET('type: jsonpath\nversion: draft-goessner-dispatch-jsonpath-00'),
  ET('type: jsonpath\nversion: xpath-30'),
);
rule(
  'Expression Type Object: xpath versions are xpath-10, xpath-20, xpath-30',
  C.ARAZZO1_EXPRESSION_TYPE_FIELD_VERSION_ENUM,
  ET('type: xpath\nversion: xpath-10'),
  ET('type: xpath\nversion: xpath-40'),
);
rule(
  'Expression Type Object: type is required',
  C.ARAZZO1_EXPRESSION_TYPE_FIELD_TYPE_REQUIRED,
  ET('type: xpath\nversion: xpath-30'),
  ET('version: xpath-30'),
);
rule(
  'Expression Type Object: version is required',
  C.ARAZZO1_EXPRESSION_TYPE_FIELD_VERSION_REQUIRED,
  ET('type: xpath\nversion: xpath-30'),
  ET('type: xpath'),
);
rule(
  'Selector Object (1.1): type is jsonpointer, jsonpath or xpath',
  C.ARAZZO1_SELECTOR_FIELD_TYPE_ENUM,
  ONE_STEP_WITH(
    'outputs:\n  o:\n    context: $response.body\n    selector: /a\n    type: jsonpointer',
    V11,
  ),
  ONE_STEP_WITH(
    'outputs:\n  o:\n    context: $response.body\n    selector: /a\n    type: regex',
    V11,
  ),
);
rule(
  'Selector Object (1.1): selector is required',
  C.ARAZZO1_SELECTOR_INCOMPLETE,
  ONE_STEP_WITH(
    'outputs:\n  o:\n    context: $response.body\n    selector: /a\n    type: jsonpath',
    V11,
  ),
  ONE_STEP_WITH('outputs:\n  o:\n    context: $response.body', V11),
);
const PR = (extra: string, o: DocOptions = {}) =>
  ONE_STEP_WITH(
    `requestBody:\n  replacements:\n    - target: /a\n      value: v\n      ${extra}`,
    o,
  );
rule(
  'Payload Replacement Object (1.1): targetSelectorType is jsonpointer, jsonpath or xpath',
  C.ARAZZO1_PAYLOAD_REPLACEMENT_FIELD_TARGET_SELECTOR_TYPE_ENUM,
  PR('targetSelectorType: jsonpath', V11),
  PR('targetSelectorType: regex', V11),
);

// ---------------------------------------------------------------- structure
rule(
  'Arazzo Object: sourceDescriptions has at least one item',
  C.ARAZZO1_ARAZZO_SPECIFICATION_FIELD_SOURCE_DESCRIPTIONS_MIN_ITEMS,
  doc(),
  doc({ srcs: 'sourceDescriptions: []\n' }),
);
rule(
  'Arazzo Object: workflows has at least one item',
  C.ARAZZO1_ARAZZO_SPECIFICATION_FIELD_WORKFLOWS_MIN_ITEMS,
  doc(),
  doc({ wfs: 'workflows: []\n' }),
);
rule(
  'Workflow Object: steps has at least one item',
  C.ARAZZO1_WORKFLOW_FIELD_STEPS_MIN_ITEMS,
  doc(),
  doc({ wfs: 'workflows:\n  - workflowId: wf\n    steps: []\n' }),
);
rule(
  'Step Object (1.0): exactly one of operationId, operationPath, workflowId',
  C.ARAZZO1_STEP_OPERATION_TARGET_ONE_OF,
  doc({ steps: '- stepId: s1\n  operationPath: "{$sourceDescriptions.api.url}#/paths/~1a/get"' }),
  doc({ steps: '- stepId: s1\n  operationId: op\n  workflowId: wf' }),
);
rule(
  'Step Object (1.0): a step with no target is rejected',
  C.ARAZZO1_STEP_OPERATION_TARGET_ONE_OF,
  doc({ steps: '- stepId: s1\n  workflowId: wf' }),
  doc({ steps: '- stepId: s1\n  description: d' }),
);
rule(
  'Step Object (1.1): exactly one of operationId, operationPath, workflowId, channelPath',
  C.ARAZZO1_STEP_OPERATION_TARGET_ONE_OF,
  doc({ ver: '1.1.0', steps: '- stepId: s1\n  channelPath: ch' }),
  doc({ ver: '1.1.0', steps: '- stepId: s1\n  channelPath: ch\n  operationId: op' }),
);
rule(
  'Parameter Object: in is required for operation steps',
  C.ARAZZO1_PARAMETER_FIELD_IN_REQUIRED_FOR_OPERATION,
  ONE_STEP_WITH(PARAM()),
  ONE_STEP_WITH('parameters:\n  - name: p\n    value: v'),
);
rule(
  'Parameter Object: in is not required for workflowId steps',
  C.ARAZZO1_PARAMETER_FIELD_IN_REQUIRED_FOR_OPERATION,
  doc({ steps: '- stepId: s1\n  workflowId: wf\n  parameters:\n    - name: p\n      value: v' }),
  doc({ steps: '- stepId: s1\n  operationId: op\n  parameters:\n    - name: p\n      value: v' }),
);
rule(
  'Parameter Object: unique by name and in',
  C.ARAZZO1_PARAMETERS_UNIQUE,
  ONE_STEP_WITH(
    'parameters:\n  - name: p\n    in: query\n    value: v\n  - name: p\n    in: header\n    value: v',
  ),
  ONE_STEP_WITH(
    'parameters:\n  - name: p\n    in: query\n    value: v\n  - name: p\n    in: query\n    value: w',
  ),
);
rule(
  'Workflow Object: parameters unique by name and in',
  C.ARAZZO1_PARAMETERS_UNIQUE,
  doc({ wf: 'parameters:\n  - name: p\n    in: query\n    value: v' }),
  doc({
    wf: 'parameters:\n  - name: p\n    in: query\n    value: v\n  - name: p\n    in: query\n    value: w',
  }),
);
rule(
  'Step Object: onSuccess actions unique by name',
  C.ARAZZO1_ACTIONS_UNIQUE,
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: end\n  - name: b\n    type: end'),
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: end\n  - name: a\n    type: end'),
);
rule(
  'Step Object: onFailure actions unique by name',
  C.ARAZZO1_ACTIONS_UNIQUE,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: end\n  - name: b\n    type: end'),
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: end\n  - name: a\n    type: end'),
);
rule(
  'Workflow Object: successActions unique by name',
  C.ARAZZO1_ACTIONS_UNIQUE,
  doc({ wf: 'successActions:\n  - name: a\n    type: end' }),
  doc({ wf: 'successActions:\n  - name: a\n    type: end\n  - name: a\n    type: end' }),
);
rule(
  'Workflow Object: failureActions unique by name',
  C.ARAZZO1_ACTIONS_UNIQUE,
  doc({ wf: 'failureActions:\n  - name: a\n    type: end' }),
  doc({ wf: 'failureActions:\n  - name: a\n    type: end\n  - name: a\n    type: end' }),
);
rule(
  'Source Description Object: name is unique',
  C.ARAZZO1_SOURCE_DESCRIPTION_FIELD_NAME_UNIQUE,
  doc({ srcs: srcsOf(API, API.replace('api', 'api2')) }),
  doc({ srcs: srcsOf(API, API) }),
);
rule(
  'Workflow Object: workflowId is unique',
  C.ARAZZO1_WORKFLOW_FIELD_WORKFLOW_ID_UNIQUE,
  doc({ wfs: wfsOf(WF('a'), WF('b')) }),
  doc({ wfs: wfsOf(WF('a'), WF('a')) }),
);
rule(
  'Step Object: stepId is unique within the workflow',
  C.ARAZZO1_STEP_FIELD_STEP_ID_UNIQUE,
  doc({ steps: `- stepId: s1\n  ${OP}\n- stepId: s2\n  ${OP}` }),
  doc({ steps: `- stepId: s1\n  ${OP}\n- stepId: s1\n  ${OP}` }),
);
rule(
  'Step Object: stepId is unique per workflow, not across workflows',
  C.ARAZZO1_STEP_FIELD_STEP_ID_UNIQUE,
  doc({ wfs: wfsOf(WF('a'), WF('b')) }),
  doc({ steps: `- stepId: s1\n  ${OP}\n- stepId: s1\n  ${OP}` }),
);

// ---------------------------------------------------------------- ids and names
rule(
  'Workflow Object: workflowId matches [A-Za-z0-9_\\-]+',
  C.ARAZZO1_WORKFLOW_FIELD_WORKFLOW_ID_PATTERN,
  doc({ wfs: wfsOf(WF('a-b_1')) }),
  doc({ wfs: wfsOf(WF('"a b"')) }),
);
rule(
  'Step Object: stepId matches [A-Za-z0-9_\\-]+',
  C.ARAZZO1_STEP_FIELD_STEP_ID_PATTERN,
  doc({ steps: `- stepId: a-b_1\n  ${OP}` }),
  doc({ steps: `- stepId: "a b"\n  ${OP}` }),
);
rule(
  'Source Description Object: name matches [A-Za-z0-9_\\-]+',
  C.ARAZZO1_SOURCE_DESCRIPTION_FIELD_NAME_PATTERN,
  doc(),
  doc({ srcs: srcsOf(API.replace('api', '"a b"')) }),
);
rule(
  'Workflow Object: outputs names match [A-Za-z0-9.\\-_]+',
  C.ARAZZO1_OUTPUTS_KEY_PATTERN,
  doc({
    wf: 'outputs:\n  a.b-c_1: $steps.s1.outputs.x',
    steps: `- stepId: s1\n  ${OP}\n  outputs:\n    x: $response.body`,
  }),
  doc({
    wf: 'outputs:\n  "a b": $steps.s1.outputs.x',
    steps: `- stepId: s1\n  ${OP}\n  outputs:\n    x: $response.body`,
  }),
);
rule(
  'Step Object: outputs names match [A-Za-z0-9.\\-_]+',
  C.ARAZZO1_OUTPUTS_KEY_PATTERN,
  ONE_STEP_WITH('outputs:\n  a.b-c_1: $response.body'),
  ONE_STEP_WITH('outputs:\n  "a b": $response.body'),
);
rule(
  'Step Object (1.0): outputs values are strings',
  C.ARAZZO1_OUTPUTS_VALUE_TYPE,
  ONE_STEP_WITH('outputs:\n  o: $response.body'),
  ONE_STEP_WITH('outputs:\n  o: 5'),
);
rule(
  'Step Object (1.0): outputs values cannot be Selector Objects',
  C.ARAZZO1_OUTPUTS_VALUE_TYPE,
  ONE_STEP_WITH('outputs:\n  o: $response.body'),
  ONE_STEP_WITH('outputs:\n  o:\n    context: $response.body\n    selector: /a'),
);
rule(
  'Step Object (1.1): outputs values are strings or Selector Objects',
  C.ARAZZO1_OUTPUTS_VALUE_TYPE,
  ONE_STEP_WITH(
    'outputs:\n  o:\n    context: $response.body\n    selector: /a\n    type: jsonpath',
    V11,
  ),
  ONE_STEP_WITH('outputs:\n  o: 5', V11),
);
rule(
  'Workflow Object (1.1): outputs values are strings or Selector Objects',
  C.ARAZZO1_OUTPUTS_VALUE_TYPE,
  doc({
    ver: '1.1.0',
    wf: 'outputs:\n  o:\n    context: $response.body\n    selector: /a\n    type: jsonpath',
  }),
  doc({ ver: '1.1.0', wf: 'outputs:\n  o: true' }),
);
rule(
  'Workflow Object: dependsOn items are existing workflows or expressions',
  C.ARAZZO1_WORKFLOW_FIELD_DEPENDS_ON_ITEMS,
  doc({
    wfs: wfsOf(
      WF('a'),
      WF('b', '    dependsOn:\n      - a\n      - $sourceDescriptions.api.other\n'),
    ),
  }),
  doc({ wfs: wfsOf(WF('a'), WF('b', '    dependsOn:\n      - missing\n')) }),
);
rule(
  'Reusable Object: reference is a $components expression',
  C.ARAZZO1_REFERENCE_FIELD_REFERENCE_FORMAT,
  ONE_STEP_WITH('parameters:\n  - reference: $components.parameters.p', { top: COMP }),
  ONE_STEP_WITH('parameters:\n  - reference: "#/components/parameters/p"', { top: COMP }),
);

// ---------------------------------------------------------------- actions
rule(
  'Success Action Object: goto requires stepId or workflowId',
  C.ARAZZO1_ACTION_GOTO_TARGET_REQUIRED,
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: goto\n    workflowId: wf'),
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: goto'),
);
rule(
  'Failure Action Object: goto requires stepId or workflowId',
  C.ARAZZO1_ACTION_GOTO_TARGET_REQUIRED,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: goto\n    stepId: s1'),
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: goto'),
);
rule(
  'Success Action Object: stepId and workflowId are mutually exclusive',
  C.ARAZZO1_ACTION_STEP_ID_WORKFLOW_ID_EXCLUSIVE,
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: goto\n    stepId: s1'),
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: goto\n    stepId: s1\n    workflowId: wf'),
);
rule(
  'Failure Action Object: stepId and workflowId are mutually exclusive',
  C.ARAZZO1_ACTION_STEP_ID_WORKFLOW_ID_EXCLUSIVE,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: retry\n    stepId: s1'),
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: retry\n    stepId: s1\n    workflowId: wf'),
);
rule(
  'Success Action Object: end has no stepId or workflowId',
  C.ARAZZO1_ACTION_END_NO_TARGET,
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: end'),
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: end\n    stepId: s1'),
);
rule(
  'Failure Action Object: end has no stepId or workflowId',
  C.ARAZZO1_ACTION_END_NO_TARGET,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: end'),
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: end\n    workflowId: wf'),
);
rule(
  'Failure Action Object: retryAfter is a non-negative number',
  C.ARAZZO1_FAILURE_ACTION_FIELD_RETRY_AFTER_VALUE,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: retry\n    retryAfter: 1.5'),
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: retry\n    retryAfter: -1'),
);
rule(
  'Failure Action Object: retryAfter is a number',
  C.ARAZZO1_FAILURE_ACTION_FIELD_RETRY_AFTER_TYPE,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: retry\n    retryAfter: 2'),
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: retry\n    retryAfter: soon'),
);
rule(
  'Failure Action Object: retryLimit is a non-negative integer',
  C.ARAZZO1_FAILURE_ACTION_FIELD_RETRY_LIMIT_VALUE,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: retry\n    retryLimit: 3'),
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: retry\n    retryLimit: 1.5'),
);
rule(
  'Failure Action Object: retryLimit is not negative',
  C.ARAZZO1_FAILURE_ACTION_FIELD_RETRY_LIMIT_VALUE,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: retry\n    retryLimit: 0'),
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: retry\n    retryLimit: -2'),
);
rule(
  'Failure Action Object: retryLimit is a number',
  C.ARAZZO1_FAILURE_ACTION_FIELD_RETRY_LIMIT_TYPE,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: retry\n    retryLimit: 2'),
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: retry\n    retryLimit: many'),
);
rule(
  'Failure Action Object: retry fields only apply to retry',
  C.ARAZZO1_FAILURE_ACTION_RETRY_FIELDS_ONLY_FOR_RETRY,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: retry\n    retryLimit: 2'),
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: end\n    retryLimit: 2'),
);
rule(
  'Success Action Object: stepId refers to a step of the workflow',
  C.ARAZZO1_SUCCESS_ACTION_FIELD_STEP_ID_EXISTS,
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: goto\n    stepId: s1'),
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: goto\n    stepId: nope'),
);
rule(
  'Success Action Object: workflowId refers to a workflow',
  C.ARAZZO1_SUCCESS_ACTION_FIELD_WORKFLOW_ID_EXISTS,
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: goto\n    workflowId: wf'),
  ONE_STEP_WITH('onSuccess:\n  - name: a\n    type: goto\n    workflowId: nope'),
);
rule(
  'Failure Action Object: stepId refers to a step of the workflow',
  C.ARAZZO1_FAILURE_ACTION_FIELD_STEP_ID_EXISTS,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: goto\n    stepId: s1'),
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: goto\n    stepId: nope'),
);
rule(
  'Failure Action Object: workflowId refers to a workflow',
  C.ARAZZO1_FAILURE_ACTION_FIELD_WORKFLOW_ID_EXISTS,
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: goto\n    workflowId: wf'),
  ONE_STEP_WITH('onFailure:\n  - name: a\n    type: goto\n    workflowId: nope'),
);
rule(
  'Step Object: workflowId refers to a workflow',
  C.ARAZZO1_STEP_FIELD_WORKFLOW_ID_EXISTS,
  doc({ steps: '- stepId: s1\n  workflowId: wf' }),
  doc({ steps: '- stepId: s1\n  workflowId: nope' }),
);

// ---------------------------------------------------------------- runtime expressions
const OUT = `- stepId: s1\n  ${OP}\n  outputs:\n    x: $response.body`;
rule(
  'Runtime expression: $steps.<id> refers to a step of the workflow',
  C.ARAZZO1_EXPRESSION_STEP_EXISTS,
  doc({ wf: 'outputs:\n  r: $steps.s1.outputs.x', steps: OUT }),
  doc({ wf: 'outputs:\n  r: $steps.nope.outputs.x', steps: OUT }),
);
rule(
  'Runtime expression: $steps.<id>.outputs.<name> is declared by the step',
  C.ARAZZO1_EXPRESSION_STEP_OUTPUT_DECLARED,
  doc({ wf: 'outputs:\n  r: $steps.s1.outputs.x', steps: OUT }),
  doc({ wf: 'outputs:\n  r: $steps.s1.outputs.y', steps: OUT }),
);
rule(
  'Runtime expression: embedded {$steps...} expressions are checked',
  C.ARAZZO1_EXPRESSION_STEP_EXISTS,
  ONE_STEP_WITH(
    'outputs:\n  x: $response.body\nrequestBody:\n  payload: "id={$steps.s1.outputs.x}"',
  ),
  ONE_STEP_WITH('requestBody:\n  payload: "id={$steps.nope.outputs.x}"'),
);
rule(
  'Runtime expression: criterion conditions are checked',
  C.ARAZZO1_EXPRESSION_STEP_EXISTS,
  ONE_STEP_WITH(
    'outputs:\n  x: $response.body\nsuccessCriteria:\n  - condition: $steps.s1.outputs.x == 1',
  ),
  ONE_STEP_WITH('successCriteria:\n  - condition: $steps.nope.outputs.x == 1'),
);
rule(
  'Runtime expression: text that is not an expression is ignored',
  C.ARAZZO1_EXPRESSION_STEP_EXISTS,
  ONE_STEP_WITH('requestBody:\n  payload: costs $steps.nope.outputs.x today'),
  ONE_STEP_WITH('requestBody:\n  payload: costs {$steps.nope.outputs.x} today'),
);
rule(
  'Runtime expression: $workflows.<id> refers to a workflow',
  C.ARAZZO1_EXPRESSION_WORKFLOW_EXISTS,
  doc({ wf: 'outputs:\n  r: $workflows.wf.outputs.x' }),
  doc({ wf: 'outputs:\n  r: $workflows.nope.outputs.x' }),
);
rule(
  'Runtime expression: $sourceDescriptions.<name> refers to a source description',
  C.ARAZZO1_EXPRESSION_SOURCE_DESCRIPTION_EXISTS,
  doc({ steps: '- stepId: s1\n  operationId: $sourceDescriptions.api.op' }),
  doc({ steps: '- stepId: s1\n  operationId: $sourceDescriptions.nope.op' }),
);
rule(
  'Runtime expression: $components.<kind>.<name> refers to a component',
  C.ARAZZO1_EXPRESSION_COMPONENT_EXISTS,
  ONE_STEP_WITH('parameters:\n  - reference: $components.parameters.p', { top: COMP }),
  ONE_STEP_WITH('parameters:\n  - reference: $components.parameters.missing', { top: COMP }),
);
const INPUTS = 'inputs:\n  type: object\n  properties:\n    a:\n      type: string';
rule(
  'Runtime expression: $inputs.<name> is declared when the workflow declares inputs',
  C.ARAZZO1_EXPRESSION_INPUT_DECLARED,
  doc({
    wf: INPUTS,
    steps: `- stepId: s1\n  ${OP}\n  parameters:\n    - name: p\n      in: query\n      value: $inputs.a`,
  }),
  doc({
    wf: INPUTS,
    steps: `- stepId: s1\n  ${OP}\n  parameters:\n    - name: p\n      in: query\n      value: $inputs.b`,
  }),
);
rule(
  'Runtime expression: $inputs.<name> is not checked without inputs.properties',
  C.ARAZZO1_EXPRESSION_INPUT_DECLARED,
  ONE_STEP_WITH('parameters:\n  - name: p\n    in: query\n    value: $inputs.anything'),
  doc({
    wf: INPUTS,
    steps: `- stepId: s1\n  ${OP}\n  parameters:\n    - name: p\n      in: query\n      value: $inputs.zzz`,
  }),
);

// ---------------------------------------------------------------- polymorphic fields
rule(
  'Parameter Object: value of a path parameter is a primitive or expression',
  C.ARAZZO1_PARAMETER_FIELD_VALUE_TYPE,
  ONE_STEP_WITH('parameters:\n  - name: p\n    in: path\n    value: 1'),
  ONE_STEP_WITH('parameters:\n  - name: p\n    in: path\n    value:\n      a: b'),
);
rule(
  'Parameter Object: value of a query parameter may be an array',
  C.ARAZZO1_PARAMETER_FIELD_VALUE_TYPE,
  ONE_STEP_WITH('parameters:\n  - name: p\n    in: query\n    value: [a, b]'),
  ONE_STEP_WITH('parameters:\n  - name: p\n    in: header\n    value: [a, b]'),
);
rule(
  'Request Body Object: payload is an object, array or string',
  C.ARAZZO1_REQUEST_BODY_FIELD_PAYLOAD_TYPE,
  ONE_STEP_WITH('requestBody:\n  payload:\n    a: b'),
  ONE_STEP_WITH('requestBody:\n  payload: 5'),
);

// ---------------------------------------------------------------- allowed fields
const N = C.NOT_ALLOWED_FIELDS;
const objects: Record<string, (line: string) => string> = {
  Arazzo: (l) => doc({ top: `${l}\n` }),
  Info: (l) => doc({ info: `info:\n  title: T\n  version: 1.0.0\n  ${l}\n` }),
  'Source Description': (l) => doc({ srcs: srcsOf(`${API}\n    ${l}`) }),
  Workflow: (l) => doc({ wf: l }),
  Step: (l) => step(`${OP}\n${l}`),
  Parameter: (l) => ONE_STEP_WITH(`${PARAM(`\n    ${l}`)}`),
  'Success Action': (l) => ONE_STEP_WITH(`onSuccess:\n  - name: a\n    type: end\n    ${l}`),
  'Failure Action': (l) => ONE_STEP_WITH(`onFailure:\n  - name: a\n    type: end\n    ${l}`),
  Criterion: (l) => ONE_STEP_WITH(`successCriteria:\n  - condition: $statusCode == 200\n    ${l}`),
  'Request Body': (l) => ONE_STEP_WITH(`requestBody:\n  payload: x\n  ${l}`),
  'Payload Replacement': (l) => PR(l),
  Components: (l) => doc({ top: `components:\n  ${l}\n` }),
};
Object.entries(objects).forEach(([name, make]) => {
  rule(
    `${name} Object: specification extensions (x-) are allowed`,
    N,
    make('x-ext: 1'),
    make('foo: 1'),
  );
});

// ---------------------------------------------------------------- 1.1 only fields
rule(
  'Arazzo Object: $self requires 1.1.0',
  N,
  doc({ ver: '1.1.0', top: '$self: https://example.com/a\n' }),
  doc({ top: '$self: https://example.com/a\n' }),
);
rule(
  'Step Object: channelPath requires 1.1.0',
  N,
  doc({ ver: '1.1.0', steps: '- stepId: s1\n  channelPath: ch' }),
  doc({ steps: '- stepId: s1\n  channelPath: ch' }),
);
rule('Step Object: action requires 1.1.0', N, CH('action: send', V11), CH('action: send'));
rule(
  'Step Object: timeout requires 1.1.0',
  N,
  ONE_STEP_WITH('timeout: 1000', V11),
  ONE_STEP_WITH('timeout: 1000'),
);
rule(
  'Step Object: correlationId requires 1.1.0',
  N,
  CH('action: receive\ncorrelationId: abc', V11),
  CH('action: receive\ncorrelationId: abc'),
);
rule(
  'Payload Replacement Object: targetSelectorType requires 1.1.0',
  N,
  PR('targetSelectorType: jsonpath', V11),
  PR('targetSelectorType: jsonpath'),
);

// ---------------------------------------------------------------- spec gaps and version gating
const KEYED = (section: string, key: string, body: string) =>
  doc({ top: `components:\n  ${section}:\n    ${key}:\n${indent(body, 6)}\n` });
const PARAM_BODY = 'name: p\nin: query\nvalue: v';
rule(
  'Components Object: parameters names match ^[a-zA-Z0-9.-_]+$',
  C.ARAZZO1_COMPONENTS_KEY_PATTERN,
  KEYED('parameters', 'my.param-1_a', PARAM_BODY),
  KEYED('parameters', '"bad key"', PARAM_BODY),
);
rule(
  'Components Object: inputs names match ^[a-zA-Z0-9.-_]+$',
  C.ARAZZO1_COMPONENTS_KEY_PATTERN,
  KEYED('inputs', 'my_input', 'type: object'),
  KEYED('inputs', '"bad/input"', 'type: object'),
);
rule(
  'Components Object: successActions names match ^[a-zA-Z0-9.-_]+$',
  C.ARAZZO1_COMPONENTS_KEY_PATTERN,
  KEYED('successActions', 'done', 'name: done\ntype: end'),
  KEYED('successActions', '"do ne"', 'name: done\ntype: end'),
);
rule(
  'Components Object: failureActions names match ^[a-zA-Z0-9.-_]+$',
  C.ARAZZO1_COMPONENTS_KEY_PATTERN,
  KEYED('failureActions', 'stop', 'name: stop\ntype: end'),
  KEYED('failureActions', '"st$op"', 'name: stop\ntype: end'),
);
rule(
  'Arazzo Object: unknown 1.x versions are flagged',
  C.ARAZZO1_ARAZZO_SPECIFICATION_FIELD_ARAZZO_VERSION_UNKNOWN,
  doc({ ver: '1.0.0' }),
  doc({ arazzo: '1.2.0' }),
);
rule(
  'Step Object (1.1): action is not applicable to OpenAPI steps',
  C.ARAZZO1_STEP_ACTION_NOT_APPLICABLE,
  doc({
    ver: '1.1.0',
    srcs: srcsOf(ASYNC_SRC),
    steps: '- stepId: s1\n  operationId: $sourceDescriptions.ev.placeOrder\n  action: send',
  }),
  ONE_STEP_WITH('action: send', V11),
);
rule(
  'Step Object (1.1): action is not applicable to expression operationIds of OpenAPI sources',
  C.ARAZZO1_STEP_ACTION_NOT_APPLICABLE,
  CH('action: receive', V11),
  doc({
    ver: '1.1.0',
    steps: '- stepId: s1\n  operationId: $sourceDescriptions.api.getPet\n  action: send',
  }),
);
rule(
  'Step Object (1.1): action is not applicable to workflowId steps',
  C.ARAZZO1_STEP_ACTION_NOT_APPLICABLE,
  doc({
    ver: '1.1.0',
    srcs: srcsOf(ASYNC_SRC),
    steps: '- stepId: s1\n  operationId: ev\n  action: send',
  }),
  doc({ ver: '1.1.0', steps: '- stepId: s1\n  workflowId: wf\n  action: send' }),
);
rule(
  'Step Object (1.1): action with an unknown source type is accepted',
  C.ARAZZO1_STEP_ACTION_NOT_APPLICABLE,
  doc({
    ver: '1.1.0',
    srcs: 'sourceDescriptions:\n  - name: x\n    url: https://example.com/x.json\n',
    steps: '- stepId: s1\n  operationId: $sourceDescriptions.x.op\n  action: send',
  }),
  ONE_STEP_WITH('action: receive', V11),
);
rule(
  'Step Object (1.1): correlationId requires action receive',
  C.ARAZZO1_STEP_CORRELATION_ID_NOT_APPLICABLE,
  CH('action: receive\ncorrelationId: abc', V11),
  CH('action: send\ncorrelationId: abc', V11),
);
rule(
  'Step Object (1.1): correlationId is not applicable to OpenAPI steps',
  C.ARAZZO1_STEP_CORRELATION_ID_NOT_APPLICABLE,
  doc({
    ver: '1.1.0',
    srcs: srcsOf(ASYNC_SRC),
    steps: '- stepId: s1\n  operationId: $sourceDescriptions.ev.onOrder\n  correlationId: abc',
  }),
  ONE_STEP_WITH('correlationId: abc', V11),
);
rule(
  'Step Object: dependsOn requires 1.1.0',
  N,
  ONE_STEP_WITH('dependsOn:\n  - s0', V11),
  ONE_STEP_WITH('dependsOn:\n  - s0'),
);
rule(
  'Parameter Object: in querystring requires 1.1.0',
  C.ARAZZO1_PARAMETER_FIELD_IN_ENUM,
  ONE_STEP_WITH('parameters:\n  - name: q\n    in: querystring\n    value: a=b', V11),
  ONE_STEP_WITH('parameters:\n  - name: q\n    in: querystring\n    value: a=b'),
);
rule(
  'Parameter Object (1.1): value Selector Object requires context and selector',
  C.ARAZZO1_SELECTOR_INCOMPLETE,
  ONE_STEP_WITH(
    'parameters:\n  - name: p\n    in: query\n    value:\n      context: $response.body\n      selector: /a\n      type: jsonpath',
    V11,
  ),
  ONE_STEP_WITH(
    'parameters:\n  - name: p\n    in: query\n    value:\n      context: $response.body',
    V11,
  ),
);
rule(
  'Payload Replacement Object (1.1): value Selector Object requires context and selector',
  C.ARAZZO1_SELECTOR_INCOMPLETE,
  ONE_STEP_WITH(
    'requestBody:\n  replacements:\n    - target: /a\n      value:\n        context: $response.body\n        selector: /b\n        type: jsonpath',
    V11,
  ),
  ONE_STEP_WITH(
    'requestBody:\n  replacements:\n    - target: /a\n      value:\n        selector: /b',
    V11,
  ),
);
rule(
  'Workflow Object (1.1): outputs Selector Object requires context and selector',
  C.ARAZZO1_SELECTOR_INCOMPLETE,
  doc({
    ...V11,
    wf: 'outputs:\n  o:\n    context: $response.body\n    selector: /a\n    type: jsonpath',
  }),
  doc({ ...V11, wf: 'outputs:\n  o:\n    selector: /a' }),
);
rule(
  'Selector Object (1.1): type is REQUIRED',
  C.ARAZZO1_SELECTOR_FIELD_TYPE_REQUIRED,
  ONE_STEP_WITH(
    'outputs:\n  o:\n    context: $response.body\n    selector: /a\n    type: jsonpath',
    V11,
  ),
  ONE_STEP_WITH('outputs:\n  o:\n    context: $response.body\n    selector: /a', V11),
);
rule(
  'Selector Object (1.1): type is inferred as xpath for an XML request context',
  C.ARAZZO1_SELECTOR_FIELD_TYPE_REQUIRED,
  ONE_STEP_WITH(
    'requestBody:\n  contentType: application/soap+xml\n  replacements:\n    - target: /a\n      value:\n        context: $request.body\n        selector: /b',
    V11,
  ),
  ONE_STEP_WITH(
    'requestBody:\n  contentType: application/soap+xml\n  replacements:\n    - target: /a\n      value:\n        context: $response.body\n        selector: /b',
    V11,
  ),
);
rule(
  'Selector Object (1.1): XML media-type context defaults to xpath',
  C.ARAZZO1_SELECTOR_FIELD_TYPE_REQUIRED,
  ONE_STEP_WITH('outputs:\n  o:\n    context: application/soap+xml\n    selector: /a', V11),
  ONE_STEP_WITH('outputs:\n  o:\n    context: application/json\n    selector: /a', V11),
);
rule(
  'Payload Replacement Object (1.1): XML target defaults to xpath',
  C.ARAZZO1_PAYLOAD_REPLACEMENT_FIELD_TARGET_SELECTOR_TYPE_ENUM,
  ONE_STEP_WITH(
    'requestBody:\n  contentType: application/xml\n  replacements:\n    - target: /Invoice/Header\n      value: updated',
    V11,
  ),
  PR('targetSelectorType: invalid', V11),
);
rule(
  'Runtime expression: $self requires 1.1.0',
  C.ARAZZO1_EXPRESSION_VERSION_NOT_AVAILABLE,
  ONE_STEP_WITH('outputs:\n  o: $self', V11),
  ONE_STEP_WITH('outputs:\n  o: $self'),
);
rule(
  'Runtime expression: $message requires 1.1.0',
  C.ARAZZO1_EXPRESSION_VERSION_NOT_AVAILABLE,
  CH('action: receive\noutputs:\n  o: $message.payload#/id', V11),
  CH('action: receive\noutputs:\n  o: $message.payload#/id'),
);
rule(
  'Runtime expression: $message.header requires 1.1.0 in conditions',
  C.ARAZZO1_EXPRESSION_VERSION_NOT_AVAILABLE,
  ONE_STEP_WITH('successCriteria:\n  - condition: $message.header.type == 1', V11),
  ONE_STEP_WITH('successCriteria:\n  - condition: $message.header.type == 1'),
);
rule(
  'Expression Type Object: jsonpath version rfc9535 requires 1.1.0',
  C.ARAZZO1_EXPRESSION_TYPE_FIELD_VERSION_ENUM,
  ET('type: jsonpath\nversion: rfc9535', V11),
  ET('type: jsonpath\nversion: rfc9535'),
);
rule(
  'Expression Type Object: xpath version xpath-31 requires 1.1.0',
  C.ARAZZO1_EXPRESSION_TYPE_FIELD_VERSION_ENUM,
  ET('type: xpath\nversion: xpath-31', V11),
  ET('type: xpath\nversion: xpath-31'),
);
rule(
  'Expression Type Object: jsonpointer type requires 1.1.0',
  C.ARAZZO1_EXPRESSION_TYPE_FIELD_TYPE_ENUM,
  ET('type: jsonpointer\nversion: rfc6901', V11),
  ET('type: jsonpointer\nversion: rfc6901'),
);
rule(
  'Expression Type Object: jsonpointer only has version rfc6901',
  C.ARAZZO1_EXPRESSION_TYPE_FIELD_VERSION_ENUM,
  ET('type: jsonpointer\nversion: rfc6901', V11),
  ET('type: jsonpointer\nversion: rfc9535', V11),
);
rule(
  'Expression Type Object (1.1): older versions remain valid',
  C.ARAZZO1_EXPRESSION_TYPE_FIELD_VERSION_ENUM,
  ET('type: jsonpath\nversion: draft-goessner-dispatch-jsonpath-00', V11),
  ET('type: jsonpath\nversion: xpath-31', V11),
);
rule(
  'Source Description Object: type asyncapi is 1.1.0 only (1.0.0)',
  C.ARAZZO1_SOURCE_DESCRIPTION_FIELD_TYPE_ENUM,
  doc({ ver: '1.1.0', srcs: srcsOf(ASYNC_SRC) }),
  doc({ ver: '1.0.0', srcs: srcsOf(ASYNC_SRC) }),
);
rule(
  'Step Object: timeout requires 1.1.0 (1.0.0)',
  N,
  ONE_STEP_WITH('timeout: 1000', V11),
  ONE_STEP_WITH('timeout: 1000', { ver: '1.0.0' }),
);
rule(
  'Arazzo Object: $self requires 1.1.0 (1.0.0)',
  N,
  doc({ ver: '1.1.0', top: '$self: https://example.com/a\n' }),
  doc({ ver: '1.0.0', top: '$self: https://example.com/a\n' }),
);

describe('apidom-ls-arazzo-spec-rules', function () {
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

  let counter = 0;
  const validate = async (text: string, format = 'yaml') => {
    counter += 1;
    // a fresh uri per document: the language service caches by uri
    return languageService.doValidation(
      TextDocument.create(`foo://bar/spec-rule-${counter}.${format}`, format, 0, text),
      validationContext,
    );
  };

  after(function () {
    languageService.terminate();
  });

  describe('malformed arazzo version (detected by shape)', function () {
    it('detects a malformed JSON version at the top level', async function () {
      const text = JSON.stringify({ arazzo: 'latest', sourceDescriptions: [], workflows: [] });
      const document = TextDocument.create('foo://bar/range.json', 'json', 0, text);
      const offset = text.indexOf('"latest"');
      assert.deepEqual(await validate(text, 'json'), [
        {
          range: {
            start: document.positionAt(offset),
            end: document.positionAt(offset + 8),
          },
          message:
            'Unknown Arazzo version, supported versions are 1.0.0, 1.0.1 and 1.1.0; version specific rules are not applied',
          severity: DiagnosticSeverity.Warning,
          code: C.ARAZZO1_ARAZZO_SPECIFICATION_FIELD_ARAZZO_VERSION_UNKNOWN,
          source: 'apilint',
        },
      ]);
    });
    it('does not detect nested Arazzo fields in a generic JSON document', async function () {
      const text = JSON.stringify({ example: { arazzo: 'latest', workflows: [] } });
      assert.deepEqual(await validate(text, 'json'), []);
    });
    ['2.0.0', 'latest', '1.0', '"1.x"'].forEach((ver) => {
      it(`warns about arazzo: ${ver}`, async function () {
        this.timeout(10000);
        const diagnostics = await validate(doc({ arazzo: ver }));
        const d = diagnostics.find(
          (x) => Number(x.code) === C.ARAZZO1_ARAZZO_SPECIFICATION_FIELD_ARAZZO_VERSION_UNKNOWN,
        );
        assert.isDefined(d, JSON.stringify(diagnostics.map((x) => [x.code, x.message])));
        assert.equal(d!.severity, DiagnosticSeverity.Warning);
      });
    });
  });

  rules.forEach(({ rule: name, code, valid, invalid }) => {
    describe(name, function () {
      it('accepts the valid case', async function () {
        this.timeout(10000);
        assert.deepEqual(await validate(valid), []);
      });
      it(`rejects the invalid case with ${C[code]}`, async function () {
        this.timeout(10000);
        const diagnostics = await validate(invalid);
        assert.include(
          diagnostics.map((d) => Number(d.code)),
          code,
          JSON.stringify(diagnostics.map((d) => [d.code, d.message])),
        );
      });
    });
  });
});
