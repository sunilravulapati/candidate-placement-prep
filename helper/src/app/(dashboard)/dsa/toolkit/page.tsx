// helper/src/app/(dashboard)/dsa/toolkit/page.tsx
import React from 'react';
import ContentAuthoringToolkit from '@/components/live-coding/ContentAuthoringToolkit';

export const metadata = {
  title: 'Content Authoring Toolkit | PrepGenie',
  description: 'Internal developer toolkit for content validation and template inspection.',
};

export default function ToolkitPage() {
  return <ContentAuthoringToolkit />;
}
