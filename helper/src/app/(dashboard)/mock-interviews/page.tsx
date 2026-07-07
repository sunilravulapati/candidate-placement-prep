// src/app/mock-interviews/page.tsx
import PhasePlaceholder from '@/components/PhasePlaceholder';
import { Video } from 'lucide-react';

export default function MockInterviewsPage() {
  return (
    <PhasePlaceholder 
      title="AI Mock Interviews"
      description="Simulate real-time HR, technical, and DSA interviews based on your resumes, and receive grading metrics."
      phase="Phase 3 Feature"
      icon={Video}
    />
  );
}
