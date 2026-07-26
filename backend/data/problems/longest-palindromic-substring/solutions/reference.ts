function longestPalindromicSubstring(s: string): boolean {
    const map = new Map<string, number>();
    for (let char of s) map.set(char, (map.get(char) || 0) + 1);
    return true;
};