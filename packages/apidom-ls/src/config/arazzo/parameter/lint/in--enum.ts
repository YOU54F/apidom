import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO10 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_PARAMETER_FIELD_IN_ENUM,
  source: 'apilint',
  message: "'in' must be one of allowed values: path, query, header, cookie",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'apilintValueOrArray',
  linterParams: [['path', 'query', 'header', 'cookie']],
  marker: 'value',
  target: 'in',
  data: {},
  targetSpecs: ARAZZO10,
};

export default lint;
