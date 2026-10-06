import { ARAZZO1 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Failure Action fields.
 * See [Failure Action Object](https://spec.openapis.org/arazzo/v1.0.1.html#failure-action-object).
 */
const documentation = [
  {
    target: 'name',
    docs: 'The name of the failure action. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'type',
    docs: 'The type of action: `end`, `goto` or `retry`. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'workflowId',
    docs: 'The workflow to go to (with `goto` or `retry`).',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'stepId',
    docs: 'The step to go to (with `goto` or `retry`).',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'retryAfter',
    docs: 'Seconds to wait before retrying (with `retry`).',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'retryLimit',
    docs: 'Maximum number of retries (with `retry`).',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'criteria',
    docs: 'Criteria that must hold for the action to run.',
    targetSpecs: ARAZZO1,
  },
];

export default documentation;
