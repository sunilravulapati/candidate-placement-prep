// backend/src/features/dsa/io/driver/renderers/javaRenderer.ts

import { BaseLanguageRenderer } from './baseRenderer';
import { DriverModel, ParamParseSpec, ReturnPrintSpec } from '../model/driverModel';
import { SupportedLanguage, mapCanonicalToLanguage } from '../../canonical/types';

export class JavaRenderer extends BaseLanguageRenderer {
  public readonly language: SupportedLanguage = 'java';

  public render(model: DriverModel): string {
    const imports = `import java.util.*;
import java.io.*;`;

    const structs = this.renderStructures(model);
    const helpers = this.renderHelpers(model);

    const parseStmts: string[] = [];
    const argNames: string[] = [];

    model.parameters.forEach((param, idx) => {
      const javaType = mapCanonicalToLanguage(param.canonicalType, 'java');
      const varName = param.name || `param${idx}`;
      argNames.push(varName);

      parseStmts.push(this.renderParameterParsing(param, varName, javaType));
    });

    const isVoid = model.returnType.canonicalType === 'void';
    const returnJavaType = mapCanonicalToLanguage(model.returnType.canonicalType, 'java');

    let callStmt = '';
    if (model.isStatic) {
      callStmt = isVoid
        ? `${model.className}.${model.functionName}(${argNames.join(', ')});`
        : `${returnJavaType} result = ${model.className}.${model.functionName}(${argNames.join(', ')});`;
    } else {
      callStmt = isVoid
        ? `solution.${model.functionName}(${argNames.join(', ')});`
        : `${returnJavaType} result = solution.${model.functionName}(${argNames.join(', ')});`;
    }

    const printStmt = isVoid
      ? 'System.out.println("null");'
      : this.renderOutputPrint(model.returnType, 'result');

    return `${imports}

${structs}public class Main {
${this.indent(helpers, 4)}

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line;
        ${model.className} solution = new ${model.className}();

        while ((line = br.readLine()) != null) {
            line = line.trim();
            if (line.isEmpty()) continue;

${this.indent(parseStmts.join('\n'), 12)}

            ${callStmt}
            ${printStmt}
        }
    }
}`;
  }

  private renderStructures(model: DriverModel): string {
    const structs: string[] = [];

    if (model.requiredStructures.includes('ListNode')) {
      structs.push(`class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; }
}`);
    }

    if (model.requiredStructures.includes('TreeNode')) {
      structs.push(`class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}`);
    }

    return structs.length > 0 ? structs.join('\n\n') + '\n\n' : '';
  }

  private renderHelpers(model: DriverModel): string {
    const helpers: string[] = [];

    helpers.push(`private static int[] parseArrayInt(String s) {
    s = s.replaceAll("[\\[\\]\\\\s]", "");
    if (s.isEmpty()) return new int[0];
    String[] parts = s.split(",");
    int[] res = new int[parts.length];
    for (int i = 0; i < parts.length; i++) {
        res[i] = Integer.parseInt(parts[i].trim());
    }
    return res;
}`);

    if (model.requiredStructures.includes('ListNode')) {
      helpers.push(`private static ListNode parseLinkedList(String s) {
    int[] nums = parseArrayInt(s);
    if (nums.length == 0) return null;
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    for (int n : nums) {
        curr.next = new ListNode(n);
        curr = curr.next;
    }
    return dummy.next;
}

private static void printLinkedList(ListNode head) {
    StringBuilder sb = new StringBuilder("[");
    ListNode curr = head;
    while (curr != null) {
        sb.append(curr.val).append(curr.next != null ? "," : "");
        curr = curr.next;
    }
    sb.append("]");
    System.out.println(sb.toString());
}`);
    }

    return helpers.join('\n\n');
  }

  private renderParameterParsing(param: ParamParseSpec, varName: string, javaType: string): string {
    const kind = param.typeInfo.kind;
    const baseType = param.typeInfo.baseType;

    if (kind === 'primitive') {
      if (baseType === 'int') return `${javaType} ${varName} = Integer.parseInt(line);`;
      if (baseType === 'long') return `${javaType} ${varName} = Long.parseLong(line);`;
      if (baseType === 'float') return `${javaType} ${varName} = Float.parseFloat(line);`;
      if (baseType === 'double') return `${javaType} ${varName} = Double.parseDouble(line);`;
      if (baseType === 'bool') return `${javaType} ${varName} = Boolean.parseBoolean(line);`;
      return `${javaType} ${varName} = line;`;
    } else if (kind === 'collection_array') {
      return `${javaType} ${varName} = parseArrayInt(line);`;
    } else if (kind === 'structure') {
      if (baseType === 'ListNode') {
        return `${javaType} ${varName} = parseLinkedList(line);`;
      }
    }

    return `${javaType} ${varName} = null; // parse ${param.canonicalType}`;
  }

  private renderOutputPrint(returnType: ReturnPrintSpec, varName: string): string {
    const kind = returnType.typeInfo.kind;
    const baseType = returnType.typeInfo.baseType;

    if (kind === 'primitive') {
      return `System.out.println(${varName});`;
    } else if (kind === 'collection_array') {
      return `System.out.println(Arrays.toString(${varName}));`;
    } else if (kind === 'structure') {
      if (baseType === 'ListNode') {
        return `printLinkedList(${varName});`;
      }
    }

    return `System.out.println(${varName});`;
  }
}
