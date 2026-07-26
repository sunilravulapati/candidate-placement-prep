import sys
import json
from typing import List, Optional, Any

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def parse_tree(data: List[Any]) -> Optional[TreeNode]:
    if not data:
        return None
    root = TreeNode(data[0])
    queue = [root]
    i = 1
    while queue and i < len(data):
        curr = queue.pop(0)
        if i < len(data) and data[i] is not None:
            curr.left = TreeNode(data[i])
            queue.append(curr.left)
        i += 1
        if i < len(data) and data[i] is not None:
            curr.right = TreeNode(data[i])
            queue.append(curr.right)
        i += 1
    return root


def main():
    lines = [line.strip() for line in sys.stdin if line.strip()]
    if not lines:
        return
    
    solution = Solution()
    idx = 0
    while idx < len(lines):
        root = parse_tree(json.loads(lines[idx + 0]))
        result = solution.maxDepth(root)
        print(result)
        idx += 1

if __name__ == "__main__":
    main()