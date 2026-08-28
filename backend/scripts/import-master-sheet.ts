// backend/scripts/import-master-sheet.ts

import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import type { DSAProblemMetadata, ResourceLink, TestCaseSpec } from '../src/features/dsa/dsaTypes.ts';
import { normalizeTestInput, serializeV1TestCase } from '../src/features/dsa/inputNormalizer.ts';
import { buildProblemInputHelper } from '../src/features/dsa/inputGuideGenerator.ts';

// Helper to find data directory
function findDataDir(): string {
  const candidates = [
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'backend', 'data'),
    path.join(process.cwd(), '..', 'backend', 'data'),
  ];
  return candidates.find((c) => fs.existsSync(c)) || path.join(process.cwd(), 'backend', 'data');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface RawExcelRow {
  'Question No.'?: number | string;
  'Problem ID'?: string;
  'Problem Name'?: string;
  'Difficulty'?: string;
  'Importance'?: string;
  'Interview Frequency'?: string;
  'Estimated Solve Time'?: string;
  'Primary Topic'?: string;
  'Secondary Topics'?: string;
  'Pattern'?: string;
  'Technique'?: string;
  'Data Structures Used'?: string;
  'Learning Path'?: string;
  'Companies'?: string;
  'Description'?: string;
  'Why Learn This?'?: string;
  'Recognition Clues'?: string;
  'Prerequisites (Concepts)'?: string;
  'Concepts Used'?: string;
  'Tags'?: string;
  'Optimal TC'?: string;
  'Optimal SC'?: string;
  'Brute TC'?: string;
  'Brute SC'?: string;
  'Hint 1'?: string;
  'Hint 2'?: string;
  'Hint 3'?: string;
  'Approach'?: string;
  'Intuition'?: string;
  'Algorithm'?: string;
  'Pseudocode'?: string;
  'Common Mistakes'?: string;
  'Edge Cases'?: string;
  'Interview Trick'?: string;
  'Revision Notes'?: string;
  'Visible Input 1'?: string;
  'Visible Output 1'?: string;
  'Visible Explanation 1'?: string;
  'Visible Input 2'?: string;
  'Visible Output 2'?: string;
  'Visible Explanation 2'?: string;
  'Visible Input 3'?: string;
  'Visible Output 3'?: string;
  'Visible Explanation 3'?: string;
  'Hidden Test Purpose 1'?: string;
  'Hidden Test Purpose 2'?: string;
  'Hidden Test Purpose 3'?: string;
  'Hidden Test Purpose 4'?: string;
  'Hidden Test Purpose 5'?: string;
  'Follow-ups'?: string;
  'Variants'?: string;
  'Related Problems'?: string;
  'LeetCode Link'?: string;
  'GeeksForGeeks Link'?: string;
  'C++ Starter Code'?: string;
  'C++ Complete Solution'?: string;
  'Python Starter Code'?: string;
  'Python Complete Solution'?: string;
  'Java Starter Code'?: string;
  'Java Complete Solution'?: string;
  'JS Starter Code'?: string;
  'JS Complete Solution'?: string;
  'TS Starter Code'?: string;
  'TS Complete Solution'?: string;
  'Hidden Input 1'?: string;
  'Hidden Output 1'?: string;
  'Hidden Input 2'?: string;
  'Hidden Output 2'?: string;
  'Hidden Input 3'?: string;
  'Hidden Output 3'?: string;
  'Hidden Input 4'?: string;
  'Hidden Output 4'?: string;
  'Hidden Input 5'?: string;
  'Hidden Output 5'?: string;
  'Visible Stdin Input 1'?: string;
  'Visible Stdin Input 2'?: string;
  'Visible Stdin Input 3'?: string;
  'Hidden Stdin Input 1'?: string;
  'Hidden Stdin Input 2'?: string;
  'Hidden Stdin Input 3'?: string;
  'Hidden Stdin Input 4'?: string;
  'Hidden Stdin Input 5'?: string;
  'Stdin Conversion Status'?: string;
  'Stdin Format Notes'?: string;
}

