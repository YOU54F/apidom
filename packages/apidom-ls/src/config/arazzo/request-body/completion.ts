import {
  ApidomCompletionItem,
  CompletionFormat,
  CompletionType,
} from '../../../apidom-language-types.ts';
import { ARAZZO1 } from '../target-specs.ts';

const completion: ApidomCompletionItem[] = [
  {
    label: 'contentType',
    insertText: 'contentType',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Request Body Object](https://spec.openapis.org/arazzo/v1.0.1.html#request-body-object)\n\\\n\\\nThe Content-Type of the request body.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'payload',
    insertText: 'payload',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Request Body Object](https://spec.openapis.org/arazzo/v1.0.1.html#request-body-object)\n\\\n\\\nThe payload, which MAY contain runtime expressions.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'replacements',
    insertText: 'replacements',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Request Body Object](https://spec.openapis.org/arazzo/v1.0.1.html#request-body-object)\n\\\n\\\nPayload Replacement Objects applied to the payload.',
    },
    targetSpecs: ARAZZO1,
  },
];

export default completion;
