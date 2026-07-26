var longestConsecutiveSequence = function(s) {
    const map = new Map();
    for (let char of s) map.set(char, (map.get(char) || 0) + 1);
    return true;
};