export function deduplicateTestCases<T extends { input: string; expectedOutput: string }>(
  tests: T[]
): { uniqueTests: T[]; removedCount: number } {
  const seen = new Set<string>();
  const uniqueTests: T[] = [];
  let removedCount = 0;

  for (const t of tests) {
    const normIn = normalizeTestInput(t.input || '').trim();
    const normOut = (t.expectedOutput || '').trim();
    const key = `${normIn}::${normOut}`;

    if (seen.has(key)) {
      removedCount++;
    } else {
      seen.add(key);
      uniqueTests.push(t);
    }
  }

  return { uniqueTests, removedCount };
}

const V1_STARTER_TEMPLATES = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Read input according to the Input Format
    // Write solution here
    return 0;
}`,
  python: `def main():
    # Read input according to the Input Format
    # Write solution here
    pass

if __name__ == "__main__":
    main()`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Read input according to the Input Format
        // Write solution here
    }
}`,
  javascript: `const fs = require("fs");

function main() {
    const input = fs.readFileSync(0, "utf-8").trim();
    if (!input) return;
    // Read input according to the Input Format
    // Write solution here
}

main();`,
  typescript: `import * as fs from "fs";

function main() {
    const input = fs.readFileSync(0, "utf-8").trim();
    if (!input) return;
    // Read input according to the Input Format
    // Write solution here
}

main();`,
};

interface TopicCorrection {
  problemTitle: string;
  slug: string;
  excelTopic: string;
  suggestedTopic: string;
  secondaryTopics: string[];
  reason: string;
  confidence: number;
}

