import { DiagnosticSeverity } from 'vscode-languageserver-types';

import arazzoSpecificationMeta from './arazzo-specification/meta.ts';
import infoMeta from './info/meta.ts';
import sourceDescriptionMeta from './source-description/meta.ts';
import workflowMeta from './workflow/meta.ts';
import stepMeta from './step/meta.ts';
import parameterMeta from './parameter/meta.ts';
import successActionMeta from './success-action/meta.ts';
import failureActionMeta from './failure-action/meta.ts';
import componentsMeta from './components/meta.ts';
import criterionMeta from './criterion/meta.ts';
import requestBodyMeta from './request-body/meta.ts';
import payloadReplacementMeta from './payload-replacement/meta.ts';
import selectorMeta from './selector/meta.ts';
import expressionTypeMeta from './expression-type/meta.ts';
import referenceMeta from './reference/meta.ts';
import ApilintCodes from '../codes.ts';

export default {
  '*': {
    lint: [
      {
        code: ApilintCodes.DUPLICATE_KEYS,
        source: 'apilint',
        message: 'an object cannot contain duplicate keys',
        severity: DiagnosticSeverity.Error,
        linterFunction: 'apilintNoDuplicateKeys',
        marker: 'key',
      },
    ],
  },
  arazzoSpecification1: arazzoSpecificationMeta,
  info: infoMeta,
  sourceDescription: sourceDescriptionMeta,
  workflow: workflowMeta,
  step: stepMeta,
  parameter: parameterMeta,
  successAction: successActionMeta,
  failureAction: failureActionMeta,
  components: componentsMeta,
  criterion: criterionMeta,
  requestBody: requestBodyMeta,
  payloadReplacement: payloadReplacementMeta,
  selector: selectorMeta,
  expressionType: expressionTypeMeta,
  reference: referenceMeta,
};
