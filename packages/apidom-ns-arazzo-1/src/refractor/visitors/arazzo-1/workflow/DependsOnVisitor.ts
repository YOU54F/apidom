import { ArrayElement, BREAK, cloneDeep } from '@swagger-api/apidom-core';

import WorkflowDependsOnElement from '../../../../elements/nces/WorkflowDependsOn.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

/**
 * @public
 */
export interface DependsOnVisitorOptions extends FallbackVisitorOptions {}

/**
 * @public
 */
class DependsOnVisitor extends FallbackVisitor {
  declare public element: WorkflowDependsOnElement;

  constructor(options: DependsOnVisitorOptions) {
    super(options);
    this.element = new WorkflowDependsOnElement();
  }

  ArrayElement(arrayElement: ArrayElement) {
    this.element = this.element.concat(cloneDeep(arrayElement));

    return BREAK;
  }
}

export default DependsOnVisitor;
