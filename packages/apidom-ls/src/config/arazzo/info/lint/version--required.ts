import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_INFO_FIELD_VERSION_REQUIRED,
  source: 'apilint',
  message: "should always have a 'version' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['version'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'version' field",
        action: 'addChild',
        snippetYaml: "version: ''\n",
        snippetJson: '"version": "",\n',
      },
    ],
  },
};

export default lint;
