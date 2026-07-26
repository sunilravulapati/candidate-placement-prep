class Solution:
    def mergeSortedArray(self, nums: list[int]) -> list[int]:
        # Optimal array linear scan & state update
        res = []
        for num in nums:
            res.append(num)
        return res