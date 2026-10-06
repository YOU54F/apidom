import { expect } from 'chai';
import { sexprs } from '@swagger-api/apidom-core';

import {
  WorkflowElement,
  StepElement,
  CriterionElement,
  ComponentsElement,
  ArazzoSpecification1Element,
  isRequestBodyElement,
  isExpressionTypeElement,
  isWorkflowDependsOnElement,
  isWorkflowParametersElement,
  isWorkflowSuccessActionsElement,
  isWorkflowFailureActionsElement,
  isComponentsSuccessActionsElement,
  isComponentsFailureActionsElement,
} from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('Arazzo11ExtensionsElement', function () {
      specify('should refract workflow level fields', function () {
        const el = WorkflowElement.refract({
          workflowId: 'w',
          dependsOn: ['other'],
          parameters: [
            { name: 'k', in: 'header', value: 'v' },
            { reference: '$components.parameters.p' },
            { $ref: '#/components/parameters/p' },
          ],
          successActions: [
            { name: 'done', type: 'end' },
            { $ref: '#/components/successActions/a' },
          ],
          failureActions: [
            { name: 'again', type: 'retry', retryLimit: 2, parameters: [{ name: 'x', value: 1 }] },
          ],
          steps: [],
        });

        expect(isWorkflowDependsOnElement((el as any).get('dependsOn'))).to.be.true;
        expect(isWorkflowParametersElement((el as any).get('parameters'))).to.be.true;
        expect(isWorkflowSuccessActionsElement((el as any).get('successActions'))).to.be.true;
        expect(isWorkflowFailureActionsElement((el as any).get('failureActions'))).to.be.true;
        expect(sexprs(el)).toMatchSnapshot();
      });

      specify('should refract step level fields', function () {
        const el = StepElement.refract({
          stepId: 's',
          operationPath: '{$sourceDescriptions.a.url}#/paths/~1x/get',
          channelPath: '{$sourceDescriptions.b.url}#/channels/c',
          timeout: 500,
          correlationId: 'abc',
          action: 'send',
          requestBody: { contentType: 'application/json', payload: {} },
          onSuccess: [{ $ref: '#/components/successActions/a' }, { name: 'n', type: 'end' }],
        });

        expect(isRequestBodyElement((el as any).get('requestBody'))).to.be.true;
        expect(sexprs(el)).toMatchSnapshot();
      });

      specify('should refract criterion expression type object', function () {
        const el = CriterionElement.refract({
          context: '$response.body',
          condition: '$[?count(@.pets) > 0]',
          type: { type: 'jsonpath', version: 'draft-goessner-dispatch-jsonpath-00' },
        });

        expect(isExpressionTypeElement((el as any).get('type'))).to.be.true;
        expect(sexprs(el)).toMatchSnapshot();
      });

      specify('should refract components actions and $self', function () {
        const comps = ComponentsElement.refract({
          successActions: { a: { name: 'a', type: 'end' } },
          failureActions: { b: { name: 'b', type: 'end' } },
        });
        const doc = ArazzoSpecification1Element.refract({
          arazzo: '1.1.0',
          $self: 'https://example.com/a',
          info: { title: 't', version: '1' },
          sourceDescriptions: [],
          workflows: [],
        });

        expect(isComponentsSuccessActionsElement((comps as any).get('successActions'))).to.be.true;
        expect(isComponentsFailureActionsElement((comps as any).get('failureActions'))).to.be.true;
        expect((doc as any).get('$self').toValue()).to.equal('https://example.com/a');
        expect(sexprs(comps)).toMatchSnapshot();
      });
    });
  });
});
