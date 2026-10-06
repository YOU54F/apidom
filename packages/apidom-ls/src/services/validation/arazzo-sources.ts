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

interface LoadedSource {
  name: string;
  type: string | undefined;
  data: Dict;
}

const parseText = async (text: string): Promise<Json> => {
  try {
    return JSON.parse(text);
  } catch {
    const result = await adapterYaml.parse(text);
    return result.result ? toValue(result.result) : undefined;
  }
};

const detectType = (data: Dict, declared?: string): string | undefined => {
  if (declared) return declared;
  if (typeof data.openapi === 'string' || typeof data.swagger === 'string') return 'openapi';
  if (typeof data.asyncapi === 'string') return 'asyncapi';
  if (typeof data.arazzo === 'string') return 'arazzo';
  return undefined;
};

/** resolves a JSON Pointer (RFC 6901), optionally URI fragment encoded, against data */
const resolvePointer = (data: Json, fragment: string): boolean => {
  let pointer = fragment;
  try {
    pointer = decodeURIComponent(fragment);
  } catch {
    // keep as is
  }
  if (pointer === '' || pointer === '#') return true;
  if (!pointer.startsWith('/')) return false;
  let current: Json = data;
  for (const raw of pointer.slice(1).split('/')) {
    const token = raw.replace(/~1/g, '/').replace(/~0/g, '~');
    if (Array.isArray(current)) {
      const idx = Number(token);
      if (!Number.isInteger(idx) || idx < 0 || idx >= current.length) return false;
      current = current[idx];
    } else if (isDict(current) && Object.prototype.hasOwnProperty.call(current, token)) {
      current = current[token];
    } else {
      return false;
    }
  }
  return true;
};

const operationIds = (data: Dict, type: string | undefined): Set<string> => {
  const ids = new Set<string>();
  if (type === 'asyncapi') {
    // AsyncAPI 3: operations keyed by id
    if (isDict(data.operations)) Object.keys(data.operations).forEach((k) => ids.add(k));
    // AsyncAPI 2: operationId on channel publish/subscribe
    if (isDict(data.channels)) {
      Object.values(data.channels).forEach((ch) => {
        if (isDict(ch)) {
          [ch.publish, ch.subscribe].forEach((op) => {
            if (isDict(op) && typeof op.operationId === 'string') ids.add(op.operationId);
          });
        }
      });
    }
  } else {
    const collect = (paths: unknown) => {
      if (!isDict(paths)) return;
      Object.values(paths).forEach((item) => {
        if (!isDict(item)) return;
        HTTP_METHODS.forEach((m) => {
          const op = item[m];
          if (isDict(op) && typeof op.operationId === 'string') ids.add(op.operationId);
        });
      });
    };
    collect(data.paths);
    collect(data.webhooks);
  }
  return ids;
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

/**
 * Checks operationId / operationPath / channelPath / workflowId of the steps of an Arazzo document
 * against the Source Description documents supplied by the provider. Only sources that are loaded
 * are checked: a source that is missing, unreachable or unparsable never produces a diagnostic.
 */
export default async function arazzoSourceDiagnostics(
  api: Element,
  textDocument: TextDocument,
  provider: SourceDocumentProvider,
  signal?: AbortSignal,
): Promise<Diagnostic[]> {
  const root =
    api.element === 'parseResult' ? (api as unknown as { result?: Element }).result : api;
  if (!isObjectEl(root)) return [];
  const diagnostics: Diagnostic[] = [];

  const sourcesEl = root.get('sourceDescriptions');
  if (!isArrayElement(sourcesEl)) return [];
  const declared = ((sourcesEl as ArrayElement).content as Element[]).filter(isObjectEl);

  // load every source once; failures mean "not loaded"
  const loaded = new Map<string, LoadedSource>();
  await Promise.all(
    declared.map(async (src) => {
      const name = str(src.get('name'));
      const url = str(src.get('url'));
      if (name === undefined || url === undefined) return;
      const type = str(src.get('type'));
      try {
        const content = await provider({ name, url, type, documentUri: textDocument.uri }, signal);
        if (content === undefined || content === null) return;
        const data = typeof content === 'string' ? await parseText(content) : content;
        if (isDict(data)) loaded.set(name, { name, type: detectType(data, type), data });
      } catch {
        // unavailable source: nothing to check against
      }
    }),
  );
  if (loaded.size === 0) return [];

  const ops = new Map<string, Set<string>>();
  const wfs = new Map<string, Set<string>>();
  const opsOf = (s: LoadedSource) => {
    if (!ops.has(s.name)) ops.set(s.name, operationIds(s.data, s.type));
    return ops.get(s.name)!;
  };
  const wfsOf = (s: LoadedSource) => {
    if (!wfs.has(s.name)) wfs.set(s.name, workflowIds(s.data));
    return wfs.get(s.name)!;
  };
  // a bare reference resolves only when there is a single Source Description
  const single = declared.length === 1 ? str(declared[0].get('name')) : undefined;

  const report = (valueEl: Element, code: number, message: string) => {
    const sm = getSourceMap(valueEl);
    const d = Diagnostic.create(
      Range.create(
        textDocument.positionAt(sm.offset),
        textDocument.positionAt(sm.offset + sm.length),
      ),
      message,
      DiagnosticSeverity.Error,
      code,
    );
    d.source = APIDOM_LINTER;
    diagnostics.push(d);
  };

  const workflows = root.get('workflows');
  if (!isArrayElement(workflows)) return [];
  ((workflows as ArrayElement).content as Element[]).filter(isObjectEl).forEach((wf) => {
    const steps = wf.get('steps');
    if (!isArrayElement(steps)) return;
    ((steps as ArrayElement).content as Element[]).filter(isObjectEl).forEach((step) => {
      const operationIdEl = step.get('operationId');
      const operationId = str(operationIdEl);
      if (operationIdEl && operationId !== undefined) {
        const m = /^\$sourceDescriptions\.([^.]+)\.(.+)$/.exec(operationId);
        const sourceName = m ? m[1] : single;
        const id = m ? m[2] : operationId;
        const source = sourceName ? loaded.get(sourceName) : undefined;
        if (source && !opsOf(source).has(id)) {
          report(
            operationIdEl,
            ApilintCodes.ARAZZO1_SOURCE_OPERATION_ID_NOT_FOUND,
            `operationId "${id}" is not defined in source description "${source.name}"`,
          );
        }
      }
      (['operationPath', 'channelPath'] as const).forEach((field) => {
        const el = step.get(field);
        const value = str(el);
        if (!el || value === undefined) return;
        const m = /^\{\$sourceDescriptions\.([^.}]+)\.url\}(?:#(.*))?$/.exec(value);
        const sourceName = m ? m[1] : single;
        const fragment = m ? m[2] : value.startsWith('#') ? value.slice(1) : undefined;
        const source = sourceName ? loaded.get(sourceName) : undefined;
        if (!source || fragment === undefined || fragment === '') return;
        if (!resolvePointer(source.data, fragment)) {
          report(
            el,
            field === 'operationPath'
              ? ApilintCodes.ARAZZO1_SOURCE_OPERATION_PATH_NOT_FOUND
              : ApilintCodes.ARAZZO1_SOURCE_CHANNEL_PATH_NOT_FOUND,
            `${field} pointer "#${fragment}" does not resolve in source description "${source.name}"`,
          );
        }
      });
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
        }
      }
    });
  });
  return diagnostics;
}
