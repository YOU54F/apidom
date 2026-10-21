import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_PAYLOAD_REPLACEMENT_FIELD_TARGET_REQUIRED,
  source: 'apilint',
  message: "should always have a 'target' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['target'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'target' field",
        action: 'addChild',
        snippetYaml: "target: ''\n",
        snippetJson: '"target": "",\n',
      },
    ],
  },
};

export default lint;
