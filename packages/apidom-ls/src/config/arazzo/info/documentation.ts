import { ARAZZO1 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Info fields.
 * See [Info Object](https://spec.openapis.org/arazzo/v1.0.1.html#info-object).
 */
const documentation = [
  {
    target: 'title',
    docs: 'A human readable title of the Arazzo Description. (required)',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'summary',
    docs: 'A short summary of the Arazzo Description.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'description',
    docs: 'A description of the purpose of the workflows. CommonMark syntax MAY be used.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'version',
    docs: 'The version of the Arazzo Description document (distinct from the specification version). (required)',
    targetSpecs: ARAZZO1,
  },
];

export default documentation;
