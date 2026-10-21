import { Mixin } from 'ts-mixer';
import { always } from 'ramda';

import ComponentsSuccessActionsElement from '../../../../elements/nces/ComponentsSuccessActions.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import MapVisitor, { MapVisitorOptions, SpecPath } from '../../generics/MapVisitor.ts';

/**
 * @public
 */
export interface ComponentsSuccessActionsVisitorOptions
  extends MapVisitorOptions,
    FallbackVisitorOptions {}

/**
 * @public
 */
class ComponentsSuccessActionsVisitor extends Mixin(MapVisitor, FallbackVisitor) {
  declare public readonly element: ComponentsSuccessActionsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'SuccessAction']>;

  constructor(options: ComponentsSuccessActionsVisitorOptions) {
    super(options);
    this.element = new ComponentsSuccessActionsElement();
    this.specPath = always(['document', 'objects', 'SuccessAction']);
  }
}

export default ComponentsSuccessActionsVisitor;
