import { ARAZZO1 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Expression Type fields.
 * See [Expression Type Object](https://spec.openapis.org/arazzo/v1.0.1.html#expression-type-object).
 */
const documentation = [
  {
    target: 'type',
    docs: 'The expression syntax: `jsonpath` or `xpath`. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'version',
    docs: 'The version of the expression syntax. (required)',
    targetSpecs: ARAZZO1,
  },
];

export default documentation;
