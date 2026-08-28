// backend/scripts/migrate-dsa-content.ts

import { runMasterSheetPipeline } from './import-master-sheet';

export function migrateAllProblems() {
  runMasterSheetPipeline();
}

if (require.main === module) {
  migrateAllProblems();
}

