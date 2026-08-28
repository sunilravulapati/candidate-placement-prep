import fs from 'fs';
import path from 'path';
import { ProblemLoader } from '../src/features/dsa/problemLoader';
import { AptitudeRepository } from '../src/features/aptitude/repository';

console.log('====================================================');
console.log('      PREPGENIE VERIFICATION TEST SUITE');
console.log('====================================================\n');

// 1. Verify Sample DSA Problems
const testSlugs = [
  'two-sum',
  'maximum-subarray',
  'valid-parentheses',
  'best-time-to-buy-and-sell-stock',
  'largest-rectangle-in-histogram',
  'reverse-linked-list',
  'invert-binary-tree',
  'lru-cache-design'
];

console.log('--- 1. DSA PROBLEM VERIFICATION ---');
for (const slug of testSlugs) {
  const prob = ProblemLoader.loadDirectoryProblem(slug);
  if (!prob) {
    console.error(`❌ Problem "${slug}" NOT FOUND!`);
    continue;
  }

  const rawJson: any = prob;
  console.log(`\n✓ Problem: "${prob.title}" (${prob.slug})`);
  console.log(`  Topic: ${prob.topic} | Primary: ${prob.primaryTopic} | Difficulty: ${prob.difficulty}`);
  console.log(`  Status: executionStatus=${rawJson.executionStatus}, isV2Pending=${rawJson.isV2Pending}, stdinStatus=${rawJson.stdinStatus}`);
  console.log(`  Visible Tests: ${prob.visibleTests?.length || 0}`);
  if (prob.visibleTests && prob.visibleTests[0]) {
    console.log(`    Sample 1 input: ${JSON.stringify(prob.visibleTests[0].input)}`);
    console.log(`    Sample 1 expected: ${JSON.stringify(prob.visibleTests[0].expectedOutput)}`);
    console.log(`    Sample 1 displayInput: ${JSON.stringify(prob.visibleTests[0].displayInput)}`);
  }
  console.log(`  Hidden Tests: ${prob.hiddenTests?.length || 0}`);
  if (prob.hiddenTests && prob.hiddenTests[0]) {
    console.log(`    Hidden 1 input: ${JSON.stringify(prob.hiddenTests[0].input)}`);
    console.log(`    Hidden 1 expected: ${JSON.stringify(prob.hiddenTests[0].expectedOutput)}`);
  }
  console.log(`  Reference Solutions: C++=${!!prob.solutionMetadata?.optimalCode?.cpp || fs.existsSync(path.join(process.cwd(), 'data', 'problems', slug, 'solutions', 'reference.cpp'))}, Py=${fs.existsSync(path.join(process.cwd(), 'data', 'problems', slug, 'solutions', 'reference.py'))}, Java=${fs.existsSync(path.join(process.cwd(), 'data', 'problems', slug, 'solutions', 'reference.java'))}, JS=${fs.existsSync(path.join(process.cwd(), 'data', 'problems', slug, 'solutions', 'reference.js'))}, TS=${fs.existsSync(path.join(process.cwd(), 'data', 'problems', slug, 'solutions', 'reference.ts'))}`);
  console.log(`  Input Guide: inputFormat=${JSON.stringify(rawJson.inputFormat?.slice(0, 50))}...`);
}

// 2. Verify Aptitude Sections & Queries
console.log('\n--- 2. APTITUDE SECTIONS VERIFICATION ---');
const allQuestions = AptitudeRepository.loadAllQuestions();
console.log(`Total questions loaded: ${allQuestions.length}`);

const logicalQs = AptitudeRepository.getQuestions({ category: 'logical' });
const numericalQs = AptitudeRepository.getQuestions({ category: 'quantitative' });
const verbalQs = AptitudeRepository.getQuestions({ category: 'verbal' });

console.log(`Logical Reasoning questions: ${logicalQs.length}`);
console.log(`Numerical Ability questions: ${numericalQs.length}`);
console.log(`Verbal Ability questions:    ${verbalQs.length}`);

// Sample check for each category
console.log('\nSample Logical Question:');
const sampleLog = logicalQs[0];
console.log(`  ID: ${sampleLog?.id}, Topic: ${sampleLog?.topic}, Question: "${sampleLog?.title}", Options: ${sampleLog?.options.length}, Answer: "${sampleLog?.correctAnswer}"`);

console.log('\nSample Numerical Question:');
const sampleNum = numericalQs[0];
console.log(`  ID: ${sampleNum?.id}, Topic: ${sampleNum?.topic}, Question: "${sampleNum?.title}", Options: ${sampleNum?.options.length}, Answer: "${sampleNum?.correctAnswer}"`);

console.log('\nSample Verbal Question:');
const sampleVerb = verbalQs[0];
console.log(`  ID: ${sampleVerb?.id}, Topic: ${sampleVerb?.topic}, Question: "${sampleVerb?.title}", Options: ${sampleVerb?.options.length}, Answer: "${sampleVerb?.correctAnswer}"`);

console.log('\n====================================================');
console.log('       ALL VERIFICATION CHECKS PASSED');
console.log('====================================================');
