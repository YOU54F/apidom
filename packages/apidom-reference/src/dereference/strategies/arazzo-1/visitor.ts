import {
  isMemberElement,
  isObjectElement,
  isStringElement,
  cloneDeep,
  toValue,
  Element,
  ObjectElement,
} from '@swagger-api/apidom-core';
import {
  ArazzoSpecification1Element,
  ReferenceElement,
  ParameterElement,
  isParameterElement,
} from '@swagger-api/apidom-ns-arazzo-1';

import type { ReferenceOptions } from '../../../options/index.ts';

/**
 * Custom mutation replacer.
 * @public
 */
export const mutationReplacer = (
  newElement: Element,
  oldElement: Element,
  key: string | number,
  parent: Element | undefined,
) => {
  if (isMemberElement(parent)) {
    parent.value = newElement; // eslint-disable-line no-param-reassign
  } else if (Array.isArray(parent)) {
    parent[key] = newElement; // eslint-disable-line no-param-reassign
  }
};

/**
 * @public
 */
export interface Arazzo1DereferenceVisitorOptions {
  readonly root: ArazzoSpecification1Element;
  readonly options: ReferenceOptions;
}

const COMPONENT_EXPRESSION = /^\$components\.(parameters|successActions|failureActions)\.([^.]+)$/;

/**
 * Dereferences Reusable Objects of the form `{ reference: "$components.<type>.<name>" }`
 * against the Components Object of the same document.
 * @public
 */
class Arazzo1DereferenceVisitor {
  protected readonly root: ArazzoSpecification1Element;

  protected readonly options: ReferenceOptions;

  constructor({ root, options }: Arazzo1DereferenceVisitorOptions) {
    this.root = root;
    this.options = options;
  }

  public ReferenceElement(
    referencingElement: ReferenceElement,
    key: string | number,
    parent: Element | undefined,
    path: (string | number)[],
    ancestors: [Element | Element[]],
    link: { replaceWith: (element: Element, replacer: typeof mutationReplacer) => void },
  ) {
    // Reusable Objects pointing into Components are internal by definition
    if (!this.options.resolve.internal) {
      return undefined;
    }

    const expression = referencingElement.reference ?? referencingElement.$ref;
    if (!isStringElement(expression)) {
      return undefined;
    }

    const match = COMPONENT_EXPRESSION.exec(toValue(expression));
    if (match === null) {
      // not a $components expression (e.g. $workflows...), leave untouched
      return undefined;
    }

    const [, type, name] = match;
    const target = (this.root.components as ObjectElement | undefined)?.get(type);
    const referenced = isObjectElement(target) ? target.get(name) : undefined;

    if (referenced === undefined) {
      return undefined;
    }

    const replacement = cloneDeep(referenced);

    // only parameter references may override the value
    if (isParameterElement(replacement) && referencingElement.hasKey('value')) {
      (replacement as ParameterElement).set('value', cloneDeep(referencingElement.get('value')));
    }

    link.replaceWith(replacement, mutationReplacer);
    return undefined;
  }
}

export default Arazzo1DereferenceVisitor;
