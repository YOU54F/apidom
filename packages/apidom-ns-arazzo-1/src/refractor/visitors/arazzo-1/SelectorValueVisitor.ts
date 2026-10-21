import { Mixin } from 'ts-mixer';
import { ObjectElement, BREAK, toValue, isStringElement } from '@swagger-api/apidom-core';

import FallbackVisitor, { FallbackVisitorOptions } from '../FallbackVisitor.ts';
import SpecificationVisitor, { SpecificationVisitorOptions } from '../SpecificationVisitor.ts';
import { isAvailable } from '../../version.ts';

/**
 * @public
 */
export interface SelectorValueVisitorOptions
  extends SpecificationVisitorOptions,
    FallbackVisitorOptions {}

/**
 * Visits a value that may be a Selector Object (Arazzo 1.1+). An object carrying both `context`
 * and `selector` string fields is refracted to SelectorElement; everything else is cloned as is.
 * @public
 */
class SelectorValueVisitor extends Mixin(SpecificationVisitor, FallbackVisitor) {
  ObjectElement(objectElement: ObjectElement) {
    const isSelector =
      isAvailable(this.specVersion, '1.1.0') &&
      isStringElement(objectElement.get('context')) &&
      isStringElement(objectElement.get('selector')) &&
      objectElement
        .keys()
        .every((key) => /^(context|selector|type|x-.*)$/.test(String(toValue(key))));

    if (!isSelector) {
      return FallbackVisitor.prototype.enter.call(this, objectElement);
    }

    this.element = this.toRefractedElement(['document', 'objects', 'Selector'], objectElement);
    return BREAK;
  }
}

export default SelectorValueVisitor;
