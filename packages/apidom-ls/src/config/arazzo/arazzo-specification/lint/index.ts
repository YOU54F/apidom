import allowedFieldsLint from './allowed-fields.ts';
import allowedFields11Lint from './allowed-fields-1-1.ts';
import arazzoRequiredLint from './arazzo--required.ts';
import arazzoTypeLint from './arazzo--type.ts';
import selfTypeLint from './self--type.ts';
import infoRequiredLint from './info--required.ts';
import infoTypeLint from './info--type.ts';
import sourceDescriptionsRequiredLint from './source-descriptions--required.ts';
import sourceDescriptionsTypeLint from './source-descriptions--type.ts';
import workflowsRequiredLint from './workflows--required.ts';
import workflowsTypeLint from './workflows--type.ts';
import componentsTypeLint from './components--type.ts';

const lints = [
  allowedFieldsLint,
  allowedFields11Lint,
  arazzoRequiredLint,
  arazzoTypeLint,
  selfTypeLint,
  infoRequiredLint,
  infoTypeLint,
  sourceDescriptionsRequiredLint,
  sourceDescriptionsTypeLint,
  workflowsRequiredLint,
  workflowsTypeLint,
  componentsTypeLint,
];

export default lints;
