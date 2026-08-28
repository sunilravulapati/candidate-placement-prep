import XLSX from 'xlsx';
import path from 'path';

const excelPath = path.join(process.cwd(), '..', 'DSA_Master_Sheet_Stdin_Converted.xlsx');
const wb = XLSX.readFile(excelPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows: any[] = XLSX.utils.sheet_to_json(sheet);

console.log('--- Sample 1: Two Sum ---');
const twoSum = rows.find(r => (r['Problem Name'] || '').includes('Two Sum'));
console.log('Title:', twoSum['Problem Name']);
console.log('Status:', twoSum['Stdin Conversion Status']);
console.log('Visible Input 1:', JSON.stringify(twoSum['Visible Input 1']));
console.log('Visible Stdin Input 1:', JSON.stringify(twoSum['Visible Stdin Input 1']));
console.log('Visible Output 1:', JSON.stringify(twoSum['Visible Output 1']));
console.log('Hidden Input 1:', JSON.stringify(twoSum['Hidden Input 1']));
console.log('Hidden Stdin Input 1:', JSON.stringify(twoSum['Hidden Stdin Input 1']));
console.log('Hidden Output 1:', JSON.stringify(twoSum['Hidden Output 1']));

console.log('\n--- Sample 2: Invert Binary Tree (REVIEW) ---');
const invertTree = rows.find(r => (r['Problem Name'] || '').includes('Invert Binary Tree'));
console.log('Title:', invertTree['Problem Name']);
console.log('Status:', invertTree['Stdin Conversion Status']);
console.log('Notes:', invertTree['Stdin Format Notes']);
console.log('Visible Input 1:', JSON.stringify(invertTree['Visible Input 1']));
console.log('Visible Stdin Input 1:', JSON.stringify(invertTree['Visible Stdin Input 1']));
console.log('Visible Output 1:', JSON.stringify(invertTree['Visible Output 1']));

console.log('\n--- Sample 3: LRU Cache (REVIEW) ---');
const lru = rows.find(r => (r['Problem Name'] || '').includes('LRU Cache'));
console.log('Title:', lru['Problem Name']);
console.log('Status:', lru['Stdin Conversion Status']);
console.log('Notes:', lru['Stdin Format Notes']);
console.log('Visible Input 1:', JSON.stringify(lru['Visible Input 1']));
console.log('Visible Stdin Input 1:', JSON.stringify(lru['Visible Stdin Input 1']));
console.log('Visible Output 1:', JSON.stringify(lru['Visible Output 1']));
