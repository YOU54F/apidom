import allowedFieldsLint from './allowed-fields.ts';
import contextTypeLint from './context--type.ts';
import conditionRequiredLint from './condition--required.ts';
import conditionTypeLint from './condition--type.ts';

const lints = [allowedFieldsLint, contextTypeLint, conditionRequiredLint, conditionTypeLint];

export default lints;