export function runMasterSheetPipeline(sampleOnlyCount?: number) {
  console.log(`=============================================================`);
  console.log(`🚀 PrepGenie DSA Master Sheet Import Pipeline (DSA V1)`);
  console.log(`=============================================================`);

  // -------------------------------------------------------------------------
  // PHASE 1: Read Converted Excel Sheet
  // -------------------------------------------------------------------------
  const excelCandidates = [
    path.join(process.cwd(), 'DSA_Master_Sheet_Stdin_Converted.xlsx'),
    path.join(process.cwd(), '..', 'DSA_Master_Sheet_Stdin_Converted.xlsx'),
    path.join(process.cwd(), 'DSA_Master_Sheet_Repaired_Test_Cases.xlsx'),
    path.join(process.cwd(), '..', 'DSA_Master_Sheet_Repaired_Test_Cases.xlsx'),
  ];
  const excelPath = excelCandidates.find((p) => fs.existsSync(p));

  if (!excelPath) {
    console.error(`❌ Error: Master Excel sheet (DSA_Master_Sheet_Stdin_Converted.xlsx) not found.`);
    return;
  }

  console.log(`\n[Phase 1] Reading Excel file from: ${excelPath}`);
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const rawRows: RawExcelRow[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Filter non-empty rows
  const validRows = rawRows.filter((r) => r['Problem Name'] || r['Problem ID']);
  console.log(`✓ Read ${validRows.length} problem rows from sheet "${sheetName}".`);

  // Data directories setup
  const dataDir = findDataDir();
  const problemsDir = path.join(dataDir, 'problems');
  if (!fs.existsSync(problemsDir)) fs.mkdirSync(problemsDir, { recursive: true });

  // -------------------------------------------------------------------------
  // PHASE 2: Topic Misclassification Analysis & Resolution
  // -------------------------------------------------------------------------
  console.log(`\n[Phase 2] Analyzing & Resolving Primary vs Secondary Topics...`);

  const topicCorrections: TopicCorrection[] = [];
  const processedProblems: Array<{
    row: RawExcelRow;
    slug: string;
    primaryTopic: string;
    secondaryTopics: string[];
    pattern: string;
    technique: string;
  }> = [];

  for (const row of validRows) {
    const rawTitle = String(row['Problem Name'] || '').trim();
    let slug = String(row['Problem ID'] || '').trim();
    if (!slug || slug.length < 2) {
      slug = slugify(rawTitle.replace(/\s*\([^)]*\)/g, ''));
    }
    // Handle specific design duplicates in Excel
    if (rawTitle.toLowerCase().includes('(design)') && (slug === 'lru-cache' || slug === 'min-stack')) {
      slug = `${slug}-design`;
    }

    const originalTopic = String(row['Primary Topic'] || 'Arrays').trim();
    const pattern = String(row['Pattern'] || '').trim();
    const titleLower = rawTitle.toLowerCase();
    const patternLower = pattern.toLowerCase();

    let primaryTopic = slugify(originalTopic);
    let secondaryTopics = String(row['Secondary Topics'] || '')
      .split(',')
      .map((s) => slugify(s.trim()))
      .filter(Boolean);

    let corrected = false;
    let reason = '';
    let confidence = 0;
    let suggestedTopic = primaryTopic;

    // Rule 1: Largest Rectangle in Histogram -> Primary: stack
    if (titleLower.includes('largest rectangle in histogram') || slug.includes('largest-rectangle-in-histogram')) {
      if (primaryTopic !== 'stack') {
        suggestedTopic = 'stack';
        if (!secondaryTopics.includes('arrays')) secondaryTopics.push('arrays');
        if (!secondaryTopics.includes('monotonic-stack')) secondaryTopics.push('monotonic-stack');
        reason = 'Problem uses Monotonic Stack for optimal boundary calculation';
        confidence = 0.98;
        corrected = true;
      }
    }
    // Rule 2: Word Search -> Primary: backtracking
    else if (titleLower.includes('word search') || slug.includes('word-search')) {
      if (primaryTopic !== 'backtracking') {
        suggestedTopic = 'backtracking';
        if (!secondaryTopics.includes('dfs')) secondaryTopics.push('dfs');
        if (!secondaryTopics.includes('matrix')) secondaryTopics.push('matrix');
        reason = 'Grid word search requires backtracking with DFS state reversal';
        confidence = 0.95;
        corrected = true;
      }
    }
    // Rule 3: Best Time to Buy and Sell Stock I -> Primary: greedy
    else if (
      titleLower.includes('best time to buy and sell stock') &&
      !titleLower.includes('ii') &&
      !titleLower.includes('iii') &&
      !titleLower.includes('iv') &&
      !titleLower.includes('cooldown') &&
      !titleLower.includes('transaction fee')
    ) {
      if (primaryTopic !== 'greedy') {
        suggestedTopic = 'greedy';
        if (!secondaryTopics.includes('dynamic-programming')) secondaryTopics.push('dynamic-programming');
        reason = 'Single-pass min-price tracking is Greedy O(N). DP is secondary representation';
        confidence = 0.95;
        corrected = true;
      }
    }
    // General Heuristics
    else if (patternLower.includes('monotonic stack') || patternLower.includes('next greater element')) {
      if (primaryTopic !== 'stack') {
        suggestedTopic = 'stack';
        reason = 'Pattern specifies Monotonic Stack';
        confidence = 0.90;
        corrected = true;
      }
    } else if (patternLower.includes('kadane') || patternLower.includes('sliding window')) {
      if (primaryTopic === 'strings' && (titleLower.includes('subarray') || titleLower.includes('sum'))) {
        suggestedTopic = 'arrays';
        reason = 'Subarray numeric operations belong to Arrays';
        confidence = 0.90;
        corrected = true;
      }
    }

    if (corrected) {
      topicCorrections.push({
        problemTitle: rawTitle,
        slug,
        excelTopic: originalTopic,
        suggestedTopic,
        secondaryTopics,
        reason,
        confidence,
      });
      primaryTopic = suggestedTopic;
    }

    processedProblems.push({
      row,
      slug,
      primaryTopic,
      secondaryTopics,
      pattern: pattern || primaryTopic,
      technique: String(row['Technique'] || '').trim(),
    });
  }

  console.log(`✓ Topic Analysis Complete: ${topicCorrections.length} refinements applied.`);

  // -------------------------------------------------------------------------
  // PHASE 3: Import Problems, Test Cases, Reference Solutions & Dynamic Guides
  // -------------------------------------------------------------------------
  const problemsToProcess = sampleOnlyCount ? processedProblems.slice(0, sampleOnlyCount) : processedProblems;
  console.log(`\n[Phase 3] Processing & Importing ${problemsToProcess.length} Problems...`);

  const masterSlugs = new Set<string>();
  let importedCount = 0;
  let v1ReadyCount = 0;
  let v2PendingCount = 0;
  let totalVisibleDedup = 0;
  let totalHiddenDedup = 0;

  for (const item of problemsToProcess) {
    const row = item.row;
    const slug = item.slug;
    masterSlugs.add(slug);

    const folderPath = path.join(problemsDir, slug);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const rawTitle = String(row['Problem Name'] || slug).trim();
    const cleanTitle = rawTitle.replace(/\s*\([^)]*\)/g, '').trim() || rawTitle;

    const difficultyStr = String(row['Difficulty'] || 'Medium').toUpperCase();
    const difficulty: 'EASY' | 'MEDIUM' | 'HARD' = difficultyStr.includes('EASY')
      ? 'EASY'
      : difficultyStr.includes('HARD')
      ? 'HARD'
      : 'MEDIUM';

    // Status: OK vs REVIEW
    const stdinStatus = String(row['Stdin Conversion Status'] || 'OK').trim();
    const isV2Pending = stdinStatus === 'REVIEW';
    const executionStatus = isV2Pending ? 'V2_PENDING' : 'V1_READY';
    const stdinFormatNotes = String(row['Stdin Format Notes'] || '').trim();

    if (isV2Pending) {
      v2PendingCount++;
    } else {
      v1ReadyCount++;
    }

    // Parse resource links
    const resources: ResourceLink[] = [];
    const lcLink = String(row['LeetCode Link'] || '').trim();
    if (lcLink && lcLink.startsWith('http')) {
      resources.push({ type: 'leetcode', url: lcLink });
    }
    const gfgLink = String(row['GeeksForGeeks Link'] || '').trim();
    if (gfgLink && gfgLink.startsWith('http')) {
      resources.push({ type: 'gfg', url: gfgLink });
    }

    // Leetcode number if any
    let leetcodeNumber: number | undefined;
    if (lcLink) {
      const match = lcLink.match(/\/problems\/[^\/]+\/?(\d+)?/);
      if (match && match[1]) leetcodeNumber = parseInt(match[1], 10);
    }

    // Data structures & tags
    const dsList = String(row['Data Structures Used'] || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const tagList = String(row['Tags'] || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const companyList = String(row['Companies'] || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const keywords = Array.from(
      new Set([...dsList, ...tagList, item.primaryTopic, item.pattern, item.technique])
    ).filter(Boolean);

    // ─────────────────────────────────────────────────────────────────────────
    // Extract Test Cases Directly from Converted Excel (Visible 1..3, Hidden 1..5)
    // ─────────────────────────────────────────────────────────────────────────
    const excelVisibleTests: TestCaseSpec[] = [];
    for (let i = 1; i <= 3; i++) {
      const stdinVal = row[`Visible Stdin Input ${i}` as keyof RawExcelRow];
      const rawInVal = row[`Visible Input ${i}` as keyof RawExcelRow];
      const inVal = stdinVal !== undefined && stdinVal !== null && String(stdinVal).trim().length > 0
        ? stdinVal
        : rawInVal;
      const outVal = row[`Visible Output ${i}` as keyof RawExcelRow];
      const expVal = row[`Visible Explanation ${i}` as keyof RawExcelRow];

      if (inVal !== undefined && inVal !== null && String(inVal).trim().length > 0) {
        const testCase = serializeV1TestCase(
          String(inVal).trim(),
          outVal !== undefined && outVal !== null ? String(outVal).trim() : '',
          `sample-${i}`,
          'sample',
          expVal ? String(expVal).trim() : `Sample test ${i} for ${cleanTitle}`
        );
        if (rawInVal) testCase.displayInput = String(rawInVal).trim();
        if (isV2Pending) testCase.serializationStatus = 'manual_required';
        excelVisibleTests.push(testCase);
      }
    }

    const excelHiddenTests: TestCaseSpec[] = [];
    for (let i = 1; i <= 5; i++) {
      const stdinVal = row[`Hidden Stdin Input ${i}` as keyof RawExcelRow];
      const rawInVal = row[`Hidden Input ${i}` as keyof RawExcelRow];
      const inVal = stdinVal !== undefined && stdinVal !== null && String(stdinVal).trim().length > 0
        ? stdinVal
        : rawInVal;
      const outVal = row[`Hidden Output ${i}` as keyof RawExcelRow];
      const purpVal = row[`Hidden Test Purpose ${i}` as keyof RawExcelRow];

      if (inVal !== undefined && inVal !== null && String(inVal).trim().length > 0) {
        const testCase = serializeV1TestCase(
          String(inVal).trim(),
          outVal !== undefined && outVal !== null ? String(outVal).trim() : '',
          `hidden-${i}`,
          'hidden',
          purpVal ? String(purpVal).trim() : `Hidden test ${i} for ${cleanTitle}`
        );
        if (rawInVal) testCase.displayInput = String(rawInVal).trim();
        if (isV2Pending) testCase.serializationStatus = 'manual_required';
        excelHiddenTests.push(testCase);
      }
    }

    // Deduplicate Visible tests first
    const visDedup = deduplicateTestCases(excelVisibleTests);
    const visibleTests = visDedup.uniqueTests;

    // Deduplicate Hidden tests against visible tests and prior hidden tests
    const seenTestKeys = new Set(visibleTests.map((t) => `${normalizeTestInput(t.input || '').trim()}::${(t.expectedOutput || '').trim()}`));
    const hiddenTests: TestCaseSpec[] = [];
    let hidRemovedCount = 0;

    for (const ht of excelHiddenTests) {
      const key = `${normalizeTestInput(ht.input || '').trim()}::${(ht.expectedOutput || '').trim()}`;
      if (seenTestKeys.has(key)) {
        hidRemovedCount++;
      } else {
        seenTestKeys.add(key);
        hiddenTests.push(ht);
      }
    }

    if (visDedup.removedCount > 0 || hidRemovedCount > 0) {
      totalVisibleDedup += visDedup.removedCount;
      totalHiddenDedup += hidRemovedCount;
      console.log(
        `  [Deduplication] ${slug}: Removed ${visDedup.removedCount} duplicate visible, ${hidRemovedCount} duplicate hidden test cases.`
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Reference Solutions: Verbatim Source of Truth from Excel Columns
    // ─────────────────────────────────────────────────────────────────────────
    const cppSol = String(row['C++ Complete Solution'] || '').trim();
    const pySol = String(row['Python Complete Solution'] || '').trim();
    const javaSol = String(row['Java Complete Solution'] || '').trim();
    const jsSol = String(row['JS Complete Solution'] || '').trim();
    const tsSol = String(row['TS Complete Solution'] || '').trim();

    const solutionsDir = path.join(folderPath, 'solutions');
    if (!fs.existsSync(solutionsDir)) fs.mkdirSync(solutionsDir, { recursive: true });

    const referenceSolutions: Record<string, string> = {
      cpp: cppSol,
      python: pySol,
      java: javaSol,
      javascript: jsSol,
      typescript: tsSol,
    };

    // Write solution files
    if (referenceSolutions.cpp) fs.writeFileSync(path.join(solutionsDir, 'reference.cpp'), referenceSolutions.cpp, 'utf-8');
    if (referenceSolutions.python) fs.writeFileSync(path.join(solutionsDir, 'reference.py'), referenceSolutions.python, 'utf-8');
    if (referenceSolutions.java) fs.writeFileSync(path.join(solutionsDir, 'reference.java'), referenceSolutions.java, 'utf-8');
    if (referenceSolutions.javascript) fs.writeFileSync(path.join(solutionsDir, 'reference.js'), referenceSolutions.javascript, 'utf-8');
    if (referenceSolutions.typescript) fs.writeFileSync(path.join(solutionsDir, 'reference.ts'), referenceSolutions.typescript, 'utf-8');

    // ─────────────────────────────────────────────────────────────────────────
    // Dynamic Input Guide (Problem-Specific Input Helper)
    // ─────────────────────────────────────────────────────────────────────────
    const sampleInputStr = visibleTests[0]?.input || (row['Visible Stdin Input 1'] ? String(row['Visible Stdin Input 1']).trim() : row['Visible Input 1'] ? String(row['Visible Input 1']).trim() : '');
    const inputHelper = buildProblemInputHelper(
      cleanTitle,
      item.primaryTopic,
      sampleInputStr,
      dsList
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Construct problem.json
    // ─────────────────────────────────────────────────────────────────────────
    const problemJson: DSAProblemMetadata & {
      inputHelper?: typeof inputHelper;
      referenceSolutions?: typeof referenceSolutions;
      starterCode?: typeof V1_STARTER_TEMPLATES;
      inputFormat?: string;
      outputFormat?: string;
      stdinStatus?: string;
      executionStatus?: string;
      isV2Pending?: boolean;
      stdinFormatNotes?: string;
    } = {
      id: slug,
      schemaVersion: '2.0',
      contentVersion: '1.1',
      importVersion: 'stdin-converted-master-v1',
      lastReviewed: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      author: 'PrepGenie Content Team',
      reviewStatus: isV2Pending ? 'reviewed' : 'published',
      stdinStatus,
      executionStatus,
      isV2Pending,
      stdinFormatNotes,

      questionNo:
        typeof row['Question No.'] === 'number'
          ? row['Question No.']
          : parseInt(String(row['Question No.'] || '0'), 10),
      slug: slug,
      title: cleanTitle,
      difficulty: difficulty,
      importance: String(row['Importance'] || '4/5').trim(),
      interviewFrequency: String(row['Interview Frequency'] || 'High').trim(),
      estimatedSolveTime: String(row['Estimated Solve Time'] || '20 mins').trim(),
      leetcodeNumber: leetcodeNumber,
      estimatedMinutes: parseInt(String(row['Estimated Solve Time'] || '20').replace(/\D/g, ''), 10) || 20,
      frequency: 85,
      acceptanceRate: 65,
      premium: false,

      topic: item.primaryTopic,
      topicId: item.primaryTopic,
      primaryTopic: item.primaryTopic,
      secondaryTopics: item.secondaryTopics,
      pattern: item.pattern,
      patternId: slugify(item.pattern),
      technique: item.technique,
      techniqueId: slugify(item.technique),
      dataStructuresUsed: dsList,
      learningPath: String(row['Learning Path'] || 'Core DSA Track').trim(),
      learningPaths: [String(row['Learning Path'] || 'Core DSA Track').trim()],

      description: String(row['Description'] || `Solve ${cleanTitle} optimally.`).trim(),
      inputFormat: inputHelper.inputFormat,
      outputFormat: 'Standard output stream containing the computed result.',
      whyLearnThis: String(row['Why Learn This?'] || `Fundamental problem for mastering ${item.primaryTopic}.`).trim(),
      recognitionClues: String(row['Recognition Clues'] || `Look for problem patterns requiring ${item.pattern}.`).trim(),
      prerequisites: String(row['Prerequisites (Concepts)'] || 'Basic programming, Arrays, Loops').trim(),
      concepts: String(row['Concepts Used'] || `${item.primaryTopic}, ${item.pattern}`).trim(),
      keywords: keywords,
      tags: tagList.length ? tagList : [item.primaryTopic],
      companies: companyList.length ? companyList : ['Amazon', 'Google', 'Microsoft'],

      constraints: [
        '1 <= input length <= 10^5',
        'Standard execution time limit: 2.0s',
        'Standard memory limit: 256MB',
      ],

      examples: visibleTests.map((vt) => ({
        input: vt.displayInput || vt.input,
        output: vt.expectedOutput,
        explanation: vt.explanation,
      })),

      hints: [
        String(row['Hint 1'] || `Analyze the constraints and boundary conditions for ${cleanTitle}.`).trim(),
        String(row['Hint 2'] || `Consider using ${item.pattern} to optimize time complexity.`).trim(),
        String(row['Hint 3'] || `Verify edge cases such as empty input or extreme values.`).trim(),
      ],

      optimalTC: String(row['Optimal TC'] || 'O(N)').trim(),
      optimalSC: String(row['Optimal SC'] || 'O(1)').trim(),
      bruteTC: String(row['Brute TC'] || 'O(N^2)').trim(),
      bruteSC: String(row['Brute SC'] || 'O(1)').trim(),

      approach: String(row['Approach'] || `Use ${item.pattern} with optimal time complexity ${row['Optimal TC'] || 'O(N)'}.`).trim(),
      intuition: String(row['Intuition'] || `Identify key invariants to reduce redundant calculations.`).trim(),
      algorithm: String(row['Algorithm'] || `1. Read input from stdin.\n2. Apply ${item.pattern}.\n3. Print result to stdout.`).trim(),
      pseudocode: String(row['Pseudocode'] || `// Solution for ${cleanTitle}\n// Read input -> Process -> Output`).trim(),
      commonMistakes: [String(row['Common Mistakes'] || 'Not handling empty inputs or boundary values.').trim()],
      edgeCases: [String(row['Edge Cases'] || 'Minimum input size, single element, negative values.').trim()],
      interviewTrick: String(row['Interview Trick'] || 'Focus on invariant preservation and spatial optimization.').trim(),
      revisionNotes: String(row['Revision Notes'] || `Key ${item.primaryTopic} question frequently asked in technical interviews.`).trim(),

      resources: resources,
      inputHelper,
      referenceSolutions,
      starterCode: V1_STARTER_TEMPLATES,

      relationships: {
        prerequisites: [],
        followUps: String(row['Follow-ups'] || '').split(',').map((s) => s.trim()).filter(Boolean),
        variants: String(row['Variants'] || '').split(',').map((s) => s.trim()).filter(Boolean),
        related: String(row['Related Problems'] || '').split(',').map((s) => s.trim()).filter(Boolean),
      },

      visibleTests,
      hiddenTests,
    };

    // Save problem.json
    fs.writeFileSync(path.join(folderPath, 'problem.json'), JSON.stringify(problemJson, null, 2), 'utf-8');

    // Save tests.json
    const allTests = [...visibleTests, ...hiddenTests];
    fs.writeFileSync(path.join(folderPath, 'tests.json'), JSON.stringify(allTests, null, 2), 'utf-8');

    // Save editorial.md
    const editorialMd = `# ${cleanTitle} — Editorial

## Overview
${problemJson.description}

## Why Learn This?
${problemJson.whyLearnThis}

## Recognition Clues
${problemJson.recognitionClues}

## Prerequisites
${problemJson.prerequisites}

## Concepts Used
${problemJson.concepts}

## Intuition & Approach
### Intuition
${problemJson.intuition}

### Approach
${problemJson.approach}

## Step-by-Step Algorithm
${problemJson.algorithm}

## Pseudocode
\`\`\`text
${problemJson.pseudocode}
\`\`\`

## Complexity Analysis
- **Optimal Time Complexity:** ${problemJson.optimalTC}
- **Optimal Space Complexity:** ${problemJson.optimalSC}
- **Brute Force Time Complexity:** ${problemJson.bruteTC}
- **Brute Force Space Complexity:** ${problemJson.bruteSC}

## Common Mistakes & Gotchas
${(problemJson.commonMistakes || []).map((m) => `- ${m}`).join('\n')}

## Edge Cases to Consider
${(problemJson.edgeCases || []).map((e) => `- ${e}`).join('\n')}

## Interview Trick
${problemJson.interviewTrick}

## Revision Notes
${problemJson.revisionNotes}
`;
    fs.writeFileSync(path.join(folderPath, 'editorial.md'), editorialMd, 'utf-8');

    // Save hints.md
    const hintsMd = problemJson.hints.join('\n---\n');
    fs.writeFileSync(path.join(folderPath, 'hints.md'), hintsMd, 'utf-8');

    importedCount++;
  }

  // -------------------------------------------------------------------------
  // PHASE 4: Clean up non-Excel problem folders
  // -------------------------------------------------------------------------
  if (!sampleOnlyCount) {
    console.log(`\n[Phase 4] Reconciling problem directory with Master Excel sheet...`);
    const existingFolders = fs.readdirSync(problemsDir).filter((f) => {
      try {
        return fs.statSync(path.join(problemsDir, f)).isDirectory();
      } catch {
        return false;
      }
    });

    let removedExtraCount = 0;
    for (const folder of existingFolders) {
      if (!masterSlugs.has(folder)) {
        const extraPath = path.join(problemsDir, folder);
        try {
          fs.rmSync(extraPath, { recursive: true, force: true });
          removedExtraCount++;
          console.log(`  • Removed obsolete non-master folder: ${folder}`);
        } catch (err) {
          console.warn(`  • Could not remove ${folder}: ${(err as Error).message}`);
        }
      }
    }

    console.log(`✓ Directory reconciliation complete: ${importedCount} master problems active (removed ${removedExtraCount} obsolete folders).`);
  }

  // -------------------------------------------------------------------------
  // PHASE 5: Build derived search index cache (search-index.json)
  // -------------------------------------------------------------------------
  console.log(`\n[Phase 5] Generating derived search index cache (search-index.json)...`);
  const searchIndexItems: any[] = [];

  for (const item of processedProblems) {
    const slug = item.slug;
    const jsonPath = path.join(problemsDir, slug, 'problem.json');
    if (fs.existsSync(jsonPath)) {
      const prob: DSAProblemMetadata & { isV2Pending?: boolean; executionStatus?: string } = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      searchIndexItems.push({
        slug: prob.slug,
        title: prob.title,
        difficulty: prob.difficulty,
        importance: prob.importance,
        interviewFrequency: prob.interviewFrequency,
        estimatedSolveTime: prob.estimatedSolveTime,
        topic: prob.topic,
        primaryTopic: prob.primaryTopic,
        secondaryTopics: prob.secondaryTopics || [],
        pattern: prob.pattern,
        patternId: prob.patternId,
        technique: prob.technique,
        techniqueId: prob.techniqueId,
        companies: prob.companies,
        dataStructuresUsed: prob.dataStructuresUsed || [],
        recognitionClues: prob.recognitionClues || '',
        keywords: prob.keywords || [],
        tags: prob.tags,
        learningPath: prob.learningPath,
        interviewTrick: prob.interviewTrick || '',
        revisionNotes: prob.revisionNotes || '',
        followUps: prob.relationships?.followUps || [],
        variants: prob.relationships?.variants || [],
        relatedProblems: prob.relationships?.related || [],
        resources: prob.resources || [],
        executionStatus: prob.executionStatus || 'V1_READY',
        isV2Pending: !!prob.isV2Pending,
      });
    }
  }

  fs.writeFileSync(path.join(dataDir, 'search-index.json'), JSON.stringify(searchIndexItems, null, 2), 'utf-8');

  console.log(`=============================================================`);
  console.log(`🎉 Master Sheet Import Pipeline Completed Successfully!`);
  console.log(`  • Total Problems Imported: ${importedCount}`);
  console.log(`  • V1 Ready Problems: ${v1ReadyCount}`);
  console.log(`  • Review / V2 Pending: ${v2PendingCount}`);
  console.log(`  • Total Visible Duplicates Removed: ${totalVisibleDedup}`);
  console.log(`  • Total Hidden Duplicates Removed: ${totalHiddenDedup}`);
  console.log(`  • Search Index Cached (${searchIndexItems.length} entries)`);
  console.log(`=============================================================`);
}

if (require.main === module) {
  try {
    runMasterSheetPipeline();
  } catch (err) {
    console.error('Import pipeline error:', (err as Error).message);
    process.exit(1);
  }
}
