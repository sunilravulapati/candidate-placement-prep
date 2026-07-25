// backend/src/features/dsa/serializers.ts

export class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

export class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val === undefined ? 0 : val;
    this.left = left === undefined ? null : left;
    this.right = right === undefined ? null : right;
  }
}

export class GraphNode {
  val: number;
  neighbors: GraphNode[];
  constructor(val?: number, neighbors?: GraphNode[]) {
    this.val = val === undefined ? 0 : val;
    this.neighbors = neighbors === undefined ? [] : neighbors;
  }
}

export class Serializers {
  // ── ListNode Serialization ──────────────────────────────────────────────────

  public static arrayToListNode(arr: number[] | null | undefined): ListNode | null {
    if (!arr || arr.length === 0) return null;
    const dummy = new ListNode(0);
    let current = dummy;
    for (const val of arr) {
      current.next = new ListNode(val);
      current = current.next;
    }
    return dummy.next;
  }

  public static listNodeToArray(head: ListNode | null | undefined): number[] {
    const result: number[] = [];
    let curr = head;
    const visited = new Set<ListNode>();
    while (curr) {
      if (visited.has(curr)) break; // Prevent infinite cycle loops
      visited.add(curr);
      result.push(curr.val);
      curr = curr.next;
    }
    return result;
  }

  // ── TreeNode Serialization (LeetCode Level-Order) ──────────────────────────

  public static arrayToTreeNode(arr: (number | null)[] | null | undefined): TreeNode | null {
    if (!arr || arr.length === 0 || arr[0] === null) return null;

    const root = new TreeNode(arr[0] as number);
    const queue: TreeNode[] = [root];
    let i = 1;

    while (queue.length > 0 && i < arr.length) {
      const current = queue.shift()!;

      // Left child
      if (i < arr.length && arr[i] !== null) {
        current.left = new TreeNode(arr[i] as number);
        queue.push(current.left);
      }
      i++;

      // Right child
      if (i < arr.length && arr[i] !== null) {
        current.right = new TreeNode(arr[i] as number);
        queue.push(current.right);
      }
      i++;
    }

    return root;
  }

  public static treeNodeToArray(root: TreeNode | null | undefined): (number | null)[] {
    if (!root) return [];
    const result: (number | null)[] = [];
    const queue: (TreeNode | null)[] = [root];

    while (queue.length > 0) {
      const node = queue.shift();
      if (node) {
        result.push(node.val);
        queue.push(node.left);
        queue.push(node.right);
      } else {
        result.push(null);
      }
    }

    // Trim trailing nulls
    while (result.length > 0 && result[result.length - 1] === null) {
      result.pop();
    }

    return result;
  }

  // ── GraphNode Serialization ─────────────────────────────────────────────────

  public static adjacencyListToGraph(adjList: number[][]): GraphNode | null {
    if (!adjList || adjList.length === 0) return null;
    const nodes = new Map<number, GraphNode>();
    for (let i = 1; i <= adjList.length; i++) {
      nodes.set(i, new GraphNode(i));
    }
    for (let i = 1; i <= adjList.length; i++) {
      const node = nodes.get(i)!;
      for (const neighborVal of adjList[i - 1]) {
        node.neighbors.push(nodes.get(neighborVal)!);
      }
    }
    return nodes.get(1) || null;
  }

  public static graphToAdjacencyList(node: GraphNode | null): number[][] {
    if (!node) return [];
    const visited = new Map<number, GraphNode>();
    const dfs = (curr: GraphNode) => {
      visited.set(curr.val, curr);
      for (const neighbor of curr.neighbors) {
        if (!visited.has(neighbor.val)) {
          dfs(neighbor);
        }
      }
    };
    dfs(node);

    const maxVal = Math.max(...Array.from(visited.keys()));
    const result: number[][] = Array.from({ length: maxVal }, () => []);
    for (let i = 1; i <= maxVal; i++) {
      const n = visited.get(i);
      if (n) {
        result[i - 1] = n.neighbors.map((nb) => nb.val);
      }
    }
    return result;
  }
}
