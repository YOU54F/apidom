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
        '[Criterion Object](https://spec.openapis.org/arazzo/v1.0.1.html#criterion-object)\n\\\n\\\nA runtime expression the condition applies to. Required when `type` is set.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'condition',
    insertText: 'condition',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Criterion Object](https://spec.openapis.org/arazzo/v1.0.1.html#criterion-object)\n\\\n\\\nThe condition to apply.',
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
        '[Criterion Object](https://spec.openapis.org/arazzo/v1.0.1.html#criterion-object)\n\\\n\\\nThe condition syntax: `simple`, `regex`, `jsonpath`, `xpath`, or an Expression Type Object.',
    },
    targetSpecs: ARAZZO1,
  },
];

export default completion;
