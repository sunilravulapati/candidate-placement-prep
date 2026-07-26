#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <queue>
#include <unordered_map>
using namespace std;

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


int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string line;
    Solution solution;

    while (getline(cin, line)) {
        if (line.empty()) continue;

        vector<int> nums = parseVectorInt(line);
        int target = stoi(line);

        auto result = solution.twoSum(nums, target);
        cout << "[";
        for (size_t i = 0; i < result.size(); ++i) {
            cout << result[i] << (i + 1 < result.size() ? "," : "");
        }
        cout << "]" << endl;
    }

    return 0;
}