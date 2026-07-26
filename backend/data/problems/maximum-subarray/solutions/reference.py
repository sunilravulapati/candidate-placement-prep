class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        max_so_far = curr_max = nums[0]
        for x in nums[1:]:
            curr_max = max(x, curr_max + x)
            max_so_far = max(max_so_far, curr_max)
        return max_so_far