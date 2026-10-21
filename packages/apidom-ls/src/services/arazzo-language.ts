import { Element, isMemberElement, toValue } from '@swagger-api/apidom-core';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CompletionItem, CompletionItemKind, Position, Range } from 'vscode-languageserver-types';

import { SourceDocumentProvider } from '../apidom-language-types.ts';
import { getSourceMap } from '../utils/utils.ts';
import { getArazzoSourceTargets } from './validation/arazzo-sources.ts';

type ObjectValue = Record<string, unknown>;
interface Candidate {
  value: string;
  detail: string;
  documentation?: string;
}
const object = (value: unknown): ObjectValue =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as ObjectValue)
    : {};
const objects = (value: unknown): ObjectValue[] => (Array.isArray(value) ? value.map(object) : []);
const enclosing = (node: Element, name: string): Element | undefined => {
  let current: Element | undefined = node;
  while (current) {
    if (current.element === name) return current;
    current = current.parent;
  }
  return undefined;
};
const valueField = (node: Element): string | undefined => {
  if (isMemberElement(node.parent) && node.parent.value === node) {
    const field = String(toValue(node.parent.key));
    const owner = node.parent.parent?.element;
    if (
      (field === 'workflowId' && owner === 'workflow') ||
      (field === 'stepId' && owner === 'step')
    )
      return undefined;
    return field;
  }
  if (node.parent?.parent && isMemberElement(node.parent.parent)) {
    return String(toValue(node.parent.parent.key));
  }
  return undefined;
};

const candidates = async (
  root: Element,
  node: Element,
  textDocument: TextDocument,
  prefix: string,
  provider?: SourceDocumentProvider,
  baseURI?: string,
): Promise<Candidate[]> => {
  const field = valueField(node);
  const doc = object(toValue(root));
  const workflow = object(toValue(enclosing(node, 'workflow')));
  const result: Candidate[] = [];
  const add = (value: string, detail: string, documentation?: string) => {
    result.push({ value, detail, documentation });
  };
  const steps = objects(workflow.steps);
  const workflows = objects(doc.workflows);
  if (field === 'workflowId') {
    workflows.forEach((target) => {
      if (typeof target.workflowId === 'string') add(target.workflowId, 'Workflow');
    });
  }
  if (field === 'stepId' || field === 'dependsOn') {
    steps.forEach((step) => {
      if (typeof step.stepId === 'string') add(step.stepId, 'Step in this workflow');
    });
  }
  const expression = prefix.startsWith('$');
  if (expression) {
    const roots: Record<string, string> = {
      $url: 'Request URL',
      $method: 'Request method',
      $statusCode: 'Response status code',
      $request: 'Request',
      $response: 'Response',
      $inputs: 'Workflow inputs',
      $outputs: 'Workflow outputs',
      $steps: 'Workflow steps',
      $workflows: 'Workflows',
      $sourceDescriptions: 'Source descriptions',
      $components: 'Reusable components',
    };
    if (typeof doc.arazzo !== 'string' || !/^1\.0\./.test(doc.arazzo)) {
      roots.$self = 'Canonical document URI';
      roots.$message = 'AsyncAPI message';
    }
    Object.entries(roots).forEach(([value, detail]) => add(value, detail));
    [
      '$request.body',
      '$request.header.',
      '$request.query.',
      '$request.path.',
      '$response.body',
      '$response.header.',
    ].forEach((value) => add(value, 'Runtime expression'));
    steps.forEach((step) => {
      if (typeof step.stepId !== 'string') return;
      add(`$steps.${step.stepId}.outputs.`, 'Step outputs');
      Object.keys(object(step.outputs)).forEach((name) =>
        add(`$steps.${step.stepId}.outputs.${name}`, 'Step output'),
      );
    });
    Object.keys(object(object(workflow.inputs).properties)).forEach((name) =>
      add(`$inputs.${name}`, 'Workflow input'),
    );
    Object.keys(object(workflow.outputs)).forEach((name) =>
      add(`$outputs.${name}`, 'Workflow output'),
    );
    workflows.forEach((target) => {
      if (typeof target.workflowId !== 'string') return;
      Object.keys(object(target.outputs)).forEach((name) =>
        add(`$workflows.${target.workflowId}.outputs.${name}`, 'Workflow output'),
      );
    });
    Object.entries(object(doc.components)).forEach(([kind, values]) => {
      Object.keys(object(values)).forEach((name) =>
        add(`$components.${kind}.${name}`, 'Reusable component'),
      );
    });
    objects(doc.sourceDescriptions).forEach((source) => {
      if (typeof source.name === 'string')
        add(`$sourceDescriptions.${source.name}.`, 'Source description');
    });
  }
  if (
    provider &&
    (field === 'operationId' || field === 'workflowId' || prefix.startsWith('$sourceDescriptions.'))
  ) {
    const targets = await getArazzoSourceTargets(root, textDocument, provider, baseURI);
    targets.forEach((target) => {
      if (field === 'operationId' && target.type === 'arazzo') return;
      if (field === 'workflowId' && target.type !== 'arazzo') return;
      const detail = [target.method, target.path].filter(Boolean).join(' ') || target.type;
      add(`$sourceDescriptions.${target.source}.${target.id}`, detail, target.summary);
      if (
        !prefix.startsWith('$') &&
        objects(doc.sourceDescriptions).length === 1 &&
        target.type !== 'arazzo'
      ) {
        add(target.id, detail, target.summary);
      }
    });
  }
  return result;
};

