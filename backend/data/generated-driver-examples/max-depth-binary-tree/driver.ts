import * as fs from 'fs';

class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
  }
}

function parseTree(arr: (number | null)[]): TreeNode | null {
  if (!arr || arr.length === 0) return null;
  const root = new TreeNode(arr[0]!);
  const queue: TreeNode[] = [root];
  let i = 1;
  while (queue.length > 0 && i < arr.length) {
    const curr = queue.shift()!;
    if (i < arr.length && arr[i] !== null) {
      curr.left = new TreeNode(arr[i]!);
      queue.push(curr.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null) {
      curr.right = new TreeNode(arr[i]!);
      queue.push(curr.right);
    }
    i++;
  }
  return root;
}

function main(): void {
  const input = fs.readFileSync(0, 'utf-8');
  const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return;

  let idx = 0;
  while (idx < lines.length) {
    const root: TreeNode | null = parseTree(JSON.parse(lines[idx + 0]));
    const result = maxDepth(root);
    console.log(result);
    idx += 1;
  }
}

main();