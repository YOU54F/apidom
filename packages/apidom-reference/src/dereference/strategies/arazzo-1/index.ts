import { visit, Element, cloneDeep } from '@swagger-api/apidom-core';
import {
  getNodeType,
  isArazzoSpecification1Element,
  keyMap,
  mediaTypes,
} from '@swagger-api/apidom-ns-arazzo-1';

import DereferenceStrategy, { DereferenceStrategyOptions } from '../DereferenceStrategy.ts';
import File from '../../../File.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import Arazzo1DereferenceVisitor from './visitor.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

export type {
  default as DereferenceStrategy,
  DereferenceStrategyOptions,
} from '../DereferenceStrategy.ts';
export type { default as File, FileOptions } from '../../../File.ts';
export type { default as Reference, ReferenceOptions } from '../../../Reference.ts';
export type { default as ReferenceSet, ReferenceSetOptions } from '../../../ReferenceSet.ts';
export type { Arazzo1DereferenceVisitorOptions, mutationReplacer } from './visitor.ts';

// @ts-ignore
const visitAsync = visit[Symbol.for('nodejs.util.promisify.custom')];

/**
 * @public
 */
export interface Arazzo1DereferenceStrategyOptions
  extends Omit<DereferenceStrategyOptions, 'name'> {}

/**
 * @public
 */
class Arazzo1DereferenceStrategy extends DereferenceStrategy {
  constructor(options?: Arazzo1DereferenceStrategyOptions) {
    super({ ...(options ?? {}), name: 'arazzo-1' });
  }

  canDereference(file: File): boolean {
    // assert by media type
    if (file.mediaType !== 'text/plain') {
      return mediaTypes.includes(file.mediaType);
    }

    // assert by inspecting ApiDOM
    return isArazzoSpecification1Element(file.parseResult?.api);
  }

  async dereference(file: File, options: ReferenceOptions): Promise<Element> {
    const immutableRefSet = options.dereference.refSet ?? new ReferenceSet();
    let refSet = immutableRefSet;

    if (!immutableRefSet.has(file.uri)) {
      immutableRefSet.add(new Reference({ uri: file.uri, value: file.parseResult! }));
    }

    const mutableRefSet = new ReferenceSet();
    if (options.dereference.immutable) {
      immutableRefSet.refs
        .map((ref) => new Reference({ ...ref, value: cloneDeep(ref.value) }))
        .forEach((ref) => mutableRefSet.add(ref));
      refSet = mutableRefSet;
    }

    const root = refSet.rootRef!.value as { result?: Element } & Element;
    const rootElement = (root.result ?? root) as Element;
    const visitor = new Arazzo1DereferenceVisitor({
      root: rootElement as never,
      options,
    });

    const dereferencedElement = await visitAsync(root, visitor, {
      keyMap,
      nodeTypeGetter: getNodeType,
    });

    if (options.dereference.refSet === null) {
      immutableRefSet.clean();
    }
    mutableRefSet.clean();

    return dereferencedElement;
  }
}

export { Arazzo1DereferenceVisitor };
export default Arazzo1DereferenceStrategy;
