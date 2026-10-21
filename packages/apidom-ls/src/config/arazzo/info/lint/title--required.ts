import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_INFO_FIELD_TITLE_REQUIRED,
  source: 'apilint',
  message: "should always have a 'title' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['title'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'title' field",
        action: 'addChild',
        snippetYaml: "title: ''\n",
        snippetJson: '"title": "",\n',
      },
    ],
  },
};

export default lint;
