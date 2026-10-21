import { ARAZZO1 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Workflow fields.
 * See [Workflow Object](https://spec.openapis.org/arazzo/v1.0.1.html#workflow-object).
 */
const documentation = [
  {
    target: 'workflowId',
    docs: 'Unique string identifying the workflow. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'summary',
    docs: 'A summary of the purpose of the workflow.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'description',
    docs: 'A description of the workflow. CommonMark syntax MAY be used.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'inputs',
    docs: 'A JSON Schema describing the inputs of the workflow.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'dependsOn',
    docs: 'Workflows that must complete before this one runs (workflowId or `$sourceDescriptions` expression).',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'steps',
    docs: 'The ordered list of steps. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'successActions',
    docs: 'Default success actions for all steps in this workflow.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'failureActions',
    docs: 'Default failure actions for all steps in this workflow.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'outputs',
    docs: 'Outputs of the workflow: names mapped to runtime expressions.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'parameters',
    docs: 'Parameters applied to all steps in this workflow.',
    targetSpecs: ARAZZO1,
  },
];

export default documentation;
