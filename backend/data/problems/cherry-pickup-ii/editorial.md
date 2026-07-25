# Cherry Pickup II — Editorial

## Overview
Two robots collect maximum cherries starting from opposite corners.

## Why Learn This?
Advanced hard-level problem testing deep problem-solving skills, optimal state management, and algorithmic rigor.

## Recognition Clues
Look for array/string traversal where dp properties or sliding boundaries reduce time complexity.

## Prerequisites
Mastery of dp, dynamic programming, advanced graph/tree traversal

## Concepts Used
Complex DP algorithms, state compression, optimization

## Intuition & Approach
### Intuition
By maintaining optimal state or invariants during iteration, we avoid recomputing redundant subproblems.

### Approach
Leverage advanced dp algorithms, multi-dimensional DP, or monotonic data structures to achieve optimal asymptotic bounds.

## Step-by-Step Algorithm
1. Initialize data structures (DP Table / Array).
2. Traverse input while updating current boundary or accumulator.
3. Return result once target state is reached.

## Pseudocode
```text
# Hard DP optimal approach
initialize state table / priority queue
while queue or states active:
  transition states
return target result
```

## Complexity Analysis
- **Optimal Time Complexity:** O(N log N) or O(N)
- **Optimal Space Complexity:** O(N)
- **Brute Force Time Complexity:** O(2^N) / O(N^3)
- **Brute Force Space Complexity:** O(N^2)

## Common Mistakes & Gotchas
- Overcomplicating the state transitions or missing crucial base cases.

## Edge Cases to Consider
- Maximum constraint bounds, disconnected components, boundary overflow.

## Interview Trick
Focus on invariant preservation and spatial optimization (in-place manipulation where applicable).

## Revision Notes
Key DP question frequently asked in FAANG/Top Tech interview loops.
