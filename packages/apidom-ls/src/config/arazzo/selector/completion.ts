import {
  ApidomCompletionItem,
  CompletionFormat,
  CompletionType,
} from '../../../apidom-language-types.ts';
import { ARAZZO1 } from '../target-specs.ts';

const completion: ApidomCompletionItem[] = [
  {
    label: 'context',
    insertText: 'context',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Selector Object](https://spec.openapis.org/arazzo/v1.0.1.html#selector-object)\n\\\n\\\nA runtime expression identifying the value to select from.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'selector',
    insertText: 'selector',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Selector Object](https://spec.openapis.org/arazzo/v1.0.1.html#selector-object)\n\\\n\\\nThe selector expression.',
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
        '[Selector Object](https://spec.openapis.org/arazzo/v1.0.1.html#selector-object)\n\\\n\\\nThe selector syntax: `jsonpointer`, `jsonpath`, `xpath`, or an Expression Type Object.',
    },
    targetSpecs: ARAZZO1,
  },
];

export default completion;
