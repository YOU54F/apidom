/* eslint-disable no-await-in-loop, no-continue */
import {
  ArrayElement,
  Element,
  ObjectElement,
  isArrayElement,
  isObjectElement,
  toValue,
} from '@swagger-api/apidom-core';
import * as adapterYaml from '@swagger-api/apidom-parser-adapter-yaml-1-2';
import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver-types';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { APIDOM_LINTER, SourceDocumentProvider } from '../../apidom-language-types.ts';
import ApilintCodes from '../../config/codes.ts';
import { getSourceMap } from '../../utils/utils.ts';

type Json = unknown;
type Dict = Record<string, unknown>;

const isDict = (v: unknown): v is Dict => typeof v === 'object' && v !== null && !Array.isArray(v);
const isObjectEl = (el: Element | undefined): el is ObjectElement =>
  el !== undefined && isObjectElement(el);

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace', 'query'];
const MAX_REF_DEPTH = 16;

/** a parsed document together with the url it was loaded from (used to resolve relative `$ref`s) */
interface Doc {
  url: string;
  data: Dict;
}

interface LoadedSource {
  name: string;
  type: string | undefined;
  doc: Doc;
}

interface NodeInDoc {
  node: Json;
  doc: Doc;
}

const parseText = async (text: string): Promise<Json> => {
  try {
    return JSON.parse(text);
  } catch {
    const result = await adapterYaml.parse(text);
    return result.result ? toValue(result.result) : undefined;
  }
};

/**
 * Shape based detection used when the Source Description declares no `type`. A malformed
 * `arazzo` value still counts: the document is an Arazzo document when it has the field.
 */
const detectType = (data: Dict, declared?: string): string | undefined => {
  if (declared) return declared;
  if (typeof data.openapi === 'string' || typeof data.swagger === 'string') return 'openapi';
  if (typeof data.asyncapi === 'string') return 'asyncapi';
  if ('arazzo' in data && ('workflows' in data || 'sourceDescriptions' in data)) return 'arazzo';
  return undefined;
};

const splitRef = (ref: string): [string, string] => {
  const i = ref.indexOf('#');
  return i === -1 ? [ref, ''] : [ref.slice(0, i), ref.slice(i + 1)];
};

const pointerTokens = (fragment: string): string[] | undefined => {
  let pointer = fragment;
  try {
    pointer = decodeURIComponent(fragment);
  } catch {
    // keep as is
  }
  if (pointer === '' || pointer === '#') return [];
  if (!pointer.startsWith('/')) return undefined;
  return pointer
    .slice(1)
    .split('/')
    .map((raw) => raw.replace(/~1/g, '/').replace(/~0/g, '~'));
};

const child = (current: Json, token: string): { found: boolean; value?: Json } => {
  if (Array.isArray(current)) {
    const idx = Number(token);
    if (!Number.isInteger(idx) || idx < 0 || idx >= current.length) return { found: false };
    return { found: true, value: current[idx] };
  }
  if (isDict(current) && Object.prototype.hasOwnProperty.call(current, token)) {
    return { found: true, value: current[token] };
  }
  return { found: false };
};

type Pointer = { status: 'found'; at: NodeInDoc } | { status: 'missing' } | { status: 'unknown' };

/**
 * Loads and caches the documents of one validation run and follows `$ref`s between them. Anything
 * that cannot be resolved (document not supplied, reference cycle, dangling pointer) is reported as
 * "unknown" so that callers stay silent instead of guessing.
 */
class Resolver {
  private cache = new Map<string, Promise<Doc | undefined>>();

  constructor(
    private provider: SourceDocumentProvider,
    private documentUri: string,
    private signal?: AbortSignal,
    private baseURI?: string,
  ) {}

  private absolute(url: string, base?: string): string {
    try {
      return new URL(url, base ? this.absolute(base) : (this.baseURI ?? this.documentUri)).href;
    } catch {
      return url;
    }
  }

