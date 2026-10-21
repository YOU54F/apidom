import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO11 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_STEP_FIELD_ACTION_ENUM,
  source: 'apilint',
  message: "'action' must be one of allowed values: send, receive",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'apilintValueOrArray',
  linterParams: [['send', 'receive']],
  marker: 'value',
  target: 'action',
  data: {},
  targetSpecs: ARAZZO11,
};

export default lint;
