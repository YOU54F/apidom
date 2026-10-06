import allowedFieldsLint from './allowed-fields.ts';
import typeRequiredLint from './type--required.ts';
import typeTypeLint from './type--type.ts';
import versionRequiredLint from './version--required.ts';
import versionTypeLint from './version--type.ts';

const lints = [
  allowedFieldsLint,
  typeRequiredLint,
  typeTypeLint,
  versionRequiredLint,
  versionTypeLint,
];

export default lints;
