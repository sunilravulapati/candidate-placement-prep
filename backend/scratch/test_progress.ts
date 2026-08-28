// backend/scratch/test_progress.ts
import prisma from '../src/db/client';
import { recordSubmissionAction, getProblemBySlugAction } from '../src/features/liveCoding/actions';
import { getUserProblemStatuses } from '../src/features/liveCoding/repository';
import { LiveCodingService } from '../src/features/liveCoding/service';

async function main() {
  console.log('--- Testing DSA Solved Status Tracking ---');

  const userId = 'user_demo';

  // 1. Initial State
  const initialDashboard = await LiveCodingService.getDashboardData(userId);
  console.log('Initial Solved:', initialDashboard.stats);

  // 2. Submit 'largest-rectangle-in-histogram' (HARD) with status ACCEPTED
  console.log('\nSubmitting ACCEPTED for largest-rectangle-in-histogram...');
  const res1 = await recordSubmissionAction({
    problemSlug: 'largest-rectangle-in-histogram',
    language: 'cpp',
    status: 'ACCEPTED',
    passedCount: 8,
    totalCount: 8,
    executionTimeMs: 42,
    memoryBytes: 15 * 1024 * 1024,
    codeSnapshot: '// test solution',
  });
  console.log('Record result 1:', res1);

  // 3. Check Problem status and Dashboard after solve
  const prob1 = await getProblemBySlugAction('largest-rectangle-in-histogram');
  console.log('Problem largest-rectangle-in-histogram status:', prob1?.status, 'isSolved:', (prob1 as any)?.isSolved);

  const afterSolve1 = await LiveCodingService.getDashboardData(userId);
  console.log('After Solve 1 Stats:', afterSolve1.stats);

  // 4. Submit same problem again (Duplicate solve test)
  console.log('\nSubmitting ACCEPTED for largest-rectangle-in-histogram again...');
  await recordSubmissionAction({
    problemSlug: 'largest-rectangle-in-histogram',
    language: 'python',
    status: 'ACCEPTED',
    passedCount: 8,
    totalCount: 8,
    executionTimeMs: 38,
    memoryBytes: 14 * 1024 * 1024,
    codeSnapshot: '# test solution 2',
  });

  const afterSolve2 = await LiveCodingService.getDashboardData(userId);
  console.log('After Duplicate Solve Stats (should remain hard=1):', afterSolve2.stats);

  // 5. Submit two-sum (EASY) with WRONG_ANSWER
  console.log('\nSubmitting WRONG_ANSWER for two-sum...');
  const resWrong = await recordSubmissionAction({
    problemSlug: 'two-sum',
    language: 'javascript',
    status: 'WRONG_ANSWER',
    passedCount: 2,
    totalCount: 8,
    executionTimeMs: 10,
    memoryBytes: 10 * 1024 * 1024,
    codeSnapshot: '// wrong answer',
  });
  console.log('Record wrong result:', resWrong);

  const probTwoSumWrong = await getProblemBySlugAction('two-sum');
  console.log('Two Sum after WRONG_ANSWER status:', probTwoSumWrong?.status, 'isSolved:', (probTwoSumWrong as any)?.isSolved);

  // 6. Submit two-sum (EASY) with ACCEPTED
  console.log('\nSubmitting ACCEPTED for two-sum...');
  const resAccepted = await recordSubmissionAction({
    problemSlug: 'two-sum',
    language: 'javascript',
    status: 'ACCEPTED',
    passedCount: 8,
    totalCount: 8,
    executionTimeMs: 12,
    memoryBytes: 10 * 1024 * 1024,
    codeSnapshot: '// correct answer',
  });
  console.log('Record accepted result:', resAccepted);

  const probTwoSumAccepted = await getProblemBySlugAction('two-sum');
  console.log('Two Sum after ACCEPTED status:', probTwoSumAccepted?.status, 'isSolved:', (probTwoSumAccepted as any)?.isSolved);

  // 7. Submit maximum-subarray (MEDIUM) with ACCEPTED
  console.log('\nSubmitting ACCEPTED for maximum-subarray...');
  await recordSubmissionAction({
    problemSlug: 'maximum-subarray',
    language: 'java',
    status: 'ACCEPTED',
    passedCount: 8,
    totalCount: 8,
    executionTimeMs: 18,
    memoryBytes: 12 * 1024 * 1024,
    codeSnapshot: '// java max subarray',
  });

  const finalDashboard = await LiveCodingService.getDashboardData(userId);
  console.log('\nFinal Dashboard Stats:');
  console.log('Easy Solved:', finalDashboard.stats.easy.solved, '/', finalDashboard.stats.easy.total);
  console.log('Medium Solved:', finalDashboard.stats.medium.solved, '/', finalDashboard.stats.medium.total);
  console.log('Hard Solved:', finalDashboard.stats.hard.solved, '/', finalDashboard.stats.hard.total);
  console.log('Acceptance Rate:', finalDashboard.stats.acceptanceRate + '%');
  console.log('Topic Progress sample (top 3):', finalDashboard.topicProgress.slice(0, 3));
}

main().catch(console.error).finally(() => prisma.$disconnect());
