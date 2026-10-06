import { ARAZZO1 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Selector fields.
 * See [Selector Object](https://spec.openapis.org/arazzo/v1.0.1.html#selector-object).
 */
const documentation = [
  {
    target: 'context',
    docs: 'A runtime expression identifying the value to select from. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'selector',
    docs: 'The selector expression. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'type',
    docs: 'The selector syntax: `jsonpointer`, `jsonpath`, `xpath`, or an Expression Type Object.',
    targetSpecs: ARAZZO1,
  },
];

export default documentation;
