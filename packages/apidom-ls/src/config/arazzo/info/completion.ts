import {
  ApidomCompletionItem,
  CompletionFormat,
  CompletionType,
} from '../../../apidom-language-types.ts';
import { ARAZZO1 } from '../target-specs.ts';

const completion: ApidomCompletionItem[] = [
  {
    label: 'title',
    insertText: 'title',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Info Object](https://spec.openapis.org/arazzo/v1.0.1.html#info-object)\n\\\n\\\nA human readable title of the Arazzo Description.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'summary',
    insertText: 'summary',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Info Object](https://spec.openapis.org/arazzo/v1.0.1.html#info-object)\n\\\n\\\nA short summary of the Arazzo Description.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'description',
    insertText: 'description',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Info Object](https://spec.openapis.org/arazzo/v1.0.1.html#info-object)\n\\\n\\\nA description of the purpose of the workflows. CommonMark syntax MAY be used.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'version',
    insertText: 'version',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Info Object](https://spec.openapis.org/arazzo/v1.0.1.html#info-object)\n\\\n\\\nThe version of the Arazzo Description document (distinct from the specification version).',
    },
    targetSpecs: ARAZZO1,
  },
];

export default completion;