  async loadSource(name: string, url: string, type?: string): Promise<Doc | undefined> {
    const requestURL = this.baseURI ? this.absolute(url) : url;
    return this.load(name, requestURL, type, requestURL);
  }

  private load(
    name: string,
    requestUrl: string,
    type: string | undefined,
    key: string,
    referencedFrom?: string,
  ): Promise<Doc | undefined> {
    const cached = this.cache.get(key);
    if (cached) return cached;
    const promise = (async (): Promise<Doc | undefined> => {
      try {
        const content = await this.provider(
          { name, url: requestUrl, type, referencedFrom, documentUri: this.documentUri },
          this.signal,
        );
        if (content === undefined || content === null) return undefined;
        const data = typeof content === 'string' ? await parseText(content) : content;
        return isDict(data) ? { url: requestUrl, data } : undefined;
      } catch {
        return undefined;
      }
    })();
    this.cache.set(key, promise);
    return promise;
  }

  /** follows `$ref` chains (local fragments and relative documents) from a node */
  async deref(at: NodeInDoc, name: string, depth = 0): Promise<NodeInDoc | undefined> {
    if (!isDict(at.node) || typeof at.node.$ref !== 'string') return at;
    if (depth > MAX_REF_DEPTH) return undefined;
    const [refUrl, fragment] = splitRef(at.node.$ref);
    let { doc }: { doc: Doc | undefined } = at;
    if (refUrl !== '') {
      const target = this.absolute(refUrl, at.doc.url);
      doc = await this.load(name, target, undefined, target.split('#')[0], at.doc.url);
    }
    const tokens = pointerTokens(fragment);
    if (!doc || !tokens) return undefined;
    let current: NodeInDoc = { node: doc.data, doc };
    for (const token of tokens) {
      const next = await this.deref(current, name, depth + 1);
      if (!next) return undefined;
      const c = child(next.node, token);
      if (!c.found) return undefined;
      current = { node: c.value, doc: next.doc };
    }
    return this.deref(current, name, depth + 1);
  }

  /** resolves a JSON Pointer against a document, following `$ref`s met on the way */
  async pointer(doc: Doc, fragment: string, name: string): Promise<Pointer> {
    const tokens = pointerTokens(fragment);
    if (!tokens) return { status: 'missing' };
    let current: NodeInDoc = { node: doc.data, doc };
    for (const token of tokens) {
      const next = await this.deref(current, name);
      if (!next) return { status: 'unknown' };
      const c = child(next.node, token);
      if (!c.found) return { status: 'missing' };
      current = { node: c.value, doc: next.doc };
    }
    const resolved = await this.deref(current, name);
    return resolved ? { status: 'found', at: resolved } : { status: 'unknown' };
  }
}

interface OperationEntry {
  op: Dict;
  method?: string;
  path?: string;
  /** resolved parameters (path item + operation); undefined when one could not be resolved */
  parameters: Dict[] | undefined;
}

interface OperationIndex {
  ops: Map<string, OperationEntry>;
  /** true when a `$ref` could not be followed, so an absent id may just be out of reach */
  incomplete: boolean;
}

const parametersOf = async (
  resolver: Resolver,
  name: string,
  ...lists: Array<{ doc: Doc; parameters: unknown }>
): Promise<Dict[] | undefined> => {
  const out: Dict[] = [];
  for (const { doc, parameters: list } of lists) {
    if (!Array.isArray(list)) continue;
    for (const raw of list) {
      const p = await resolver.deref({ node: raw, doc }, name);
      if (!p) return undefined;
      if (isDict(p.node)) {
        const parameter = p.node;
        const previous =
          typeof parameter.name === 'string' && typeof parameter.in === 'string'
            ? out.findIndex((entry) => entry.name === parameter.name && entry.in === parameter.in)
            : -1;
        if (previous === -1) out.push(parameter);
        else out[previous] = parameter;
      }
    }
  }
  return out;
};

