import {
  ApidomCompletionItem,
  CompletionFormat,
  CompletionType,
} from '../../../apidom-language-types.ts';
import { ARAZZO1 } from '../target-specs.ts';

const completion: ApidomCompletionItem[] = [
  {
    label: 'inputs',
    insertText: 'inputs',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Components Object](https://spec.openapis.org/arazzo/v1.0.1.html#components-object)\n\\\n\\\nReusable JSON Schemas for workflow inputs.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'parameters',
    insertText: 'parameters',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Components Object](https://spec.openapis.org/arazzo/v1.0.1.html#components-object)\n\\\n\\\nReusable Parameter Objects.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'successActions',
    insertText: 'successActions',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Components Object](https://spec.openapis.org/arazzo/v1.0.1.html#components-object)\n\\\n\\\nReusable Success Action Objects.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'failureActions',
    insertText: 'failureActions',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Components Object](https://spec.openapis.org/arazzo/v1.0.1.html#components-object)\n\\\n\\\nReusable Failure Action Objects.',
    },
    targetSpecs: ARAZZO1,
  },
];

export default completion;
