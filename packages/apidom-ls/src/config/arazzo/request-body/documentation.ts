import { ARAZZO1 } from '../target-specs.ts';

/**
 * Hover documentation for Arazzo Request Body fields.
 * See [Request Body Object](https://spec.openapis.org/arazzo/v1.0.1.html#request-body-object).
 */
const documentation = [
  {
    target: 'contentType',
    docs: 'The Content-Type of the request body.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'payload',
    docs: 'The payload, which MAY contain runtime expressions.',
    targetSpecs: ARAZZO1,
  },
  {
    target: 'replacements',
    docs: 'Payload Replacement Objects applied to the payload.',
    targetSpecs: ARAZZO1,
  },
];

export default documentation;
