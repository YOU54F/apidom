import { DiagnosticSeverity } from 'vscode-languageserver-types';

import ApilintCodes from '../../../codes.ts';
import { LinterMeta } from '../../../../apidom-language-types.ts';
import { ARAZZO1 } from '../../target-specs.ts';

const lint: LinterMeta = {
  code: ApilintCodes.ARAZZO1_WORKFLOW_FIELD_WORKFLOW_ID_REQUIRED,
  source: 'apilint',
  message: "should always have a 'workflowId' field",
  severity: DiagnosticSeverity.Error,
  linterFunction: 'hasRequiredField',
  linterParams: ['workflowId'],
  marker: 'key',
  targetSpecs: ARAZZO1,
  data: {
    quickFix: [
      {
        message: "add 'workflowId' field",
        action: 'addChild',
        snippetYaml: "workflowId: ''\n",
        snippetJson: '"workflowId": "",\n',
      },
    ],
  },
};

export default lint;
