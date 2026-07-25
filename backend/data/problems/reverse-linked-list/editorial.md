# Reverse Linked List I — Editorial

## Overview
Reverse a singly linked list iteratively or recursively.

## Why Learn This?
Classic pointer manipulation benchmark question required for complex list operations.

## Recognition Clues
Look for array/string traversal where linked list properties or sliding boundaries reduce time complexity.

## Prerequisites
Singly Linked List, Pointers

## Concepts Used
Previous/Current/Next pointers, Recursive call stack

## Intuition & Approach
### Intuition
By maintaining optimal state or invariants during iteration, we avoid recomputing redundant subproblems.

### Approach
Iteratively reverse links using three pointers: prev initialized to null, curr to head. Continuously redirect curr.next to prev.

## Step-by-Step Algorithm
1. Initialize data structures (Singly Linked List).
2. Traverse input while updating current boundary or accumulator.
3. Return result once target state is reached.

## Pseudocode
```text
prev = None, curr = head
while curr:
  next_node = curr.next
  curr.next = prev
  prev = curr
  curr = next_node
return prev
```

## Complexity Analysis
- **Optimal Time Complexity:** O(N)
- **Optimal Space Complexity:** O(1)
- **Brute Force Time Complexity:** O(N)
- **Brute Force Space Complexity:** O(N) recursive

## Common Mistakes & Gotchas
- Losing reference to next node before updating pointer, causing memory leaks/infinite loops.

## Edge Cases to Consider
- Empty list (head is None), single node list.

## Interview Trick
Focus on invariant preservation and spatial optimization (in-place manipulation where applicable).

## Revision Notes
Key Linked List question frequently asked in FAANG/Top Tech interview loops.
