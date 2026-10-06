import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../codes.ts';
import { LinterMeta } from '../../apidom-language-types.ts';
import { ARAZZO1, ARAZZO10, ARAZZO11 } from './target-specs.ts';
import skipReusableObjects from './skip-reusable.ts';

const { Error: ERROR, Warning: WARNING } = DiagnosticSeverity;

const lint = (meta: Partial<LinterMeta>): LinterMeta =>
  ({
    source: 'apilint',
    severity: ERROR,
    marker: 'value',
    targetSpecs: ARAZZO1,
    ...meta,
  }) as LinterMeta;

/**
 * Runtime expression checks, one lint per kind of reference, attached to every field that
 * can carry a runtime expression.
 */
const expressionLints = (target: string): LinterMeta[] => [
  lint({
    code: ApilintCodes.ARAZZO1_EXPRESSION_STEP_EXISTS,
    message: 'Runtime expression references a step that does not exist in the workflow',
    linterFunction: 'arazzoExpressionStepExists',
    target,
  }),
  lint({
    code: ApilintCodes.ARAZZO1_EXPRESSION_STEP_OUTPUT_DECLARED,
    message: 'Runtime expression references an output that the step does not declare',
    severity: WARNING,
    linterFunction: 'arazzoExpressionStepOutputDeclared',
    target,
  }),
  lint({
    code: ApilintCodes.ARAZZO1_EXPRESSION_WORKFLOW_EXISTS,
    message: 'Runtime expression references a workflow that does not exist',
    linterFunction: 'arazzoExpressionWorkflowExists',
    target,
  }),
  lint({
    code: ApilintCodes.ARAZZO1_EXPRESSION_SOURCE_DESCRIPTION_EXISTS,
    message: 'Runtime expression references a source description that does not exist',
    linterFunction: 'arazzoExpressionSourceDescriptionExists',
    target,
  }),
  lint({
    code: ApilintCodes.ARAZZO1_EXPRESSION_COMPONENT_EXISTS,
    message: 'Runtime expression references a component that does not exist',
    linterFunction: 'arazzoExpressionComponentExists',
    target,
  }),
  lint({
    code: ApilintCodes.ARAZZO1_EXPRESSION_INPUT_DECLARED,
    message: "Runtime expression references an input not declared in the workflow 'inputs'",
    linterFunction: 'arazzoExpressionInputDeclared',
    target,
  }),
];

const idPattern = '^[A-Za-z0-9_\\-]+$';

const gotoMessage = "'goto' action requires one of 'stepId' or 'workflowId'";

const actionLints = (): LinterMeta[] => [
  lint({
    code: ApilintCodes.ARAZZO1_ACTION_GOTO_TARGET_REQUIRED,
    message: gotoMessage,
    linterFunction: 'arazzoActionGotoTarget',
    marker: 'key',
  }),
  lint({
    code: ApilintCodes.ARAZZO1_ACTION_STEP_ID_WORKFLOW_ID_EXCLUSIVE,
    message: "'stepId' and 'workflowId' are mutually exclusive",
    linterFunction: 'arazzoActionTargetExclusive',
    marker: 'key',
  }),
  lint({
    code: ApilintCodes.ARAZZO1_ACTION_END_NO_TARGET,
    message: "'end' action must not specify 'stepId' or 'workflowId'",
    linterFunction: 'arazzoActionEndNoTarget',
    marker: 'key',
  }),
  ...expressionLints('workflowId'),
];

