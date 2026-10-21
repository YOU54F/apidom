import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_SUCCESS_ACTION_FIELD_TYPE_ENUM,
  source: 'apilint',
  message: "'type' must be one of allowed values: end, goto",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'apilintValueOrArray',
  linterParams: [['end', 'goto']],
  marker: 'value',
  target: 'type',
  data: {},
  targetSpecs: ARAZZO1,
};

export default lint;
