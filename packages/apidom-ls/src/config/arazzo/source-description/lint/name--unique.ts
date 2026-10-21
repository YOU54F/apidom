import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_SOURCE_DESCRIPTION_FIELD_NAME_UNIQUE,
  source: 'apilint',
  message: "'name' must be unique among all source descriptions",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'apilintPropertyUniqueValue',
  linterParams: [['sourceDescription'], 'name', 'propertyValues'],
  marker: 'value',
  target: 'name',
  targetSpecs: ARAZZO1,
};

export default lint;
