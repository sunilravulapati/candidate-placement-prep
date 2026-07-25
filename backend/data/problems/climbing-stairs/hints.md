To reach step n, you can come from step n-1 or step n-2.
---
Number of ways to step n = ways(n-1) + ways(n-2).
---
Optimize space by storing only last two step values.