import allowedFieldsLint from './allowed-fields.ts';
import inputsTypeLint from './inputs--type.ts';
import parametersTypeLint from './parameters--type.ts';
import successActionsTypeLint from './success-actions--type.ts';
import failureActionsTypeLint from './failure-actions--type.ts';

const lints = [
  allowedFieldsLint,
  inputsTypeLint,
  parametersTypeLint,
  successActionsTypeLint,
  failureActionsTypeLint,
];

export default lints;
