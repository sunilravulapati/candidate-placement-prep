// src/app/knowledge-hub/page.tsx
import PhasePlaceholder from '@/components/PhasePlaceholder';
import { BookOpen } from 'lucide-react';

export default function KnowledgeHubPage() {
  return (
    <PhasePlaceholder 
      title="Knowledge Hub & Flashcards"
      description="Store, index, and query PDF documents or markdown logs, practice flashcards, and use context-aware AI search."
      phase="Phase 5 Feature"
      icon={BookOpen}
    />
  );
}
