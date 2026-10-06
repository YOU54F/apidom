import allowedFieldsLint from './allowed-fields.ts';
import nameRequiredLint from './name--required.ts';
import nameTypeLint from './name--type.ts';
import inTypeLint from './in--type.ts';
import inEnumLint from './in--enum.ts';
import valueRequiredLint from './value--required.ts';
import skipReusableObjects from '../../skip-reusable.ts';

const lints = skipReusableObjects([
  allowedFieldsLint,
  nameRequiredLint,
  nameTypeLint,
  inTypeLint,
  inEnumLint,
  valueRequiredLint,
]);

export default lints;
