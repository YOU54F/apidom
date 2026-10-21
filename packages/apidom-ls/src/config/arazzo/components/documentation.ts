import { ARAZZO1 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Components fields.
 * See [Components Object](https://spec.openapis.org/arazzo/v1.0.1.html#components-object).
 */
const documentation = [
  {
    target: 'inputs',
    docs: 'Reusable JSON Schemas for workflow inputs.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'parameters',
    docs: 'Reusable Parameter Objects.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'successActions',
    docs: 'Reusable Success Action Objects.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'failureActions',
    docs: 'Reusable Failure Action Objects.',
    targetSpecs: ARAZZO1,
  },
];

export default documentation;
