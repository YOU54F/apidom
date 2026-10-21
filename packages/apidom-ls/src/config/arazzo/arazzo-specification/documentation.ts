import { ARAZZO1, ARAZZO11 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Arazzo Specification fields.
 * See [Arazzo Specification Object](https://spec.openapis.org/arazzo/v1.0.1.html#arazzo-specification-object).
 */
const documentation = [
  {
    target: 'arazzo',
    docs: 'The version number of the Arazzo Specification (`1.0.0`, `1.0.1` or `1.1.0`). (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: '$self',
    docs: 'A URI identifying this document, used as the base for resolving relative references (1.1+).',
    targetSpecs: ARAZZO11,
  },
  {
    target: 'info',
    docs: 'Metadata about the workflows contained in this document. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'sourceDescriptions',
    docs: 'The OpenAPI or Arazzo documents the workflows use. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'workflows',
    docs: 'The list of workflows. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'components',
    docs: 'Reusable inputs, parameters and actions referenced from workflows.',
    targetSpecs: ARAZZO1,
  },
];

export default documentation;
