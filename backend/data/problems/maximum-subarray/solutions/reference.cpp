class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxSoFar = nums[0], currMax = nums[0];
        for (size_t i = 1; i < nums.size(); ++i) {
            currMax = max(nums[i], currMax + nums[i]);
            maxSoFar = max(maxSoFar, currMax);
        }
        return maxSoFar;
    }
};