import {
  ObjectElement,
  ArrayElement,
  StringElement,
  Attributes,
  Meta,
} from '@swagger-api/apidom-core';
import { JSONSchemaElement } from '@swagger-api/apidom-ns-json-schema-2020-12';

/**
 * @public
 */
class Workflow extends ObjectElement {
  constructor(content?: Record<string, unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'workflow';
  }

  get workflowId(): StringElement | undefined {
    return this.get('workflowId');
  }

  set workflowId(workflowId: StringElement | undefined) {
    this.set('workflowId', workflowId);
  }

  get summary(): StringElement | undefined {
    return this.get('summary');
  }

  set summary(summary: StringElement | undefined) {
    this.set('summary', summary);
  }

  get description(): StringElement | undefined {
    return this.get('description');
  }

  set description(description: StringElement | undefined) {
    this.set('description', description);
  }

  get inputs(): JSONSchemaElement | undefined {
    return this.get('inputs');
  }

  set inputs(inputs: JSONSchemaElement | undefined) {
    this.set('inputs', inputs);
  }

  get steps(): ArrayElement | undefined {
    return this.get('steps');
  }

  set steps(steps: ArrayElement | undefined) {
    this.set('steps', steps);
  }

  get outputs(): ObjectElement | undefined {
    return this.get('outputs');
  }

  set outputs(outputs: ObjectElement | undefined) {
    this.set('outputs', outputs);
  }

  get dependsOn(): ArrayElement | undefined {
    return this.get('dependsOn');
  }

  set dependsOn(dependsOn: ArrayElement | undefined) {
    this.set('dependsOn', dependsOn);
  }

  get parameters(): ArrayElement | undefined {
    return this.get('parameters');
  }

  set parameters(parameters: ArrayElement | undefined) {
    this.set('parameters', parameters);
  }

  get successActions(): ArrayElement | undefined {
    return this.get('successActions');
  }

  set successActions(successActions: ArrayElement | undefined) {
    this.set('successActions', successActions);
  }

  get failureActions(): ArrayElement | undefined {
    return this.get('failureActions');
  }

  set failureActions(failureActions: ArrayElement | undefined) {
    this.set('failureActions', failureActions);
  }
}

export default Workflow;
