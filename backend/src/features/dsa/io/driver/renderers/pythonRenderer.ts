// backend/src/features/dsa/io/driver/renderers/pythonRenderer.ts

import { BaseLanguageRenderer } from './baseRenderer';
import { DriverModel, ParamParseSpec, ReturnPrintSpec } from '../model/driverModel';
import { SupportedLanguage } from '../../canonical/types';

export class PythonRenderer extends BaseLanguageRenderer {
  public readonly language: SupportedLanguage = 'python';

  public render(model: DriverModel): string {
    const imports = `import sys
import json
from typing import List, Optional, Any`;

    const structs = this.renderStructures(model);
    const helpers = this.renderHelpers(model);

    const parseStmts: string[] = [];
    const argNames: string[] = [];

    model.parameters.forEach((param, idx) => {
      const varName = param.name || `param${idx}`;
      argNames.push(varName);

      parseStmts.push(this.renderParameterParsing(param, varName, idx));
    });

    const isVoid = model.returnType.canonicalType === 'void';

    let callStmt = '';
    if (model.isStatic) {
      callStmt = isVoid
        ? `${model.className}.${model.functionName}(${argNames.join(', ')})`
        : `result = ${model.className}.${model.functionName}(${argNames.join(', ')})`;
    } else {
      callStmt = isVoid
        ? `solution.${model.functionName}(${argNames.join(', ')})`
        : `result = solution.${model.functionName}(${argNames.join(', ')})`;
    }

    const printStmt = isVoid
      ? 'print("null")'
      : this.renderOutputPrint(model.returnType, 'result');

    const numParams = model.parameters.length;
    const linesPerTestCase = numParams > 0 ? numParams : 1;

    return `${imports}

${structs}${helpers}
def main():
    lines = [line.strip() for line in sys.stdin if line.strip()]
    if not lines:
        return
    
    solution = ${model.className}()
    idx = 0
    while idx < len(lines):
${this.indent(this.renderLoopBody(model, parseStmts, callStmt, printStmt, linesPerTestCase), 8)}

if __name__ == "__main__":
    main()`;
  }

  private renderStructures(model: DriverModel): string {
    const structs: string[] = [];

    if (model.requiredStructures.includes('ListNode')) {
      structs.push(`class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next`);
    }

    if (model.requiredStructures.includes('TreeNode')) {
      structs.push(`class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right`);
    }

    return structs.length > 0 ? structs.join('\n\n') + '\n\n' : '';
  }

  private renderHelpers(model: DriverModel): string {
    const helpers: string[] = [];

    if (model.requiredStructures.includes('ListNode')) {
      helpers.push(`def parse_linked_list(data: List[int]) -> Optional[ListNode]:
    if not data:
        return None
    dummy = ListNode(0)
    curr = dummy
    for val in data:
        curr.next = ListNode(val)
        curr = curr.next
    return dummy.next

def print_linked_list(head: Optional[ListNode]) -> None:
    res = []
    curr = head
    while curr:
        res.append(curr.val)
        curr = curr.next
    print(json.dumps(res))`);
    }

    if (model.requiredStructures.includes('TreeNode')) {
      helpers.push(`def parse_tree(data: List[Any]) -> Optional[TreeNode]:
    if not data:
        return None
    root = TreeNode(data[0])
    queue = [root]
    i = 1
    while queue and i < len(data):
        curr = queue.pop(0)
        if i < len(data) and data[i] is not None:
            curr.left = TreeNode(data[i])
            queue.append(curr.left)
        i += 1
        if i < len(data) and data[i] is not None:
            curr.right = TreeNode(data[i])
            queue.append(curr.right)
        i += 1
    return root`);
    }

    return helpers.length > 0 ? helpers.join('\n\n') + '\n\n' : '';
  }

  private renderParameterParsing(param: ParamParseSpec, varName: string, paramIndex: number): string {
    const kind = param.typeInfo.kind;
    const baseType = param.typeInfo.baseType;
    const lineAccess = `lines[idx + ${paramIndex}]`;

    if (kind === 'primitive') {
      if (baseType === 'int') return `${varName} = int(${lineAccess})`;
      if (baseType === 'float' || baseType === 'double') return `${varName} = float(${lineAccess})`;
      if (baseType === 'bool') return `${varName} = ${lineAccess}.lower() == "true"`;
      if (baseType === 'string') return `${varName} = json.loads(${lineAccess}) if ${lineAccess}.startswith('"') else ${lineAccess}`;
      return `${varName} = ${lineAccess}`;
    } else if (kind === 'collection_array' || kind === 'collection_matrix') {
      return `${varName} = json.loads(${lineAccess})`;
    } else if (kind === 'structure') {
      if (baseType === 'ListNode') {
        return `${varName} = parse_linked_list(json.loads(${lineAccess}))`;
      } else if (baseType === 'TreeNode') {
        return `${varName} = parse_tree(json.loads(${lineAccess}))`;
      }
    }

    return `${varName} = json.loads(${lineAccess})`;
  }

  private renderLoopBody(
    model: DriverModel,
    parseStmts: string[],
    callStmt: string,
    printStmt: string,
    linesPerTestCase: number
  ): string {
    return `${parseStmts.join('\n')}
${callStmt}
${printStmt}
idx += ${linesPerTestCase}`;
  }

  private renderOutputPrint(returnType: ReturnPrintSpec, varName: string): string {
    const kind = returnType.typeInfo.kind;
    const baseType = returnType.typeInfo.baseType;

    if (kind === 'structure' && baseType === 'ListNode') {
      return `print_linked_list(${varName})`;
    } else if (kind === 'primitive' && baseType === 'bool') {
      return `print("true" if ${varName} else "false")`;
    } else if (kind === 'collection_array' || kind === 'collection_matrix') {
      return `print(json.dumps(${varName}))`;
    }

    return `print(${varName})`;
  }
}
