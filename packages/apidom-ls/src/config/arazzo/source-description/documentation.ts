import { ARAZZO1 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Source Description fields.
 * See [Source Description Object](https://spec.openapis.org/arazzo/v1.0.1.html#source-description-object).
 */
const documentation = [
  {
    target: 'name',
    docs: 'A unique name for the source description, referenced as `$sourceDescriptions.<name>`. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'url',
    docs: 'A URL to the source description document. Relative references resolve against the Arazzo document. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'type',
    docs: 'The type of the source description: `openapi` or `arazzo`.',
    targetSpecs: ARAZZO1,
  },
];

export default documentation;
