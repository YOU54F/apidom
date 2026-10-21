import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO11 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_STEP_FIELD_CHANNEL_PATH_TYPE,
  source: 'apilint',
  message: "'channelPath' must be a string",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'apilintType',
  linterParams: ['string'],
  marker: 'value',
  target: 'channelPath',
  targetSpecs: ARAZZO11,
};

export default lint;
