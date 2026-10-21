import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_WORKFLOW_FIELD_STEPS_REQUIRED,
  source: 'apilint',
  message: "should always have a 'steps' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['steps'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'steps' field",
        action: 'addChild',
        snippetYaml: "steps: ''\n",
        snippetJson: '"steps": "",\n',
      },
    ],
  },
};

export default lint;
