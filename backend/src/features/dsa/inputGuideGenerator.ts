// backend/src/features/dsa/inputGuideGenerator.ts

export interface InputGuideSnippets {
  cpp: string;
  python: string;
  java: string;
  javascript: string;
  typescript: string;
}

export interface InputHelperData {
  mode: 'auto' | 'manual';
  inputFormat: string;
  sampleInput: string;
  instructions?: string;
  snippets: InputGuideSnippets;
}

export type CommonInputPattern =
  | 'SINGLE_ARRAY'
  | 'ARRAY_AND_TARGET'
  | 'TWO_ARRAYS'
  | 'SINGLE_STRING'
  | 'TWO_STRINGS'
  | 'STRING_AND_INT'
  | 'SINGLE_INT'
  | 'MULTIPLE_INTS'
  | 'MATRIX'
  | 'GRAPH_EDGES'
  | 'GENERIC';

/**
 * Detect the common competitive programming input pattern based on metadata, sample input, and tags.
 */
export function detectInputPattern(
  sampleInput: string,
  primaryTopic: string,
  dataStructuresUsed: string[] = [],
  problemTitle: string = ''
): CommonInputPattern {
  const sample = (sampleInput || '').trim();
  const topic = (primaryTopic || '').toLowerCase();
  const title = (problemTitle || '').toLowerCase();
  const dsList = dataStructuresUsed.map((d) => d.toLowerCase());

  // 1. Array + Target (e.g. Two Sum, Subarray Sum, etc.)
  if (
    (sample.includes('target') || title.includes('two sum') || title.includes('search in rotated')) &&
    (sample.includes('[') || sample.split('\n').length >= 2)
  ) {
    return 'ARRAY_AND_TARGET';
  }

  // 2. Matrix / Grid / 2D Array
  if (
    dsList.includes('matrix') ||
    dsList.includes('grid') ||
    topic.includes('matrix') ||
    title.includes('matrix') ||
    sample.startsWith('[[') ||
    sample.includes('][')
  ) {
    return 'MATRIX';
  }

  // 3. Graph Edges
  if (
    (topic.includes('graph') || dsList.includes('graph')) &&
    (sample.includes('edges') || sample.includes('[['))
  ) {
    return 'GRAPH_EDGES';
  }

  // 4. Two Strings (e.g. Valid Anagram, Edit Distance, Longest Common Subsequence)
  if (
    (topic.includes('string') || title.includes('anagram') || title.includes('subsequence') || title.includes('edit distance')) &&
    ((sample.includes('s =') && sample.includes('t =')) || sample.split('\n').length >= 2)
  ) {
    return 'TWO_STRINGS';
  }

  // 5. Single String (e.g. Valid Parentheses, Longest Palindromic Substring)
  if (topic.includes('string') || title.includes('parentheses') || title.includes('palindrome') || (sample.startsWith('"') && !sample.includes('['))) {
    return 'SINGLE_STRING';
  }

  // 6. Two Arrays (e.g. Intersection, Merge Sorted Array)
  if (
    (sample.includes('nums1') && sample.includes('nums2')) ||
    (sample.includes('[') && (sample.match(/\[/g) || []).length >= 2)
  ) {
    return 'TWO_ARRAYS';
  }

  // 7. Single Array (e.g. Maximum Subarray, Best Time to Buy, Contains Duplicate)
  if (
    topic.includes('array') ||
    dsList.includes('array') ||
    sample.includes('[') ||
    sample.includes(',')
  ) {
    return 'SINGLE_ARRAY';
  }

  // 8. Single Integer (e.g. Climbing Stairs, Fibonacci, Counting Bits)
  if (/^-?\d+$/.test(sample.trim()) || title.includes('fibonacci') || title.includes('climbing stairs')) {
    return 'SINGLE_INT';
  }

  // 9. Multiple Integers
  if (/^-?\d+(\s+-?\d+)+$/.test(sample.trim())) {
    return 'MULTIPLE_INTS';
  }

  return 'GENERIC';
}

/**
 * Generate standard competitive programming input parsing snippets for all 5 languages.
 */
export function generateInputSnippets(
  pattern: CommonInputPattern,
  sampleInput: string,
  problemTitle: string
): InputGuideSnippets {
  switch (pattern) {
    case 'SINGLE_ARRAY':
      return {
        cpp: `// Read array length then elements
int n;
if (cin >> n) {
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    // Solve problem with nums
}`,
        python: `# Read array length and space-separated elements
import sys

input_data = sys.stdin.read().split()
if input_data:
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    # Solve problem with nums`,
        java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) {
                nums[i] = sc.nextInt();
            }
            // Solve problem with nums
        }
    }
}`,
        javascript: `const fs = require('fs');

