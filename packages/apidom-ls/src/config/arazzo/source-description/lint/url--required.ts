import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_SOURCE_DESCRIPTION_FIELD_URL_REQUIRED,
  source: 'apilint',
  message: "should always have a 'url' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['url'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'url' field",
        action: 'addChild',
        snippetYaml: "url: ''\n",
        snippetJson: '"url": "",\n',
      },
    ],
  },
};

export default lint;
