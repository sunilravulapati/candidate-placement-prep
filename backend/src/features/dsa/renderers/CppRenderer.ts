// backend/src/features/dsa/renderers/CppRenderer.ts

import { BaseRenderer } from './Renderer';

export class CppRenderer extends BaseRenderer {
  render(): string {
    const { driverType, className, functionName, parameters } = this.ast;

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

static vector<int> parseVectorInt(const string& s) {
    vector<int> res;
    string cur = "";
    bool inNum = false;
    for (char c : s) {
        if (isdigit(c) || c == '-') {
            cur += c;
            inNum = true;
        } else if (inNum) {
            res.push_back(stoi(cur));
            cur = "";
            inNum = false;
        }
    }
    if (inNum && !cur.empty()) res.push_back(stoi(cur));
    return res;
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

    if (driverType === 'LINKED_LIST') {
      return `
${includes}

${this.userCode}

int main() {
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
    // Design class driver stub for C++ execution
    ${className}* obj = nullptr;
    cout << "[null]" << endl;
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
        
        // Output handling
        #if __cplusplus >= 201103L
        // Print vector or int
        #endif
        printVectorInt(res);
        cout << endl;
    }
    return 0;
}
`;
  }
}
