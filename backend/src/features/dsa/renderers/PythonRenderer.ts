// backend/src/features/dsa/renderers/PythonRenderer.ts

import { BaseRenderer } from './Renderer';

export class PythonRenderer extends BaseRenderer {
  render(): string {
    const { driverType, className, functionName } = this.ast;

    const helpers = `
import sys
import json
import re
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

def build_tree(raw_str):
    if not raw_str:
        return None
    s = raw_str.strip()
    if s.startswith('[') and s.endswith(']'):
        s = s[1:-1].strip()
    if not s or s == '0':
        return None
    tokens = re.split(r'[,\\s]+', s)
    tokens = [t for t in tokens if t]
    if not tokens:
        return None
    start_idx = 0
    try:
        possible_count = int(tokens[0])
        if possible_count == len(tokens) - 1:
            start_idx = 1
    except Exception:
        pass
    if start_idx >= len(tokens):
        return None
    if tokens[start_idx] in ('null', 'None', ''):
        return None
    root = TreeNode(int(tokens[start_idx]))
    queue = [root]
    i = start_idx + 1
    while queue and i < len(tokens):
        curr = queue.pop(0)
        if i < len(tokens):
            val = tokens[i]
            i += 1
            if val not in ('null', 'None'):
                curr.left = TreeNode(int(val))
                queue.append(curr.left)
        if i < len(tokens):
            val = tokens[i]
            i += 1
            if val not in ('null', 'None'):
                curr.right = TreeNode(int(val))
                queue.append(curr.right)
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


def expand_ranges(token):
    def replace_range(match):
        start = int(match.group(1))
        end = int(match.group(2))
        length = end - start + 1
        if length <= 0 or length > 20000:
            return f"{start},{end}"
        return ','.join(str(start + i) for i in range(length))
    return re.sub(r'\[(.*?)\]', lambda m: '[' + re.sub(r'\b(\d+)\s*\.\.\s*(\d+)\b', replace_range, m.group(1)) + ']', token)


def parse_value(token):
    stripped = token.strip()
    try:
        return json.loads(stripped)
    except Exception:
        pass

    match = re.match(r'^[A-Za-z_][A-Za-z0-9_]*\s*=\s*(.*)$', stripped)
    candidate = match.group(1).strip() if match else stripped
    candidate = expand_ranges(candidate)
    try:
        return json.loads(candidate)
    except Exception:
        return candidate
`;

    if (driverType === 'COMMAND_SEQUENCE') {
      return `
${helpers}

${this.userCode}

if __name__ == '__main__':
    raw_input = sys.stdin.read().strip()
    if raw_input:
        lines = [l.strip() for l in raw_input.split('\\n') if l.strip()]
        if lines:
            line1 = lines[0]
            if line1.startswith('['):
                commands = json.loads(lines[0])
                args_list = json.loads(lines[1]) if len(lines) > 1 else []
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
            else:
                import inspect
                cls = globals().get("${className}") or getattr(sys.modules[__name__], "${className}", None)
                obj = None
                line_idx = 0
                if cls:
                    try:
                        sig = inspect.signature(cls.__init__)
                        params = [p for p in sig.parameters.values() if p.name != 'self']
                        if len(params) == 1:
                            obj = cls(int(lines[0]))
                            line_idx = 1
                        else:
                            obj = cls()
                            line_idx = 0
                    except Exception:
                        obj = cls()
                
                op_count = int(lines[line_idx]) if line_idx < len(lines) and lines[line_idx].lstrip('-').isdigit() else 0
                line_idx += 1
                results = []
                for i in range(line_idx, min(len(lines), line_idx + op_count)):
                    parts = lines[i].split()
                    if not parts:
                        continue
                    cmd = parts[0]
                    args = []
                    for token in parts[2:]:
                        try:
                            args.append(int(token))
                        except ValueError:
                            args.append(token)
                    if obj and hasattr(obj, cmd):
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
        raw_args = [parse_value(l) for l in lines]
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
        root = build_tree(raw_input)
        solver = ${className}()
        func = getattr(solver, '${functionName}', None)
        if not func:
            methods = [m for m in dir(solver) if not m.startswith('_') and callable(getattr(solver, m))]
            if methods:
                func = getattr(solver, methods[0])
        if func:
            res = func(root)
            if isinstance(res, TreeNode):
                print(json.dumps(treeNodeToArray(res)))
            else:
                print(json.dumps(res))
    else:
        print("[]")
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
        args = [parse_value(l) for l in lines]
        solver = ${className}()
        func = getattr(solver, '${functionName}', None)
        if func:
            res = func(*args)
            print(json.dumps(res))
`;
  }
}