export const arazzoCompletions = async (
  root: Element,
  node: Element | undefined,
  textDocument: TextDocument,
  position: Position,
  json: boolean,
  provider?: SourceDocumentProvider,
  baseURI?: string,
): Promise<CompletionItem[]> => {
  if (!node || !valueField(node)) return [];
  const field = valueField(node)!;
  const map = getSourceMap(node);
  const offset = textDocument.offsetAt(position);
  const text = textDocument.getText();
  const original = text.slice(map.offset, map.endOffset);
  const quote = original.startsWith('"') || original.startsWith("'") ? original[0] : '';
  const start = original ? map.offset + quote.length : offset;
  const end = original
    ? (map.endOffset ?? offset) - (quote && original.endsWith(quote) ? 1 : 0)
    : offset;
  const before = text.slice(start, offset);
  const expression = /\$[\w.-]*$/.exec(before);
  if (!expression && !['operationId', 'workflowId', 'stepId', 'dependsOn'].includes(field))
    return [];
  const prefix = expression ? expression[0] : before;
  const range = Range.create(
    textDocument.positionAt(expression ? offset - prefix.length : start),
    textDocument.positionAt(end),
  );
  const values = await candidates(root, node, textDocument, prefix, provider, baseURI);
  const seen = new Set<string>();
  return values
    .filter((candidate) => {
      if (!candidate.value.startsWith(prefix) || seen.has(candidate.value)) return false;
      seen.add(candidate.value);
      return true;
    })
    .map((candidate) => ({
      label: candidate.value,
      kind: CompletionItemKind.Reference,
      detail: candidate.detail,
      documentation: candidate.documentation,
      textEdit: {
        range,
        newText: json && !quote ? JSON.stringify(candidate.value) : candidate.value,
      },
    }));
};

export const arazzoHover = async (
  root: Element,
  node: Element,
  textDocument: TextDocument,
  provider?: SourceDocumentProvider,
  baseURI?: string,
): Promise<string | undefined> => {
  const value = toValue(node);
  if (typeof value !== 'string' || !valueField(node)) return undefined;
  const match = (await candidates(root, node, textDocument, value, provider, baseURI)).find(
    (candidate) => candidate.value === value,
  );
  return match
    ? `**${match.detail}**${match.documentation ? `\n\n${match.documentation}` : ''}`
    : undefined;
};
