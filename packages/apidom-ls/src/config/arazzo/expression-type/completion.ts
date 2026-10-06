import {
  ApidomCompletionItem,
  CompletionFormat,
  CompletionType,
} from '../../../apidom-language-types.ts';
import { ARAZZO1 } from '../target-specs.ts';

const completion: ApidomCompletionItem[] = [
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
        '[Expression Type Object](https://spec.openapis.org/arazzo/v1.0.1.html#expression-type-object)\n\\\n\\\nThe expression syntax: `jsonpath` or `xpath`.',
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
        '[Expression Type Object](https://spec.openapis.org/arazzo/v1.0.1.html#expression-type-object)\n\\\n\\\nThe version of the expression syntax.',
    },
    targetSpecs: ARAZZO1,
  },
];

export default completion;
