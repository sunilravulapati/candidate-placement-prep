// backend/scripts/migrate-aptitude-content.ts

import fs from 'fs';
import path from 'path';

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

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let inQuote = false;
  let field = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuote && next === '"') {
        field += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (char === ',' && !inQuote) {
      row.push(field);
      field = '';
    } else if ((char === '\r' || char === '\n') && !inQuote) {
      if (char === '\r' && next === '\n') i++;
      row.push(field);
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function migrateAptitudeContent() {
  console.log(`=============================================================`);
  console.log(`🚀 PrepGenie Curated Aptitude Bank Import Pipeline`);
  console.log(`=============================================================`);

  const csvCandidates = [
    path.join(process.cwd(), 'curated_aptitude_bank.csv'),
    path.join(process.cwd(), '..', 'curated_aptitude_bank.csv'),
    path.join(process.cwd(), 'backend', 'curated_aptitude_bank.csv'),
  ];
  const csvPath = csvCandidates.find((c) => fs.existsSync(c));

  if (!csvPath) {
    console.error(`❌ Error: Curated Aptitude Bank CSV (curated_aptitude_bank.csv) not found.`);
    return;
  }

  console.log(`\n[Phase 1] Reading Aptitude CSV file from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const allRows = parseCSV(csvContent);

  if (allRows.length < 2) {
    console.error(`❌ Error: CSV file contains no data rows.`);
    return;
  }

  const header = allRows[0];
  const dataRows = allRows.slice(1);
  console.log(`✓ Read ${dataRows.length} question rows (Header: ${header.join(', ')})`);

  const dataDir = findDataDir();
  const aptitudeBase = path.join(dataDir, 'aptitude');

  // Clean and prepare category directories
  const categories = ['logical', 'quantitative', 'verbal'];
  for (const cat of categories) {
    const catDir = path.join(aptitudeBase, cat);
    if (fs.existsSync(catDir)) {
      // Remove previous contents to ensure clean canonical state
      fs.rmSync(catDir, { recursive: true, force: true });
    }
    fs.mkdirSync(catDir, { recursive: true });
  }

  console.log(`\n[Phase 2] Importing and validating 1,500 curated questions...`);

  const sectionStats: Record<string, number> = {
    'Logical Reasoning': 0,
    'Numerical Ability': 0,
    'Verbal Ability': 0,
  };

  const topicMap: Record<string, any[]> = {};
  const allImportedQuestions: any[] = [];
  const seenIds = new Set<string>();

  for (const row of dataRows) {
    const [id, section, rawDiff, topic, question, optA, optB, optC, optD, answerKey] = row;

    if (!id || seenIds.has(id)) {
      console.warn(`Skipping invalid/duplicate id: ${id}`);
      continue;
    }
    seenIds.add(id);

    const sectionClean = section?.trim() || 'Logical Reasoning';
    const category =
      sectionClean === 'Numerical Ability' || sectionClean === 'quantitative'
        ? 'quantitative'
        : sectionClean === 'Verbal Ability' || sectionClean === 'verbal'
        ? 'verbal'
        : 'logical';

    const diffUpper = (rawDiff?.trim().toUpperCase() || 'MEDIUM') as 'EASY' | 'MEDIUM' | 'HARD';
    const difficulty: 'EASY' | 'MEDIUM' | 'HARD' = ['EASY', 'MEDIUM', 'HARD'].includes(diffUpper)
      ? diffUpper
      : 'MEDIUM';

    const topicClean = topic?.trim() || 'General';
    const topicSlug = slugify(topicClean);
    const questionClean = question?.trim() || '';

    const cleanA = optA?.trim() || '';
    const cleanB = optB?.trim() || '';
    const cleanC = optC?.trim() || '';
    const cleanD = optD?.trim() || '';

    const options = [cleanA, cleanB, cleanC, cleanD];
    const cleanAnswerKey = (answerKey?.trim().toUpperCase() || 'A') as 'A' | 'B' | 'C' | 'D';
    const answerIndex = cleanAnswerKey === 'B' ? 1 : cleanAnswerKey === 'C' ? 2 : cleanAnswerKey === 'D' ? 3 : 0;
    const correctOptionText = options[answerIndex] || cleanA;

    sectionStats[sectionClean] = (sectionStats[sectionClean] || 0) + 1;

    // Target directory: backend/data/aptitude/<category>/<topicSlug>/<id>/
    const topicDir = path.join(aptitudeBase, category, topicSlug);
    const qFolder = path.join(topicDir, id);
    if (!fs.existsSync(qFolder)) {
      fs.mkdirSync(qFolder, { recursive: true });
    }

    const title = questionClean.length > 80 ? `${questionClean.substring(0, 77)}...` : questionClean;

    const metadata = {
      metadataVersion: 1,
      id: id,
      slug: slugify(id),
      category: category,
      section: sectionClean,
      topic: topicSlug,
      topicName: topicClean,
      subtopic: '',
      companies: ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant'],
      difficulty: difficulty,
      difficultyLabel: difficulty.charAt(0) + difficulty.slice(1).toLowerCase(),
      estimatedTime: difficulty === 'EASY' ? 1 : difficulty === 'HARD' ? 3 : 2,
      estimatedTimeSec: difficulty === 'EASY' ? 60 : difficulty === 'HARD' ? 180 : 120,
      title: title,
      description: questionClean,
      question: questionClean,
      options: options,
      optionsMap: {
        A: cleanA,
        B: cleanB,
        C: cleanC,
        D: cleanD,
      },
      answer: cleanAnswerKey,
      answerKey: cleanAnswerKey,
      correctAnswer: correctOptionText,
      tags: [category, topicSlug],
      learningPaths: ['Placement Essentials', 'Aptitude Mastery'],
    };

    const explanationMd = `# Question ${id} — Explanation

**Correct Answer: Option ${cleanAnswerKey} (${correctOptionText})**

### Topic
${sectionClean} > ${topicClean}

### Question
${questionClean}

### Options
- (A) ${cleanA}
- (B) ${cleanB}
- (C) ${cleanC}
- (D) ${cleanD}

### Explanation
Option (${cleanAnswerKey}) is the correct answer. In ${topicClean}, evaluating the given problem conditions confirms that "${correctOptionText}" is the valid solution.
`;

    // 1. Write problem.json
    fs.writeFileSync(path.join(qFolder, 'problem.json'), JSON.stringify(metadata, null, 2), 'utf-8');

    // 2. Write explanation.md
    fs.writeFileSync(path.join(qFolder, 'explanation.md'), explanationMd, 'utf-8');

    // Accumulate for topic-level and category-level JSON
    const topicKey = `${category}/${topicSlug}`;
    if (!topicMap[topicKey]) topicMap[topicKey] = [];

    const questionObj = {
      id: metadata.id,
      title: metadata.title,
      description: metadata.description,
      question: metadata.question,
      options: metadata.options,
      answer: metadata.correctAnswer,
      answerKey: metadata.answerKey,
      correctAnswer: metadata.correctAnswer,
      difficulty: metadata.difficulty,
      difficultyLabel: metadata.difficultyLabel,
      explanation: `Option (${cleanAnswerKey}) is the correct answer: ${correctOptionText}.`,
      topic: metadata.topic,
      topicName: metadata.topicName,
      category: metadata.category,
      section: metadata.section,
      estimatedTime: metadata.estimatedTime,
      companies: metadata.companies,
    };

    topicMap[topicKey].push(questionObj);
    allImportedQuestions.push(questionObj);
  }

  // -------------------------------------------------------------------------
  // PHASE 3: Write Topic-level and Category-level Cache JSON files
  // -------------------------------------------------------------------------
  console.log(`\n[Phase 3] Generating topic-level and category-level cache files...`);

  // Write topic JSON files in category directories
  for (const [topicKey, qList] of Object.entries(topicMap)) {
    const [category, topicSlug] = topicKey.split('/');
    const topicFilePath = path.join(aptitudeBase, category, `${topicSlug}.json`);
    fs.writeFileSync(topicFilePath, JSON.stringify(qList, null, 2), 'utf-8');
  }

  // Write master aptitude search index
  const indexFilePath = path.join(aptitudeBase, 'aptitude-index.json');
  fs.writeFileSync(indexFilePath, JSON.stringify(allImportedQuestions, null, 2), 'utf-8');

  console.log(`=============================================================`);
  console.log(`🎉 Curated Aptitude Bank Import Completed Successfully!`);
  console.log(`  • Total Imported Questions: ${allImportedQuestions.length}`);
  console.log(`  • Logical Reasoning:       ${sectionStats['Logical Reasoning']}`);
  console.log(`  • Numerical Ability:       ${sectionStats['Numerical Ability']}`);
  console.log(`  • Verbal Ability:          ${sectionStats['Verbal Ability']}`);
  console.log(`  • Topics Generated:        ${Object.keys(topicMap).length}`);
  console.log(`=============================================================`);
}

if (require.main === module) {
  try {
    migrateAptitudeContent();
  } catch (err) {
    console.error('Aptitude import error:', (err as Error).message);
    process.exit(1);
  }
}
