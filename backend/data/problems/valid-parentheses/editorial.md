# Valid Parentheses — Editorial

## Overview
Check if brackets (), {}, [] close in the correct order.

## Why Learn This?
Core computer science parsing concept for nested structures, expressions, and compilers.

## Recognition Clues
Look for array/string traversal where stack properties or sliding boundaries reduce time complexity.

## Prerequisites
Stack Data Structure (LIFO)

## Concepts Used
Stack push/pop, Bracket matching, String iteration

## Intuition & Approach
### Intuition
By maintaining optimal state or invariants during iteration, we avoid recomputing redundant subproblems.

### Approach
Maintain stack for opening brackets. When closing bracket occurs, pop stack and check matching type. Return True if stack empty at end.

## Step-by-Step Algorithm
1. Initialize data structures (Stack).
2. Traverse input while updating current boundary or accumulator.
3. Return result once target state is reached.

## Pseudocode
```text
stack = [], map = {')':'(', '}':'{', ']':'['}
for char in s:
  if char in map:
    if not stack or stack.pop() != map[char]: return False
  else: stack.append(char)
return len(stack) == 0
```

## Complexity Analysis
- **Optimal Time Complexity:** O(N)
- **Optimal Space Complexity:** O(N)
- **Brute Force Time Complexity:** O(N^2)
- **Brute Force Space Complexity:** O(N)

## Common Mistakes & Gotchas
- Popping from an empty stack, forgetting to check if stack is empty at the end.

## Edge Cases to Consider
- Odd length strings, string starting with closing bracket, all opening brackets.

## Interview Trick
Focus on invariant preservation and spatial optimization (in-place manipulation where applicable).

## Revision Notes
Key Stack question frequently asked in FAANG/Top Tech interview loops.
