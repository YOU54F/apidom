import { ArrayElement, Attributes, Meta } from '@swagger-api/apidom-core';

/**
 * @public
 */
class WorkflowParameters extends ArrayElement {
  static primaryClass = 'workflow-parameters';

  constructor(content?: Array<unknown>, meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.classes.push(WorkflowParameters.primaryClass);
  }
}

export default WorkflowParameters;
