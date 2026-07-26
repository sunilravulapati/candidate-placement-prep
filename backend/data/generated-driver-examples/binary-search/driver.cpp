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

        auto result = solution.search(nums, target);
        cout << result << endl;
    }

    return 0;
}