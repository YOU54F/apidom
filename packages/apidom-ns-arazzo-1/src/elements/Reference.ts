import { StringElement, ObjectElement, Attributes, Meta } from '@swagger-api/apidom-core';

/**
 * @public
 */
class Reference extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'reference';
    this.classes.push('arazzo-spec-reference');
  }

  /** Reusable Object field per the spec: a runtime expression such as `$components.parameters.p`. */
  get reference(): StringElement | undefined {
    return this.get('reference');
  }

  set reference(reference: StringElement | undefined) {
    this.set('reference', reference);
  }

  /** Non-spec alias kept for compatibility with earlier documents. */
  get $ref(): StringElement | undefined {
    return this.get('$ref');
  }

  set $ref($ref: StringElement | undefined) {
    this.set('$ref', $ref);
  }

  get value(): StringElement | undefined {
    return this.get('value');
  }

  set value(value: StringElement | undefined) {
    this.set('value', value);
  }
}

export default Reference;
