import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_WORKFLOW_FIELD_WORKFLOW_ID_UNIQUE,
  source: 'apilint',
  message: "'workflowId' must be unique among all workflows",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'apilintPropertyUniqueValue',
  linterParams: [['workflow'], 'workflowId', 'propertyValues'],
  marker: 'value',
  target: 'workflowId',
  targetSpecs: ARAZZO1,
};

export default lint;
