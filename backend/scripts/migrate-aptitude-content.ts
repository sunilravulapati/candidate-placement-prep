// backend/scripts/migrate-aptitude-content.ts

import fs from 'fs';
import path from 'path';

interface LegacyAptitudeQuestion {
  id: string;
  category?: string;
  topic?: string;
  subtopic?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  companies?: string[];
  tags?: string[];
  estimatedTime?: number;
}

const CATEGORIES = ['quantitative', 'logical', 'verbal', 'di'];

export function migrateAptitudeContent() {
  const dataDirCandidates = [
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'backend', 'data'),
    path.join(process.cwd(), '..', 'backend', 'data'),
  ];
  const dataDir = dataDirCandidates.find((c) => fs.existsSync(c));
  if (!dataDir) {
    console.error('Data directory not found');
    return;
  }

  const aptitudeBase = path.join(dataDir, 'aptitude');
  if (!fs.existsSync(aptitudeBase)) return;

  let totalMigrated = 0;

  for (const cat of CATEGORIES) {
    const catDir = path.join(aptitudeBase, cat);
    if (!fs.existsSync(catDir)) continue;

    const items = fs.readdirSync(catDir);
    for (const item of items) {
      if (!item.endsWith('.json')) continue;
      const topicSlug = item.replace('.json', '');
      const filePath = path.join(catDir, item);

      try {
        const questions: LegacyAptitudeQuestion[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        for (const q of questions) {
          const qId = q.id || `${cat}-${topicSlug}-${Math.random().toString(36).substr(2, 6)}`;
          const qFolder = path.join(catDir, topicSlug, qId);
          if (!fs.existsSync(qFolder)) {
            fs.mkdirSync(qFolder, { recursive: true });
          }

          const metadata = {
            metadataVersion: 1,
            id: qId,
            slug: qId,
            category: cat,
            topic: topicSlug,
            subtopic: q.subtopic || '',
            companies: q.companies || ['TCS', 'Infosys', 'Wipro', 'Accenture'],
            difficulty: q.difficulty || 'MEDIUM',
            estimatedTime: q.estimatedTime || 2,
            question: q.question || (q as any).description || (q as any).title || '',
            options: q.options || [],
            answer: q.answer || (q as any).correctAnswer || '',
            tags: q.tags || [topicSlug],
            learningPaths: ['Aptitude Essentials']
          };

          const explanationMd = `# Question ${qId} — Explanation\n\n${q.explanation || 'No detailed explanation provided.'}`;

          fs.writeFileSync(path.join(qFolder, 'problem.json'), JSON.stringify(metadata, null, 2), 'utf-8');
          fs.writeFileSync(path.join(qFolder, 'explanation.md'), explanationMd, 'utf-8');

          totalMigrated++;
        }
      } catch (err) {
        console.error(`Failed migrating aptitude file ${filePath}:`, (err as Error).message);
      }
    }
  }

  console.log(`Successfully migrated ${totalMigrated} Aptitude questions into folder structure!`);
}

if (require.main === module) {
  migrateAptitudeContent();
}