const indexOperations = async (
  resolver: Resolver,
  source: LoadedSource,
): Promise<OperationIndex> => {
  const ops = new Map<string, OperationEntry>();
  let incomplete = false;
  const root: NodeInDoc = { node: source.doc.data, doc: source.doc };
  const { name } = source;

  const fromPathItems = async (container: unknown) => {
    if (!isDict(container)) return;
    for (const [path, raw] of Object.entries(container)) {
      const item = await resolver.deref({ node: raw, doc: source.doc }, name);
      if (!item) {
        incomplete = true;
        continue;
      }
      if (!isDict(item.node)) continue;
      const pathItem = item.node;
      const operations: Array<[string, unknown]> = HTTP_METHODS.map((method) => [
        method,
        pathItem[method],
      ]);
      if (isDict(pathItem.additionalOperations)) {
        operations.push(...Object.entries(pathItem.additionalOperations));
      }
      for (const [method, rawOp] of operations) {
        const op = await resolver.deref({ node: rawOp, doc: item.doc }, name);
        if (!op) {
          incomplete = true;
          continue;
        }
        if (isDict(op.node) && typeof op.node.operationId === 'string') {
          const parameters = await parametersOf(
            resolver,
            name,
            { doc: item.doc, parameters: pathItem.parameters },
            { doc: op.doc, parameters: op.node.parameters },
          );
          ops.set(op.node.operationId, {
            op: op.node,
            parameters,
            method: method.toUpperCase(),
            path,
          });
        }
      }
    }
  };

  const { data } = source.doc;
  if (source.type === 'asyncapi') {
    // AsyncAPI 3: operations keyed by id
    if (isDict(data.operations)) {
      Object.keys(data.operations).forEach((k) => ops.set(k, { op: {}, parameters: [] }));
    }
    // AsyncAPI 2: operationId on channel publish/subscribe; channels may be `$ref`s
    if (isDict(data.channels)) {
      for (const rawChannel of Object.values(data.channels)) {
        const ch = await resolver.deref({ node: rawChannel, doc: source.doc }, name);
        if (!ch) {
          incomplete = true;
          continue;
        }
        if (isDict(ch.node)) {
          [ch.node.publish, ch.node.subscribe].forEach((op) => {
            if (isDict(op) && typeof op.operationId === 'string') {
              ops.set(op.operationId, { op, parameters: [] });
            }
          });
        }
      }
    }
  } else {
    await fromPathItems(root.node && (root.node as Dict).paths);
    await fromPathItems(root.node && (root.node as Dict).webhooks);
  }
  return { ops, incomplete };
};

const workflowIds = (data: Dict): Set<string> => {
  const ids = new Set<string>();
  if (Array.isArray(data.workflows)) {
    data.workflows.forEach((w) => {
      if (isDict(w) && typeof w.workflowId === 'string') ids.add(w.workflowId);
    });
  }
  return ids;
};

const str = (el: Element | undefined): string | undefined => {
  const v = el ? toValue(el) : undefined;
  return typeof v === 'string' ? v : undefined;
};

const mediaTypeOf = (parameter: Dict): string | undefined =>
  isDict(parameter.content) ? Object.keys(parameter.content)[0] : undefined;

const isFormMediaType = (mt: string) => /^application\/x-www-form-urlencoded\b/i.test(mt);
const isJsonMediaType = (mt: string) => /^application\/([\w.+-]+\+)?json\b/i.test(mt);

const loadSourceDocuments = async (
  root: ObjectElement,
  textDocument: TextDocument,
  provider: SourceDocumentProvider,
  signal?: AbortSignal,
  baseURI?: string,
) => {
  const sources = root.get('sourceDescriptions');
  const declared = isArrayElement(sources)
    ? ((sources as ArrayElement).content as Element[]).filter(isObjectEl)
    : [];
  const resolver = new Resolver(provider, textDocument.uri, signal, baseURI);
  const loaded = new Map<string, LoadedSource>();
  await Promise.all(
    declared.map(async (source) => {
      const name = str(source.get('name'));
      const url = str(source.get('url'));
      if (name === undefined || url === undefined) return;
      const type = str(source.get('type'));
      const doc = await resolver.loadSource(name, url, type);
      if (doc) loaded.set(name, { name, type: detectType(doc.data, type), doc });
    }),
  );
  return { declared, resolver, loaded };
};

