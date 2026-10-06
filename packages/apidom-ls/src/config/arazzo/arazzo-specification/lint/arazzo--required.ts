import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_ARAZZO_SPECIFICATION_FIELD_ARAZZO_REQUIRED,
  source: 'apilint',
  message: "should always have a 'arazzo' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['arazzo'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'arazzo' field",
        action: 'addChild',
        snippetYaml: "arazzo: ''\n",
        snippetJson: '"arazzo": "",\n',
      },
    ],
  },
};

export default lint;
