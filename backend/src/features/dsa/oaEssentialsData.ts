// backend/src/features/dsa/oaEssentialsData.ts
// Curated Online Assessment (OA) Ranked Pattern Bank & Playbooks
// Derived from PrepGenie_V1_Ranked_Pattern_Bank.xlsx

export interface OAPatternPlaybook {
  id: string;
  corePattern: string;
  signal15Sec: string;
  commonTrap: string;
  mentalModel: string;
  timeComplexity: string;
  targetQuestions: string;
  visualCue: string;
}

export interface OACuratedProblem {
  rank: number;
  title: string;
  platform: 'HackerRank' | 'LeetCode' | 'Codeforces' | string;
  tier: string;
  pattern: string;
  trigger: string;
  trap: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  priority: 'P0 - Crucial' | 'P1 - High Yield' | 'P2 - Speed/Edge' | string;
  template: string;
  slug: string;
  isRepoProblem: boolean;
  equivalentSlug?: string;
  companies: string[];
  frequency: number;
}

export const OA_PATTERN_PLAYBOOKS: OAPatternPlaybook[] = [
  {
    "id": "difference-array-range-prefix",
    "corePattern": "Difference Array / Range Prefix",
    "signal15Sec": "Many range updates [l, r, +val] followed by querying final array state",
    "commonTrap": "Looks like simple nested for-loop or Segment Tree overkill",
    "mentalModel": "Record derivatives! Mark boundaries +k at L and -k at R+1, compute prefix sum once",
    "timeComplexity": "O(N + Q)",
    "targetQuestions": "Array Manipulation, Sherlock and Array",
    "visualCue": "Slider visualization showing step-function boundary pulses"
  },
  {
    "id": "binary-search-on-answer-space",
    "corePattern": "Binary Search on Answer Space",
    "signal15Sec": "'Minimize the maximum...', 'Find minimum capacity to do X in K steps', verify(x) is monotonic",
    "commonTrap": "Looks like dynamic programming, greedy simulation, or graph flow",
    "mentalModel": "Answer space is monotonic boolean array [F, F, F, T, T, T]. Halve the candidate answer range!",
    "timeComplexity": "O(N * log(Range))",
    "targetQuestions": "Minimum Time Required, Koko Bananas, Ship Packages",
    "visualCue": "Split-screen range dial: candidate X on top, verification simulator below"
  },
  {
    "id": "dynamic-sliding-window",
    "corePattern": "Dynamic Sliding Window",
    "signal15Sec": "Contiguous subarray/substring satisfying a property (distinct elements, sum <= K, at most K changes)",
    "commonTrap": "Looks like 2-nested loops O(N^2) or generating all substrings",
    "mentalModel": "Caterpillar crawl: expand Right until invalid, then advance Left until valid again",
    "timeComplexity": "O(N)",
    "targetQuestions": "Longest Substring Without Repeating, Min Size Subarray Sum, Fruit Into Baskets",
    "visualCue": "Two-pointer glowing caliper bracket highlighting active subsegment"
  },
  {
    "id": "monotonic-stack",
    "corePattern": "Monotonic Stack",
    "signal15Sec": "Find next/previous greater/smaller element; largest rectangle under skyline/histogram",
    "commonTrap": "Looks like O(N^2) backward scan or brute force range search",
    "mentalModel": "Keep stack ordered. An incoming element that breaks order 'resolves' all smaller/larger waiting elements",
    "timeComplexity": "O(N)",
    "targetQuestions": "Next Greater Element, Daily Temperatures, Largest Rectangle in Histogram",
    "visualCue": "Stack elevator showing items popping out when shadowed by a bigger element"
  },
  {
    "id": "bi-directional-frequency-map",
    "corePattern": "Bi-directional Frequency Map",
    "signal15Sec": "Queries asking: 'Does any number exist with frequency K?' while streaming inserts/deletions",
    "commonTrap": "Keeping a single map {element: count} and scanning all values (O(N) per query -> TLE)",
    "mentalModel": "Two synced maps: val_to_freq {val: count} AND freq_to_count {count: how_many_vals_have_this}",
    "timeComplexity": "O(1) per query",
    "targetQuestions": "Frequency Queries, Count Triplets, Sherlock Valid String",
    "visualCue": "Dual ledger showing element counter and frequency histogram counter in sync"
  },
  {
    "id": "cycle-decomposition-permutations",
    "corePattern": "Cycle Decomposition (Permutations)",
    "signal15Sec": "Find minimum number of swaps to sort an array of elements",
    "commonTrap": "Trying greedy sorting swaps without global cycle awareness",
    "mentalModel": "Every permutation is a set of disjoint directed cycles. Swaps needed = sum(cycle_size - 1)",
    "timeComplexity": "O(N)",
    "targetQuestions": "Minimum Swaps 2, New Year Chaos",
    "visualCue": "Directed graph node ring tracing closed orbits"
  },
  {
    "id": "bitwise-invariant-xor-cancellation",
    "corePattern": "Bitwise Invariant / XOR Cancellation",
    "signal15Sec": "Find odd occurrence, missing number, or operations involving subsets where x ^ x = 0",
    "commonTrap": "Using hash sets or extra memory when bitwise operators provide O(1) space invariants",
    "mentalModel": "XOR cancels identical numbers; sum equals XOR when no carry occurs (A & B == 0)",
    "timeComplexity": "O(N) or O(log N)",
    "targetQuestions": "Lonely Integer, Sum vs XOR, Sansa and XOR, Counter Game",
    "visualCue": "Binary bit-strip viewer showing cancellation lights"
  },
  {
    "id": "greedy-end-boundary-interval-reach",
    "corePattern": "Greedy End-Boundary Interval / Reach",
    "signal15Sec": "Interval scheduling, minimum leaps/jumps, partition string so letters don't cross boundaries",
    "commonTrap": "Backtracking / recursion or memoized DP trying all jump combinations",
    "mentalModel": "Record max reach or rightmost occurrence; once current horizon is reached, commit an interval cut",
    "timeComplexity": "O(N)",
    "targetQuestions": "Jump Game, Jump Game II, Partition Labels, Gas Station",
    "visualCue": "Horizontal timeline with leap arcs and boundary cut markers"
  },
  {
    "id": "opposite-end-two-pointers",
    "corePattern": "Opposite-End Two Pointers",
    "signal15Sec": "Sorted array, finding pairs/triplets summing to target, water trapping / container bounds",
    "commonTrap": "Nested two-loop search O(N^2)",
    "mentalModel": "Squeeze from outside inward; moving the smaller boundary is the ONLY direction that could improve outcome",
    "timeComplexity": "O(N log N) / O(N)",
    "targetQuestions": "Container With Most Water, 3Sum, Two Sum II",
    "visualCue": "Left & Right pincers clamping inward based on comparison operator"
  }
];

