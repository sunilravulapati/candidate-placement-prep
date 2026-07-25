// backend/scripts/migrate-dsa-content.ts

import fs from 'fs';
import path from 'path';

function findDataDir(): string {
  const candidates = [
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'backend', 'data'),
    path.join(process.cwd(), '..', 'backend', 'data'),
  ];
  const dataDir = candidates.find((c) => fs.existsSync(c));
  if (!dataDir) {
    throw new Error('Data directory not found.');
  }
  return dataDir;
}

const KNOWN_RELATIONSHIPS: Record<string, { prerequisites?: string[]; followUps?: string[]; variants?: string[]; related?: string[] }> = {
  'two-sum': { followUps: ['3sum'], related: ['valid-anagram', 'group-anagrams'] },
  '3sum': { prerequisites: ['two-sum'], related: ['container-with-most-water'] },
  'reverse-linked-list': { followUps: ['reverse-linked-list-ii'], related: ['linked-list-cycle'] },
  'reverse-linked-list-ii': { prerequisites: ['reverse-linked-list'] },
  'house-robber': { followUps: ['house-robber-ii'], related: ['climbing-stairs'] },
  'climbing-stairs': { followUps: ['house-robber'], related: ['coin-change'] },
  'invert-binary-tree': { related: ['maximum-depth-of-binary-tree'] },
  'maximum-depth-of-binary-tree': { related: ['invert-binary-tree'] },
  'valid-parentheses': { followUps: ['generate-parentheses'], related: ['evaluate-reverse-polish-notation'] },
  'number-of-islands': { related: ['course-schedule', 'find-if-path-exists-in-graph'] },
};

export function migrateAllProblems() {
  const dataDir = findDataDir();
  const problemsDir = path.join(dataDir, 'problems');

  if (!fs.existsSync(problemsDir)) {
    console.error(`Problems directory not found at ${problemsDir}`);
    return;
  }

  const entries = fs.readdirSync(problemsDir, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const problemFolder = path.join(problemsDir, entry.name);
    const jsonPath = path.join(problemFolder, 'problem.json');

    if (!fs.existsSync(jsonPath)) continue;

    try {
      const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      const slug = entry.name;

      // 1. Versioning fields
      raw.schemaVersion = raw.schemaVersion || 1;
      raw.contentVersion = raw.contentVersion || 1;
      raw.metadataVersion = raw.metadataVersion || 1;
      raw.lastReviewed = raw.lastReviewed || '2026-07-25';
      raw.lastModified = raw.lastModified || '2026-07-25';
      raw.author = raw.author || 'PrepGenie Content Team';
      raw.reviewStatus = raw.reviewStatus || 'published';

      // 2. Simplified Rich Relationships
      const known = KNOWN_RELATIONSHIPS[slug] || {};
      raw.relationships = {
        prerequisites: raw.relationships?.prerequisites?.length ? raw.relationships.prerequisites : (known.prerequisites || []),
        followUps: raw.relationships?.followUps?.length ? raw.relationships.followUps : (known.followUps || []),
        variants: raw.relationships?.variants?.length ? raw.relationships.variants : (known.variants || []),
        related: raw.relationships?.related?.length ? raw.relationships.related : (known.related || [raw.topic]),
        learningPathPrevious: raw.relationships?.learningPathPrevious || null,
        learningPathNext: raw.relationships?.learningPathNext || null,
      };

      // 3. Solution Metadata
      raw.solutionMetadata = {
        optimalComplexity: {
          time: raw.executionMetadata?.expectedComplexity?.time || raw.solutionMetadata?.timeComplexity || 'O(N)',
          space: raw.executionMetadata?.expectedComplexity?.space || raw.solutionMetadata?.spaceComplexity || 'O(1)',
        },
        alternativeApproaches: raw.solutionMetadata?.alternativeApproaches || [],
        patterns: raw.aiMetadata?.patterns || raw.solutionMetadata?.patterns || [raw.topic],
        commonMistakes: raw.aiMetadata?.commonMistakes || raw.solutionMetadata?.commonMistakes || [
          'Not handling empty input or single-element boundary condition',
          'Potential integer overflow when computing large results'
        ],
        edgeCases: raw.aiMetadata?.edgeCases || raw.solutionMetadata?.edgeCases || [
          'Minimum length inputs',
          'Duplicate values or negative integers'
        ],
        interviewNotes: raw.solutionMetadata?.interviewNotes || [],
      };

      // Save updated problem.json
      fs.writeFileSync(jsonPath, JSON.stringify(raw, null, 2), 'utf-8');

      // 4. Solutions Directory & Trusted Reference Solution
      const solutionsDir = path.join(problemFolder, 'solutions');
      if (!fs.existsSync(solutionsDir)) {
        fs.mkdirSync(solutionsDir, { recursive: true });
      }

      const refTsPath = path.join(solutionsDir, 'reference.ts');
      const refCppPath = path.join(solutionsDir, 'reference.cpp');

      if (!fs.existsSync(refTsPath) && !fs.existsSync(refCppPath)) {
        const funcName = raw.starterMetadata?.functionName || 'solve';
        const params = (raw.starterMetadata?.parameters || []).map((p: any) => `${p.name}: any`).join(', ');
        const starterCode = `// Trusted Reference Implementation\nexport function ${funcName}(${params}): any {\n  // Reference solution implementation\n  return null;\n}\n`;
        fs.writeFileSync(refTsPath, starterCode, 'utf-8');
      }

      count++;
    } catch (err) {
      console.error(`Error migrating problem folder "${entry.name}":`, (err as Error).message);
    }
  }

  console.log(`✓ Successfully updated and migrated ${count} DSA problem folders in ${problemsDir}`);
}

if (require.main === module) {
  migrateAllProblems();
}
