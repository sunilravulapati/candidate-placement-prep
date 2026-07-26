// backend/src/features/dsa/io/driver/renderers/typescriptRenderer.ts

import { BaseLanguageRenderer } from './baseRenderer';
import { DriverModel, ParamParseSpec, ReturnPrintSpec } from '../model/driverModel';
import { SupportedLanguage, mapCanonicalToLanguage } from '../../canonical/types';

export class TypeScriptRenderer extends BaseLanguageRenderer {
  public readonly language: SupportedLanguage = 'typescript';

  public render(model: DriverModel): string {
    const imports = `import * as fs from 'fs';`;

    const structs = this.renderStructures(model);
    const helpers = this.renderHelpers(model);

    const parseStmts: string[] = [];
    const argNames: string[] = [];

    model.parameters.forEach((param, idx) => {
      const tsType = mapCanonicalToLanguage(param.canonicalType, 'typescript');
      const varName = param.name || `param${idx}`;
      argNames.push(varName);
      parseStmts.push(this.renderParameterParsing(param, varName, tsType, idx));
    });

    const isVoid = model.returnType.canonicalType === 'void';

    let callStmt = '';
    if (model.className && model.className !== 'Solution') {
      callStmt = isVoid
        ? `const solution = new ${model.className}();\nsolution.${model.functionName}(${argNames.join(', ')});`
        : `const solution = new ${model.className}();\nconst result = solution.${model.functionName}(${argNames.join(', ')});`;
    } else {
      callStmt = isVoid
        ? `${model.functionName}(${argNames.join(', ')});`
        : `const result = ${model.functionName}(${argNames.join(', ')});`;
    }

    const printStmt = isVoid
      ? 'console.log("null");'
      : this.renderOutputPrint(model.returnType, 'result');

    const numParams = model.parameters.length;
    const stepSize = numParams > 0 ? numParams : 1;

    return `${imports}

${structs}${helpers}function main(): void {
  const input = fs.readFileSync(0, 'utf-8');
  const lines = input.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return;

  let idx = 0;
  while (idx < lines.length) {
${this.indent(this.renderLoopBody(parseStmts, callStmt, printStmt, stepSize), 4)}
  }
}

main();`;
  }

  private renderStructures(model: DriverModel): string {
    const structs: string[] = [];

    if (model.requiredStructures.includes('ListNode')) {
      structs.push(`class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = (val === undefined ? 0 : val);
    this.next = (next === undefined ? null : next);
  }
}`);
    }

    if (model.requiredStructures.includes('TreeNode')) {
      structs.push(`class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
  }
}`);
    }

    return structs.length > 0 ? structs.join('\n\n') + '\n\n' : '';
  }

  private renderHelpers(model: DriverModel): string {
    const helpers: string[] = [];

    if (model.requiredStructures.includes('ListNode')) {
      helpers.push(`function parseLinkedList(arr: number[]): ListNode | null {
  if (!arr || arr.length === 0) return null;
  const dummy = new ListNode(0);
  let curr = dummy;
  for (const val of arr) {
    curr.next = new ListNode(val);
    curr = curr.next;
  }
  return dummy.next;
}

function printLinkedList(head: ListNode | null): void {
  const res: number[] = [];
  let curr = head;
  while (curr) {
    res.push(curr.val);
    curr = curr.next;
  }
  console.log(JSON.stringify(res));
}`);
    }

    if (model.requiredStructures.includes('TreeNode')) {
      helpers.push(`function parseTree(arr: (number | null)[]): TreeNode | null {
  if (!arr || arr.length === 0) return null;
  const root = new TreeNode(arr[0]!);
  const queue: TreeNode[] = [root];
  let i = 1;
  while (queue.length > 0 && i < arr.length) {
    const curr = queue.shift()!;
    if (i < arr.length && arr[i] !== null) {
      curr.left = new TreeNode(arr[i]!);
      queue.push(curr.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null) {
      curr.right = new TreeNode(arr[i]!);
      queue.push(curr.right);
    }
    i++;
  }
  return root;
}`);
    }

    return helpers.length > 0 ? helpers.join('\n\n') + '\n\n' : '';
  }

  private renderParameterParsing(
    param: ParamParseSpec,
    varName: string,
    tsType: string,
    paramIndex: number
  ): string {
    const kind = param.typeInfo.kind;
    const baseType = param.typeInfo.baseType;
    const lineAccess = `lines[idx + ${paramIndex}]`;

    if (kind === 'primitive') {
      if (baseType === 'int') return `const ${varName}: number = parseInt(${lineAccess}, 10);`;
      if (baseType === 'float' || baseType === 'double') return `const ${varName}: number = parseFloat(${lineAccess});`;
      if (baseType === 'bool') return `const ${varName}: boolean = ${lineAccess} === 'true';`;
      if (baseType === 'string') return `const ${varName}: string = ${lineAccess}.startsWith('"') ? JSON.parse(${lineAccess}) : ${lineAccess};`;
      return `const ${varName}: string = ${lineAccess};`;
    } else if (kind === 'collection_array' || kind === 'collection_matrix') {
      return `const ${varName}: ${tsType} = JSON.parse(${lineAccess});`;
    } else if (kind === 'structure') {
      if (baseType === 'ListNode') {
        return `const ${varName}: ${tsType} = parseLinkedList(JSON.parse(${lineAccess}));`;
      } else if (baseType === 'TreeNode') {
        return `const ${varName}: ${tsType} = parseTree(JSON.parse(${lineAccess}));`;
      }
    }

    return `const ${varName}: ${tsType} = JSON.parse(${lineAccess});`;
  }

  private renderLoopBody(
    parseStmts: string[],
    callStmt: string,
    printStmt: string,
    stepSize: number
  ): string {
    return `${parseStmts.join('\n')}
${callStmt}
${printStmt}
idx += ${stepSize};`;
  }

  private renderOutputPrint(returnType: ReturnPrintSpec, varName: string): string {
    const kind = returnType.typeInfo.kind;
    const baseType = returnType.typeInfo.baseType;

    if (kind === 'structure' && baseType === 'ListNode') {
      return `printLinkedList(${varName});`;
    } else if (kind === 'collection_array' || kind === 'collection_matrix') {
      return `console.log(JSON.stringify(${varName}));`;
    }

    return `console.log(${varName});`;
  }
}
