import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO10 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_SOURCE_DESCRIPTION_FIELD_TYPE_ENUM,
  source: 'apilint',
  message: "'type' must be one of allowed values: openapi, arazzo",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'apilintValueOrArray',
  linterParams: [['openapi', 'arazzo']],
  marker: 'value',
  target: 'type',
  data: {},
  targetSpecs: ARAZZO10,
};

export default lint;
