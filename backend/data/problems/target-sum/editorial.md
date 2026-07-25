# Target Sum — Editorial

## Overview
Assign + or - signs to elements to make the total sum equal to a target.

## Why Learn This?
High frequency medium-level interview question for testing algorithm design and dp proficiency.

## Recognition Clues
Look for array/string traversal where dp properties or sliding boundaries reduce time complexity.

## Prerequisites
DP fundamentals, recursion, or hashing

## Concepts Used
DP pattern optimization, search space reduction

## Intuition & Approach
### Intuition
By maintaining optimal state or invariants during iteration, we avoid recomputing redundant subproblems.

### Approach
Apply dp specific optimal traversal or data structure mapping to satisfy target time/space constraints.

## Step-by-Step Algorithm
1. Initialize data structures (DP Table / Array).
2. Traverse input while updating current boundary or accumulator.
3. Return result once target state is reached.

## Pseudocode
```text
# Medium DP optimal pattern
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
Key DP question frequently asked in FAANG/Top Tech interview loops.
