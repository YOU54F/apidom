import allowedFieldsLint from './allowed-fields.ts';
import workflowIdRequiredLint from './workflow-id--required.ts';
import workflowIdTypeLint from './workflow-id--type.ts';
import summaryTypeLint from './summary--type.ts';
import descriptionTypeLint from './description--type.ts';
import inputsTypeLint from './inputs--type.ts';
import dependsOnTypeLint from './depends-on--type.ts';
import stepsRequiredLint from './steps--required.ts';
import stepsTypeLint from './steps--type.ts';
import successActionsTypeLint from './success-actions--type.ts';
import failureActionsTypeLint from './failure-actions--type.ts';
import outputsTypeLint from './outputs--type.ts';
import parametersTypeLint from './parameters--type.ts';

const lints = [
  allowedFieldsLint,
  workflowIdRequiredLint,
  workflowIdTypeLint,
  summaryTypeLint,
  descriptionTypeLint,
  inputsTypeLint,
  dependsOnTypeLint,
  stepsRequiredLint,
  stepsTypeLint,
  successActionsTypeLint,
  failureActionsTypeLint,
  outputsTypeLint,
  parametersTypeLint,
];

export default lints;