export const OA_CURATED_PROBLEMS: OACuratedProblem[] = [
  {
    "rank": 1,
    "title": "Array Manipulation",
    "platform": "HackerRank",
    "tier": "Arrays / Prefix",
    "pattern": "Difference Array / Prefix Sum",
    "trigger": "Range updates [l, r, +k] followed by point/global queries in O(n + q)",
    "trap": "Brute force loop O(n*q) TLEs. Must mark arr[l] += k, arr[r+1] -= k and prefix sum once at end",
    "difficulty": "HARD",
    "priority": "P0 - Crucial",
    "template": "diff[l]+=k, diff[r+1]-=k -> prefix_sum",
    "slug": "maximum-subarray",
    "isRepoProblem": true,
    "equivalentSlug": "maximum-subarray",
    "companies": [
      "Amazon",
      "Google",
      "HackerRank"
    ],
    "frequency": 98
  },
  {
    "rank": 2,
    "title": "Longest Substring Without Repeating",
    "platform": "LeetCode",
    "tier": "Sliding Window",
    "pattern": "Dynamic Variable Window",
    "trigger": "Contiguous substring/subarray under dynamic character uniqueness condition",
    "trap": "Don't shrink with while-loop by 1; jump left pointer to last_seen[char] + 1 directly",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "dict/map last_seen; L = max(L, last_seen[c]+1)",
    "slug": "longest-substring-without-repeating-characters",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "frequency": 98
  },
  {
    "rank": 3,
    "title": "Subarray Division 1",
    "platform": "HackerRank",
    "tier": "Sliding Window",
    "pattern": "Fixed-Size Window (K)",
    "trigger": "Contiguous sequence of exact length K with target sum/condition",
    "trap": "Do not recompute sum every window. Add incoming arr[r], subtract outgoing arr[r-k]",
    "difficulty": "EASY",
    "priority": "P0 - Crucial",
    "template": "w_sum += arr[i] - arr[i-k]",
    "slug": "minimum-size-subarray-sum",
    "isRepoProblem": true,
    "equivalentSlug": "minimum-size-subarray-sum",
    "companies": [
      "Amazon",
      "Goldman Sachs"
    ],
    "frequency": 98
  },
  {
    "rank": 4,
    "title": "Minimum Time Required",
    "platform": "HackerRank",
    "tier": "Binary Search",
    "pattern": "Binary Search on Answer / Monotonicity",
    "trigger": "Optimal allocation / min time / capacity where verify(X) is monotonic (T,T,T,F,F)",
    "trap": "It's NOT an array search; search space is range [min_time, max_time]. Check if sum(days//rate) >= goal",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "low=1, high=max*goal; while low<=high: mid; verify(mid)",
    "slug": "koko-eating-bananas",
    "isRepoProblem": true,
    "equivalentSlug": "koko-eating-bananas",
    "companies": [
      "Amazon",
      "Uber",
      "Google"
    ],
    "frequency": 98
  },
  {
    "rank": 5,
    "title": "Minimum Swaps 2",
    "platform": "HackerRank",
    "tier": "Arrays / Graphs",
    "pattern": "Cycle Decomposition in Permutation",
    "trigger": "Minimum swaps to sort consecutive integers 1 to N or distinct elements",
    "trap": "Treat index-to-value as directed graph. Swaps needed = sum(cycle_len - 1)",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "while arr[i] != i+1: swap(i, arr[i]-1)",
    "slug": "sort-colors",
    "isRepoProblem": true,
    "equivalentSlug": "sort-colors",
    "companies": [
      "Amazon",
      "Microsoft",
      "Adobe"
    ],
    "frequency": 98
  },
  {
    "rank": 6,
    "title": "Count Triplets",
    "platform": "HackerRank",
    "tier": "Hashing",
    "pattern": "Dynamic Frequency / Multi-State Map",
    "trigger": "Counting combinations satisfying a chain relation (e.g. geometric progression i < j < k)",
    "trap": "One map causes duplicate counts; use 2 maps: 'potential pairs waiting' and 'potential triplets waiting'",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "right_map[x*r] += 1; left_map tracks history",
    "slug": "group-anagrams",
    "isRepoProblem": true,
    "equivalentSlug": "group-anagrams",
    "companies": [
      "Amazon",
      "Goldman Sachs"
    ],
    "frequency": 98
  },
  {
    "rank": 7,
    "title": "Next Greater Element / Daily Temperatures",
    "platform": "LeetCode",
    "tier": "Stack & Queue",
    "pattern": "Monotonic Stack (Decreasing)",
    "trigger": "Find the next/previous greater or smaller element in O(n) without nested scan",
    "trap": "While stack and stack[-1] < curr: pop and resolve answer for the popped index",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "while stack and arr[stack[-1]] < x: res[pop()] = x",
    "slug": "daily-temperatures",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "frequency": 97
  },
  {
    "rank": 8,
    "title": "Koko Eating Bananas",
    "platform": "LeetCode",
    "tier": "Binary Search",
    "pattern": "Min Speed / Capacity Parameter",
    "trigger": "Minimize K such that total work ceil(pile/k) <= hours",
    "trap": "Search range is [1, max(piles)]. Monotonic predicate: feasible(k) is False...False, True...True",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "low=1, high=max(piles); if feasible(mid): high=mid-1",
    "slug": "koko-eating-bananas",
    "isRepoProblem": true,
    "companies": [
      "Google",
      "Airbnb",
      "Amazon"
    ],
    "frequency": 97
  },
  {
    "rank": 9,
    "title": "Sherlock and the Valid String",
    "platform": "HackerRank",
    "tier": "Strings / Hashing",
    "pattern": "Frequency of Frequency Map",
    "trigger": "Strings where removing at most 1 character normalizes frequencies",
    "trap": "Mapping char->freq is not enough; must map freq->count of freq and check delta conditions",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "freq_count = Counter(Counter(s).values())",
    "slug": "permutation-in-string",
    "isRepoProblem": true,
    "equivalentSlug": "permutation-in-string",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "frequency": 97
  },
  {
    "rank": 10,
    "title": "Container With Most Water",
    "platform": "LeetCode",
    "tier": "Two Pointers",
    "pattern": "Opposite-End Inward Squeeze",
    "trigger": "Find pair (i, j) maximizing (j-i)*min(h[i], h[j]); moving inner pointer can only improve if height > current",
    "trap": "Always advance the shorter wall; moving the taller wall can never yield greater area",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "while L < R: if h[L] < h[R]: L+=1 else: R-=1",
    "slug": "container-with-most-water",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Apple",
      "Google"
    ],
    "frequency": 97
  },
  {
    "rank": 11,
    "title": "3Sum",
    "platform": "LeetCode",
    "tier": "Two Pointers",
    "pattern": "Sort + Two Pointers with Deduplication",
    "trigger": "Triplet sum to 0 / target with strict uniqueness constraint (no duplicate triplets)",
    "trap": "Sort first; fix i, then two-pointer (L, R). Must skip identical consecutive elements for i, L, R",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "sort(); for i in range: while L<R and duplicates: skip",
    "slug": "3sum",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Facebook",
      "Microsoft"
    ],
    "frequency": 97
  },
  {
    "rank": 12,
    "title": "New Year Chaos",
    "platform": "HackerRank",
    "tier": "Arrays",
    "pattern": "Bounded Inversion Counting",
    "trigger": "Queue swaps where each person can move at most 2 spots forward",
    "trap": "Full inversion counting is O(n log n), but here anyone ahead of person P could only jump from max(0, P-2)",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "check arr[i]-(i+1) > 2 -> 'Too chaotic'; loop from max(0, P-2)",
    "slug": "sort-colors",
    "isRepoProblem": true,
    "equivalentSlug": "sort-colors",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 97
  },
  {
    "rank": 13,
    "title": "Largest Rectangle in Histogram",
    "platform": "LeetCode",
    "tier": "Stack & Queue",
    "pattern": "Monotonic Stack Area Boundaries",
    "trigger": "Maximum rectangular area under irregular bar charts",
    "trap": "Find left and right boundaries where bar is the bottleneck height using monotonic stack",
    "difficulty": "HARD",
    "priority": "P0 - Crucial",
    "template": "stack of indices; h = arr[pop()], w = i - stack[-1] - 1",
    "slug": "largest-rectangle-in-histogram",
    "isRepoProblem": true,
    "companies": [
      "Google",
      "Amazon",
      "Microsoft"
    ],
    "frequency": 96
  },
  {
    "rank": 14,
    "title": "Sum vs XOR",
    "platform": "HackerRank",
    "tier": "Bit Manipulation",
    "pattern": "Zero-Bit Counting (n + x = n ^ x)",
    "trigger": "Find count of x <= n where n + x == n ^ x",
    "trap": "Addition equals XOR iff there is NO carry bit (n & x == 0). Result is 2^(number of unset bits in n)",
    "difficulty": "EASY",
    "priority": "P0 - Crucial",
    "template": "return 1 << bin(n)[2:].count('0') if n > 0 else 1",
    "slug": "single-number",
    "isRepoProblem": true,
    "equivalentSlug": "single-number",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 96
  },
  {
    "rank": 15,
    "title": "Climbing the Leaderboard",
    "platform": "HackerRank",
    "tier": "Searching",
    "pattern": "Dense Ranking + Two-Pointer / Binary Search",
    "trigger": "Incremental rank evaluation of new scores against an existing large leaderboard",
    "trap": "Re-evaluating from rank 1 each time is O(m*n). Scores are sorted, so traverse leaderboard backwards!",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "unique_scores = sorted(set(scores)); two-pointer backwards",
    "slug": "binary-search",
    "isRepoProblem": true,
    "equivalentSlug": "binary-search",
    "companies": [
      "Amazon",
      "Google"
    ],
    "frequency": 96
  },
  {
    "rank": 16,
    "title": "Special String Again",
    "platform": "HackerRank",
    "tier": "Strings",
    "pattern": "Run-Length Encoding / Point Pivot",
    "trigger": "Count substrings with all identical characters except possibly middle one",
    "trap": "Compress string to tuples [(char, count)]. Case 1: n*(n+1)//2. Case 2: middle char count == 1 and neighbours match",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "RLE compression: [(c1, cnt1), (c2, cnt2)...]",
    "slug": "longest-repeating-character-replacement",
    "isRepoProblem": true,
    "equivalentSlug": "longest-repeating-character-replacement",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 96
  },
  {
    "rank": 17,
    "title": "Minimum Size Subarray Sum",
    "platform": "LeetCode",
    "tier": "Sliding Window",
    "pattern": "Dynamic Expanding/Contracting Window",
    "trigger": "Find minimal length subarray with sum >= target with positive numbers",
    "trap": "Expand right pointer until sum >= S, then shrink left pointer aggressively to minimize window size",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "while s >= target: min_len = min(min_len, r-l+1); s -= arr[l]; l+=1",
    "slug": "minimum-size-subarray-sum",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Goldman Sachs"
    ],
    "frequency": 96
  },
  {
    "rank": 18,
    "title": "Search in Rotated Sorted Array",
    "platform": "LeetCode",
    "tier": "Binary Search",
    "pattern": "Modified Binary Search / Halving Invariant",
    "trigger": "Sorted array rotated at unknown pivot; search target in O(log n)",
    "trap": "At least one half is ALWAYS strictly sorted. Determine which half is sorted, then check if target lies inside it",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "if arr[low] <= arr[mid]: check left half, else check right half",
    "slug": "search-in-rotated-sorted-array",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Microsoft",
      "Google"
    ],
    "frequency": 96
  },
  {
    "rank": 19,
    "title": "Frequency Queries",
    "platform": "HackerRank",
    "tier": "Hashing",
    "pattern": "Bi-directional Hash Tracking",
    "trigger": "Data stream queries: insert x, delete x, check if any value has exact frequency F in O(1)",
    "trap": "A single count map requires O(n) scan to verify frequency F. Maintain freq_map AND count_of_freq map",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "val_to_freq[x], freq_to_count[f] updated simultaneously",
    "slug": "top-k-frequent-elements",
    "isRepoProblem": true,
    "equivalentSlug": "top-k-frequent-elements",
    "companies": [
      "Amazon",
      "Goldman Sachs"
    ],
    "frequency": 96
  },
  {
    "rank": 20,
    "title": "Sherlock and Anagrams",
    "platform": "HackerRank",
    "tier": "Hashing",
    "pattern": "Canonical Signature Hashing",
    "trigger": "Count pairs of substrings that are anagrams of each other",
    "trap": "Sort characters of each substring to form canonical key; count freq; add C(freq, 2) to answer",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "key = ''.join(sorted(sub)); map[key] += 1; sum(v*(v-1)//2)",
    "slug": "group-anagrams",
    "isRepoProblem": true,
    "equivalentSlug": "group-anagrams",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 95
  },
  {
    "rank": 21,
    "title": "Queue using Two Stacks",
    "platform": "HackerRank",
    "tier": "Stack & Queue",
    "pattern": "Amortized O(1) Push/Pop Transfer",
    "trigger": "Implement FIFO Queue behavior using only LIFO Stacks",
    "trap": "Transfer stack_in to stack_out ONLY when stack_out is empty. Each element moved at most twice -> O(1) amortized",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "push to in_stack; pop from out_stack (fill from in_stack if empty)",
    "slug": "implement-queue-using-stacks",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "frequency": 95
  },
  {
    "rank": 22,
    "title": "Common Child",
    "platform": "HackerRank",
    "tier": "Strings / DP",
    "pattern": "Longest Common Subsequence (LCS)",
    "trigger": "Longest string derived from both strings by deleting 0 or more characters",
    "trap": "2D DP grid: if s1[i]==s2[j] then 1+dp[i-1][j-1], else max(dp[i-1][j], dp[i][j-1]). Space optimize to 1D row",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "dp[j] = prev_diag + 1 if match else max(dp[j], dp[j-1])",
    "slug": "longest-increasing-subsequence",
    "isRepoProblem": true,
    "equivalentSlug": "longest-increasing-subsequence",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 95
  },
  {
    "rank": 23,
    "title": "Sherlock and Array",
    "platform": "HackerRank",
    "tier": "Arrays / Prefix",
    "pattern": "Equilibrium Index via Total Sum",
    "trigger": "Find element where sum of elements to left equals sum of elements to right",
    "trap": "No need for 2 arrays. left_sum = 0, right_sum = total - arr[0]; advance i while updating",
    "difficulty": "EASY",
    "priority": "P0 - Crucial",
    "template": "right = total - x - left; if left == right: return YES; left += x",
    "slug": "maximum-subarray",
    "isRepoProblem": true,
    "equivalentSlug": "maximum-subarray",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 95
  },
  {
    "rank": 24,
    "title": "Fraudulent Activity Notifications",
    "platform": "HackerRank",
    "tier": "Sorting / Window",
    "pattern": "Sliding Median via Counting Sort Array",
    "trigger": "Detect expenditure >= 2 * median of rolling window of size D",
    "trap": "Sorting each window is O(n*d log d) -> TLE! Since values <= 200, use counting sort array of size 201 in O(200)",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "count_arr[201]; add arr[i], remove arr[i-d]; get_median(count_arr)",
    "slug": "sliding-window-maximum",
    "isRepoProblem": true,
    "equivalentSlug": "sliding-window-maximum",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 95
  },
  {
    "rank": 25,
    "title": "Lonely Integer & Flipping Bits",
    "platform": "HackerRank",
    "tier": "Bit Manipulation",
    "pattern": "XOR Cancellation & Fixed-Width Masking",
    "trigger": "Find single non-duplicate; flip 32-bit unsigned integer",
    "trap": "x ^ x = 0 and x ^ 0 = x; unsigned 32-bit flip is ~n & 0xFFFFFFFF (prevent language sign overflow)",
    "difficulty": "EASY",
    "priority": "P0 - Crucial",
    "template": "res ^= x; (~n) & 0xFFFFFFFF",
    "slug": "single-number",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Bloomberg"
    ],
    "frequency": 95
  },
  {
    "rank": 26,
    "title": "Generate Parentheses",
    "platform": "LeetCode",
    "tier": "Recursion / Backtrack",
    "pattern": "Constrained State Tree Pruning",
    "trigger": "Generate all well-formed combinations of N pairs of parentheses",
    "trap": "Branch open if open < N; branch close if close < open. Guarantees 0 invalid paths generated",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "backtrack(open, close): if open<N: '('; if close<open: ')'",
    "slug": "generate-parentheses",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Uber",
      "Microsoft"
    ],
    "frequency": 94
  },
  {
    "rank": 27,
    "title": "Merge Sort: Counting Inversions",
    "platform": "HackerRank",
    "tier": "Sorting",
    "pattern": "Divide & Conquer Inversion Accumulation",
    "trigger": "Count pairs (i, j) such that i < j and arr[i] > arr[j]",
    "trap": "During merge step: when right element arr[j] is smaller than arr[i], it is smaller than all remaining in left half",
    "difficulty": "HARD",
    "priority": "P0 - Crucial",
    "template": "inv_count += (mid - i + 1) during merge when arr[j] < arr[i]",
    "slug": "sort-colors",
    "isRepoProblem": true,
    "equivalentSlug": "sort-colors",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "frequency": 94
  },
  {
    "rank": 28,
    "title": "Max Min",
    "platform": "HackerRank",
    "tier": "Greedy / Array",
    "pattern": "Sorting + Sliding Minimum Span",
    "trigger": "Select subset of K elements minimizing max(subset) - min(subset)",
    "trap": "Subset elements must be contiguous in sorted array! Sort array and check arr[i+k-1] - arr[i] for all i",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "sort(); min(arr[i+k-1] - arr[i] for i in range(n-k+1))",
    "slug": "sliding-window-maximum",
    "isRepoProblem": true,
    "equivalentSlug": "sliding-window-maximum",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 94
  },
  {
    "rank": 29,
    "title": "The Maximum Subarray",
    "platform": "HackerRank",
    "tier": "Arrays / Greedy",
    "pattern": "Kadane's Algorithm vs Subsequence Accumulation",
    "trigger": "Find max contiguous subarray sum AND max non-contiguous subsequence sum",
    "trap": "Kadane: max_current = max(x, max_current + x). Subsequence: sum all positives (or max element if all negative)",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "curr = max(x, curr+x); best = max(best, curr)",
    "slug": "maximum-subarray",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "frequency": 94
  },
  {
    "rank": 30,
    "title": "Pairs",
    "platform": "HackerRank",
    "tier": "Searching / Two Pointer",
    "pattern": "Sorted Pointer Gap vs Hash Difference Lookup",
    "trigger": "Count pairs with difference equal to target K",
    "trap": "Two pointer on sorted array (if diff < k: R++, if diff > k: L++) or single pass hash set lookup (x - k in set)",
    "difficulty": "MEDIUM",
    "priority": "P0 - Crucial",
    "template": "set_lookup: if x + k in num_set: count += 1",
    "slug": "two-sum-ii-input-array-is-sorted",
    "isRepoProblem": true,
    "equivalentSlug": "two-sum-ii-input-array-is-sorted",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 94
  },
  {
    "rank": 31,
    "title": "Castle on the Grid",
    "platform": "HackerRank",
    "tier": "BFS / Grid",
    "pattern": "Multi-Step Ray Marching BFS",
    "trigger": "Shortest turns for a rook moving along straight rows/cols in grid",
    "trap": "Normal BFS moves 1 cell; here one move continues in direction until hitting obstacle or border",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "for dx, dy in dirs: while valid(nx, ny): mark visited, nx+=dx",
    "slug": "rotting-oranges",
    "isRepoProblem": true,
    "equivalentSlug": "rotting-oranges",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 94
  },
  {
    "rank": 32,
    "title": "Simple Text Editor",
    "platform": "HackerRank",
    "tier": "Stack & Queue",
    "pattern": "Undo Stack with Command Snapshots",
    "trigger": "Perform append, delete, print, undo operations efficiently",
    "trap": "Stack stores prior state or inverse operations (e.g. deleted string) to rollback in O(1)",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "history_stack.append(current_str); pop() on undo",
    "slug": "evaluate-reverse-polish-notation",
    "isRepoProblem": true,
    "equivalentSlug": "evaluate-reverse-polish-notation",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 93
  },
  {
    "rank": 33,
    "title": "Sansa and XOR",
    "platform": "HackerRank",
    "tier": "Bit Manipulation",
    "pattern": "Subarray Frequency Parity",
    "trigger": "XOR sum of all contiguous subarrays",
    "trap": "Element at index i appears (i+1)*(n-i) times across all subarrays. If count is even, it cancels out to 0!",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "if (i+1)*(n-i) % 2 == 1: res ^= arr[i]",
    "slug": "single-number",
    "isRepoProblem": true,
    "equivalentSlug": "single-number",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 93
  },
  {
    "rank": 34,
    "title": "Subsets & Permutations",
    "platform": "LeetCode",
    "tier": "Recursion / Backtrack",
    "pattern": "Take / Skip vs Used-Set Branching",
    "trigger": "Generate powerset (2^n) and permutations (n!)",
    "trap": "Subsets: decision to include/exclude at index. Permutations: iterate over remaining unused candidates",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "dfs(start, path) for combinations; used[i] for permutations",
    "slug": "subsets",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Google",
      "Uber"
    ],
    "frequency": 93
  },
  {
    "rank": 35,
    "title": "Reverse a Linked List & Detect Cycle",
    "platform": "HackerRank",
    "tier": "Linked List",
    "pattern": "Pointer Inversion & Floyd's Tortoise-Hare",
    "trigger": "In-place node reversal; detect infinite loop in singly linked list",
    "trap": "Reversal: prev=None, curr=head, next=curr.next. Cycle: slow moves 1 step, fast moves 2 steps; check collision",
    "difficulty": "EASY",
    "priority": "P1 - High Yield",
    "template": "while fast and fast.next: slow=slow.next; fast=fast.next.next",
    "slug": "reverse-linked-list",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Microsoft",
      "Apple"
    ],
    "frequency": 93
  },
  {
    "rank": 36,
    "title": "Find All Anagrams in a String",
    "platform": "LeetCode",
    "tier": "Sliding Window",
    "pattern": "Fixed Window Character Frequency Equality",
    "trigger": "Find all start indices of p's anagrams in s",
    "trap": "Sliding window of length len(p). Maintain character count delta or two 26-length frequency arrays",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "s_cnt[ord(c)-97]+=1; if s_cnt == p_cnt: res.append(i-k+1)",
    "slug": "permutation-in-string",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "frequency": 93
  },
  {
    "rank": 37,
    "title": "Longest Repeating Character Replacement",
    "platform": "LeetCode",
    "tier": "Sliding Window",
    "pattern": "Window Invariant (Window Length - Max Frequency <= K)",
    "trigger": "Longest substring of same letter by replacing at most k characters",
    "trap": "Valid condition is (right - left + 1) - max_freq <= k. Do not need to decrement max_freq when shrinking!",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "max_f = max(max_f, cnt[c]); if (r-l+1) - max_f > k: cnt[l]-=1; l+=1",
    "slug": "longest-repeating-character-replacement",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Google"
    ],
    "frequency": 93
  },
  {
    "rank": 38,
    "title": "Fruit Into Baskets",
    "platform": "LeetCode",
    "tier": "Sliding Window",
    "pattern": "At Most K Distinct Keys Window",
    "trigger": "Longest subarray containing at most 2 distinct integer values",
    "trap": "Hash map tracks frequency of fruits in window. When len(map) > 2, shrink left until one fruit count hits 0",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "while len(count_map) > 2: map[arr[l]]-=1; if 0: del; l+=1",
    "slug": "longest-substring-without-repeating-characters",
    "isRepoProblem": true,
    "equivalentSlug": "longest-substring-without-repeating-characters",
    "companies": [
      "Google",
      "Amazon"
    ],
    "frequency": 93
  },
  {
    "rank": 39,
    "title": "First and Last Position of Element",
    "platform": "LeetCode",
    "tier": "Binary Search",
    "pattern": "Boundary Clamping Binary Search",
    "trigger": "Find starting and ending index of target in sorted array in O(log n)",
    "trap": "When arr[mid] == target, do not stop! For left boundary: high = mid - 1. For right boundary: low = mid + 1",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "find_bound(is_left): if match: ans=mid; clamp left or right",
    "slug": "binary-search",
    "isRepoProblem": true,
    "equivalentSlug": "binary-search",
    "companies": [
      "Amazon",
      "LinkedIn"
    ],
    "frequency": 92
  },
  {
    "rank": 40,
    "title": "Capacity to Ship Packages Within D Days",
    "platform": "LeetCode",
    "tier": "Binary Search",
    "pattern": "Greedy Feasibility Check on Capacity Range",
    "trigger": "Find least ship weight capacity to ship all packages within D days in given order",
    "trap": "Range: low = max(weights), high = sum(weights). Check if day_count <= D using greedy accumulator",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "low=max(w), high=sum(w); greedy_days(capacity) <= D",
    "slug": "capacity-to-ship-packages-within-d-days",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Google"
    ],
    "frequency": 92
  },
  {
    "rank": 41,
    "title": "Counter Game",
    "platform": "HackerRank",
    "tier": "Bit Manipulation",
    "pattern": "Powers of 2 and Bit Shifts",
    "trigger": "Subtract largest power of 2 <= n or divide by 2 if power of 2",
    "trap": "Count number of set bits and trailing zeros. Total moves = (set_bits - 1) + trailing_zeros",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "moves = bin(n - 1).count('1'); return Richard/Louise",
    "slug": "number-of-1-bits",
    "isRepoProblem": true,
    "equivalentSlug": "number-of-1-bits",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 92
  },
  {
    "rank": 42,
    "title": "Between Two Sets",
    "platform": "HackerRank",
    "tier": "Math",
    "pattern": "LCM of First Array, GCD of Second Array",
    "trigger": "Count numbers that are multiples of all array A and factors of all array B",
    "trap": "Compute L = LCM(A) and G = GCD(B). Candidate values must be multiples of L that evenly divide G",
    "difficulty": "EASY",
    "priority": "P1 - High Yield",
    "template": "L = reduce(lcm, A); G = reduce(gcd, B); count x in range(L, G+1, L)",
    "slug": "counting-bits",
    "isRepoProblem": true,
    "equivalentSlug": "counting-bits",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 92
  },
  {
    "rank": 43,
    "title": "Dynamic Array",
    "platform": "HackerRank",
    "tier": "Arrays",
    "pattern": "Bitwise Indexing Query System",
    "trigger": "Simulate 2D dynamic sequences with XOR-dependent index calculation",
    "trap": "idx = (x ^ lastAnswer) % n; manages custom index routing and query record buffering",
    "difficulty": "EASY",
    "priority": "P1 - High Yield",
    "template": "arr[(x ^ last_ans) % n].append(y)",
    "slug": "product-of-array-except-self",
    "isRepoProblem": true,
    "equivalentSlug": "product-of-array-except-self",
    "companies": [
      "HackerRank",
      "Amazon"
    ],
    "frequency": 92
  },
  {
    "rank": 44,
    "title": "2D Array - DS (Hourglass)",
    "platform": "HackerRank",
    "tier": "Arrays",
    "pattern": "Kernel Convolution / Fixed Stencil",
    "trigger": "Find max hourglass sum in fixed 6x6 matrix",
    "trap": "Direct offset traversal: sum(row[c:c+3]) + mid + sum(row+2[c:c+3]). Beware negative sums initial max = -infinity",
    "difficulty": "EASY",
    "priority": "P1 - High Yield",
    "template": "max_val = -float('inf'); loop i, j from 0 to 3",
    "slug": "rotate-image",
    "isRepoProblem": true,
    "equivalentSlug": "rotate-image",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 92
  },
  {
    "rank": 45,
    "title": "Arrays: Left Rotation",
    "platform": "HackerRank",
    "tier": "Arrays",
    "pattern": "Index Remapping vs Reversal Algorithm",
    "trigger": "Rotate array left by d positions in O(n) time and O(1) space",
    "trap": "arr[(i + d) % n] or Three-step reversal: reverse(0, d-1), reverse(d, n-1), reverse(0, n-1)",
    "difficulty": "EASY",
    "priority": "P1 - High Yield",
    "template": "return arr[d:] + arr[:d]  or reverse in-place",
    "slug": "rotate-image",
    "isRepoProblem": true,
    "equivalentSlug": "rotate-image",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 91
  },
  {
    "rank": 46,
    "title": "Equal Stacks",
    "platform": "HackerRank",
    "tier": "Stack & Queue",
    "pattern": "Greedy Sum Equalization via Popping Highest",
    "trigger": "Find max possible equal height of 3 stacks by popping top cylinders",
    "trap": "Track heights h1, h2, h3. At each step, pop from whichever stack has strictly greater height",
    "difficulty": "EASY",
    "priority": "P1 - High Yield",
    "template": "while not (h1 == h2 == h3): pop from tallest stack",
    "slug": "min-stack",
    "isRepoProblem": true,
    "equivalentSlug": "min-stack",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 91
  },
  {
    "rank": 47,
    "title": "Waiter",
    "platform": "HackerRank",
    "tier": "Stack & Queue",
    "pattern": "Prime Sieve Driven Plate Stacking",
    "trigger": "Divisibility-based pile redistribution using consecutive primes",
    "trap": "Precompute first Q primes using Sieve of Eratosthenes. Maintain stack A and answer plate collector B",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "for p in primes: pop stack; if val % p == 0: push B else push next_A",
    "slug": "evaluate-reverse-polish-notation",
    "isRepoProblem": true,
    "equivalentSlug": "evaluate-reverse-polish-notation",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 91
  },
  {
    "rank": 48,
    "title": "Jump Game & Jump Game II",
    "platform": "LeetCode",
    "tier": "Greedy / Array",
    "pattern": "Farthest Reachable Index Horizon",
    "trigger": "Determine reachability and minimum jumps to target index",
    "trap": "Jump 1: max_reach = max(max_reach, i + nums[i]); if i > max_reach: return False. Jump 2: BFS level leap",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "curr_end = max_reach; jumps++ when i reaches curr_end",
    "slug": "jump-game",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "frequency": 91
  },
  {
    "rank": 49,
    "title": "Gas Station",
    "platform": "LeetCode",
    "tier": "Greedy / Array",
    "pattern": "Net Deficit Accumulation & Reset",
    "trigger": "Find starting gas station index to complete circular tour",
    "trap": "If total gas < total cost, impossible (-1). Otherwise, whenever tank drops < 0, start MUST be at next index!",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "tank += gas[i]-cost[i]; if tank < 0: start = i+1; tank = 0",
    "slug": "gas-station",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Google"
    ],
    "frequency": 91
  },
  {
    "rank": 50,
    "title": "Partition Labels",
    "platform": "LeetCode",
    "tier": "Two Pointers / Greedy",
    "pattern": "Rightmost Occurrence Interval Merging",
    "trigger": "Partition string so each letter appears in at most one part",
    "trap": "Record last occurrence index of each character. Iterate and extend end = max(end, last[char]). If i == end: cut",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "last = {c: i for i, c in enumerate(s)}; end = max(end, last[c])",
    "slug": "jump-game-ii",
    "isRepoProblem": true,
    "equivalentSlug": "jump-game-ii",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "frequency": 91
  },
  {
    "rank": 51,
    "title": "Ice Cream Parlor",
    "platform": "HackerRank",
    "tier": "Searching / Hash",
    "pattern": "Two-Sum Complements with 1-based Indexing",
    "trigger": "Find two distinct flavors summing to total money M",
    "trap": "Hash map stores seen prices -> indices. Check complement (M - price) in map in O(n) single pass",
    "difficulty": "EASY",
    "priority": "P1 - High Yield",
    "template": "if target - x in seen: return (seen[target-x]+1, i+1)",
    "slug": "two-sum-ii-input-array-is-sorted",
    "isRepoProblem": true,
    "equivalentSlug": "two-sum-ii-input-array-is-sorted",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 90
  },
  {
    "rank": 52,
    "title": "Ransom Note & Two Strings",
    "platform": "HackerRank",
    "tier": "Hashing",
    "pattern": "Character Frequency Subset & Alphabet Intersect",
    "trigger": "Check if note can be formed from magazine words / shared substring",
    "trap": "Ransom Note: Counter(note) - Counter(magazine) is empty. Two Strings: set(s1) & set(s2) is not empty",
    "difficulty": "EASY",
    "priority": "P1 - High Yield",
    "template": "return not (Counter(note) - Counter(mag))",
    "slug": "group-anagrams",
    "isRepoProblem": true,
    "equivalentSlug": "group-anagrams",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 90
  },
  {
    "rank": 53,
    "title": "Mark and Toys",
    "platform": "HackerRank",
    "tier": "Sorting / Greedy",
    "pattern": "Greedy Knapsack with Uniform Weights",
    "trigger": "Max number of toys buyable with budget K",
    "trap": "Sort prices ascending; greedily pick cheapest items until accumulated cost exceeds budget",
    "difficulty": "EASY",
    "priority": "P1 - High Yield",
    "template": "sort(); for p in prices: if budget >= p: budget -= p; count += 1",
    "slug": "destroying-asteroids",
    "isRepoProblem": true,
    "equivalentSlug": "destroying-asteroids",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 90
  },
  {
    "rank": 54,
    "title": "Grid Challenge",
    "platform": "HackerRank",
    "tier": "Sorting",
    "pattern": "Row Sort with Column Non-Decreasing Verification",
    "trigger": "Rearrange each row alphabetically; verify columns are ordered",
    "trap": "Sort each string in grid. Then verify every col satisfies grid[row][col] <= grid[row+1][col]",
    "difficulty": "EASY",
    "priority": "P1 - High Yield",
    "template": "grid = [sorted(row) for row in grid]; check column order",
    "slug": "sort-colors",
    "isRepoProblem": true,
    "equivalentSlug": "sort-colors",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 90
  },
  {
    "rank": 55,
    "title": "Permuting Two Arrays",
    "platform": "HackerRank",
    "tier": "Sorting / Greedy",
    "pattern": "Opposite-Order Dual Sorting",
    "trigger": "Verify if permutation of A and B satisfies A[i] + B[i] >= K for all i",
    "trap": "Sort A ascending and B descending; pairing min of A with max of B maximizes balance",
    "difficulty": "EASY",
    "priority": "P1 - High Yield",
    "template": "A.sort(); B.sort(reverse=True); all(a+b >= k for a,b in zip(A,B))",
    "slug": "two-sum",
    "isRepoProblem": true,
    "equivalentSlug": "two-sum",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 90
  },
  {
    "rank": 56,
    "title": "Time Conversion & Camel Case 4",
    "platform": "HackerRank",
    "tier": "Strings",
    "pattern": "String Parsing & Token Segmentation",
    "trigger": "12h to 24h conversion; CamelCase method/variable/class parsing",
    "trap": "String indexing, splitting, zero padding, and formatted token reconstruction",
    "difficulty": "EASY",
    "priority": "P1 - High Yield",
    "template": "split, conditional hours formatting, re.sub / join tokens",
    "slug": "valid-anagram",
    "isRepoProblem": true,
    "equivalentSlug": "valid-anagram",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 90
  },
  {
    "rank": 57,
    "title": "Alternating Characters",
    "platform": "HackerRank",
    "tier": "Strings",
    "pattern": "Adjacent Deletion Count",
    "trigger": "Min deletions so no two adjacent characters are equal",
    "trap": "Single pass count where s[i] == s[i-1]",
    "difficulty": "EASY",
    "priority": "P1 - High Yield",
    "template": "sum(1 for i in range(1, len(s)) if s[i] == s[i-1])",
    "slug": "evaluate-reverse-polish-notation",
    "isRepoProblem": true,
    "equivalentSlug": "evaluate-reverse-polish-notation",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 90
  },
  {
    "rank": 58,
    "title": "Two Characters",
    "platform": "HackerRank",
    "tier": "Strings",
    "pattern": "Pairwise Alphabet Elimination & Validation",
    "trigger": "Find longest valid alternating string of 2 distinct characters",
    "trap": "Iterate over all pairs of characters (max 26*25/2 = 325 combos); filter string and check alternation",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "itertools.combinations(distinct_chars, 2) -> validate",
    "slug": "longest-substring-without-repeating-characters",
    "isRepoProblem": true,
    "equivalentSlug": "longest-substring-without-repeating-characters",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 89
  },
  {
    "rank": 59,
    "title": "HackerRank in a String!",
    "platform": "HackerRank",
    "tier": "Strings / Two Pointer",
    "pattern": "Greedy Subsequence Pointer Matching",
    "trigger": "Determine if target sequence exists as a subsequence",
    "trap": "Iterate text with single pointer against pattern index. Increment pattern pointer on character match",
    "difficulty": "EASY",
    "priority": "P1 - High Yield",
    "template": "p_ptr = 0; for c in s: if c == pat[p_ptr]: p_ptr+=1",
    "slug": "permutation-in-string",
    "isRepoProblem": true,
    "equivalentSlug": "permutation-in-string",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 89
  },
  {
    "rank": 60,
    "title": "Recursive Digit Sum",
    "platform": "HackerRank",
    "tier": "Math / Recursion",
    "pattern": "Digital Root via Modulo 9",
    "trigger": "Super digit of number created by repeating string n, k times",
    "trap": "Formula: digit sum of number is congruent to number mod 9. super_digit = (sum(digits) * k - 1) % 9 + 1",
    "difficulty": "MEDIUM",
    "priority": "P1 - High Yield",
    "template": "s = sum(int(d) for d in n) * k; return (s-1)%9 + 1 if s else 0",
    "slug": "counting-bits",
    "isRepoProblem": true,
    "equivalentSlug": "counting-bits",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 89
  },
  {
    "rank": 61,
    "title": "Queries with Fixed Length",
    "platform": "HackerRank",
    "tier": "Sliding Window / Deque",
    "pattern": "Sliding Window Minimum of Maximums",
    "trigger": "Find min of all maxes in windows of size d",
    "trap": "Monotonic decreasing deque to maintain rolling maximum in O(n); take min across all valid windows",
    "difficulty": "HARD",
    "priority": "P2 - Twist",
    "template": "collections.deque; keep elements in descending order",
    "slug": "sliding-window-maximum",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Google"
    ],
    "frequency": 89
  },
  {
    "rank": 62,
    "title": "The Great XOR & Maximizing XOR",
    "platform": "HackerRank",
    "tier": "Bit Manipulation",
    "pattern": "Highest Significant Bit Reasoning",
    "trigger": "Count a < x such that x ^ a > x",
    "trap": "For each 0 bit at position i in x, all combinations with 1 at position i yield a larger XOR -> 2^(pos)",
    "difficulty": "EASY",
    "priority": "P2 - Twist",
    "template": "find MSB; 2**(msb+1) - 1 - x",
    "slug": "counting-bits",
    "isRepoProblem": true,
    "equivalentSlug": "counting-bits",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 89
  },
  {
    "rank": 63,
    "title": "AND Product",
    "platform": "HackerRank",
    "tier": "Bit Manipulation",
    "pattern": "Common Bit Prefix Range",
    "trigger": "Bitwise AND of all integers between A and B inclusive",
    "trap": "Find common prefix bits of A and B; all lower bits will flip at least once to 0 in the range",
    "difficulty": "MEDIUM",
    "priority": "P2 - Twist",
    "template": "while A < B: B &= (B - 1) / shift until A == B",
    "slug": "number-of-1-bits",
    "isRepoProblem": true,
    "equivalentSlug": "number-of-1-bits",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 89
  },
  {
    "rank": 64,
    "title": "Sherlock and Squares",
    "platform": "HackerRank",
    "tier": "Math",
    "pattern": "Square Root Boundary Interval",
    "trigger": "Count square integers in range [A, B]",
    "trap": "Direct formula: floor(sqrt(B)) - ceil(sqrt(A)) + 1 in O(1) time without looping",
    "difficulty": "EASY",
    "priority": "P2 - Twist",
    "template": "floor(math.isqrt(b)) - ceil(math.sqrt(a)) + 1",
    "slug": "binary-search",
    "isRepoProblem": true,
    "equivalentSlug": "binary-search",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 88
  },
  {
    "rank": 65,
    "title": "Leonardo's Prime Factors",
    "platform": "HackerRank",
    "tier": "Math",
    "pattern": "Cumulative Prime Multiples",
    "trigger": "Max distinct prime factors for any number <= N",
    "trap": "Multiply smallest consecutive primes (2, 3, 5, 7, 11...) until product exceeds N. Count is number of primes",
    "difficulty": "EASY",
    "priority": "P2 - Twist",
    "template": "prod = 1; count = 0; for p in primes: prod*=p; if prod>n: break",
    "slug": "single-number",
    "isRepoProblem": true,
    "equivalentSlug": "single-number",
    "companies": [
      "Amazon",
      "HackerRank"
    ],
    "frequency": 88
  },
  {
    "rank": 66,
    "title": "Find Peak Element",
    "platform": "LeetCode",
    "tier": "Binary Search",
    "pattern": "Gradient Ascending Search",
    "trigger": "Find local peak element where num[i] > num[i+1] in O(log n)",
    "trap": "If arr[mid] < arr[mid+1], a peak MUST exist in the right half (slope is rising). Otherwise, search left",
    "difficulty": "MEDIUM",
    "priority": "P2 - Twist",
    "template": "if arr[mid] < arr[mid+1]: low = mid+1 else: high = mid",
    "slug": "binary-search",
    "isRepoProblem": true,
    "equivalentSlug": "binary-search",
    "companies": [
      "Amazon",
      "Google"
    ],
    "frequency": 88
  },
  {
    "rank": 67,
    "title": "Remove K Digits",
    "platform": "LeetCode",
    "tier": "Stack & Queue",
    "pattern": "Monotonic Stack Greedy Pruning",
    "trigger": "Remove K digits to form smallest possible integer",
    "trap": "While k > 0 and stack and stack[-1] > digit: pop and k -= 1. Strip leading zeros",
    "difficulty": "MEDIUM",
    "priority": "P2 - Twist",
    "template": "while k and stack and stack[-1] > d: stack.pop(); k-=1",
    "slug": "daily-temperatures",
    "isRepoProblem": true,
    "equivalentSlug": "daily-temperatures",
    "companies": [
      "Amazon",
      "Google"
    ],
    "frequency": 88
  },
  {
    "rank": 68,
    "title": "Sort Colors (Dutch National Flag)",
    "platform": "LeetCode",
    "tier": "Two Pointers",
    "pattern": "3-Way Partitioning (0, 1, 2)",
    "trigger": "Sort array of 0s, 1s, and 2s in-place in a single pass",
    "trap": "Three pointers (low, mid, high). If 0: swap(mid, low), low++, mid++. If 1: mid++. If 2: swap(mid, high), high--",
    "difficulty": "MEDIUM",
    "priority": "P2 - Twist",
    "template": "while mid <= high: partition around 1",
    "slug": "sort-colors",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "frequency": 88
  },
  {
    "rank": 69,
    "title": "Asteroid Collision",
    "platform": "LeetCode",
    "tier": "Stack & Queue",
    "pattern": "Opposing Sign Collision Stack",
    "trigger": "Simulate moving asteroids colliding (positive goes right, negative goes left)",
    "trap": "Only right-moving (+) followed by left-moving (-) can collide. Compare absolute weights on stack",
    "difficulty": "MEDIUM",
    "priority": "P2 - Twist",
    "template": "while stack and x < 0 < stack[-1]: resolve explode/break",
    "slug": "destroying-asteroids",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Google"
    ],
    "frequency": 88
  },
  {
    "rank": 70,
    "title": "Intersection of Two Linked Lists",
    "platform": "LeetCode",
    "tier": "Linked List",
    "pattern": "Dual-Pointer Cycle Offset Alignment",
    "trigger": "Find node at which two linked lists intersect",
    "trap": "ptrA = headA, ptrB = headB. When ptrA hits end, redirect to headB. They travel identical total distance (a+b)",
    "difficulty": "EASY",
    "priority": "P2 - Twist",
    "template": "ptrA = ptrA.next if ptrA else headB; ptrB = ptrB.next if ptrB else headA",
    "slug": "intersection-of-two-linked-lists",
    "isRepoProblem": true,
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "frequency": 88
  }
];

