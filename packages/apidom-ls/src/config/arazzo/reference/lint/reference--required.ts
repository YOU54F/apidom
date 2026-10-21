import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_REFERENCE_FIELD_REFERENCE_REQUIRED,
  source: 'apilint',
  message: "should always have a 'reference' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['reference'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'reference' field",
        action: 'addChild',
        snippetYaml: "reference: ''\n",
        snippetJson: '"reference": "",\n',
      },
    ],
  },
};

export default lint;
