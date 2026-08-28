import XLSX from 'xlsx';
import path from 'path';

const excelPath = path.join(process.cwd(), '..', 'DSA_Master_Sheet_Stdin_Converted.xlsx');
const wb = XLSX.readFile(excelPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows: any[] = XLSX.utils.sheet_to_json(sheet);

console.log('Total rows:', rows.length);

let totalVis = 0;
let totalHid = 0;
let visDups = 0;
let hidDups = 0;
const missingFields: Record<string, number> = {};

for (const r of rows) {
  const slug = r['Problem ID'] || r['Problem Name'];
  const status = r['Stdin Conversion Status'];

  // Check visible tests
  const seenVis = new Set<string>();
  for (let i = 1; i <= 3; i++) {
    const rawIn = r[`Visible Stdin Input ${i}`] !== undefined ? r[`Visible Stdin Input ${i}`] : r[`Visible Input ${i}`];
    const rawOut = r[`Visible Output ${i}`];
    if (rawIn !== undefined && rawIn !== null && String(rawIn).trim().length > 0) {
      totalVis++;
      const key = `${String(rawIn).trim()}::${String(rawOut || '').trim()}`;
      if (seenVis.has(key)) {
        visDups++;
        console.log(`Duplicate visible test in ${slug}: ${key}`);
      }
      seenVis.add(key);
    }
  }

  // Check hidden tests
  const seenHid = new Set<string>();
  for (let i = 1; i <= 5; i++) {
    const rawIn = r[`Hidden Stdin Input ${i}`] !== undefined ? r[`Hidden Stdin Input ${i}`] : r[`Hidden Input ${i}`];
    const rawOut = r[`Hidden Output ${i}`];
    if (rawIn !== undefined && rawIn !== null && String(rawIn).trim().length > 0) {
      totalHid++;
      const key = `${String(rawIn).trim()}::${String(rawOut || '').trim()}`;
      if (seenHid.has(key)) {
        hidDups++;
        console.log(`Duplicate hidden test in ${slug}: ${key}`);
      }
      seenHid.add(key);
    }
  }

  // Check complete solutions
  ['C++ Complete Solution', 'Python Complete Solution', 'Java Complete Solution', 'JS Complete Solution', 'TS Complete Solution'].forEach(sol => {
    if (!r[sol] || String(r[sol]).trim().length === 0) {
      missingFields[sol] = (missingFields[sol] || 0) + 1;
      console.log(`Missing ${sol} in ${slug}`);
    }
  });
}

console.log(`Total Visible Tests: ${totalVis}, Visible Duplicates: ${visDups}`);
console.log(`Total Hidden Tests: ${totalHid}, Hidden Duplicates: ${hidDups}`);
console.log('Missing solution counts:', missingFields);
