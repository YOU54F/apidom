import allowedFieldsLint from './allowed-fields.ts';
import nameRequiredLint from './name--required.ts';
import nameTypeLint from './name--type.ts';
import typeRequiredLint from './type--required.ts';
import typeTypeLint from './type--type.ts';
import typeEnumLint from './type--enum.ts';
import workflowIdTypeLint from './workflow-id--type.ts';
import stepIdTypeLint from './step-id--type.ts';
import retryAfterTypeLint from './retry-after--type.ts';
import retryLimitTypeLint from './retry-limit--type.ts';
import criteriaTypeLint from './criteria--type.ts';

const lints = [
  allowedFieldsLint,
  nameRequiredLint,
  nameTypeLint,
  typeRequiredLint,
  typeTypeLint,
  typeEnumLint,
  workflowIdTypeLint,
  stepIdTypeLint,
  retryAfterTypeLint,
  retryLimitTypeLint,
  criteriaTypeLint,
];

export default lints;
