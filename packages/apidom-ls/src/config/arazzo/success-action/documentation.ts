import { ARAZZO1 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Success Action fields.
 * See [Success Action Object](https://spec.openapis.org/arazzo/v1.0.1.html#success-action-object).
 */
const documentation = [
  {
    target: 'name',
    docs: 'The name of the success action. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'type',
    docs: 'The type of action: `end` or `goto`. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'workflowId',
    docs: 'The workflow to go to (with `goto`).',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'stepId',
    docs: 'The step to go to (with `goto`).',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'criteria',
    docs: 'Criteria that must hold for the action to run.',
    targetSpecs: ARAZZO1,
  },
];

export default documentation;
