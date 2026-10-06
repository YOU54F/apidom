import {
  ApidomCompletionItem,
  CompletionFormat,
  CompletionType,
} from '../../../apidom-language-types.ts';
import { ARAZZO1, ARAZZO11 } from '../target-specs.ts';

const completion: ApidomCompletionItem[] = [
  {
    label: 'arazzo',
    insertText: 'arazzo',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Arazzo Specification Object](https://spec.openapis.org/arazzo/v1.0.1.html#arazzo-specification-object)\n\\\n\\\nThe version number of the Arazzo Specification (`1.0.0`, `1.0.1` or `1.1.0`).',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: '$self',
    insertText: '$self',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Arazzo Specification Object](https://spec.openapis.org/arazzo/v1.0.1.html#arazzo-specification-object)\n\\\n\\\nA URI identifying this document, used as the base for resolving relative references (1.1+).',
    },
    targetSpecs: ARAZZO11,
  },
  {
    label: 'info',
    insertText: 'info',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Arazzo Specification Object](https://spec.openapis.org/arazzo/v1.0.1.html#arazzo-specification-object)\n\\\n\\\nMetadata about the workflows contained in this document.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'sourceDescriptions',
    insertText: 'sourceDescriptions',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Arazzo Specification Object](https://spec.openapis.org/arazzo/v1.0.1.html#arazzo-specification-object)\n\\\n\\\nThe OpenAPI or Arazzo documents the workflows use.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'workflows',
    insertText: 'workflows',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Arazzo Specification Object](https://spec.openapis.org/arazzo/v1.0.1.html#arazzo-specification-object)\n\\\n\\\nThe list of workflows.',
    },
    targetSpecs: ARAZZO1,
  },
  {
    label: 'components',
    insertText: 'components',
    kind: 14,
    format: CompletionFormat.QUOTED,
    type: CompletionType.PROPERTY,
    insertTextFormat: 2,
    documentation: {
      kind: 'markdown',
      value:
        '[Arazzo Specification Object](https://spec.openapis.org/arazzo/v1.0.1.html#arazzo-specification-object)\n\\\n\\\nReusable inputs, parameters and actions referenced from workflows.',
    },
    targetSpecs: ARAZZO1,
  },
];

export default completion;
