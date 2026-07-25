# Meeting Rooms — Editorial

## Overview
Determine if a person could attend all given meetings.

## Why Learn This?
Essential entry-level sorting pattern used in technical screening interviews.

## Recognition Clues
Look for array/string traversal where sorting properties or sliding boundaries reduce time complexity.

## Prerequisites
Basic sorting syntax and fundamentals

## Concepts Used
Sorting traversal, conditionals, pointers

## Intuition & Approach
### Intuition
By maintaining optimal state or invariants during iteration, we avoid recomputing redundant subproblems.

### Approach
Traverse the input using standard sorting techniques, updating state variables or hash maps as required.

## Step-by-Step Algorithm
1. Initialize data structures (Array).
2. Traverse input while updating current boundary or accumulator.
3. Return result once target state is reached.

## Pseudocode
```text
# Standard Sorting solution pattern
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
Key Sorting question frequently asked in FAANG/Top Tech interview loops.