export interface ArazzoSourceTarget {
  source: string;
  type: string;
  id: string;
  method?: string;
  path?: string;
  summary?: string;
}

export const getArazzoSourceTargets = async (
  root: Element,
  textDocument: TextDocument,
  provider: SourceDocumentProvider,
  baseURI?: string,
): Promise<ArazzoSourceTarget[]> => {
  if (!isObjectEl(root)) return [];
  const { resolver, loaded } = await loadSourceDocuments(
    root,
    textDocument,
    provider,
    undefined,
    baseURI,
  );
  const groups = await Promise.all(
    [...loaded.values()].map(async (source) => {
      if (source.type === 'arazzo') {
        return [...workflowIds(source.doc.data)].map((id) => ({
          source: source.name,
          type: 'arazzo',
          id,
        }));
      }
      if (source.type !== 'openapi' && source.type !== 'asyncapi') return [];
      const index = await indexOperations(resolver, source);
      return [...index.ops].map(([id, entry]) => ({
        source: source.name,
        type: source.type!,
        id,
        method: entry.method,
        path: entry.path,
        summary: typeof entry.op.summary === 'string' ? entry.op.summary : undefined,
      }));
    }),
  );
  return groups.flat();
};

/**
 * Checks operationId / operationPath / channelPath / workflowId of the steps of an Arazzo document
 * against the Source Description documents supplied by the provider. Only sources that are loaded
 * are checked: a source that is missing, unreachable or unparsable never produces a diagnostic.
 * `$ref`s inside a source (local fragments, and relative references the provider can supply) are
 * followed; a reference that cannot be followed makes the checks that depend on it silent.
 */
