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
        matrix = json.loads(lines[idx + 0])
        solution.rotate(matrix)
        print("null")
        idx += 1

if __name__ == "__main__":
    main()