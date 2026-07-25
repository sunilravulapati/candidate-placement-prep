// backend/src/features/dsa/topicTaxonomy.ts

export interface DSATopicDefinition {
  slug: string;
  name: string;
  description: string;
  iconName: string;
  estimatedHours: number;
}

export const DSA_TOPICS_31: DSATopicDefinition[] = [
  { slug: 'arrays', name: 'Arrays', description: 'Contiguous memory structures, prefix sums, and element manipulation.', iconName: 'Array', estimatedHours: 8 },
  { slug: 'strings', name: 'Strings', description: 'Character sequence operations, pattern matching, and anagrams.', iconName: 'Type', estimatedHours: 6 },
  { slug: 'hashing', name: 'Hashing', description: 'Hash tables, frequency maps, sets, and constant time lookups.', iconName: 'Hash', estimatedHours: 6 },
  { slug: 'two-pointers', name: 'Two Pointers', description: 'In-place array scanning using converging or trailing pointers.', iconName: 'GitCommit', estimatedHours: 5 },
  { slug: 'sliding-window', name: 'Sliding Window', description: 'Dynamic or fixed size contiguous subarray tracking.', iconName: 'Maximize2', estimatedHours: 6 },
  { slug: 'binary-search', name: 'Binary Search', description: 'Divide-and-conquer search on sorted space and search space reduction.', iconName: 'Search', estimatedHours: 8 },
  { slug: 'stack', name: 'Stack', description: 'LIFO evaluation, monotonic stacks, and expression evaluation.', iconName: 'Layers', estimatedHours: 5 },
  { slug: 'queue', name: 'Queue', description: 'FIFO order, sliding window maximums, and monotonic queues.', iconName: 'ListOrdered', estimatedHours: 4 },
  { slug: 'linked-list', name: 'Linked List', description: 'Pointer traversal, reversal, cycle detection, and slow/fast pointers.', iconName: 'Link', estimatedHours: 6 },
  { slug: 'recursion', name: 'Recursion', description: 'Self-referential functions, base cases, and call stack processing.', iconName: 'Repeat', estimatedHours: 5 },
  { slug: 'backtracking', name: 'Backtracking', description: 'State-space tree exploration, combinations, and permutations.', iconName: 'RotateCcw', estimatedHours: 8 },
  { slug: 'greedy', name: 'Greedy', description: 'Locally optimal choices aiming for global optimum solutions.', iconName: 'Zap', estimatedHours: 7 },
  { slug: 'heap-priority-queue', name: 'Heap / Priority Queue', description: 'Min-heaps, max-heaps, dynamic top-K tracking, and median streams.', iconName: 'BarChart2', estimatedHours: 6 },
  { slug: 'trees', name: 'Trees', description: 'Hierarchical node traversal (BFS/DFS), diameter, and tree paths.', iconName: 'GitBranch', estimatedHours: 10 },
  { slug: 'binary-search-trees', name: 'Binary Search Trees', description: 'BST validation, insertion, deletion, and lowest common ancestor.', iconName: 'Network', estimatedHours: 6 },
  { slug: 'trie', name: 'Trie', description: 'Prefix trees, autocomplete structures, and string search optimization.', iconName: 'FolderTree', estimatedHours: 5 },
  { slug: 'graphs', name: 'Graphs', description: 'Adjacency lists, BFS/DFS traversal, connected components, and cycles.', iconName: 'Share2', estimatedHours: 12 },
  { slug: 'dynamic-programming', name: 'Dynamic Programming', description: 'Memoization, tabulation, subproblem breakdown, and 1D/2D DP.', iconName: 'Cpu', estimatedHours: 18 },
  { slug: 'bit-manipulation', name: 'Bit Manipulation', description: 'AND, OR, XOR operations, bitmasks, and binary counting.', iconName: 'Binary', estimatedHours: 5 },
  { slug: 'math', name: 'Math', description: 'Number theory, GCD/LCM, modular arithmetic, and prime sieves.', iconName: 'Calculator', estimatedHours: 6 },
  { slug: 'design', name: 'Design', description: 'Data structure design (LRU Cache, MinStack, Trie, Twitter).', iconName: 'Layout', estimatedHours: 8 },
  { slug: 'intervals', name: 'Intervals', description: 'Interval merging, overlap detection, and boundary sorting.', iconName: 'Sliders', estimatedHours: 5 },
  { slug: 'matrix', name: 'Matrix', description: '2D grid traversals, spiral order, matrix rotation, and island counting.', iconName: 'Grid', estimatedHours: 6 },
  { slug: 'union-find', name: 'Union Find (DSU)', description: 'Disjoint Set Union, path compression, and union by rank.', iconName: 'Combine', estimatedHours: 5 },
  { slug: 'segment-tree', name: 'Segment Tree', description: 'Range queries and point/range updates in O(log N) time.', iconName: 'GitFork', estimatedHours: 8 },
  { slug: 'fenwick-tree', name: 'Fenwick Tree', description: 'Binary Indexed Trees for prefix sum queries and updates.', iconName: 'Activity', estimatedHours: 6 },
  { slug: 'topological-sort', name: 'Topological Sort', description: 'Directed Acyclic Graph (DAG) task scheduling and Kahn’s Algorithm.', iconName: 'ArrowDownRight', estimatedHours: 5 },
  { slug: 'shortest-path', name: 'Shortest Path', description: 'Dijkstra, Bellman-Ford, and Floyd-Warshall algorithms.', iconName: 'Navigation', estimatedHours: 7 },
  { slug: 'advanced-graphs', name: 'Advanced Graphs', description: 'Bridges, articulation points, Strongly Connected Components (SCC).', iconName: 'Compass', estimatedHours: 8 },
  { slug: 'advanced-dp', name: 'Advanced DP', description: 'Bitmask DP, Digit DP, Tree DP, and DP optimization tricks.', iconName: 'Sparkles', estimatedHours: 12 },
  { slug: 'miscellaneous', name: 'Miscellaneous', description: 'Specialized algorithms, reservoir sampling, and custom problems.', iconName: 'HelpCircle', estimatedHours: 5 },
];
