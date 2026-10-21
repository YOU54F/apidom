import { LinterMeta } from '../../apidom-language-types.ts';

/**
 * A Reusable Object (`reference` plus optional `value`) is also linted as the element it
 * references (parameter, successAction, failureAction), but the fields of that element come
 * from the resolved component, so its own required-field and allowed-field rules don't apply.
 */
const skipReusableObjects = (lints: LinterMeta[]): LinterMeta[] =>
  lints.map((lint) => ({
    ...lint,
    conditions: [
      ...(lint.conditions ?? []),
      { function: 'missingFields', params: [['reference', '$ref']] },
    ],
  }));

export default skipReusableObjects;
