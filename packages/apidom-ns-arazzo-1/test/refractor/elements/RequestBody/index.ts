import { expect } from 'chai';
import { sexprs } from '@swagger-api/apidom-core';

import {
  RequestBodyElement,
  isRequestBodyElement,
  isRequestBodyReplacementsElement,
  isPayloadReplacementElement,
  isExpressionTypeElement,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('RequestBodyElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const el = RequestBodyElement.refract({
          contentType: 'application/json',
          payload: { name: '$inputs.name' },
          replacements: [
            { target: '/name', value: '$inputs.other' },
            { target: '$.id', targetSelectorType: 'jsonpath', value: 1 },
            {
              target: '/x',
              targetSelectorType: { type: 'jsonpath', version: 'rfc9535' },
              value: 2,
            },
          ],
        });

        expect(isRequestBodyElement(el)).to.be.true;
        expect(isRequestBodyReplacementsElement(el.replacements)).to.be.true;
        expect(isPayloadReplacementElement((el.replacements as any).get(0))).to.be.true;
        expect(isExpressionTypeElement((el.replacements as any).get(2).get('targetSelectorType')))
          .to.be.true;
        expect(sexprs(el)).toMatchSnapshot();
      });
    });
  });
});
