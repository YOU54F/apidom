import {
  ApidomCompletionItem,
  CompletionFormat,
  CompletionType,
} from '../../../apidom-language-types.ts';
import { ARAZZO1, ARAZZO11 } from '../target-specs.ts';

const completion: ApidomCompletionItem[] = [
  {
    label: 'target',
    insertText: 'target',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Payload Replacement Object](https://spec.openapis.org/arazzo/v1.0.1.html#payload-replacement-object)\n\\\n\\\nA JSON Pointer or XPath expression locating the value to replace.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'targetSelectorType',
    insertText: 'targetSelectorType',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Payload Replacement Object](https://spec.openapis.org/arazzo/v1.0.1.html#payload-replacement-object)\n\\\n\\\nThe selector syntax used by `target` (1.1+).',
    },
    targetSpecs: ARAZZO11,
  },
  {
    label: 'value',
    insertText: 'value',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Payload Replacement Object](https://spec.openapis.org/arazzo/v1.0.1.html#payload-replacement-object)\n\\\n\\\nThe replacement value, or a runtime expression.',
    },
    targetSpecs: ARAZZO1,
  },
];

export default completion;
