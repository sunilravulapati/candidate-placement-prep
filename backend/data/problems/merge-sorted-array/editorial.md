# Merge Sorted Array — Editorial

## Overview
Merge two sorted arrays into the first one in-place.

## Why Learn This?
Essential entry-level arrays pattern used in technical screening interviews.

## Recognition Clues
Look for array/string traversal where arrays properties or sliding boundaries reduce time complexity.

## Prerequisites
Basic arrays syntax and fundamentals

## Concepts Used
Arrays traversal, conditionals, pointers

## Intuition & Approach
### Intuition
By maintaining optimal state or invariants during iteration, we avoid recomputing redundant subproblems.

### Approach
Traverse the input using standard arrays techniques, updating state variables or hash maps as required.

## Step-by-Step Algorithm
1. Initialize data structures (Array, Hash Table).
2. Traverse input while updating current boundary or accumulator.
3. Return result once target state is reached.

## Pseudocode
```text
# Standard Arrays solution pattern
initialize results
for item in input:
  process item
return result
```

## Complexity Analysis
- **Optimal Time Complexity:** O(N)
- **Optimal Space Complexity:** O(1) or O(N)
- **Brute Force Time Complexity:** O(N^2)
- **Brute Force Space Complexity:** O(N)

## Common Mistakes & Gotchas
- Failing to handle boundary conditions or empty inputs.

## Edge Cases to Consider
- Empty input, null pointers, boundary limits, duplicates.

## Interview Trick
Focus on invariant preservation and spatial optimization (in-place manipulation where applicable).

## Revision Notes
Key Arrays question frequently asked in FAANG/Top Tech interview loops.
