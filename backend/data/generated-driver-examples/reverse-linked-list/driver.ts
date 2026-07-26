import * as fs from 'fs';

class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = (val === undefined ? 0 : val);
    this.next = (next === undefined ? null : next);
  }
}

function parseLinkedList(arr: number[]): ListNode | null {
  if (!arr || arr.length === 0) return null;
  const dummy = new ListNode(0);
  let curr = dummy;
  for (const val of arr) {
    curr.next = new ListNode(val);
    curr = curr.next;
  }
  return dummy.next;
}

function printLinkedList(head: ListNode | null): void {
  const res: number[] = [];
  let curr = head;
  while (curr) {
    res.push(curr.val);
    curr = curr.next;
  }
  console.log(JSON.stringify(res));
}

function main(): void {
  const input = fs.readFileSync(0, 'utf-8');
  const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return;

  let idx = 0;
  while (idx < lines.length) {
    const head: ListNode | null = parseLinkedList(JSON.parse(lines[idx + 0]));
    const result = reverseList(head);
    printLinkedList(result);
    idx += 1;
  }
}

main();