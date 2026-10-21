import { ARAZZO1 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Criterion fields.
 * See [Criterion Object](https://spec.openapis.org/arazzo/v1.0.1.html#criterion-object).
 */
const documentation = [
  {
    target: 'context',
    docs: 'A runtime expression the condition applies to. Required when `type` is set.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'condition',
    docs: 'The condition to apply. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'type',
    docs: 'The condition syntax: `simple`, `regex`, `jsonpath`, `xpath`, or an Expression Type Object.',
    targetSpecs: ARAZZO1,
  },
];

export default documentation;
