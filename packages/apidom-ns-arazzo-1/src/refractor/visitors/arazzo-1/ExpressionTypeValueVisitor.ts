import { Mixin } from 'ts-mixer';
import { ObjectElement, BREAK } from '@swagger-api/apidom-core';

import FallbackVisitor, { FallbackVisitorOptions } from '../FallbackVisitor.ts';
import SpecificationVisitor, { SpecificationVisitorOptions } from '../SpecificationVisitor.ts';

/**
 * @public
 */
export interface ExpressionTypeValueVisitorOptions
  extends SpecificationVisitorOptions,
    FallbackVisitorOptions {}

/**
 * Visits a `type` field that is either a plain string (e.g. `jsonpath`) or an
 * Expression Type Object (`{ type, version }`). Strings fall back to the
 * current element; objects are refracted to ExpressionTypeElement.
 * @public
 */
class ExpressionTypeValueVisitor extends Mixin(SpecificationVisitor, FallbackVisitor) {
  ObjectElement(objectElement: ObjectElement) {
    this.element = this.toRefractedElement(
      ['document', 'objects', 'ExpressionType'],
      objectElement,
    );

    return BREAK;
  }
}

export default ExpressionTypeValueVisitor;
