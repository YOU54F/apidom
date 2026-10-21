import { ARAZZO1 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Reusable fields.
 * See [Reusable Object](https://spec.openapis.org/arazzo/v1.0.1.html#reusable-object).
 */
const documentation = [
  {
    target: 'reference',
    docs: 'A runtime expression referencing a component, e.g. `$components.parameters.page`. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'value',
    docs: 'A value overriding the referenced object (parameters only).',
    targetSpecs: ARAZZO1,
  },
];

export default documentation;
