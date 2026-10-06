import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_STEP_FIELD_STEP_ID_REQUIRED,
  source: 'apilint',
  message: "should always have a 'stepId' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['stepId'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'stepId' field",
        action: 'addChild',
        snippetYaml: "stepId: ''\n",
        snippetJson: '"stepId": "",\n',
      },
    ],
  },
};

export default lint;
