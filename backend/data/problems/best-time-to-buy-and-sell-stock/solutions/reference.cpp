class Solution {
public:
    int bestTimeTo(vector<int>& nums) {
        int n = nums.size();
        vector<int> dp(n + 1, 0);
        for (int i = 1; i <= n; ++i) {
            dp[i] = dp[i - 1] + nums[i - 1];
        }
        return dp[n];
    }
};