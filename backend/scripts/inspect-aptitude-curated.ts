import fs from 'fs';
import path from 'path';

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let inQuote = false;
  let field = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuote && next === '"') {
        field += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (char === ',' && !inQuote) {
      row.push(field);
      field = '';
    } else if ((char === '\r' || char === '\n') && !inQuote) {
      if (char === '\r' && next === '\n') i++;
      row.push(field);
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const csvPath = path.join(process.cwd(), '..', 'curated_aptitude_bank.csv');
const rawText = fs.readFileSync(csvPath, 'utf-8');
const allRows = parseCSV(rawText);

console.log('Header:', allRows[0]);
const data = allRows.slice(1);
console.log('Total Questions:', data.length);

const sectionCounts: Record<string, number> = {};
const topicMap: Record<string, Set<string>> = {};
const diffCounts: Record<string, number> = {};
const ansCounts: Record<string, number> = {};
let invalidOptions = 0;
let htmlTags = 0;
const seenIds = new Set<string>();
let dupIds = 0;
const seenText = new Set<string>();
let dupText = 0;

for (const row of data) {
  const [id, section, diff, topic, question, a, b, c, d, answer] = row;
  
  if (seenIds.has(id)) dupIds++;
  seenIds.add(id);

  const norm = question.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (seenText.has(norm)) dupText++;
  seenText.add(norm);

  sectionCounts[section] = (sectionCounts[section] || 0) + 1;
  if (!topicMap[section]) topicMap[section] = new Set();
  topicMap[section].add(topic);

  diffCounts[diff] = (diffCounts[diff] || 0) + 1;
  ansCounts[answer] = (ansCounts[answer] || 0) + 1;

  if (!a || !b || !c || !d || !a.trim() || !b.trim() || !c.trim() || !d.trim()) {
    invalidOptions++;
  }

  if (/<[^>]+>/.test(question) || /<[^>]+>/.test(a) || /<[^>]+>/.test(b) || /<[^>]+>/.test(c) || /<[^>]+>/.test(d)) {
    htmlTags++;
  }
}

console.log('Section counts:', sectionCounts);
console.log('Difficulty counts:', diffCounts);
console.log('Answer distribution:', ansCounts);
console.log('Duplicate IDs:', dupIds);
console.log('Duplicate Question Text:', dupText);
console.log('Invalid Options:', invalidOptions);
console.log('HTML Tags count:', htmlTags);
console.log('Topics by Section:');
for (const [sec, tops] of Object.entries(topicMap)) {
  console.log(`  ${sec} (${tops.size} topics):`, Array.from(tops).join(', '));
}