const input = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
if (input.length > 0 && input[0] !== '') {
    const n = parseInt(input[0], 10);
    const nums = input.slice(1, n + 1).map(Number);
    // Solve problem with nums
}`,
        typescript: `import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
if (input.length > 0 && input[0] !== '') {
    const n = parseInt(input[0], 10);
    const nums: number[] = input.slice(1, n + 1).map(Number);
    // Solve problem with nums
}`,
      };

    case 'ARRAY_AND_TARGET':
      return {
        cpp: `// Read array length, array elements, then target
int n;
if (cin >> n) {
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    int target;
    cin >> target;
    // Solve problem with nums and target
}`,
        python: `# Read array and target value
import sys

input_data = sys.stdin.read().split()
if input_data:
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[n+1])
    # Solve problem with nums and target`,
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) {
                nums[i] = sc.nextInt();
            }
            int target = sc.nextInt();
            // Solve problem with nums and target
        }
    }
}`,
        javascript: `const fs = require('fs');

const input = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
if (input.length > 0 && input[0] !== '') {
    const n = parseInt(input[0], 10);
    const nums = input.slice(1, n + 1).map(Number);
    const target = parseInt(input[n + 1], 10);
    // Solve problem with nums and target
}`,
        typescript: `import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
if (input.length > 0 && input[0] !== '') {
    const n = parseInt(input[0], 10);
    const nums: number[] = input.slice(1, n + 1).map(Number);
    const target: number = parseInt(input[n + 1], 10);
    // Solve problem with nums and target
}`,
      };

    case 'SINGLE_STRING':
      return {
        cpp: `// Read string input
string s;
if (cin >> s) {
    // Solve problem with s
}`,
        python: `# Read string input
import sys

s = sys.stdin.read().strip()
if s:
    # Solve problem with s
    pass`,
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            // Solve problem with s
        }
    }
}`,
        javascript: `const fs = require('fs');

const s = fs.readFileSync(0, 'utf8').trim();
if (s) {
    // Solve problem with s
}`,
        typescript: `import * as fs from 'fs';

const s: string = fs.readFileSync(0, 'utf8').trim();
if (s) {
    // Solve problem with s
}`,
      };

    case 'TWO_STRINGS':
      return {
        cpp: `// Read two strings
string s1, s2;
if (cin >> s1 >> s2) {
    // Solve problem with s1 and s2
}`,
        python: `# Read two strings
import sys

tokens = sys.stdin.read().split()
if len(tokens) >= 2:
    s1, s2 = tokens[0], tokens[1]
    # Solve problem with s1 and s2`,
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s1 = sc.next();
            String s2 = sc.next();
            // Solve problem with s1 and s2
        }
    }
}`,
        javascript: `const fs = require('fs');

const tokens = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
if (tokens.length >= 2) {
    const s1 = tokens[0];
    const s2 = tokens[1];
    // Solve problem with s1 and s2
}`,
        typescript: `import * as fs from 'fs';

const tokens: string[] = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
if (tokens.length >= 2) {
    const s1: string = tokens[0];
    const s2: string = tokens[1];
    // Solve problem with s1 and s2
}`,
      };

    case 'MATRIX':
      return {
        cpp: `// Read matrix dimensions (rows, cols) and grid elements
