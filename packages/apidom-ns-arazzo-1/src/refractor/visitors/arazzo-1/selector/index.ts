import { Mixin } from 'ts-mixer';
import { always } from 'ramda';

import SelectorElement from '../../../../elements/Selector.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import FixedFieldsVisitor, {
  FixedFieldsVisitorOptions,
  SpecPath,
} from '../../generics/FixedFieldsVisitor.ts';

/**
 * @public
 */
export interface SelectorVisitorOptions extends FixedFieldsVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class SelectorVisitor extends Mixin(FixedFieldsVisitor, FallbackVisitor) {
  declare public readonly element: SelectorElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Selector']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: SelectorVisitorOptions) {
    super(options);
    this.element = new SelectorElement();
    this.specPath = always(['document', 'objects', 'Selector']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default SelectorVisitor;
