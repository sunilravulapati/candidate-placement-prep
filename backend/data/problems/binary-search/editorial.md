# Binary Search — Editorial

## Overview
Search for a target element in a sorted array in O(log n).

## Why Learn This?
Fundamental logarithmic search algorithm on ordered search spaces.

## Recognition Clues
Look for array/string traversal where binary search properties or sliding boundaries reduce time complexity.

## Prerequisites
Sorted Arrays, Loop conditionals

## Concepts Used
Middle element computation, Search range reduction

## Intuition & Approach
### Intuition
By maintaining optimal state or invariants during iteration, we avoid recomputing redundant subproblems.

### Approach
Set low = 0, high = N - 1. While low <= high, compute mid = low + (high - low)//2. Compare nums[mid] with target.

## Step-by-Step Algorithm
1. Initialize data structures (Array).
2. Traverse input while updating current boundary or accumulator.
3. Return result once target state is reached.

## Pseudocode
```text
low = 0, high = len(nums)-1
while low <= high:
  mid = low + (high - low)//2
  if nums[mid] == target: return mid
  elif nums[mid] < target: low = mid + 1
  else: high = mid - 1
return -1
```

## Complexity Analysis
- **Optimal Time Complexity:** O(log N)
- **Optimal Space Complexity:** O(1)
- **Brute Force Time Complexity:** O(N)
- **Brute Force Space Complexity:** O(1)

## Common Mistakes & Gotchas
- Integer overflow with (low + high)//2 in C++/Java (use low + (high-low)//2), off-by-one errors with boundary conditions.

## Edge Cases to Consider
- Single element array, target smaller than min or larger than max, target present at endpoints.

## Interview Trick
Focus on invariant preservation and spatial optimization (in-place manipulation where applicable).

## Revision Notes
Key Binary Search question frequently asked in FAANG/Top Tech interview loops.
