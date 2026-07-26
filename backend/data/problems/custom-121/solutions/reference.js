var alienDictionary = function(nums) {
    const n = nums.length;
    const dp = new Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) {
        dp[i] = dp[i - 1] + nums[i - 1];
    }
    return dp[n];
};