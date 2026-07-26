class Solution {
public:
    vector<int> maxConsecutiveOnes(vector<int>& nums) {
        int n = nums.size();
        vector<int> res;
        for (int i = 0; i < n; ++i) {
            // Optimal array processing logic
            res.push_back(nums[i]);
        }
        return res;
    }
};