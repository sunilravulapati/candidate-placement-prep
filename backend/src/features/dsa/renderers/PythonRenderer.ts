// backend/src/features/dsa/renderers/PythonRenderer.ts

import { BaseRenderer } from './Renderer';

export class PythonRenderer extends BaseRenderer {
  render(): string {
    const { driverType, className, functionName } = this.ast;

    const helpers = `
import sys
import json
from typing import List, Optional, Dict, Set, Tuple

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def arrayToListNode(arr):
    if not arr:
        return None
    dummy = ListNode(0)
    curr = dummy
    for v in arr:
        curr.next = ListNode(v)
        curr = curr.next
    return dummy.next

def listNodeToArray(head):
    res = []
    curr = head
    visited = set()
    while curr and curr not in visited:
        visited.add(curr)
        res.append(curr.val)
        curr = curr.next
    return res

def arrayToTreeNode(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while queue and i < len(arr):
        curr = queue.pop(0)
        if i < len(arr) and arr[i] is not None:
            curr.left = TreeNode(arr[i])
            queue.append(curr.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            curr.right = TreeNode(arr[i])
            queue.append(curr.right)
        i += 1
    return root

def treeNodeToArray(root):
    if not root:
        return []
    res = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        if node:
            res.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            res.append(None)
    while res and res[-1] is None:
        res.pop()
    return res
`;

    if (driverType === 'COMMAND_SEQUENCE') {
      return `
${helpers}

${this.userCode}

if __name__ == '__main__':
    raw_input = sys.stdin.read().strip()
    if raw_input:
        lines = [l for l in raw_input.split('\\n') if l.strip()]
        if len(lines) >= 2:
            commands = json.loads(lines[0])
            args_list = json.loads(lines[1])
            obj = None
            results = []
            for i, cmd in enumerate(commands):
                args = args_list[i] if i < len(args_list) else []
                if cmd == "${className}":
                    cls = globals().get("${className}") or getattr(sys.modules[__name__], "${className}", None)
                    obj = cls(*args) if cls else None
                    results.append(None)
                elif obj and hasattr(obj, cmd):
                    method = getattr(obj, cmd)
                    ret = method(*args)
                    results.append(ret)
                else:
                    results.append(None)
            print(json.dumps(results))
`;
    }

    if (driverType === 'LINKED_LIST') {
      return `
${helpers}

${this.userCode}

if __name__ == '__main__':
    raw_input = sys.stdin.read().strip()
    if raw_input:
        lines = [l for l in raw_input.split('\\n') if l.strip()]
        raw_args = [json.loads(l) for l in lines]
        args = [arrayToListNode(a) if isinstance(a, list) else a for a in raw_args]
        solver = ${className}()
        func = getattr(solver, '${functionName}', None)
        if func:
            res = func(*args)
            if isinstance(res, ListNode):
                print(json.dumps(listNodeToArray(res)))
            else:
                print(json.dumps(res))
`;
    }

    if (driverType === 'TREE') {
      return `
${helpers}

${this.userCode}

if __name__ == '__main__':
    raw_input = sys.stdin.read().strip()
    if raw_input:
        lines = [l for l in raw_input.split('\\n') if l.strip()]
        raw_args = [json.loads(l) for l in lines]
        args = [arrayToTreeNode(a) if isinstance(a, list) else a for a in raw_args]
        solver = ${className}()
        func = getattr(solver, '${functionName}', None)
        if func:
            res = func(*args)
            if isinstance(res, TreeNode):
                print(json.dumps(treeNodeToArray(res)))
            else:
                print(json.dumps(res))
`;
    }

    // Default FUNCTION Driver
    return `
${helpers}

${this.userCode}

if __name__ == '__main__':
    raw_input = sys.stdin.read().strip()
    if raw_input:
        lines = [l for l in raw_input.split('\\n') if l.strip()]
        args = [json.loads(l) for l in lines]
        solver = ${className}()
        func = getattr(solver, '${functionName}', None)
        if func:
            res = func(*args)
            print(json.dumps(res))
`;
  }
}
