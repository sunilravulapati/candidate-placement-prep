# 3Sum — Editorial

## Overview
Find all unique triplets that sum to zero.

## Why Learn This?
High frequency medium-level interview question for testing algorithm design and two pointers proficiency.

## Recognition Clues
Look for array/string traversal where two pointers properties or sliding boundaries reduce time complexity.

## Prerequisites
Two Pointers fundamentals, recursion, or hashing

## Concepts Used
Two Pointers pattern optimization, search space reduction

## Intuition & Approach
### Intuition
By maintaining optimal state or invariants during iteration, we avoid recomputing redundant subproblems.

### Approach
Apply two pointers specific optimal traversal or data structure mapping to satisfy target time/space constraints.

## Step-by-Step Algorithm
1. Initialize data structures (Array).
2. Traverse input while updating current boundary or accumulator.
3. Return result once target state is reached.

## Pseudocode
```text
# Medium Two Pointers optimal pattern
setup data structures
while condition:
  update state
return optimal value
```

## Complexity Analysis
- **Optimal Time Complexity:** O(N) or O(N log N)
- **Optimal Space Complexity:** O(N) or O(1)
- **Brute Force Time Complexity:** O(N^2)
- **Brute Force Space Complexity:** O(N)

## Common Mistakes & Gotchas
- Off-by-one errors, unnecessary nested loops leading to quadratic time.

## Edge Cases to Consider
- Large scale inputs, single element, negative numbers, cycles.

## Interview Trick
Focus on invariant preservation and spatial optimization (in-place manipulation where applicable).

## Revision Notes
Key Two Pointers question frequently asked in FAANG/Top Tech interview loops.
