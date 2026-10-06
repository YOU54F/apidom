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
import specLints from './spec-lints.ts';
import { FormatMeta } from '../../apidom-language-types.ts';

const withSpecLints = (key: string, meta: FormatMeta): FormatMeta => ({
  ...meta,
  lint: [...(meta.lint ?? []), ...(specLints[key] ?? [])],
});

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
  arazzoSpecification1: withSpecLints('arazzoSpecification1', arazzoSpecificationMeta),
  info: infoMeta,
  sourceDescription: withSpecLints('sourceDescription', sourceDescriptionMeta),
  workflow: withSpecLints('workflow', workflowMeta),
  step: withSpecLints('step', stepMeta),
  parameter: withSpecLints('parameter', parameterMeta),
  successAction: withSpecLints('successAction', successActionMeta),
  failureAction: withSpecLints('failureAction', failureActionMeta),
  components: componentsMeta,
  criterion: withSpecLints('criterion', criterionMeta),
  requestBody: withSpecLints('requestBody', requestBodyMeta),
  payloadReplacement: withSpecLints('payloadReplacement', payloadReplacementMeta),
  selector: withSpecLints('selector', selectorMeta),
  expressionType: withSpecLints('expressionType', expressionTypeMeta),
  reference: withSpecLints('reference', referenceMeta),
};
