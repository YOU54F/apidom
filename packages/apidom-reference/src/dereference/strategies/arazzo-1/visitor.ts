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
  SourceDescriptionElement,
  isParameterElement,
} from '@swagger-api/apidom-ns-arazzo-1';

import MaximumResolveDepthError from '../../../errors/MaximumResolveDepthError.ts';
import * as url from '../../../util/url.ts';
import parse from '../../../parse/index.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
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
  readonly reference: Reference;
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

  protected readonly reference: Reference;

  constructor({ root, options, reference }: Arazzo1DereferenceVisitorOptions) {
    this.root = root;
    this.options = options;
    this.reference = reference;
  }

  /**
   * Loads the document a Source Description points at into the ReferenceSet.
   * The Source Description itself is left untouched: its operations are addressed
   * by runtime expressions, which are not replaced.
   */
  public async SourceDescriptionElement(sourceDescription: SourceDescriptionElement) {
    if (!this.options.resolve.external) {
      return undefined;
    }

    const sourceUrl = sourceDescription.url;
    if (!isStringElement(sourceUrl)) {
      return undefined;
    }

    if (this.reference.depth >= this.options.resolve.maxDepth) {
      throw new MaximumResolveDepthError(
        `Maximum resolution depth of ${this.options.resolve.maxDepth} has been exceeded by file "${this.reference.uri}"`,
      );
    }

    const baseURI = url.resolve(
      this.reference.uri,
      url.sanitize(url.stripHash(toValue(sourceUrl))),
    );
    const { refSet } = this.reference as { refSet: ReferenceSet };

    if (refSet.has(baseURI)) {
      return undefined;
    }

    const parseResult = await parse(url.unsanitize(baseURI), {
      ...this.options,
      parse: { ...this.options.parse, mediaType: 'text/plain' },
    });

    refSet.add(
      new Reference({
        uri: baseURI,
        value: cloneDeep(parseResult),
        depth: this.reference.depth + 1,
      }),
    );
    if (this.options.dereference.immutable) {
      refSet.add(
        new Reference({
          uri: `immutable://${baseURI}`,
          value: parseResult,
          depth: this.reference.depth + 1,
        }),
      );
    }
    return undefined;
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
