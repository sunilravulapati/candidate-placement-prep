// backend/scratch/check_db.ts
import prisma from '../src/db/client';
import { CodingProblemRepository, CodingSessionRepository } from '../src/features/liveCoding/repository';

async function main() {
  const problemCount = await prisma.codingProblem.count();
  console.log('CodingProblem DB count:', problemCount);

  const sampleProblem = await prisma.codingProblem.findUnique({ where: { slug: 'largest-rectangle-in-histogram' } });
  console.log('largest-rectangle-in-histogram in DB:', sampleProblem ? sampleProblem.id : 'NOT FOUND');

  const staticProb = await CodingProblemRepository.getProblemBySlug('largest-rectangle-in-histogram');
  console.log('staticProb id:', staticProb?.id, 'title:', staticProb?.title);

  // Test creating a session for demo user 'user_demo'
  try {
    const session = await CodingSessionRepository.getOrCreateSession('user_demo', 'largest-rectangle-in-histogram', 'javascript');
    console.log('Session created successfully:', session.id);
  } catch (err) {
    console.error('Session creation failed:', err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
