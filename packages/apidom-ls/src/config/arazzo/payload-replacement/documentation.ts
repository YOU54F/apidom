import { ARAZZO1, ARAZZO11 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Payload Replacement fields.
 * See [Payload Replacement Object](https://spec.openapis.org/arazzo/v1.0.1.html#payload-replacement-object).
 */
const documentation = [
  {
    target: 'target',
    docs: 'A JSON Pointer or XPath expression locating the value to replace. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'targetSelectorType',
    docs: 'The selector syntax used by `target` (1.1+).',
    targetSpecs: ARAZZO11,
  },
  {
    target: 'value',
    docs: 'The replacement value, or a runtime expression. (required)',
    targetSpecs: ARAZZO1,
  },
];

export default documentation;
