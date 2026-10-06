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
        '[Success Action Object](https://spec.openapis.org/arazzo/v1.0.1.html#success-action-object)\n\\\n\\\nThe name of the success action.',
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
        '[Success Action Object](https://spec.openapis.org/arazzo/v1.0.1.html#success-action-object)\n\\\n\\\nThe type of action: `end` or `goto`.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'workflowId',
    insertText: 'workflowId',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Success Action Object](https://spec.openapis.org/arazzo/v1.0.1.html#success-action-object)\n\\\n\\\nThe workflow to go to (with `goto`).',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'stepId',
    insertText: 'stepId',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Success Action Object](https://spec.openapis.org/arazzo/v1.0.1.html#success-action-object)\n\\\n\\\nThe step to go to (with `goto`).',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'criteria',
    insertText: 'criteria',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Success Action Object](https://spec.openapis.org/arazzo/v1.0.1.html#success-action-object)\n\\\n\\\nCriteria that must hold for the action to run.',
    },
    targetSpecs: ARAZZO1,
  },
];

export default completion;
