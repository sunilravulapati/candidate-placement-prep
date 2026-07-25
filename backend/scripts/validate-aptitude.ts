// backend/scripts/validate-aptitude.ts

import fs from 'fs';
import path from 'path';

interface AptitudeValidationSummary {
  scanned: number;
  valid: number;
  invalid: number;
  errorsByQuestion: Record<string, string[]>;
}

const VALID_CATEGORIES = ['quantitative', 'logical', 'verbal', 'di'];

export function validateAptitudeRepository(): AptitudeValidationSummary {
  const dataDirCandidates = [
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'backend', 'data'),
    path.join(process.cwd(), '..', 'backend', 'data'),
  ];
  const dataDir = dataDirCandidates.find((c) => fs.existsSync(c));
  if (!dataDir) throw new Error('Data directory not found');

  const aptitudeBase = path.join(dataDir, 'aptitude');
  const summary: AptitudeValidationSummary = {
    scanned: 0,
    valid: 0,
    invalid: 0,
    errorsByQuestion: {},
  };

  for (const cat of VALID_CATEGORIES) {
    const catDir = path.join(aptitudeBase, cat);
    if (!fs.existsSync(catDir)) continue;

    const topics = fs.readdirSync(catDir, { withFileTypes: true });
    for (const top of topics) {
      if (!top.isDirectory()) continue;
      const topDir = path.join(catDir, top.name);
      const qFolders = fs.readdirSync(topDir, { withFileTypes: true });

      for (const qf of qFolders) {
        if (!qf.isDirectory()) continue;
        const folderPath = path.join(topDir, qf.name);
        const qErrors: string[] = [];

        summary.scanned++;

        // 1. problem.json
        const pPath = path.join(folderPath, 'problem.json');
        if (!fs.existsSync(pPath)) {
          qErrors.push('Missing problem.json');
        } else {
          try {
            const raw = JSON.parse(fs.readFileSync(pPath, 'utf-8'));
            if (!raw.id) qErrors.push('Missing id');
            if (!raw.question || raw.question.trim().length === 0) qErrors.push('Missing question text');
            if (!Array.isArray(raw.options) || raw.options.length < 2) qErrors.push('Must have at least 2 options');
            if (!raw.answer) qErrors.push('Missing answer');
            if (Array.isArray(raw.options) && raw.answer && !raw.options.includes(raw.answer)) {
              qErrors.push(`Answer "${raw.answer}" is not present in options array`);
            }
            if (!raw.difficulty || !['EASY', 'MEDIUM', 'HARD'].includes(raw.difficulty.toUpperCase())) {
              qErrors.push(`Invalid difficulty "${raw.difficulty}"`);
            }
            if (!raw.category || !VALID_CATEGORIES.includes(raw.category)) {
              qErrors.push(`Invalid category "${raw.category}"`);
            }
            if (!raw.topic) qErrors.push('Missing topic');
          } catch (err) {
            qErrors.push(`Failed parsing problem.json: ${(err as Error).message}`);
          }
        }

        // 2. explanation.md
        const expPath = path.join(folderPath, 'explanation.md');
        if (!fs.existsSync(expPath) || fs.readFileSync(expPath, 'utf-8').trim().length === 0) {
          qErrors.push('Missing or empty explanation.md');
        }

        if (qErrors.length > 0) {
          summary.invalid++;
          summary.errorsByQuestion[`${cat}/${top.name}/${qf.name}`] = qErrors;
        } else {
          summary.valid++;
        }
      }
    }
  }

  return summary;
}

if (require.main === module) {
  try {
    const res = validateAptitudeRepository();
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`✓ ${res.scanned} Aptitude questions scanned`);
    console.log(`✓ ${res.valid} valid`);
    console.log(`${res.invalid} invalid`);
    console.log('─────────────────────────────────────────────────────────────');

    if (res.invalid > 0) {
      console.error('\n✗ Aptitude validation failed for:');
      for (const [id, errs] of Object.entries(res.errorsByQuestion)) {
        console.error(`\n✗ ${id}:`);
        errs.forEach((e) => console.error(`  - ${e}`));
      }
      process.exit(1);
    } else {
      console.log('\n✓ All Aptitude questions validated successfully!');
    }
  } catch (err) {
    console.error('Aptitude Validation Error:', (err as Error).message);
    process.exit(1);
  }
}
