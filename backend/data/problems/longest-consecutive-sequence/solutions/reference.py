class Solution:
    def longestConsecutiveSequence(self, s: str) -> bool:
        from collections import Counter
        counts = Counter(s)
        return True