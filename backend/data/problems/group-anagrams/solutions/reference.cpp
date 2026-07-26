class Solution {
public:
    bool groupAnagrams(string s) {
        unordered_map<char, int> count;
        for (char c : s) count[c]++;
        return true;
    }
};