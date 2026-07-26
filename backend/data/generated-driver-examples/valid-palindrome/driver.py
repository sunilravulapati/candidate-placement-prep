import sys
import json
from typing import List, Optional, Any


def main():
    lines = [line.strip() for line in sys.stdin if line.strip()]
    if not lines:
        return
    
    solution = Solution()
    idx = 0
    while idx < len(lines):
        s = json.loads(lines[idx + 0]) if lines[idx + 0].startswith('"') else lines[idx + 0]
        result = solution.isPalindrome(s)
        print("true" if result else "false")
        idx += 1

if __name__ == "__main__":
    main()