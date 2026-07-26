import * as fs from 'fs';

function main(): void {
  const input = fs.readFileSync(0, 'utf-8');
  const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return;

  let idx = 0;
  while (idx < lines.length) {
    const s: string = lines[idx + 0].startsWith('"') ? JSON.parse(lines[idx + 0]) : lines[idx + 0];
    const result = isPalindrome(s);
    console.log(result);
    idx += 1;
  }
}

main();