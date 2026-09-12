// backend/src/features/dsa/renderers/CppRenderer.ts

import { BaseRenderer } from './Renderer';

export class CppRenderer extends BaseRenderer {
  render(): string {
    const { driverType, className = 'Solution', functionName = 'solve', parameters = [] } = this.ast;

    const includes = `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <sstream>
#include <cctype>

using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

static vector<string> splitTokens(const string& s) {
    vector<string> tokens;
    string cur = "";
    for (char c : s) {
        if (c == '[' || c == ']' || c == ',' || isspace(c)) {
            if (!cur.empty()) {
                tokens.push_back(cur);
                cur = "";
            }
        } else {
            cur += c;
        }
    }
    if (!cur.empty()) tokens.push_back(cur);
    return tokens;
}

static vector<int> parseVectorInt(const string& s) {
    vector<int> res;
    for (const string& tok : splitTokens(s)) {
        try {
            res.push_back(stoi(tok));
        } catch (...) {}
    }
    return res;
}

static TreeNode* buildTree(const string& s) {
    vector<string> tokens = splitTokens(s);
    if (tokens.empty()) return nullptr;

    size_t startIdx = 0;
    try {
        int possibleCount = stoi(tokens[0]);
        if (possibleCount == (int)tokens.size() - 1) {
            startIdx = 1;
        }
    } catch (...) {}

    if (startIdx >= tokens.size()) return nullptr;
    if (tokens[startIdx] == "null" || tokens[startIdx] == "None") return nullptr;

    TreeNode* root = new TreeNode(stoi(tokens[startIdx]));
    queue<TreeNode*> q;
    q.push(root);
    size_t i = startIdx + 1;

    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front();
        q.pop();

        if (i < tokens.size()) {
            string leftVal = tokens[i++];
            if (leftVal != "null" && leftVal != "None") {
                curr->left = new TreeNode(stoi(leftVal));
                q.push(curr->left);
            }
        }
        if (i < tokens.size()) {
            string rightVal = tokens[i++];
            if (rightVal != "null" && rightVal != "None") {
                curr->right = new TreeNode(stoi(rightVal));
                q.push(curr->right);
            }
        }
    }
    return root;
}

static ListNode* arrayToListNode(const vector<int>& nums) {
    if (nums.empty()) return nullptr;
    ListNode* dummy = new ListNode(0);
    ListNode* curr = dummy;
    for (int v : nums) {
        curr->next = new ListNode(v);
        curr = curr->next;
    }
    return dummy->next;
}

static void printVectorInt(const vector<int>& v) {
    cout << "[";
    for (size_t i = 0; i < v.size(); i++) {
        cout << v[i] << (i + 1 == v.size() ? "" : ",");
    }
    cout << "]";
}

static void printVectorVectorInt(const vector<vector<int>>& vv) {
    cout << "[";
    for (size_t i = 0; i < vv.size(); i++) {
        printVectorInt(vv[i]);
        if (i + 1 < vv.size()) cout << ",";
    }
    cout << "]";
}

static void printTree(TreeNode* root) {
    if (!root) {
        cout << "[]";
        return;
    }
    vector<string> list;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* node = q.front();
        q.pop();
        if (node) {
            list.push_back(to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            list.push_back("null");
        }
    }
    while (!list.empty() && list.back() == "null") {
        list.pop_back();
    }
    cout << "[";
    for (size_t i = 0; i < list.size(); i++) {
        cout << list[i] << (i + 1 == list.size() ? "" : ",");
    }
    cout << "]";
}

static void printList(ListNode* head) {
    vector<int> v;
    ListNode* curr = head;
    while (curr) {
        v.push_back(curr->val);
        curr = curr->next;
    }
    printVectorInt(v);
}
`;

    const codeWithoutComments = this.userCode
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '');
    const hasUserMain = /\bint\s+main\s*\(/m.test(codeWithoutComments);

    if (hasUserMain) {
      return `
${includes}

${this.userCode}
`;
    }

    if (driverType === 'TREE') {
      return `
${includes}

${this.userCode}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string fullInput, line;
    while (getline(cin, line)) {
        fullInput += line + " ";
    }
    
    TreeNode* root = buildTree(fullInput);
    ${className} solver;
    auto res = solver.${functionName}(root);
    
    // Auto print based on return type traits
    struct Printer {
        static void print(const vector<vector<int>>& v) { printVectorVectorInt(v); }
        static void print(const vector<int>& v) { printVectorInt(v); }
        static void print(TreeNode* node) { printTree(node); }
        static void print(int val) { cout << val; }
        static void print(long long val) { cout << val; }
        static void print(bool val) { cout << (val ? "true" : "false"); }
        static void print(const string& val) { cout << val; }
    };
    
    Printer::print(res);
    cout << endl;
    return 0;
}
`;
    }

    if (driverType === 'LINKED_LIST') {
      return `
${includes}

${this.userCode}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string line1;
    if (getline(cin, line1)) {
        vector<int> nums1 = parseVectorInt(line1);
        ListNode* head = arrayToListNode(nums1);
        
        ${className} solver;
        ListNode* res = solver.${functionName}(head);
        printList(res);
        cout << endl;
    }
    return 0;
}
`;
    }

    if (driverType === 'COMMAND_SEQUENCE') {
      return `
${includes}

${this.userCode}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string line;
    vector<string> lines;
    while (getline(cin, line)) {
        if (!line.empty()) lines.push_back(line);
    }

    if (lines.empty()) {
        cout << "[]" << endl;
        return 0;
    }

    if (lines[0].find("[") != string::npos) {
        // LeetCode JSON format fallback
        cout << "[]" << endl;
        return 0;
    }

    // Stream format
    int cap = stoi(lines[0]);
    ${className}* obj = new ${className}(cap);
    int opCount = lines.size() > 1 ? stoi(lines[1]) : 0;

    cout << "[";
    bool first = true;
    for (size_t i = 2; i < lines.size() && (int)i < 2 + opCount; i++) {
        stringstream ss(lines[i]);
        string cmd;
        int argCount = 0;
        ss >> cmd >> argCount;
        if (!first) cout << ",";
        first = false;

        if (cmd == "put") {
            int k, v;
            ss >> k >> v;
            obj->put(k, v);
            cout << "null";
        } else if (cmd == "get") {
            int k;
            ss >> k;
            int val = obj->get(k);
            cout << val;
        } else {
            cout << "null";
        }
    }
    cout << "]" << endl;
    return 0;
}
`;
    }

    // Default driver
    const isTwoArgs = parameters.length >= 2;
    return `
${includes}

${this.userCode}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string line1, line2;
    if (getline(cin, line1)) {
        vector<int> nums = parseVectorInt(line1);
        int target = 0;
        if (getline(cin, line2)) {
            vector<int> tVec = parseVectorInt(line2);
            if (!tVec.empty()) target = tVec[0];
        }
        ${className} solver;
        ${isTwoArgs ? `auto res = solver.${functionName}(nums, target);` : `auto res = solver.${functionName}(nums);`}
        
        struct Printer {
            static void print(const vector<vector<int>>& v) { printVectorVectorInt(v); }
            static void print(const vector<int>& v) { printVectorInt(v); }
            static void print(int val) { cout << val; }
            static void print(long long val) { cout << val; }
            static void print(bool val) { cout << (val ? "true" : "false"); }
            static void print(const string& val) { cout << val; }
        };
        Printer::print(res);
        cout << endl;
    }
    return 0;
}
`;
  }
}

