import allowedFieldsLint from './allowed-fields.ts';
import titleRequiredLint from './title--required.ts';
import titleTypeLint from './title--type.ts';
import summaryTypeLint from './summary--type.ts';
import descriptionTypeLint from './description--type.ts';
import versionRequiredLint from './version--required.ts';
import versionTypeLint from './version--type.ts';

const lints = [
  allowedFieldsLint,
  titleRequiredLint,
  titleTypeLint,
  summaryTypeLint,
  descriptionTypeLint,
  versionRequiredLint,
  versionTypeLint,
];

export default lints;
