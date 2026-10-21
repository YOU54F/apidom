import { Mixin } from 'ts-mixer';
import { always } from 'ramda';

import ComponentsFailureActionsElement from '../../../../elements/nces/ComponentsFailureActions.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import MapVisitor, { MapVisitorOptions, SpecPath } from '../../generics/MapVisitor.ts';

/**
 * @public
 */
export interface ComponentsFailureActionsVisitorOptions
  extends MapVisitorOptions,
    FallbackVisitorOptions {}

/**
 * @public
 */
class ComponentsFailureActionsVisitor extends Mixin(MapVisitor, FallbackVisitor) {
  declare public readonly element: ComponentsFailureActionsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'FailureAction']>;

  constructor(options: ComponentsFailureActionsVisitorOptions) {
    super(options);
    this.element = new ComponentsFailureActionsElement();
    this.specPath = always(['document', 'objects', 'FailureAction']);
  }
}

export default ComponentsFailureActionsVisitor;
