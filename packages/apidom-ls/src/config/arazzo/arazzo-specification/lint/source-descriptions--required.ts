import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_ARAZZO_SPECIFICATION_FIELD_SOURCE_DESCRIPTIONS_REQUIRED,
  source: 'apilint',
  message: "should always have a 'sourceDescriptions' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['sourceDescriptions'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'sourceDescriptions' field",
        action: 'addChild',
        snippetYaml: "sourceDescriptions: ''\n",
        snippetJson: '"sourceDescriptions": "",\n',
      },
    ],
  },
};

export default lint;
