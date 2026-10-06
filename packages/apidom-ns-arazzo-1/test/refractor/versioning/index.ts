import { expect } from 'chai';
import { toValue } from '@swagger-api/apidom-core';

import {
  ArazzoSpecification1Element,
  isSelectorElement,
  isRequestBodyElement,
} from '../../../src/index.ts';

const doc = (arazzo: string | undefined) => ({
  ...(arazzo ? { arazzo } : {}),
  $self: 'https://example.com/a.arazzo.yaml',
  info: { title: 't', version: '1' },
  sourceDescriptions: [{ name: 'a', url: 'a.yaml', type: 'openapi' }],
  workflows: [
    {
      workflowId: 'w',
      steps: [
        {
          stepId: 's',
          operationId: 'op',
          timeout: 500,
          correlationId: 'c',
          requestBody: {
            payload: {},
            replacements: [
              { target: '/a', targetSelectorType: 'jsonpath', value: 1 },
              {
                target: '/b',
                value: { context: '$response.body', selector: '$.x', type: 'jsonpath' },
              },
            ],
          },
          outputs: {
            picked: { context: '$response.body', selector: '$.id', type: 'jsonpath' },
            plain: '$response.body',
          },
        },
      ],
    },
  ],
});

const step = (el: any) => el.get('workflows').get(0).get('steps').get(0);
const isFixed = (obj: any, key: string) =>
  obj.content.some((m: any) => toValue(m.key) === key && m.classes.includes('fixed-field'));

describe('refractor', function () {
  context('arazzo version gating', function () {
    specify('should refract 1.1 fields as fixed fields in 1.1.0', function () {
      const el: any = ArazzoSpecification1Element.refract(doc('1.1.0'));

      expect(isFixed(el, '$self')).to.be.true;
      expect(isFixed(step(el), 'timeout')).to.be.true;
      expect(isFixed(step(el), 'correlationId')).to.be.true;
    });

    specify('should keep 1.1 fields as plain members in 1.0.1', function () {
      const el: any = ArazzoSpecification1Element.refract(doc('1.0.1'));

      expect(isFixed(el, '$self')).to.be.false;
      expect(isFixed(step(el), 'timeout')).to.be.false;
      expect(el.get('$self')).to.not.be.undefined;
      expect(isFixed(step(el), 'operationId')).to.be.true;
    });

    specify('should not gate when the version is missing', function () {
      const el: any = ArazzoSpecification1Element.refract(doc(undefined));

      expect(isFixed(el, '$self')).to.be.true;
    });

    specify('should gate PayloadReplacement targetSelectorType', function () {
      const gated: any = ArazzoSpecification1Element.refract(doc('1.0.0'));
      const open: any = ArazzoSpecification1Element.refract(doc('1.1.0'));
      const first = (el: any) => step(el).get('requestBody').get('replacements').get(0);

      expect(isRequestBodyElement(step(gated).get('requestBody'))).to.be.true;
      expect(isFixed(first(gated), 'targetSelectorType')).to.be.false;
      expect(isFixed(first(open), 'targetSelectorType')).to.be.true;
    });
  });

  context('selector objects in values', function () {
    specify(
      'should refract Selector Objects in outputs and replacement values in 1.1',
      function () {
        const el: any = ArazzoSpecification1Element.refract(doc('1.1.0'));
        const outputs = step(el).get('outputs');
        const replacement = step(el).get('requestBody').get('replacements').get(1);

        expect(isSelectorElement(outputs.get('picked'))).to.be.true;
        expect(isSelectorElement(replacement.get('value'))).to.be.true;
        expect(isSelectorElement(outputs.get('plain'))).to.be.false;
        expect(toValue(outputs.get('plain'))).to.equal('$response.body');
      },
    );

    specify('should leave Selector-shaped objects as plain objects in 1.0.1', function () {
      const el: any = ArazzoSpecification1Element.refract(doc('1.0.1'));

      expect(isSelectorElement(step(el).get('outputs').get('picked'))).to.be.false;
    });
  });
});
