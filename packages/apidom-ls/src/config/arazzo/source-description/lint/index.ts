import allowedFieldsLint from './allowed-fields.ts';
import nameRequiredLint from './name--required.ts';
import nameTypeLint from './name--type.ts';
import urlRequiredLint from './url--required.ts';
import urlTypeLint from './url--type.ts';
import typeTypeLint from './type--type.ts';
import typeEnumLint from './type--enum.ts';

const lints = [
  allowedFieldsLint,
  nameRequiredLint,
  nameTypeLint,
  urlRequiredLint,
  urlTypeLint,
  typeTypeLint,
  typeEnumLint,
];

export default lints;