const specLints: Record<string, LinterMeta[]> = {
  arazzoSpecification1: [
    lint({
      code: ApilintCodes.ARAZZO1_ARAZZO_SPECIFICATION_FIELD_SOURCE_DESCRIPTIONS_MIN_ITEMS,
      message: "'sourceDescriptions' must contain at least one item",
      linterFunction: 'apilintArrayNotEmpty',
      target: 'sourceDescriptions',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_ARAZZO_SPECIFICATION_FIELD_WORKFLOWS_MIN_ITEMS,
      message: "'workflows' must contain at least one item",
      linterFunction: 'apilintArrayNotEmpty',
      target: 'workflows',
    }),
  ],
  sourceDescription: [
    lint({
      code: ApilintCodes.ARAZZO1_SOURCE_DESCRIPTION_FIELD_NAME_PATTERN,
      message: "'name' must match [A-Za-z0-9_\\-]+",
      linterFunction: 'apilintValueRegex',
      linterParams: [idPattern],
      target: 'name',
    }),
  ],
  workflow: [
    lint({
      code: ApilintCodes.ARAZZO1_WORKFLOW_FIELD_WORKFLOW_ID_PATTERN,
      message: "'workflowId' must match [A-Za-z0-9_\\-]+",
      linterFunction: 'apilintValueRegex',
      linterParams: [idPattern],
      target: 'workflowId',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_WORKFLOW_FIELD_STEPS_MIN_ITEMS,
      message: "'steps' must contain at least one item",
      linterFunction: 'apilintArrayNotEmpty',
      target: 'steps',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_WORKFLOW_FIELD_DEPENDS_ON_ITEMS,
      message:
        "'dependsOn' items must be ids of existing workflows or runtime expressions ($sourceDescriptions.<name>.<workflowId>)",
      linterFunction: 'arazzoDependsOnValid',
      target: 'dependsOn',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_PARAMETERS_UNIQUE,
      message: "'parameters' must be unique by 'name' and 'in'",
      linterFunction: 'arazzoListUnique',
      linterParams: [['name', 'in']],
      target: 'parameters',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_ACTIONS_UNIQUE,
      message: "'successActions' must be unique by 'name'",
      linterFunction: 'arazzoListUnique',
      linterParams: [['name']],
      target: 'successActions',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_ACTIONS_UNIQUE,
      message: "'failureActions' must be unique by 'name'",
      linterFunction: 'arazzoListUnique',
      linterParams: [['name']],
      target: 'failureActions',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_OUTPUTS_KEY_PATTERN,
      message: "'outputs' names must match [A-Za-z0-9.\\-_]+",
      linterFunction: 'apilintKeysRegex',
      linterParams: ['^[A-Za-z0-9.\\-_]+$'],
      target: 'outputs',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_OUTPUTS_VALUE_TYPE,
      message: "'outputs' values must be strings (runtime expressions)",
      linterFunction: 'arazzoOutputsValues',
      linterParams: [false],
      target: 'outputs',
      targetSpecs: ARAZZO10,
    }),
    lint({
      code: ApilintCodes.ARAZZO1_OUTPUTS_VALUE_TYPE,
      message: "'outputs' values must be strings or Selector Objects",
      linterFunction: 'arazzoOutputsValues',
      linterParams: [true],
      target: 'outputs',
      targetSpecs: ARAZZO11,
    }),
    ...expressionLints('outputs'),
    ...expressionLints('dependsOn'),
  ],
  step: [
    lint({
      code: ApilintCodes.ARAZZO1_STEP_FIELD_STEP_ID_PATTERN,
      message: "'stepId' must match [A-Za-z0-9_\\-]+",
      linterFunction: 'apilintValueRegex',
      linterParams: [idPattern],
      target: 'stepId',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_STEP_OPERATION_TARGET_ONE_OF,
      message: "Step must specify exactly one of 'operationId', 'operationPath' or 'workflowId'",
      linterFunction: 'arazzoExactlyOneOf',
      linterParams: [['operationId', 'operationPath', 'workflowId']],
      marker: 'key',
      targetSpecs: ARAZZO10,
    }),
    lint({
      code: ApilintCodes.ARAZZO1_STEP_OPERATION_TARGET_ONE_OF,
      message:
        "Step must specify exactly one of 'operationId', 'operationPath', 'workflowId' or 'channelPath'",
      linterFunction: 'arazzoExactlyOneOf',
      linterParams: [['operationId', 'operationPath', 'workflowId', 'channelPath']],
      marker: 'key',
      targetSpecs: ARAZZO11,
    }),
    lint({
      code: ApilintCodes.ARAZZO1_PARAMETERS_UNIQUE,
      message: "'parameters' must be unique by 'name' and 'in'",
      linterFunction: 'arazzoListUnique',
      linterParams: [['name', 'in']],
      target: 'parameters',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_ACTIONS_UNIQUE,
      message: "'onSuccess' must be unique by 'name'",
      linterFunction: 'arazzoListUnique',
      linterParams: [['name']],
      target: 'onSuccess',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_ACTIONS_UNIQUE,
      message: "'onFailure' must be unique by 'name'",
      linterFunction: 'arazzoListUnique',
      linterParams: [['name']],
      target: 'onFailure',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_OUTPUTS_KEY_PATTERN,
      message: "'outputs' names must match [A-Za-z0-9.\\-_]+",
      linterFunction: 'apilintKeysRegex',
      linterParams: ['^[A-Za-z0-9.\\-_]+$'],
      target: 'outputs',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_OUTPUTS_VALUE_TYPE,
      message: "'outputs' values must be strings (runtime expressions)",
      linterFunction: 'arazzoOutputsValues',
      linterParams: [false],
      target: 'outputs',
      targetSpecs: ARAZZO10,
    }),
    lint({
      code: ApilintCodes.ARAZZO1_OUTPUTS_VALUE_TYPE,
      message: "'outputs' values must be strings or Selector Objects",
      linterFunction: 'arazzoOutputsValues',
      linterParams: [true],
      target: 'outputs',
      targetSpecs: ARAZZO11,
    }),
    ...[
      'operationId',
      'operationPath',
      'workflowId',
      'channelPath',
      'correlationId',
      'outputs',
    ].flatMap(expressionLints),
  ],
  parameter: [
    ...skipReusableObjects([
      lint({
        code: ApilintCodes.ARAZZO1_PARAMETER_FIELD_IN_REQUIRED_FOR_OPERATION,
        message: "'in' is required when the step specifies 'operationId' or 'operationPath'",
        linterFunction: 'arazzoParameterInRequired',
        marker: 'key',
      }),
    ]),
    lint({
      code: ApilintCodes.ARAZZO1_PARAMETER_FIELD_VALUE_TYPE,
      message: "'value' of a path, header or cookie parameter should be a primitive",
      severity: WARNING,
      linterFunction: 'arazzoParameterValueType',
      target: 'value',
    }),
    ...expressionLints('value'),
  ],
  criterion: [
    lint({
      code: ApilintCodes.ARAZZO1_CRITERION_FIELD_CONTEXT_REQUIRED_WITH_TYPE,
      message: "'context' is required when 'type' is specified",
      linterFunction: 'arazzoCriterionContextRequired',
      target: 'type',
      marker: 'key',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_CRITERION_FIELD_TYPE_ENUM,
      message: "'type' must be one of simple, regex, jsonpath, xpath or an Expression Type Object",
      linterFunction: 'arazzoCriterionTypeValid',
      target: 'type',
    }),
    ...expressionLints('condition'),
    ...expressionLints('context'),
  ],
  requestBody: [
    lint({
      code: ApilintCodes.ARAZZO1_REQUEST_BODY_FIELD_PAYLOAD_TYPE,
      message: "'payload' should be an object, array or string",
      severity: WARNING,
      linterFunction: 'arazzoPayloadType',
      target: 'payload',
    }),
    ...expressionLints('payload'),
  ],
  payloadReplacement: [
    lint({
      code: ApilintCodes.ARAZZO1_PAYLOAD_REPLACEMENT_FIELD_TARGET_SELECTOR_TYPE_ENUM,
      message:
        "'targetSelectorType' must be one of jsonpointer, jsonpath, xpath or an Expression Type Object",
      linterFunction: 'arazzoSelectorTypeValid',
      target: 'targetSelectorType',
      targetSpecs: ARAZZO11,
    }),
    ...expressionLints('value'),
  ],
  selector: [
    lint({
      code: ApilintCodes.ARAZZO1_SELECTOR_FIELD_TYPE_ENUM,
      message: "'type' must be one of jsonpointer, jsonpath, xpath or an Expression Type Object",
      linterFunction: 'arazzoSelectorTypeValid',
      target: 'type',
    }),
    ...expressionLints('context'),
  ],
  expressionType: [
    lint({
      code: ApilintCodes.ARAZZO1_EXPRESSION_TYPE_FIELD_TYPE_ENUM,
      message: "'type' must be one of jsonpath, xpath",
      linterFunction: 'arazzoExpressionTypeTypeValid',
      target: 'type',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_EXPRESSION_TYPE_FIELD_VERSION_ENUM,
      message: "'version' is not valid for the given 'type'",
      linterFunction: 'arazzoExpressionTypeVersionValid',
      target: 'version',
    }),
  ],
  successAction: actionLints(),
  failureAction: [
    ...actionLints(),
    lint({
      code: ApilintCodes.ARAZZO1_FAILURE_ACTION_FIELD_RETRY_AFTER_VALUE,
      message: "'retryAfter' must not be negative",
      linterFunction: 'arazzoNonNegativeNumber',
      target: 'retryAfter',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_FAILURE_ACTION_FIELD_RETRY_LIMIT_VALUE,
      message: "'retryLimit' must be a non-negative integer",
      linterFunction: 'arazzoNonNegativeNumber',
      linterParams: [true],
      target: 'retryLimit',
    }),
    lint({
      code: ApilintCodes.ARAZZO1_FAILURE_ACTION_RETRY_FIELDS_ONLY_FOR_RETRY,
      message: "'retryAfter' and 'retryLimit' only apply to 'retry' actions",
      severity: WARNING,
      linterFunction: 'arazzoRetryFieldsOnlyForRetry',
      marker: 'key',
    }),
  ],
  reference: [
    lint({
      code: ApilintCodes.ARAZZO1_REFERENCE_FIELD_REFERENCE_FORMAT,
      message:
        "'reference' must be a runtime expression of the form $components.<inputs|parameters|successActions|failureActions>.<name>",
      linterFunction: 'apilintValueRegex',
      linterParams: [
        '^\\$components\\.(inputs|parameters|successActions|failureActions)\\.[A-Za-z0-9_.\\-]+$',
      ],
      target: 'reference',
    }),
    ...expressionLints('reference'),
  ],
};

export default specLints;