export class OAEssentialsRegistry {
  public static getAllProblems(): OACuratedProblem[] {
    return OA_CURATED_PROBLEMS;
  }

  public static getPlaybooks(): OAPatternPlaybook[] {
    return OA_PATTERN_PLAYBOOKS;
  }

  public static getProblemByRank(rank: number): OACuratedProblem | undefined {
    return OA_CURATED_PROBLEMS.find((p) => p.rank === rank);
  }

  public static getProblemBySlug(slug: string): OACuratedProblem | undefined {
    return OA_CURATED_PROBLEMS.find(
      (p) => p.slug === slug || p.equivalentSlug === slug
    );
  }

  public static getProblemsByTier(tier: string): OACuratedProblem[] {
    const tLower = tier.toLowerCase();
    return OA_CURATED_PROBLEMS.filter((p) => p.tier.toLowerCase().includes(tLower));
  }

  public static getProblemsByPriority(priority: string): OACuratedProblem[] {
    const pLower = priority.toLowerCase();
    return OA_CURATED_PROBLEMS.filter((p) => p.priority.toLowerCase().includes(pLower));
  }

  public static getStats() {
    const total = OA_CURATED_PROBLEMS.length;
    const p0 = OA_CURATED_PROBLEMS.filter((p) => p.priority.includes('P0')).length;
    const p1 = OA_CURATED_PROBLEMS.filter((p) => p.priority.includes('P1')).length;
    const p2 = OA_CURATED_PROBLEMS.filter((p) => p.priority.includes('P2')).length;
    const easy = OA_CURATED_PROBLEMS.filter((p) => p.difficulty === 'EASY').length;
    const medium = OA_CURATED_PROBLEMS.filter((p) => p.difficulty === 'MEDIUM').length;
    const hard = OA_CURATED_PROBLEMS.filter((p) => p.difficulty === 'HARD').length;
    const inRepo = OA_CURATED_PROBLEMS.filter((p) => p.isRepoProblem).length;

    return {
      total,
      p0,
      p1,
      p2,
      easy,
      medium,
      hard,
      inRepo,
      playbooksCount: OA_PATTERN_PLAYBOOKS.length,
    };
  }
}
