// backend/scripts/validate-dsa-v1.ts

import fs from 'fs';
import path from 'path';
import { DSA_TOPICS_31 } from '../src/features/dsa/topicTaxonomy';

function findDataDir(): string {
  const candidates = [
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'backend', 'data'),
    path.join(process.cwd(), '..', 'backend', 'data'),
  ];
  return candidates.find((c) => fs.existsSync(c)) || path.join(process.cwd(), 'backend', 'data');
}

export function validateDSAV1() {
  const dataDir = findDataDir();
  const problemsDir = path.join(dataDir, 'problems');

  if (!fs.existsSync(problemsDir)) {
    throw new Error(`Problems directory not found at ${problemsDir}`);
  }

  const entries = fs.readdirSync(problemsDir, { withFileTypes: true });
  const problemFolders = entries.filter((e) => e.isDirectory());

  const totalProblems = problemFolders.length;
  let v1ReadyCount = 0;
  let v2PendingCount = 0;
  let visibleTestsPass = 0;
  let hiddenTestsPass = 0;
  let duplicateTestsCount = 0;

  let cppCount = 0;
  let pyCount = 0;
  let javaCount = 0;
  let jsCount = 0;
  let tsCount = 0;

  let compatibleSerialization = 0;
  let manualReviewSerialization = 0;
  let failedSerialization = 0;

  let validTopicCount = 0;
  let topicWarnings = 0;

  const validTopicSlugs = new Set(DSA_TOPICS_31.map((t) => t.slug));
  // Include common recognized primary topic aliases
  validTopicSlugs.add('arrays');
  validTopicSlugs.add('strings');
  validTopicSlugs.add('hashing');
  validTopicSlugs.add('two-pointers');
  validTopicSlugs.add('sliding-window');
  validTopicSlugs.add('binary-search');
  validTopicSlugs.add('sorting');
  validTopicSlugs.add('greedy');
  validTopicSlugs.add('stack');
  validTopicSlugs.add('queue');
  validTopicSlugs.add('linked-list');
  validTopicSlugs.add('recursion');
  validTopicSlugs.add('backtracking');
  validTopicSlugs.add('heap');
  validTopicSlugs.add('tree');
  validTopicSlugs.add('bst');
  validTopicSlugs.add('trie');
  validTopicSlugs.add('graphs');
  validTopicSlugs.add('dp');
  validTopicSlugs.add('bit-manipulation');
  validTopicSlugs.add('design');
  validTopicSlugs.add('design-misc');

  const reviewProblemNames: string[] = [];

  for (const folder of problemFolders) {
    const slug = folder.name;
    const folderPath = path.join(problemsDir, slug);

    // 1. Problem JSON
    const jsonPath = path.join(folderPath, 'problem.json');
    let isReview = false;

    if (fs.existsSync(jsonPath)) {
      try {
        const prob = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const primary = (prob.primaryTopic || prob.topic || '').toLowerCase();
        if (primary && (validTopicSlugs.has(primary) || validTopicSlugs.has(primary.replace(/[^a-z0-9]+/g, '-')))) {
          validTopicCount++;
        } else {
          topicWarnings++;
        }

        if (prob.isV2Pending || prob.stdinStatus === 'REVIEW' || prob.executionStatus === 'V2_PENDING') {
          isReview = true;
          v2PendingCount++;
          reviewProblemNames.push(prob.title || slug);
        } else {
          v1ReadyCount++;
        }
      } catch {
        topicWarnings++;
      }
    }

    // 2. Tests JSON
    const testsJsonPath = path.join(folderPath, 'tests.json');
    if (fs.existsSync(testsJsonPath)) {
      try {
        const tests = JSON.parse(fs.readFileSync(testsJsonPath, 'utf-8'));
        const visible = tests.filter((t: any) => t.classification === 'sample' || (t.id && t.id.startsWith('sample')));
        const hidden = tests.filter((t: any) => t.classification !== 'sample' && (!t.id || !t.id.startsWith('sample')));

        if (visible.length >= 1) visibleTestsPass++;
        if (hidden.length >= 1) hiddenTestsPass++;

        // Duplicate check
        const seen = new Set<string>();
        for (const t of tests) {
          const key = `${(t.input || t.stdin || '').trim()}::${(t.expectedOutput || '').trim()}`;
          if (seen.has(key)) {
            duplicateTestsCount++;
          } else {
            seen.add(key);
          }

          // Serialization status
          if (t.serializationStatus === 'manual_required') {
            manualReviewSerialization++;
          } else if (t.serializationStatus === 'failed') {
            failedSerialization++;
          }
        }

        if (isReview) {
          // Counted under manual review
        } else {
          compatibleSerialization++;
        }
      } catch {
        failedSerialization++;
      }
    }

    // 3. Reference Solutions
    const solsDir = path.join(folderPath, 'solutions');
    if (fs.existsSync(solsDir)) {
      if (fs.existsSync(path.join(solsDir, 'reference.cpp')) && fs.readFileSync(path.join(solsDir, 'reference.cpp'), 'utf-8').trim().length > 0) cppCount++;
      if (fs.existsSync(path.join(solsDir, 'reference.py')) && fs.readFileSync(path.join(solsDir, 'reference.py'), 'utf-8').trim().length > 0) pyCount++;
      if (fs.existsSync(path.join(solsDir, 'reference.java')) && fs.readFileSync(path.join(solsDir, 'reference.java'), 'utf-8').trim().length > 0) javaCount++;
      if (fs.existsSync(path.join(solsDir, 'reference.js')) && fs.readFileSync(path.join(solsDir, 'reference.js'), 'utf-8').trim().length > 0) jsCount++;
      if (fs.existsSync(path.join(solsDir, 'reference.ts')) && fs.readFileSync(path.join(solsDir, 'reference.ts'), 'utf-8').trim().length > 0) tsCount++;
    }
  }

  const isHealthy =
    totalProblems === 174 &&
    v1ReadyCount === 147 &&
    v2PendingCount === 27 &&
    visibleTestsPass === 174 &&
    hiddenTestsPass === 174 &&
    duplicateTestsCount === 0 &&
    cppCount === 174 &&
    pyCount === 174 &&
    javaCount === 174 &&
    jsCount === 174 &&
    tsCount === 174 &&
    failedSerialization === 0;

  console.log(`====================================================`);
  console.log(`          PREPGENIE DSA V1 COMPATIBILITY`);
  console.log(`====================================================\n`);

  console.log(`DSA CONTENT REPORT:`);
  console.log(`Total Problems:       ${totalProblems}`);
  console.log(`V1 Ready:             ${v1ReadyCount}`);
  console.log(`Review / V2 Pending:  ${v2PendingCount}\n`);

  console.log(`Visible Tests:`);
  console.log(`${visibleTestsPass} / 174\n`);

  console.log(`Hidden Tests:`);
  console.log(`${hiddenTestsPass} / 174\n`);

  console.log(`Duplicate Tests:`);
  console.log(`${duplicateTestsCount}\n`);

  console.log(`Reference Solutions:`);
  console.log(`C++          ${cppCount} / 174`);
  console.log(`Python       ${pyCount} / 174`);
  console.log(`Java         ${javaCount} / 174`);
  console.log(`JavaScript   ${jsCount} / 174`);
  console.log(`TypeScript   ${tsCount} / 174\n`);

  console.log(`V1 Input Serialization:`);
  console.log(`V1 Ready:      ${v1ReadyCount}`);
  console.log(`V2 Pending:    ${v2PendingCount}`);
  console.log(`Failed:        ${failedSerialization}\n`);

  console.log(`Topic Classification:`);
  console.log(`Valid:    ${validTopicCount}`);
  console.log(`Warnings: ${topicWarnings}\n`);

  console.log(`Review Problems List (${reviewProblemNames.length}):`);
  reviewProblemNames.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));

  console.log(`\nRepository:`);
  console.log(isHealthy ? `Healthy` : `Issues Detected`);

  console.log(`\n====================================================`);
}

if (require.main === module) {
  try {
    validateDSAV1();
  } catch (err) {
    console.error('V1 validation error:', (err as Error).message);
    process.exit(1);
  }
}
