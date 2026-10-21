import {
  ApidomCompletionItem,
  CompletionFormat,
  CompletionType,
} from '../../../apidom-language-types.ts';
import { ARAZZO1, ARAZZO11 } from '../target-specs.ts';

const completion: ApidomCompletionItem[] = [
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
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nUnique string identifying the step within its workflow.',
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
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nA description of the step.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'operationId',
    insertText: 'operationId',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nThe operationId of an operation in a source description, as `$sourceDescriptions.<name>.<operationId>`.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'operationPath',
    insertText: 'operationPath',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nA JSON Pointer expression to an operation in a source description.',
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
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nThe workflowId of a workflow this step invokes.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'channelPath',
    insertText: 'channelPath',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nA reference to an AsyncAPI channel (1.1+).',
    },
    targetSpecs: ARAZZO11,
  },
  {
    label: 'action',
    insertText: 'action',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nThe AsyncAPI action to perform: `send` or `receive` (1.1+).',
    },
    targetSpecs: ARAZZO11,
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
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nParameters passed to the operation or workflow.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'requestBody',
    insertText: 'requestBody',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nThe request body to send with the operation.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'successCriteria',
    insertText: 'successCriteria',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nCriteria that must hold for the step to be considered successful.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'onSuccess',
    insertText: 'onSuccess',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nActions to take when the step succeeds.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'onFailure',
    insertText: 'onFailure',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nActions to take when the step fails.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'outputs',
    insertText: 'outputs',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nOutputs of the step: names mapped to runtime expressions.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'timeout',
    insertText: 'timeout',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nTime in milliseconds to wait for the step to complete (1.1+).',
    },
    targetSpecs: ARAZZO11,
  },
  {
    label: 'correlationId',
    insertText: 'correlationId',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Step Object](https://spec.openapis.org/arazzo/v1.0.1.html#step-object)\n\\\n\\\nCorrelation identifier for request/reply messaging (1.1+).',
    },
    targetSpecs: ARAZZO11,
  },
];

export default completion;
