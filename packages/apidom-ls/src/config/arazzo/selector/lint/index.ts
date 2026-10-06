import allowedFieldsLint from './allowed-fields.ts';
import contextRequiredLint from './context--required.ts';
import contextTypeLint from './context--type.ts';
import selectorRequiredLint from './selector--required.ts';
import selectorTypeLint from './selector--type.ts';

const lints = [
  allowedFieldsLint,
  contextRequiredLint,
  contextTypeLint,
  selectorRequiredLint,
  selectorTypeLint,
];

export default lints;
