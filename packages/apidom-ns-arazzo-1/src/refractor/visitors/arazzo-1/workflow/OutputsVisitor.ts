import { Mixin } from 'ts-mixer';
import { always } from 'ramda';

import MapVisitor, { MapVisitorOptions, SpecPath } from '../../generics/MapVisitor.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import WorkflowOutputsElement from '../../../../elements/nces/WorkflowOutputs.ts';

/**
 * @public
 */
export interface OutputsVisitorOptions extends MapVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class OutputsVisitor extends Mixin(MapVisitor, FallbackVisitor) {
  declare public readonly element: WorkflowOutputsElement;

  declare protected readonly specPath: SpecPath<['selectorValue']>;

  constructor(options: OutputsVisitorOptions) {
    super(options);
    this.element = new WorkflowOutputsElement();
    this.specPath = always(['selectorValue']);
  }
}

export default OutputsVisitor;
