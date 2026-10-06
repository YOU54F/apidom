import {
  ApidomCompletionItem,
  CompletionFormat,
  CompletionType,
} from '../../../apidom-language-types.ts';
import { ARAZZO1 } from '../target-specs.ts';

const completion: ApidomCompletionItem[] = [
  {
    label: 'name',
    insertText: 'name',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Source Description Object](https://spec.openapis.org/arazzo/v1.0.1.html#source-description-object)\n\\\n\\\nA unique name for the source description, referenced as `$sourceDescriptions.<name>`.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'url',
    insertText: 'url',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Source Description Object](https://spec.openapis.org/arazzo/v1.0.1.html#source-description-object)\n\\\n\\\nA URL to the source description document. Relative references resolve against the Arazzo document.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'type',
    insertText: 'type',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Source Description Object](https://spec.openapis.org/arazzo/v1.0.1.html#source-description-object)\n\\\n\\\nThe type of the source description: `openapi` or `arazzo`.',
    },
    targetSpecs: ARAZZO1,
  },
];

export default completion;