int r, c;
if (cin >> r >> c) {
    vector<vector<int>> matrix(r, vector<int>(c));
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            cin >> matrix[i][j];
        }
    }
    // Solve problem with matrix
}`,
        python: `# Read matrix dimensions (rows, cols) and grid
import sys

input_data = sys.stdin.read().split()
if input_data:
    r, c = int(input_data[0]), int(input_data[1])
    idx = 2
    matrix = []
    for _ in range(r):
        matrix.append([int(x) for x in input_data[idx:idx+c]])
        idx += c
    # Solve problem with matrix`,
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int r = sc.nextInt();
            int c = sc.nextInt();
            int[][] matrix = new int[r][c];
            for (int i = 0; i < r; i++) {
                for (int j = 0; j < c; j++) {
                    matrix[i][j] = sc.nextInt();
                }
            }
            // Solve problem with matrix
        }
    }
}`,
        javascript: `const fs = require('fs');

const tokens = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
if (tokens.length >= 2) {
    const r = parseInt(tokens[0], 10);
    const c = parseInt(tokens[1], 10);
    let idx = 2;
    const matrix = [];
    for (let i = 0; i < r; i++) {
        matrix.push(tokens.slice(idx, idx + c).map(Number));
        idx += c;
    }
    // Solve problem with matrix
}`,
        typescript: `import * as fs from 'fs';

const tokens: string[] = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
if (tokens.length >= 2) {
    const r = parseInt(tokens[0], 10);
    const c = parseInt(tokens[1], 10);
    let idx = 2;
    const matrix: number[][] = [];
    for (let i = 0; i < r; i++) {
        matrix.push(tokens.slice(idx, idx + c).map(Number));
        idx += c;
    }
    // Solve problem with matrix
}`,
      };

    case 'SINGLE_INT':
      return {
        cpp: `// Read single integer
int n;
if (cin >> n) {
    // Solve problem with n
}`,
        python: `# Read single integer
import sys

input_str = sys.stdin.read().strip()
if input_str:
    n = int(input_str)
    # Solve problem with n`,
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            // Solve problem with n
        }
    }
}`,
        javascript: `const fs = require('fs');

const input = fs.readFileSync(0, 'utf8').trim();
if (input) {
    const n = parseInt(input, 10);
    // Solve problem with n
}`,
        typescript: `import * as fs from 'fs';

const input: string = fs.readFileSync(0, 'utf8').trim();
if (input) {
    const n: number = parseInt(input, 10);
    // Solve problem with n
}`,
      };

    case 'GRAPH_EDGES':
      return {
        cpp: `// Read number of vertices (n) and number of edges (m)
int n, m;
if (cin >> n >> m) {
    vector<vector<int>> adj(n);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u); // if undirected
    }
    // Solve problem with graph
}`,
        python: `# Read number of vertices (n) and edges (m)
import sys
from collections import defaultdict

input_data = sys.stdin.read().split()
if input_data:
    n, m = int(input_data[0]), int(input_data[1])
    adj = defaultdict(list)
    idx = 2
    for _ in range(m):
        u, v = int(input_data[idx]), int(input_data[idx+1])
        adj[u].append(v)
        adj[v].append(u)
        idx += 2
    # Solve problem with graph`,
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int m = sc.nextInt();
            List<List<Integer>> adj = new ArrayList<>();
            for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
            for (int i = 0; i < m; i++) {
                int u = sc.nextInt();
                int v = sc.nextInt();
                adj.get(u).add(v);
                adj.get(v).add(u);
            }
            // Solve problem with graph
        }
    }
}`,
        javascript: `const fs = require('fs');

const tokens = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
if (tokens.length >= 2) {
    const n = parseInt(tokens[0], 10);
    const m = parseInt(tokens[1], 10);
    const adj = Array.from({ length: n }, () => []);
    let idx = 2;
    for (let i = 0; i < m; i++) {
        const u = parseInt(tokens[idx], 10);
        const v = parseInt(tokens[idx + 1], 10);
        adj[u].push(v);
        adj[v].push(u);
        idx += 2;
    }
    // Solve problem with graph
}`,
        typescript: `import * as fs from 'fs';

