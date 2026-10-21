import { ARAZZO1 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Parameter fields.
 * See [Parameter Object](https://spec.openapis.org/arazzo/v1.0.1.html#parameter-object).
 */
const documentation = [
  {
    target: 'name',
    docs: 'The name of the parameter. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'in',
    docs: 'The location of the parameter: `path`, `query`, `header` or `cookie`. Required for operation steps.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'value',
    docs: 'The value to pass, or a runtime expression. (required)',
    targetSpecs: ARAZZO1,
  },
];

export default documentation;
