// backend/scripts/validate-content.ts

import fs from 'fs';
import path from 'path';

export interface ValidationSummary {
  scanned: number;
  valid: number;
  warnings: number;
  duplicateSlugs: number;
  missingEditorials: number;
  missingHints: number;
  missingSolutions: number;
  missingExamples: number;
  missingConstraints: number;
  missingCompanies: number;
  invalidCanonicalTypes: number;
  invalidDriverTypes: number;
  missingHiddenTests: number;
  errorsByProblem: Record<string, string[]>;
}

const ALLOWED_DRIVERS = [
  'DEFAULT',
  'LINKED_LIST',
  'TREE',
  'GRAPH',
  'COMMAND_SEQUENCE',
  'MATRIX',
  'INTERACTIVE',
  'SQL',
  'SCRIPT',
  'CUSTOM',
];

export function validateRepository(): ValidationSummary {
  const dataDirCandidates = [
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'backend', 'data'),
    path.join(process.cwd(), '..', 'backend', 'data'),
  ];
  const dataDir = dataDirCandidates.find((c) => fs.existsSync(c));
  if (!dataDir) {
    throw new Error('Backend data directory not found.');
  }

  const problemsDir = path.join(dataDir, 'problems');
  if (!fs.existsSync(problemsDir)) {
    throw new Error(`Problems directory not found at ${problemsDir}`);
  }

  const summary: ValidationSummary = {
    scanned: 0,
    valid: 0,
    warnings: 0,
    duplicateSlugs: 0,
    missingEditorials: 0,
    missingHints: 0,
    missingSolutions: 0,
    missingExamples: 0,
    missingConstraints: 0,
    missingCompanies: 0,
    invalidCanonicalTypes: 0,
    invalidDriverTypes: 0,
    missingHiddenTests: 0,
    errorsByProblem: {},
  };

  const slugs = new Set<string>();
  const entries = fs.readdirSync(problemsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const problemFolder = path.join(problemsDir, entry.name);
    const pErrors: string[] = [];

    summary.scanned++;

    // 1. Check problem.json
    const jsonPath = path.join(problemFolder, 'problem.json');
    if (!fs.existsSync(jsonPath)) {
      pErrors.push('Missing problem.json');
    } else {
      try {
        const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        if (!raw.schemaVersion) pErrors.push('Missing schemaVersion');
        if (!raw.contentVersion) pErrors.push('Missing contentVersion');
        if (!raw.reviewStatus) pErrors.push('Missing reviewStatus');

        if (!raw.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.slug)) {
          pErrors.push(`Invalid slug format: "${raw.slug}"`);
        } else if (slugs.has(raw.slug)) {
          summary.duplicateSlugs++;
          pErrors.push(`Duplicate slug detected: "${raw.slug}"`);
        } else {
          slugs.add(raw.slug);
        }

        if (!raw.title) pErrors.push('Missing title');
        if (!raw.difficulty) pErrors.push('Missing difficulty');
        if (!raw.topic) pErrors.push('Missing topic');

        if (!raw.examples || raw.examples.length === 0) {
          summary.missingExamples++;
        }
        if (!raw.constraints || raw.constraints.length === 0) {
          summary.missingConstraints++;
        }
        if (!raw.companies || raw.companies.length === 0) {
          summary.missingCompanies++;
        }

        // Check starterMetadata
        if (!raw.starterMetadata) {
          pErrors.push('Missing starterMetadata');
        } else if (!raw.starterMetadata.functionName && raw.starterMetadata.problemType !== 'DESIGN') {
          pErrors.push('Missing starterMetadata.functionName');
        }

        // Check executionMetadata
        if (!raw.executionMetadata) {
          pErrors.push('Missing executionMetadata');
        } else if (!raw.executionMetadata.comparator) {
          pErrors.push('Missing executionMetadata.comparator');
        }

        // Check driverMetadata
        if (!raw.driverMetadata) {
          pErrors.push('Missing driverMetadata');
        } else if (!ALLOWED_DRIVERS.includes(raw.driverMetadata.driver)) {
          summary.invalidDriverTypes++;
          pErrors.push(`Invalid driverMetadata.driver: "${raw.driverMetadata.driver}"`);
        }
      } catch (err) {
        pErrors.push(`Failed to parse problem.json: ${(err as Error).message}`);
      }
    }

    // 2. Check editorial.md
    const editorialPath = path.join(problemFolder, 'editorial.md');
    if (!fs.existsSync(editorialPath) || fs.readFileSync(editorialPath, 'utf-8').trim().length === 0) {
      summary.missingEditorials++;
      pErrors.push('Missing or empty editorial.md');
    }

    // 3. Check hints.md
    const hintsPath = path.join(problemFolder, 'hints.md');
    if (!fs.existsSync(hintsPath) || fs.readFileSync(hintsPath, 'utf-8').trim().length === 0) {
      summary.missingHints++;
      pErrors.push('Missing or empty hints.md');
    }

    // 4. Check solutions/ folder
    const solutionsFolder = path.join(problemFolder, 'solutions');
    if (!fs.existsSync(solutionsFolder)) {
      summary.missingSolutions++;
      pErrors.push('Missing solutions/ folder');
    } else {
      const solFiles = fs.readdirSync(solutionsFolder);
      if (solFiles.length === 0) {
        summary.missingSolutions++;
        pErrors.push('solutions/ folder is empty (at least 1 reference solution required)');
      }
    }

    // 5. Check tests.json
    const testsPath = path.join(problemFolder, 'tests.json');
    if (!fs.existsSync(testsPath)) {
      summary.missingHiddenTests++;
      pErrors.push('Missing tests.json');
    } else {
      try {
        const tests = JSON.parse(fs.readFileSync(testsPath, 'utf-8'));
        const hiddenCount = Array.isArray(tests) ? tests.filter((t: any) => t.classification !== 'sample').length : 0;
        if (hiddenCount < 3) {
          summary.missingHiddenTests++;
          pErrors.push(`Fewer than 3 hidden/stress tests found (found ${hiddenCount})`);
        }
      } catch (err) {
        pErrors.push(`Failed to parse tests.json: ${(err as Error).message}`);
      }
    }

    if (pErrors.length > 0) {
      summary.errorsByProblem[entry.name] = pErrors;
    } else {
      summary.valid++;
    }
  }

  return summary;
}

if (require.main === module) {
  try {
    const res = validateRepository();
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`✓ ${res.scanned} problems scanned`);
    console.log(`✓ ${res.valid} valid`);
    console.log(`${res.warnings} warnings`);
    console.log(`${res.duplicateSlugs} duplicate slugs`);
    console.log(`${res.missingEditorials} missing editorials`);
    console.log(`${res.missingHints} missing hints`);
    console.log(`${res.missingSolutions} missing solutions`);
    console.log(`${res.invalidCanonicalTypes} invalid canonical types`);
    console.log(`${res.invalidDriverTypes} invalid driver types`);
    console.log(`${res.missingHiddenTests} missing hidden tests`);
    console.log('─────────────────────────────────────────────────────────────');

    if (res.valid < res.scanned) {
      console.error('\n✗ Content validation failed for the following problems:');
      for (const [slug, errs] of Object.entries(res.errorsByProblem)) {
        console.error(`\n✗ ${slug}:`);
        errs.forEach((e) => console.error(`  - ${e}`));
      }
      process.exit(1);
    } else {
      console.log('\n✓ All DSA content validated successfully!');
    }
  } catch (err) {
    console.error('Validation Script Error:', (err as Error).message);
    process.exit(1);
  }
}