const tokens: string[] = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);
if (tokens.length >= 2) {
    const n = parseInt(tokens[0], 10);
    const m = parseInt(tokens[1], 10);
    const adj: number[][] = Array.from({ length: n }, () => []);
    let idx = 2;
    for (let i = 0; i < m; i++) {
        const u = parseInt(tokens[idx], 10);
        const v = parseInt(tokens[idx + 1], 10);
        adj[u].push(v);
        adj[v].push(u);
        idx += 2;
    }
    // Solve problem with graph
}`,
      };

    case 'GENERIC':
    default:
      return {
        cpp: `// Standard competitive programming stdin reader
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Read input from cin
    // Process solution
    // Print result to cout

    return 0;
}`,
        python: `# Standard competitive programming stdin reader
import sys

def main():
    input_data = sys.stdin.read().splitlines()
    if not input_data:
        return
    # Process solution
    # Print result to stdout

if __name__ == "__main__":
    main()`,
        java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line;
        while ((line = br.readLine()) != null) {
            // Process solution
            // System.out.println(result);
        }
    }
}`,
        javascript: `const fs = require('fs');

const input = fs.readFileSync(0, 'utf8').trim();
if (input) {
    // Process input
    // console.log(result);
}`,
        typescript: `import * as fs from 'fs';

const input: string = fs.readFileSync(0, 'utf8').trim();
if (input) {
    // Process input
    // console.log(result);
}`,
      };
  }
}

/**
 * Generate full InputHelperData object for a problem.
 */
export function buildProblemInputHelper(
  problemTitle: string,
  primaryTopic: string,
  sampleInput: string,
  dataStructuresUsed: string[] = [],
  manualOverride?: Partial<InputHelperData>
): InputHelperData {
  if (manualOverride && manualOverride.mode === 'manual' && manualOverride.snippets) {
    return {
      mode: 'manual',
      inputFormat: manualOverride.inputFormat || `Standard competitive programming stdin input for ${problemTitle}.`,
      sampleInput: manualOverride.sampleInput || sampleInput || '',
      instructions: manualOverride.instructions,
      snippets: manualOverride.snippets as InputGuideSnippets,
    };
  }

  const pattern = detectInputPattern(sampleInput, primaryTopic, dataStructuresUsed, problemTitle);
  const snippets = generateInputSnippets(pattern, sampleInput, problemTitle);

  let formatDescription = 'Standard input stream containing problem parameters.';
  switch (pattern) {
    case 'SINGLE_ARRAY':
      formatDescription = 'Line 1: Integer n (number of elements)\nLine 2: n space-separated integers';
      break;
    case 'ARRAY_AND_TARGET':
      formatDescription = 'Line 1: Integer n (number of elements)\nLine 2: n space-separated integers\nLine 3: Target integer';
      break;
    case 'SINGLE_STRING':
      formatDescription = 'Single line containing the string input';
      break;
    case 'TWO_STRINGS':
      formatDescription = 'Two strings provided on separate lines or space-separated';
      break;
    case 'MATRIX':
      formatDescription = 'Line 1: Integers r (rows) and c (columns)\nNext r lines: c space-separated integers';
      break;
    case 'SINGLE_INT':
      formatDescription = 'Single integer input value';
      break;
    case 'GRAPH_EDGES':
      formatDescription = 'Line 1: Integers n (vertices) and m (edges)\nNext m lines: Edge pairs u v';
      break;
    default:
      formatDescription = `Standard competitive programming input stream for ${problemTitle}.`;
  }

  return {
    mode: 'auto',
    inputFormat: formatDescription,
    sampleInput: sampleInput || '',
    instructions: `Read input from standard input (stdin) and print output to standard output (stdout).`,
    snippets,
  };
}
