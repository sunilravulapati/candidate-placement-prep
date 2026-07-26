#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <queue>
#include <unordered_map>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

static vector<int> parseVectorInt(const string& s) {
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
}

static TreeNode* parseTree(const string& s) {
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
}


int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string line;
    Solution solution;

    while (getline(cin, line)) {
        if (line.empty()) continue;

        TreeNode* root = parseTree(line);

        auto result = solution.maxDepth(root);
        cout << result << endl;
    }

    return 0;
}