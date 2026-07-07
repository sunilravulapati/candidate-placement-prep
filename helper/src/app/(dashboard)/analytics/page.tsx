// src/app/analytics/page.tsx
import PhasePlaceholder from '@/components/PhasePlaceholder';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <PhasePlaceholder 
      title="Analytics & Revision Insights"
      description="Access deep insights about your DSA progress, average mock interview metrics, and revision logs to optimize placement success."
      phase="Phase 6 Feature"
      icon={BarChart3}
    />
  );
}
