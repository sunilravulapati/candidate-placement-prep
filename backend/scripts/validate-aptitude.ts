// backend/scripts/validate-aptitude.ts

import fs from 'fs';
import path from 'path';

export interface AptitudeValidationSummary {
  scanned: number;
  valid: number;
  invalid: number;
  logicalCount: number;
  numericalCount: number;
  verbalCount: number;
  duplicateCount: number;
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
    logicalCount: 0,
    numericalCount: 0,
    verbalCount: 0,
    duplicateCount: 0,
    errorsByQuestion: {},
  };

  const seenIds = new Set<string>();
  const seenQuestionTexts = new Set<string>();

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
            
            // Unique ID check
            if (!raw.id) {
              qErrors.push('Missing id');
            } else if (seenIds.has(raw.id)) {
              qErrors.push(`Duplicate question id: ${raw.id}`);
              summary.duplicateCount++;
            } else {
              seenIds.add(raw.id);
            }

            // Question text
            if (!raw.question || raw.question.trim().length === 0) {
              qErrors.push('Missing question text');
            } else {
              const norm = raw.question.toLowerCase().replace(/[^a-z0-9]/g, '');
              seenQuestionTexts.add(norm);
            }

            // HTML check
            if (raw.question && /<[^>]+>/.test(raw.question)) {
              qErrors.push('Question text contains HTML tags');
            }

            // Options: exactly 4
            if (!Array.isArray(raw.options) || raw.options.length !== 4) {
              qErrors.push(`Must have exactly 4 options (found ${raw.options?.length})`);
            } else {
              for (let i = 0; i < raw.options.length; i++) {
                const opt = raw.options[i];
                if (!opt || String(opt).trim().length === 0) {
                  qErrors.push(`Option ${i + 1} is empty`);
                }
                if (/<[^>]+>/.test(String(opt))) {
                  qErrors.push(`Option ${i + 1} contains HTML tags`);
                }
              }
            }

            // Answer normalization: A/B/C/D or valid text
            const validAnswerKeys = ['A', 'B', 'C', 'D'];
            const ansKey = raw.answerKey || (validAnswerKeys.includes(raw.answer) ? raw.answer : null);
            const ansText = raw.correctAnswer || (Array.isArray(raw.options) && raw.options.includes(raw.answer) ? raw.answer : null);

            if (!ansKey && !ansText) {
              qErrors.push(`Answer "${raw.answer}" is neither a valid key (A/B/C/D) nor in options`);
            }

            // Difficulty: EASY / MEDIUM / HARD
            if (!raw.difficulty || !['EASY', 'MEDIUM', 'HARD'].includes(raw.difficulty.toUpperCase())) {
              qErrors.push(`Invalid difficulty "${raw.difficulty}". Allowed: EASY, MEDIUM, HARD`);
            }

            // Category
            if (!raw.category || !VALID_CATEGORIES.includes(raw.category)) {
              qErrors.push(`Invalid category "${raw.category}"`);
            } else {
              if (raw.category === 'logical') summary.logicalCount++;
              else if (raw.category === 'quantitative') summary.numericalCount++;
              else if (raw.category === 'verbal') summary.verbalCount++;
            }

            // Topic
            if (!raw.topic) {
              qErrors.push('Missing topic');
            }
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

export function printAptitudeReport(summary: AptitudeValidationSummary) {
  console.log(`====================================================`);
  console.log(`               APTITUDE REPORT`);
  console.log(`====================================================\n`);

  console.log(`Total: ${summary.scanned}\n`);
  console.log(`Logical:   ${summary.logicalCount}`);
  console.log(`Numerical: ${summary.numericalCount}`);
  console.log(`Verbal:    ${summary.verbalCount}\n`);

  console.log(`Duplicates:   ${summary.duplicateCount}`);
  console.log(`Invalid rows: ${summary.invalid}\n`);

  if (summary.invalid > 0) {
    console.error('✗ Validation failed for:');
    for (const [id, errs] of Object.entries(summary.errorsByQuestion)) {
      console.error(`\n✗ ${id}:`);
      errs.forEach((e) => console.error(`  - ${e}`));
    }
  } else {
    console.log('✓ All Aptitude questions validated successfully!');
  }
  console.log(`====================================================`);
}

if (require.main === module) {
  try {
    const res = validateAptitudeRepository();
    printAptitudeReport(res);

    if (res.invalid > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Aptitude Validation Error:', (err as Error).message);
    process.exit(1);
  }
}
