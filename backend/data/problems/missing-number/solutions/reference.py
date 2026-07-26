class Solution:
    def missingNumber(self, nums: list[int]) -> int:
        n = len(nums)
        dp = [0] * (n + 1)
        for i in range(1, n + 1):
            dp[i] = dp[i - 1] + nums[i - 1]
        return dp[n]