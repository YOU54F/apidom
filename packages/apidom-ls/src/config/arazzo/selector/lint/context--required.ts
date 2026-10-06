import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_SELECTOR_FIELD_CONTEXT_REQUIRED,
  source: 'apilint',
  message: "should always have a 'context' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['context'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'context' field",
        action: 'addChild',
        snippetYaml: "context: ''\n",
        snippetJson: '"context": "",\n',
      },
    ],
  },
};

export default lint;
