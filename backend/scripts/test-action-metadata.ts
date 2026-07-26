// backend/scripts/test-action-metadata.ts

import { getProblemBySlugAction } from '../src/features/liveCoding/actions';
import { IOFramework } from '../src/features/dsa/io';

async function testAction() {
  const problem = await getProblemBySlugAction('two-sum');
  if (!problem) {
    console.error('Failed to load problem action');
    process.exit(1);
  }

  console.log('✅ Problem loaded via getProblemBySlugAction!');
  console.log('StarterMetadata:', JSON.stringify((problem as any).starterMetadata, null, 2));
  console.log('ExecutionMetadata:', JSON.stringify((problem as any).executionMetadata, null, 2));

  const driverCode = IOFramework.buildAndRender((problem as any).starterMetadata, 'cpp');
  console.log('\n--- Generated IOFramework Driver ---');
  console.log(driverCode);
}

testAction().catch(console.error);
