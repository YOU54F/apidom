import { Mixin } from 'ts-mixer';
import { always } from 'ramda';

import ExpressionTypeElement from '../../../../elements/ExpressionType.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import FixedFieldsVisitor, {
  FixedFieldsVisitorOptions,
  SpecPath,
} from '../../generics/FixedFieldsVisitor.ts';

/**
 * @public
 */
export interface ExpressionTypeVisitorOptions
  extends FixedFieldsVisitorOptions,
    FallbackVisitorOptions {}

/**
 * @public
 */
class ExpressionTypeVisitor extends Mixin(FixedFieldsVisitor, FallbackVisitor) {
  declare public readonly element: ExpressionTypeElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'ExpressionType']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: ExpressionTypeVisitorOptions) {
    super(options);
    this.element = new ExpressionTypeElement();
    this.specPath = always(['document', 'objects', 'ExpressionType']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ExpressionTypeVisitor;
