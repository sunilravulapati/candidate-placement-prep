import sys
import json
from typing import List, Optional, Any

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def parse_linked_list(data: List[int]) -> Optional[ListNode]:
    if not data:
        return None
    dummy = ListNode(0)
    curr = dummy
    for val in data:
        curr.next = ListNode(val)
        curr = curr.next
    return dummy.next

def print_linked_list(head: Optional[ListNode]) -> None:
    res = []
    curr = head
    while curr:
        res.append(curr.val)
        curr = curr.next
    print(json.dumps(res))


def main():
    lines = [line.strip() for line in sys.stdin if line.strip()]
    if not lines:
        return
    
    solution = Solution()
    idx = 0
    while idx < len(lines):
        head = parse_linked_list(json.loads(lines[idx + 0]))
        result = solution.reverseList(head)
        print_linked_list(result)
        idx += 1

if __name__ == "__main__":
    main()