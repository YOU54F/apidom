import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_ARAZZO_SPECIFICATION_FIELD_WORKFLOWS_REQUIRED,
  source: 'apilint',
  message: "should always have a 'workflows' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['workflows'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'workflows' field",
        action: 'addChild',
        snippetYaml: "workflows: ''\n",
        snippetJson: '"workflows": "",\n',
      },
    ],
  },
};

export default lint;
