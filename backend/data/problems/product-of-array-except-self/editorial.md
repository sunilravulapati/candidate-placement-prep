# Product of Array Except Self — Editorial

## Overview
Return array where each element is product of all others, without division.

## Why Learn This?
Teaches prefix/suffix accumulation techniques without relying on division operator.

## Recognition Clues
Look for array/string traversal where arrays properties or sliding boundaries reduce time complexity.

## Prerequisites
Arrays, Loop accumulators

## Concepts Used
Prefix Product, Suffix Product, Space Optimization

## Intuition & Approach
### Intuition
By maintaining optimal state or invariants during iteration, we avoid recomputing redundant subproblems.

### Approach
Pass 1: res[i] stores product of elements to the left of i. Pass 2: compute suffix product from right to left, multiplying into res[i].

## Step-by-Step Algorithm
1. Initialize data structures (Array, Hash Table).
2. Traverse input while updating current boundary or accumulator.
3. Return result once target state is reached.

## Pseudocode
```text
res = [1]*N
prefix = 1
for i in 0..N-1: res[i] = prefix; prefix *= nums[i]
suffix = 1
for i in N-1..0: res[i] *= suffix; suffix *= nums[i]
return res
```

## Complexity Analysis
- **Optimal Time Complexity:** O(N)
- **Optimal Space Complexity:** O(1) auxiliary
- **Brute Force Time Complexity:** O(N)
- **Brute Force Space Complexity:** O(N)

## Common Mistakes & Gotchas
- Using division operator when problem explicitly forbids it.

## Edge Cases to Consider
- Array containing zeros (one zero vs multiple zeros).

## Interview Trick
Focus on invariant preservation and spatial optimization (in-place manipulation where applicable).

## Revision Notes
Key Arrays question frequently asked in FAANG/Top Tech interview loops.
