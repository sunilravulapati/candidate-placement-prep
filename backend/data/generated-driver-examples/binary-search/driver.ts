import * as fs from 'fs';

function main(): void {
  const input = fs.readFileSync(0, 'utf-8');
  const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return;

  let idx = 0;
  while (idx < lines.length) {
    const nums: number[] = JSON.parse(lines[idx + 0]);
    const target: number = parseInt(lines[idx + 1], 10);
    const result = search(nums, target);
    console.log(result);
    idx += 2;
  }
}

main();