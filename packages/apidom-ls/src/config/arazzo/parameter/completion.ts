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
        '[Parameter Object](https://spec.openapis.org/arazzo/v1.0.1.html#parameter-object)\n\\\n\\\nThe name of the parameter.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'in',
    insertText: 'in',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Parameter Object](https://spec.openapis.org/arazzo/v1.0.1.html#parameter-object)\n\\\n\\\nThe location of the parameter: `path`, `query`, `header` or `cookie`. Required for operation steps.',
    },
    targetSpecs: ARAZZO1,
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
        '[Parameter Object](https://spec.openapis.org/arazzo/v1.0.1.html#parameter-object)\n\\\n\\\nThe value to pass, or a runtime expression.',
    },
    targetSpecs: ARAZZO1,
  },
];

export default completion;
