import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_SUCCESS_ACTION_FIELD_WORKFLOW_ID_EXISTS,
  source: 'apilint',
  message: "'workflowId' does not match any workflow in this document",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'arazzoWorkflowExists',
  marker: 'value',
  target: 'workflowId',
  targetSpecs: ARAZZO1,
};

export default lint;
