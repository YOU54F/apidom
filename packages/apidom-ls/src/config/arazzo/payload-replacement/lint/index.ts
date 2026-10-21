import allowedFieldsLint from './allowed-fields.ts';
import allowedFields11Lint from './allowed-fields-1-1.ts';
import targetRequiredLint from './target--required.ts';
import targetTypeLint from './target--type.ts';
import valueRequiredLint from './value--required.ts';

const lints = [
  allowedFieldsLint,
  allowedFields11Lint,
  targetRequiredLint,
  targetTypeLint,
  valueRequiredLint,
];

export default lints;
