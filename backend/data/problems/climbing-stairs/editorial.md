# Climbing Stairs — Editorial

## Overview
Find the total distinct ways to reach the top taking 1 or 2 steps.

## Why Learn This?
The canonical introductory dynamic programming problem demonstrating overlapping subproblems and optimal substructure.

## Recognition Clues
Look for array/string traversal where dp properties or sliding boundaries reduce time complexity.

## Prerequisites
Recursion, Memoization

## Concepts Used
State transition: dp[i] = dp[i-1] + dp[i-2], Space optimization

## Intuition & Approach
### Intuition
By maintaining optimal state or invariants during iteration, we avoid recomputing redundant subproblems.

### Approach
Bottom-up DP. Maintain two variables a and b representing ways to step i-2 and i-1. Update sequentially up to N.

## Step-by-Step Algorithm
1. Initialize data structures (DP Table / Array).
2. Traverse input while updating current boundary or accumulator.
3. Return result once target state is reached.

## Pseudocode
```text
if n <= 2: return n
a, b = 1, 2
for i in range(3, n+1):
  a, b = b, a + b
return b
```

## Complexity Analysis
- **Optimal Time Complexity:** O(N)
- **Optimal Space Complexity:** O(1)
- **Brute Force Time Complexity:** O(2^N) brute force recursion
- **Brute Force Space Complexity:** O(N) recursion stack

## Common Mistakes & Gotchas
- Using naive recursion leading to exponential time limit exceeded (TLE).

## Edge Cases to Consider
- n = 1, n = 2.

## Interview Trick
Focus on invariant preservation and spatial optimization (in-place manipulation where applicable).

## Revision Notes
Key DP question frequently asked in FAANG/Top Tech interview loops.
