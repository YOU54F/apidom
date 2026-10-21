import { Mixin } from 'ts-mixer';
import { ArrayElement, Element, BREAK } from '@swagger-api/apidom-core';

import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import SpecificationVisitor, { SpecificationVisitorOptions } from '../../SpecificationVisitor.ts';
import RequestBodyReplacementsElement from '../../../../elements/nces/RequestBodyReplacements.ts';

/**
 * @public
 */
export interface RequestBodyReplacementsVisitorOptions
  extends SpecificationVisitorOptions,
    FallbackVisitorOptions {}

/**
 * @public
 */
class RequestBodyReplacementsVisitor extends Mixin(SpecificationVisitor, FallbackVisitor) {
  declare public readonly element: RequestBodyReplacementsElement;

  constructor(options: RequestBodyReplacementsVisitorOptions) {
    super(options);
    this.element = new RequestBodyReplacementsElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element): void => {
      const element = this.toRefractedElement(['document', 'objects', 'PayloadReplacement'], item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default RequestBodyReplacementsVisitor;
