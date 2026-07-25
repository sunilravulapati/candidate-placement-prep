# Two Sum — Editorial

## Overview
Find two numbers that add up to a specific target.

## Why Learn This?
Essential lookup optimization problem; reduces O(N^2) brute force to O(N) using Hash Map.

## Recognition Clues
Look for array/string traversal where hashing properties or sliding boundaries reduce time complexity.

## Prerequisites
Hash Maps, Key-Value pairs

## Concepts Used
Complement Search, Hash Map constant-time lookup

## Intuition & Approach
### Intuition
By maintaining optimal state or invariants during iteration, we avoid recomputing redundant subproblems.

### Approach
Iterate through array. For each num, calculate complement = target - num. If complement in map, return indices. Otherwise insert num -> index.

## Step-by-Step Algorithm
1. Initialize data structures (Array, Hash Table).
2. Traverse input while updating current boundary or accumulator.
3. Return result once target state is reached.

## Pseudocode
```text
seen = {}
for i, num in enumerate(nums):
  comp = target - num
  if comp in seen: return [seen[comp], i]
  seen[num] = i
```

## Complexity Analysis
- **Optimal Time Complexity:** O(N)
- **Optimal Space Complexity:** O(N)
- **Brute Force Time Complexity:** O(N^2)
- **Brute Force Space Complexity:** O(1)

## Common Mistakes & Gotchas
- Re-using the same element twice, not checking if complement is already stored.

## Edge Cases to Consider
- Duplicate numbers that add up to target, negative numbers.

## Interview Trick
Focus on invariant preservation and spatial optimization (in-place manipulation where applicable).

## Revision Notes
Key Hashing question frequently asked in FAANG/Top Tech interview loops.
