// backend/scripts/bulk-update.ts

import fs from 'fs';
import path from 'path';

function parseArgs() {
  const args = process.argv.slice(2);
  const params: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const parts = args[i].replace(/^--/, '').split('=');
      const key = parts[0];
      const val = parts[1] || (args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : 'true');
      params[key] = val;
    }
  }
  return params;
}

export function bulkUpdateCLI() {
  const params = parseArgs();

  const addCompany = params['add-company'];
  const removeCompany = params['remove-company'];
  const addPath = params['add-learning-path'];
  const removePath = params['remove-learning-path'];
  const setStatus = params['set-review-status'];
  const filterTopic = params['filter-topic'];
  const filterDifficulty = params['filter-difficulty'];
  const isDryRun = params['dry-run'] === 'true' || params['dry-run'] === '1';

  const dataDirCandidates = [
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'backend', 'data'),
    path.join(process.cwd(), '..', 'backend', 'data'),
  ];
  const dataDir = dataDirCandidates.find((c) => fs.existsSync(c));
  if (!dataDir) {
    console.error('Data directory not found.');
    process.exit(1);
  }

  const problemsDir = path.join(dataDir, 'problems');
  if (!fs.existsSync(problemsDir)) {
    console.error(`Problems directory not found at ${problemsDir}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(problemsDir, { withFileTypes: true });
  let updatedCount = 0;

  console.log('─────────────────────────────────────────────────────────────');
  console.log(`🔧 BULK CONTENT UPDATE TOOL ${isDryRun ? '(DRY RUN MODE)' : ''}`);
  console.log('─────────────────────────────────────────────────────────────');

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const jsonPath = path.join(problemsDir, entry.name, 'problem.json');
    if (!fs.existsSync(jsonPath)) continue;

    try {
      const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      if (filterTopic && raw.topic !== filterTopic) continue;
      if (filterDifficulty && raw.difficulty !== filterDifficulty.toUpperCase()) continue;

      let modified = false;

      // Add Company
      if (addCompany) {
        raw.companies = raw.companies || [];
        if (!raw.companies.includes(addCompany)) {
          raw.companies.push(addCompany);
          modified = true;
        }
      }

      // Remove Company
      if (removeCompany && raw.companies) {
        const initialLen = raw.companies.length;
        raw.companies = raw.companies.filter((c: string) => c.toLowerCase() !== removeCompany.toLowerCase());
        if (raw.companies.length !== initialLen) modified = true;
      }

      // Add Learning Path
      if (addPath) {
        raw.learningPaths = raw.learningPaths || [];
        if (!raw.learningPaths.includes(addPath)) {
          raw.learningPaths.push(addPath);
          modified = true;
        }
      }

      // Remove Learning Path
      if (removePath && raw.learningPaths) {
        const initialLen = raw.learningPaths.length;
        raw.learningPaths = raw.learningPaths.filter((p: string) => p.toLowerCase() !== removePath.toLowerCase());
        if (raw.learningPaths.length !== initialLen) modified = true;
      }

      // Set Review Status
      if (setStatus) {
        if (raw.reviewStatus !== setStatus) {
          raw.reviewStatus = setStatus;
          modified = true;
        }
      }

      if (modified) {
        raw.lastModified = new Date().toISOString().split('T')[0];
        updatedCount++;
        console.log(`  [UPDATED] ${entry.name}`);
        if (!isDryRun) {
          fs.writeFileSync(jsonPath, JSON.stringify(raw, null, 2), 'utf-8');
        }
      }
    } catch (err) {
      console.error(`  [ERROR] ${entry.name}: ${(err as Error).message}`);
    }
  }

  console.log('─────────────────────────────────────────────────────────────');
  console.log(`✓ Bulk update completed! Total problems updated: ${updatedCount}`);
  if (isDryRun) {
    console.log('💡 Note: Dry run mode active. No changes were written to disk.');
  }
}

if (require.main === module) {
  bulkUpdateCLI();
}
