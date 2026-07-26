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
        nums = json.loads(lines[idx + 0])
        target = int(lines[idx + 1])
        result = solution.search(nums, target)
        print(result)
        idx += 2

if __name__ == "__main__":
    main()