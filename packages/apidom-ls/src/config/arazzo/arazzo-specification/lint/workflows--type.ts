import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_ARAZZO_SPECIFICATION_FIELD_WORKFLOWS_TYPE,
  source: 'apilint',
  message: "'workflows' must be an array",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'apilintType',
  linterParams: ['array'],
  marker: 'value',
  target: 'workflows',
  targetSpecs: ARAZZO1,
};

export default lint;
