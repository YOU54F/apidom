import allowedFieldsLint from './allowed-fields.ts';
import nameRequiredLint from './name--required.ts';
import nameTypeLint from './name--type.ts';
import typeRequiredLint from './type--required.ts';
import typeTypeLint from './type--type.ts';
import typeEnumLint from './type--enum.ts';
import workflowIdTypeLint from './workflow-id--type.ts';
import stepIdTypeLint from './step-id--type.ts';
import criteriaTypeLint from './criteria--type.ts';
import workflowIdExistsLint from './workflow-id--exists.ts';
import stepIdExistsLint from './step-id--exists.ts';

const lints = [
  stepIdExistsLint,
  workflowIdExistsLint,
  allowedFieldsLint,
  nameRequiredLint,
  nameTypeLint,
  typeRequiredLint,
  typeTypeLint,
  typeEnumLint,
  workflowIdTypeLint,
  stepIdTypeLint,
  criteriaTypeLint,
];

export default lints;
