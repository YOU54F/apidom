import { ARAZZO1, ARAZZO11 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Step fields.
 * See [Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object).
 */
const documentation = [
  {
    target: 'stepId',
    docs: 'Unique string identifying the step within its workflow. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'description',
    docs: 'A description of the step.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'operationId',
    docs: 'The operationId of an operation in a source description, as `$sourceDescriptions.<name>.<operationId>`.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'operationPath',
    docs: 'A JSON Pointer expression to an operation in a source description.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'workflowId',
    docs: 'The workflowId of a workflow this step invokes.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'channelPath',
    docs: 'A reference to an AsyncAPI channel (1.1+).',
    targetSpecs: ARAZZO11,
  },
  {
    target: 'action',
    docs: 'The AsyncAPI action to perform: `send` or `receive` (1.1+).',
    targetSpecs: ARAZZO11,
  },
  {
    target: 'parameters',
    docs: 'Parameters passed to the operation or workflow.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'requestBody',
    docs: 'The request body to send with the operation.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'successCriteria',
    docs: 'Criteria that must hold for the step to be considered successful.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'onSuccess',
    docs: 'Actions to take when the step succeeds.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'onFailure',
    docs: 'Actions to take when the step fails.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'outputs',
    docs: 'Outputs of the step: names mapped to runtime expressions.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'timeout',
    docs: 'Time in milliseconds to wait for the step to complete (1.1+).',
    targetSpecs: ARAZZO11,
  },
  {
    target: 'correlationId',
    docs: 'Correlation identifier for request/reply messaging (1.1+).',
    targetSpecs: ARAZZO11,
  },
];

export default documentation;
