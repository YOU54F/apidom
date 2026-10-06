import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_CRITERION_FIELD_CONDITION_REQUIRED,
  source: 'apilint',
  message: "should always have a 'condition' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['condition'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'condition' field",
        action: 'addChild',
        snippetYaml: "condition: ''\n",
        snippetJson: '"condition": "",\n',
      },
    ],
  },
};

export default lint;
