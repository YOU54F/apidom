import {
  ApidomCompletionItem,
  CompletionFormat,
  CompletionType,
} from '../../../apidom-language-types.ts';
import { ARAZZO1 } from '../target-specs.ts';

const completion: ApidomCompletionItem[] = [
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
        '[Workflow Object](https://spec.openapis.org/arazzo/v1.0.1.html#workflow-object)\n\\\n\\\nUnique string identifying the workflow.',
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
        '[Workflow Object](https://spec.openapis.org/arazzo/v1.0.1.html#workflow-object)\n\\\n\\\nA summary of the purpose of the workflow.',
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
        '[Workflow Object](https://spec.openapis.org/arazzo/v1.0.1.html#workflow-object)\n\\\n\\\nA description of the workflow. CommonMark syntax MAY be used.',
    },
    targetSpecs: ARAZZO1,
  },
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
        '[Workflow Object](https://spec.openapis.org/arazzo/v1.0.1.html#workflow-object)\n\\\n\\\nA JSON Schema describing the inputs of the workflow.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'dependsOn',
    insertText: 'dependsOn',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Workflow Object](https://spec.openapis.org/arazzo/v1.0.1.html#workflow-object)\n\\\n\\\nWorkflows that must complete before this one runs (workflowId or `$sourceDescriptions` expression).',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'steps',
    insertText: 'steps',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Workflow Object](https://spec.openapis.org/arazzo/v1.0.1.html#workflow-object)\n\\\n\\\nThe ordered list of steps.',
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
        '[Workflow Object](https://spec.openapis.org/arazzo/v1.0.1.html#workflow-object)\n\\\n\\\nDefault success actions for all steps in this workflow.',
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
        '[Workflow Object](https://spec.openapis.org/arazzo/v1.0.1.html#workflow-object)\n\\\n\\\nDefault failure actions for all steps in this workflow.',
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
        '[Workflow Object](https://spec.openapis.org/arazzo/v1.0.1.html#workflow-object)\n\\\n\\\nOutputs of the workflow: names mapped to runtime expressions.',
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
        '[Workflow Object](https://spec.openapis.org/arazzo/v1.0.1.html#workflow-object)\n\\\n\\\nParameters applied to all steps in this workflow.',
    },
    targetSpecs: ARAZZO1,
  },
];

export default completion;
