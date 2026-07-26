#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <queue>
#include <unordered_map>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
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

static ListNode* parseLinkedList(const string& s) {
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
}


int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string line;
    Solution solution;

    while (getline(cin, line)) {
        if (line.empty()) continue;

        ListNode* head = parseLinkedList(line);

        auto result = solution.reverseList(head);
        printLinkedList(result);
    }

    return 0;
}