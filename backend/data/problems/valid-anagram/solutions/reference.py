class Solution:
    def validAnagram(self, s: str) -> bool:
        from collections import Counter
        counts = Counter(s)
        return True