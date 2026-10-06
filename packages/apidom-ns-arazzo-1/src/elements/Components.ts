import { ObjectElement, Attributes, Meta } from '@swagger-api/apidom-core';

/**
 * @public
 */
class Components extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'components';
  }

  get inputs(): ObjectElement | undefined {
    return this.get('inputs');
  }

  set inputs(inputs: ObjectElement | undefined) {
    this.set('inputs', inputs);
  }

  get parameters(): ObjectElement | undefined {
    return this.get('parameters');
  }

  set parameters(parameters: ObjectElement | undefined) {
    this.set('parameters', parameters);
  }

  get successActions(): ObjectElement | undefined {
    return this.get('successActions');
  }

  set successActions(successActions: ObjectElement | undefined) {
    this.set('successActions', successActions);
  }

  get failureActions(): ObjectElement | undefined {
    return this.get('failureActions');
  }

  set failureActions(failureActions: ObjectElement | undefined) {
    this.set('failureActions', failureActions);
  }
}

export default Components;