export default async function arazzoSourceDiagnostics(
  api: Element,
  textDocument: TextDocument,
  provider: SourceDocumentProvider,
  signal?: AbortSignal,
  baseURI?: string,
): Promise<Diagnostic[]> {
  const root =
    api.element === 'parseResult' ? (api as unknown as { result?: Element }).result : api;
  if (!isObjectEl(root)) return [];
  const diagnostics: Diagnostic[] = [];

  const { declared, resolver, loaded } = await loadSourceDocuments(
    root,
    textDocument,
    provider,
    signal,
    baseURI,
  );
  if (loaded.size === 0) return [];

  const indexes = new Map<string, Promise<OperationIndex>>();
  const indexOf = (s: LoadedSource) => {
    if (!indexes.has(s.name)) indexes.set(s.name, indexOperations(resolver, s));
    return indexes.get(s.name)!;
  };
  const wfs = new Map<string, Set<string>>();
  const wfsOf = (s: LoadedSource) => {
    if (!wfs.has(s.name)) wfs.set(s.name, workflowIds(s.doc.data));
    return wfs.get(s.name)!;
  };
  // a bare reference resolves only when there is a single Source Description
  const single = declared.length === 1 ? str(declared[0].get('name')) : undefined;
  const localWorkflowIds = new Set<string>();
  const workflows = root.get('workflows');
  if (isArrayElement(workflows)) {
    ((workflows as ArrayElement).content as Element[]).filter(isObjectEl).forEach((w) => {
      const id = str(w.get('workflowId'));
      if (id !== undefined) localWorkflowIds.add(id);
    });
  }

  const report = (
    valueEl: Element,
    code: number,
    message: string,
    severity: DiagnosticSeverity = DiagnosticSeverity.Error,
  ) => {
    const sm = getSourceMap(valueEl);
    const d = Diagnostic.create(
      Range.create(
        textDocument.positionAt(sm.offset),
        textDocument.positionAt(sm.offset + sm.length),
      ),
      message,
      severity,
      code,
    );
    d.source = APIDOM_LINTER;
    diagnostics.push(d);
  };

  /** the operation a step addresses, when it can be told: entry and the source it lives in */
  const resolveOperation = async (
    step: ObjectElement,
  ): Promise<{ source: LoadedSource; entry: OperationEntry } | undefined> => {
    const operationId = str(step.get('operationId'));
    if (operationId !== undefined) {
      const m = /^\$sourceDescriptions\.([^.]+)\.(.+)$/.exec(operationId);
      const sourceName = m ? m[1] : single;
      const source = sourceName ? loaded.get(sourceName) : undefined;
      if (!source) return undefined;
      const entry = (await indexOf(source)).ops.get(m ? m[2] : operationId);
      return entry ? { source, entry } : undefined;
    }
    const operationPath = str(step.get('operationPath'));
    if (operationPath === undefined) return undefined;
    const m = /^\{\$sourceDescriptions\.([^.}]+)\.url\}#(.*)$/.exec(operationPath);
    const sourceName = m ? m[1] : single;
    const fragment = m ? m[2] : operationPath.startsWith('#') ? operationPath.slice(1) : undefined;
    const source = sourceName ? loaded.get(sourceName) : undefined;
    if (!source || !fragment) return undefined;
    const tokens = pointerTokens(fragment);
    if (!tokens || tokens.length < 2) return undefined;
    const encode = (ts: string[]) =>
      ts.length === 0
        ? ''
        : `/${ts.map((t) => t.replace(/~/g, '~0').replace(/\//g, '~1')).join('/')}`;
    const op = await resolver.pointer(source.doc, encode(tokens), source.name);
    const item = await resolver.pointer(source.doc, encode(tokens.slice(0, -1)), source.name);
    if (op.status !== 'found' || !isDict(op.at.node)) return undefined;
    const pathItem = item.status === 'found' && isDict(item.at.node) ? item.at.node : {};
    const parameters = await parametersOf(
      resolver,
      source.name,
      { doc: item.status === 'found' ? item.at.doc : source.doc, parameters: pathItem.parameters },
      { doc: op.at.doc, parameters: op.at.node.parameters },
    );
    return { source, entry: { op: op.at.node, parameters } };
  };

  const checkQuerystring = async (step: ObjectElement) => {
    const params = step.get('parameters');
    if (!isArrayElement(params)) return;
    const qs = ((params as ArrayElement).content as Element[])
      .filter(isObjectEl)
      .filter((p) => str(p.get('in')) === 'querystring');
    if (qs.length === 0) return;
    const resolved = await resolveOperation(step);
    // only OpenAPI operations can define a querystring parameter; stay silent when unresolved
    if (!resolved || resolved.source.type !== 'openapi' || !resolved.entry.parameters) return;
    const defined = resolved.entry.parameters.find((p) => p.in === 'querystring');
    for (const p of qs) {
      const inEl = p.get('in')!;
      if (!defined) {
        report(
          inEl,
          ApilintCodes.ARAZZO1_SOURCE_QUERYSTRING_NOT_DEFINED,
          "the referenced operation does not define a 'querystring' parameter",
          DiagnosticSeverity.Warning,
        );
      } else {
        const mediaType = mediaTypeOf(defined);
        const valueEl = p.get('value');
        const value = valueEl ? toValue(valueEl) : undefined;
        // expressions and Selector Objects resolve at runtime; only literals can be compared
        if (mediaType && valueEl && typeof value === 'string' && !value.includes('$')) {
          const trimmed = value.trim();
          let mismatch: string | undefined;
          if (isFormMediaType(mediaType) && /^[{[]/.test(trimmed)) {
            mismatch = 'a JSON value, expected key=value pairs joined by &';
          } else if (isJsonMediaType(mediaType)) {
            try {
              JSON.parse(trimmed);
            } catch {
              mismatch = 'not valid JSON';
            }
          }
          if (mismatch) {
            report(
              valueEl,
              ApilintCodes.ARAZZO1_SOURCE_QUERYSTRING_MEDIA_TYPE_MISMATCH,
              `'querystring' value is ${mismatch} (the operation's parameter content is ${mediaType})`,
              DiagnosticSeverity.Warning,
            );
          }
        }
      }
      if (resolved.entry.parameters.some((q) => q.in === 'query')) {
        report(
          inEl,
          ApilintCodes.ARAZZO1_SOURCE_QUERYSTRING_NOT_DEFINED,
          "the referenced operation also defines 'query' parameters, which cannot coexist with a 'querystring' parameter",
          DiagnosticSeverity.Warning,
        );
      }
    }
  };

  if (!isArrayElement(workflows)) return [];
  const wfEls = ((workflows as ArrayElement).content as Element[]).filter(isObjectEl);
  for (const wf of wfEls) {
    const steps = wf.get('steps');
    if (!isArrayElement(steps)) continue;
    for (const step of ((steps as ArrayElement).content as Element[]).filter(isObjectEl)) {
      const operationIdEl = step.get('operationId');
      const operationId = str(operationIdEl);
      if (operationIdEl && operationId !== undefined) {
        const m = /^\$sourceDescriptions\.([^.]+)\.(.+)$/.exec(operationId);
        const sourceName = m ? m[1] : single;
        const id = m ? m[2] : operationId;
        const source = sourceName ? loaded.get(sourceName) : undefined;
        if (source) {
          const index = await indexOf(source);
          if (!index.ops.has(id) && !index.incomplete) {
            report(
              operationIdEl,
              ApilintCodes.ARAZZO1_SOURCE_OPERATION_ID_NOT_FOUND,
              `operationId "${id}" is not defined in source description "${source.name}"`,
            );
          }
        }
      }
      for (const field of ['operationPath', 'channelPath'] as const) {
        const el = step.get(field);
        const value = str(el);
        if (el && value !== undefined) {
          const m = /^\{\$sourceDescriptions\.([^.}]+)\.url\}(?:#(.*))?$/.exec(value);
          const sourceName = m ? m[1] : single;
          const fragment = m ? m[2] : value.startsWith('#') ? value.slice(1) : undefined;
          const source = sourceName ? loaded.get(sourceName) : undefined;
          if (source && fragment !== undefined && fragment !== '') {
            const r = await resolver.pointer(source.doc, fragment, source.name);
            if (r.status === 'missing') {
              report(
                el,
                field === 'operationPath'
                  ? ApilintCodes.ARAZZO1_SOURCE_OPERATION_PATH_NOT_FOUND
                  : ApilintCodes.ARAZZO1_SOURCE_CHANNEL_PATH_NOT_FOUND,
                `${field} pointer "#${fragment}" does not resolve in source description "${source.name}"`,
              );
            }
          }
        }
      }
      const workflowIdEl = step.get('workflowId');
      const workflowId = str(workflowIdEl);
      if (workflowIdEl && workflowId !== undefined) {
        const m = /^\$sourceDescriptions\.([^.]+)\.(.+)$/.exec(workflowId);
        if (m) {
          const source = loaded.get(m[1]);
          if (source && source.type === 'arazzo' && !wfsOf(source).has(m[2])) {
            report(
              workflowIdEl,
              ApilintCodes.ARAZZO1_SOURCE_WORKFLOW_ID_NOT_FOUND,
              `workflowId "${m[2]}" is not defined in source description "${source.name}"`,
            );
          }
        } else if (!localWorkflowIds.has(workflowId)) {
          // a bare id that is not a workflow of this document but is one of exactly one loaded
          // Arazzo source: it can only be meant for that source, which requires the expression form
          const owners = [...loaded.values()].filter(
            (s) => s.type === 'arazzo' && wfsOf(s).has(workflowId),
          );
          if (owners.length === 1) {
            report(
              workflowIdEl,
              ApilintCodes.ARAZZO1_SOURCE_WORKFLOW_ID_EXPRESSION_REQUIRED,
              `workflowId "${workflowId}" is defined in source description "${owners[0].name}"; use "$sourceDescriptions.${owners[0].name}.${workflowId}"`,
            );
          }
        }
      }
      await checkQuerystring(step);
    }
  }
  return diagnostics;
}
