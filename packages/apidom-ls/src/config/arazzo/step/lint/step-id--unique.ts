import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_STEP_FIELD_STEP_ID_UNIQUE,
  source: 'apilint',
  message: "'stepId' must be unique within the workflow",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'arazzoStepIdUnique',
  marker: 'value',
  target: 'stepId',
  targetSpecs: ARAZZO1,
};

export default lint;
