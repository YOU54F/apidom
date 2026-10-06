import {
  ApidomCompletionItem,
  CompletionFormat,
  CompletionType,
} from '../../../apidom-language-types.ts';
import { ARAZZO1 } from '../target-specs.ts';

const completion: ApidomCompletionItem[] = [
  {
    label: 'reference',
    insertText: 'reference',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Reusable Object](https://spec.openapis.org/arazzo/v1.0.1.html#reusable-object)\n\\\n\\\nA runtime expression referencing a component, e.g. `$components.parameters.page`.',
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
        '[Reusable Object](https://spec.openapis.org/arazzo/v1.0.1.html#reusable-object)\n\\\n\\\nA value overriding the referenced object (parameters only).',
    },
    targetSpecs: ARAZZO1,
  },
];

export default completion;
