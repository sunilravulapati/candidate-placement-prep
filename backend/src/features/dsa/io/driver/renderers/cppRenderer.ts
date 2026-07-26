// backend/src/features/dsa/io/driver/renderers/cppRenderer.ts

import { BaseLanguageRenderer } from './baseRenderer';
import { DriverModel, ParamParseSpec, ReturnPrintSpec } from '../model/driverModel';
import { SupportedLanguage, mapCanonicalToLanguage } from '../../canonical/types';

export class CppRenderer extends BaseLanguageRenderer {
  public readonly language: SupportedLanguage = 'cpp';

  public render(model: DriverModel): string {
    const includes = this.renderIncludes();
    const structs = this.renderStructures(model);
    const helpers = this.renderHelpers(model);

    const parseStmts: string[] = [];
    const argNames: string[] = [];

    model.parameters.forEach((param, idx) => {
      const cppType = mapCanonicalToLanguage(param.canonicalType, 'cpp');
      const varName = param.name || `param${idx}`;
      argNames.push(varName);

      parseStmts.push(this.renderParameterParsing(param, varName, cppType));
    });

    const isVoid = model.returnType.canonicalType === 'void';
    const returnCppType = mapCanonicalToLanguage(model.returnType.canonicalType, 'cpp');

    let callStmt = '';
    if (model.isStatic) {
      callStmt = isVoid
        ? `${model.className}::${model.functionName}(${argNames.join(', ')});`
        : `auto result = ${model.className}::${model.functionName}(${argNames.join(', ')});`;
    } else {
      callStmt = isVoid
        ? `solution.${model.functionName}(${argNames.join(', ')});`
        : `auto result = solution.${model.functionName}(${argNames.join(', ')});`;
    }

    const printStmt = isVoid
      ? 'cout << "null" << endl;'
      : this.renderOutputPrint(model.returnType, 'result');

    return `${includes}

${structs}${helpers}
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string line;
    ${model.className} solution;

    while (getline(cin, line)) {
        if (line.empty()) continue;

${this.indent(parseStmts.join('\n'), 8)}

        ${callStmt}
        ${printStmt}
    }

    return 0;
}`;
  }

  private renderIncludes(): string {
    return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <queue>
#include <unordered_map>
using namespace std;`;
  }

  private renderStructures(model: DriverModel): string {
    const structs: string[] = [];

    if (model.requiredStructures.includes('ListNode')) {
      structs.push(`struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};`);
    }

    if (model.requiredStructures.includes('TreeNode')) {
      structs.push(`struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};`);
    }

    if (model.requiredStructures.includes('GraphNode')) {
      structs.push(`class Node {
public:
    int val;
    vector<Node*> neighbors;
    Node() : val(0) {}
    Node(int _val) : val(_val) {}
    Node(int _val, vector<Node*> _neighbors) : val(_val), neighbors(_neighbors) {}
};`);
    }

    return structs.length > 0 ? structs.join('\n\n') + '\n\n' : '';
  }

  private renderHelpers(model: DriverModel): string {
    const helpers: string[] = [];

    // Base parser helpers
    helpers.push(`static vector<int> parseVectorInt(const string& s) {
    vector<int> res;
    stringstream ss(s);
    char ch;
    int val;
    while (ss >> ch) {
        if (ch == '[' || ch == ',' || ch == ']') continue;
        ss.unget();
        if (ss >> val) res.push_back(val);
    }
    return res;
}`);

    if (model.requiredStructures.includes('ListNode')) {
      helpers.push(`static ListNode* parseLinkedList(const string& s) {
    vector<int> nums = parseVectorInt(s);
    if (nums.empty()) return nullptr;
    ListNode* head = new ListNode(nums[0]);
    ListNode* curr = head;
    for (size_t i = 1; i < nums.size(); ++i) {
        curr->next = new ListNode(nums[i]);
        curr = curr->next;
    }
    return head;
}

static void printLinkedList(ListNode* head) {
    cout << "[";
    ListNode* curr = head;
    while (curr) {
        cout << curr->val << (curr->next ? "," : "");
        curr = curr->next;
    }
    cout << "]" << endl;
}`);
    }

    if (model.requiredStructures.includes('TreeNode')) {
      helpers.push(`static TreeNode* parseTree(const string& s) {
    // Level order parse helper
    if (s == "[]" || s.empty()) return nullptr;
    vector<int> nums = parseVectorInt(s);
    if (nums.empty()) return nullptr;
    TreeNode* root = new TreeNode(nums[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < nums.size()) {
        TreeNode* curr = q.front();
        q.pop();
        if (i < nums.size()) {
            curr->left = new TreeNode(nums[i++]);
            q.push(curr->left);
        }
        if (i < nums.size()) {
            curr->right = new TreeNode(nums[i++]);
            q.push(curr->right);
        }
    }
    return root;
}`);
    }

    return helpers.join('\n\n') + '\n\n';
  }

  private renderParameterParsing(param: ParamParseSpec, varName: string, cppType: string): string {
    const kind = param.typeInfo.kind;
    const baseType = param.typeInfo.baseType;

    if (kind === 'primitive') {
      if (baseType === 'int' || baseType === 'long') {
        return `${cppType} ${varName} = stoi(line);`;
      } else if (baseType === 'float' || baseType === 'double') {
        return `${cppType} ${varName} = stod(line);`;
      } else if (baseType === 'bool') {
        return `${cppType} ${varName} = (line == "true" || line == "1");`;
      } else {
        return `${cppType} ${varName} = line;`;
      }
    } else if (kind === 'collection_array') {
      return `${cppType} ${varName} = parseVectorInt(line);`;
    } else if (kind === 'structure') {
      if (baseType === 'ListNode') {
        return `${cppType} ${varName} = parseLinkedList(line);`;
      } else if (baseType === 'TreeNode') {
        return `${cppType} ${varName} = parseTree(line);`;
      }
    }

    return `${cppType} ${varName}; // parse ${param.canonicalType}`;
  }

  private renderOutputPrint(returnType: ReturnPrintSpec, varName: string): string {
    const kind = returnType.typeInfo.kind;
    const baseType = returnType.typeInfo.baseType;

    if (kind === 'primitive') {
      if (baseType === 'bool') {
        return `cout << (${varName} ? "true" : "false") << endl;`;
      }
      return `cout << ${varName} << endl;`;
    } else if (kind === 'collection_array') {
      return `cout << "[";
        for (size_t i = 0; i < ${varName}.size(); ++i) {
            cout << ${varName}[i] << (i + 1 < ${varName}.size() ? "," : "");
        }
        cout << "]" << endl;`;
    } else if (kind === 'structure') {
      if (baseType === 'ListNode') {
        return `printLinkedList(${varName});`;
      }
    }

    return `cout << ${varName} << endl;`;
  }
}
