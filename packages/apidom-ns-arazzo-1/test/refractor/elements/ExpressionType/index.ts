import { expect } from 'chai';
import { sexprs } from '@swagger-api/apidom-core';

import { ExpressionTypeElement, isExpressionTypeElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ExpressionTypeElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const el = ExpressionTypeElement.refract({ type: 'xpath', version: 'xpath-30' });

        expect(isExpressionTypeElement(el)).to.be.true;
        expect(sexprs(el)).toMatchSnapshot();
      });
    });
  });
});
