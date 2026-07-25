# Maximum Subarray — Editorial

## Overview
Find the contiguous subarray with the largest sum.

## Why Learn This?
Fundamental dynamic programming problem for array optimization and maximum subarray contiguous sum.

## Recognition Clues
Look for array/string traversal where arrays properties or sliding boundaries reduce time complexity.

## Prerequisites
Array traversal, basic loops

## Concepts Used
Local max vs Global max, Dynamic Programming, Greedy

## Intuition & Approach
### Intuition
By maintaining optimal state or invariants during iteration, we avoid recomputing redundant subproblems.

### Approach
Maintain current_sum and max_sum. Iterate through elements, add to current_sum. Update max_sum. If current_sum < 0, reset current_sum to 0.

## Step-by-Step Algorithm
1. Initialize data structures (Array, Hash Table).
2. Traverse input while updating current boundary or accumulator.
3. Return result once target state is reached.

## Pseudocode
```text
max_so_far = -inf, curr = 0
for x in nums:
  curr += x
  max_so_far = max(max_so_far, curr)
  if curr < 0: curr = 0
return max_so_far
```

## Complexity Analysis
- **Optimal Time Complexity:** O(N)
- **Optimal Space Complexity:** O(1)
- **Brute Force Time Complexity:** O(N log N) / O(N^2)
- **Brute Force Space Complexity:** O(log N)

## Common Mistakes & Gotchas
- Not handling all negative numbers properly (initializing max_sum to 0 instead of -inf).

## Edge Cases to Consider
- All negative numbers, single element array, array with alternating signs.

## Interview Trick
Focus on invariant preservation and spatial optimization (in-place manipulation where applicable).

## Revision Notes
Key Arrays question frequently asked in FAANG/Top Tech interview loops.
