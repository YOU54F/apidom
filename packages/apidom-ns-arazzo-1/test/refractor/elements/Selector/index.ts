import { expect } from 'chai';
import { sexprs } from '@swagger-api/apidom-core';

import {
  SelectorElement,
  isSelectorElement,
  isExpressionTypeElement,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('SelectorElement', function () {
      specify('should preserve a missing required type for validation', function () {
        const el = SelectorElement.refract({ context: '$response.body', selector: '/id' });

        expect(isSelectorElement(el)).to.be.true;
        expect(el.type).to.be.undefined;
      });

      specify('should refract to semantic ApiDOM tree', function () {
        const el = SelectorElement.refract({
          context: '$response.body',
          selector: '$.items[0].id',
          type: { type: 'jsonpath', version: 'rfc9535' },
        });

        expect(isSelectorElement(el)).to.be.true;
        expect(sexprs(el)).toMatchSnapshot();
      });

      specify('should keep a string type as a string', function () {
        const el = SelectorElement.refract({
          context: '$response.body',
          selector: '//a',
          type: 'xpath',
        });

        expect(isExpressionTypeElement((el as any).get('type'))).to.be.false;
        expect(sexprs(el)).toMatchSnapshot();
      });
    });
  });
});
