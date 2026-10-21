import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_SUCCESS_ACTION_FIELD_STEP_ID_EXISTS,
  source: 'apilint',
  message: "'stepId' does not match any step in this workflow",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'arazzoStepExists',
  marker: 'value',
  target: 'stepId',
  targetSpecs: ARAZZO1,
};

export default lint;
