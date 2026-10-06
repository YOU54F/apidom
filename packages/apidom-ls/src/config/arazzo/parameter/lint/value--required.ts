import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_PARAMETER_FIELD_VALUE_REQUIRED,
  source: 'apilint',
  message: "should always have a 'value' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['value'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'value' field",
        action: 'addChild',
        snippetYaml: "value: ''\n",
        snippetJson: '"value": "",\n',
      },
    ],
  },
};

export default lint;
