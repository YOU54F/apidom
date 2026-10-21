import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_FAILURE_ACTION_FIELD_RETRY_AFTER_TYPE,
  source: 'apilint',
  message: "'retryAfter' must be a number",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'apilintType',
  linterParams: ['number'],
  marker: 'value',
  target: 'retryAfter',
  targetSpecs: ARAZZO1,
};

export default lint;
