import { ArrayElement, Attributes, Meta } from '@swagger-api/apidom-core';

/**
 * @public
 */
class SuccessActionParameters extends ArrayElement {
  static primaryClass = 'success-action-parameters';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(SuccessActionParameters.primaryClass);
  }
}

export default SuccessActionParameters;
