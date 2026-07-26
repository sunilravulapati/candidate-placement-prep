// backend/scripts/validate-io-framework.ts

import fs from 'fs';
import path from 'path';
import { IOFramework, StarterMetadata, SupportedLanguage } from '../src/features/dsa/io';
import { ProblemLoader } from '../src/features/dsa/problemLoader';

const SAMPLE_PROBLEMS: StarterMetadata[] = [
  // 1. Two Sum (Array + Integer)
  {
    className: 'Solution',
    functionName: 'twoSum',
    parameters: [
      { name: 'nums', type: 'array<int>' },
      { name: 'target', type: 'int' },
    ],
    returnType: 'array<int>',
  },
  // 2. Binary Search (Array + Integer)
  {
    className: 'Solution',
    functionName: 'search',
    parameters: [
      { name: 'nums', type: 'array<int>' },
      { name: 'target', type: 'int' },
    ],
    returnType: 'int',
  },
  // 3. Valid Palindrome (String)
  {
    className: 'Solution',
    functionName: 'isPalindrome',
    parameters: [{ name: 's', type: 'string' }],
    returnType: 'bool',
  },
  // 4. Rotate Matrix (Matrix)
  {
    className: 'Solution',
    functionName: 'rotate',
    parameters: [{ name: 'matrix', type: 'matrix<int>' }],
    returnType: 'void',
  },
  // 5. Reverse Linked List (Linked List)
  {
    className: 'Solution',
    functionName: 'reverseList',
    parameters: [{ name: 'head', type: 'ListNode' }],
    returnType: 'ListNode',
  },
  // 6. Maximum Depth of Binary Tree (Binary Tree)
  {
    className: 'Solution',
    functionName: 'maxDepth',
    parameters: [{ name: 'root', type: 'TreeNode' }],
    returnType: 'int',
  },
];

const TARGET_LANGUAGES: SupportedLanguage[] = ['cpp', 'java', 'python', 'javascript', 'typescript'];

function runValidation() {
  console.log('==================================================');
  console.log('🚀 Running IO Framework Comprehensive Validation');
  console.log('==================================================\n');

  // Load existing problems from disk if available to augment validation test set
  let loadedCount = 0;
  try {
    const diskProblems = ProblemLoader.loadAllDirectoryProblems();
    for (const prob of diskProblems) {
      if (prob.starterMetadata && prob.starterMetadata.functionName) {
        SAMPLE_PROBLEMS.push(prob.starterMetadata);
        loadedCount++;
      }
    }
    console.log(`[Info] Loaded ${loadedCount} real problems from backend/data/problems`);
  } catch (err) {
    console.log('[Info] ProblemLoader disk scan skipped or empty. Using core test suite.');
  }

  const validatorReport = IOFramework.validateAll(SAMPLE_PROBLEMS);

  // Generate example drivers artifact
  const exampleOutputDirectory = path.join(__dirname, '..', 'data', 'generated-driver-examples');
  if (!fs.existsSync(exampleOutputDirectory)) {
    fs.mkdirSync(exampleOutputDirectory, { recursive: true });
  }

  const keyExamples = [
    { title: 'two-sum', meta: SAMPLE_PROBLEMS[0] },
    { title: 'binary-search', meta: SAMPLE_PROBLEMS[1] },
    { title: 'valid-palindrome', meta: SAMPLE_PROBLEMS[2] },
    { title: 'rotate-matrix', meta: SAMPLE_PROBLEMS[3] },
    { title: 'reverse-linked-list', meta: SAMPLE_PROBLEMS[4] },
    { title: 'max-depth-binary-tree', meta: SAMPLE_PROBLEMS[5] },
  ];

  for (const example of keyExamples) {
    const exampleFolder = path.join(exampleOutputDirectory, example.title);
    if (!fs.existsSync(exampleFolder)) {
      fs.mkdirSync(exampleFolder, { recursive: true });
    }

    for (const lang of TARGET_LANGUAGES) {
      const generatedCode = IOFramework.buildAndRender(example.meta, lang);
      const ext = lang === 'python' ? 'py' : lang === 'cpp' ? 'cpp' : lang === 'java' ? 'java' : lang === 'javascript' ? 'js' : 'ts';
      fs.writeFileSync(path.join(exampleFolder, `driver.${ext}`), generatedCode, 'utf-8');
    }
  }

  // Write report JSON
  const reportPath = path.join(__dirname, '..', 'data', 'io-framework-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(validatorReport, null, 2), 'utf-8');

  console.log(`\n✅ Validation Report written to: ${reportPath}`);
  console.log(`✅ Example Generated Drivers written to: ${exampleOutputDirectory}`);
  console.log(`\nResults: ${validatorReport.status.toUpperCase()}`);
  console.log(`Total Checked: ${validatorReport.totalChecked}`);
  console.log(`Errors: ${validatorReport.errorCount}`);
  console.log(`Warnings: ${validatorReport.warningCount}`);
  console.log('==================================================');
}

runValidation();
