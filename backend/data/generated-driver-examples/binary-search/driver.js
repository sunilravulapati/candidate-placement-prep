const fs = require('fs');

function main() {
  const input = fs.readFileSync(0, 'utf-8');
  const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return;

  let idx = 0;
  while (idx < lines.length) {
    var nums = JSON.parse(lines[idx + 0]);
    var target = parseInt(lines[idx + 1], 10);
    var result = search(nums, target);
    console.log(result);
    idx += 2;
  }
}

main();