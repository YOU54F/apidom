import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_SELECTOR_FIELD_SELECTOR_REQUIRED,
  source: 'apilint',
  message: "should always have a 'selector' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['selector'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'selector' field",
        action: 'addChild',
        snippetYaml: "selector: ''\n",
        snippetJson: '"selector": "",\n',
      },
    ],
  },
};

export default lint;
