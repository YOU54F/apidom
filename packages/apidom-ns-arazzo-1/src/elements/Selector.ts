import { ObjectElement, Element, StringElement, Attributes, Meta } from '@swagger-api/apidom-core';

/**
 * @public
 */
class Selector extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'selector';
  }

  get context(): StringElement | undefined {
    return this.get('context');
  }

  set context(context: StringElement | undefined) {
    this.set('context', context);
  }

  get selector(): StringElement | undefined {
    return this.get('selector');
  }

  set selector(selector: StringElement | undefined) {
    this.set('selector', selector);
  }

  get type(): Element | undefined {
    return this.get('type');
  }

  set type(type: Element | undefined) {
    this.set('type', type);
  }
}

export default Selector;
