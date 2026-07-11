import CodingWorkspace from '@/components/live-coding/CodingWorkspace';

export default async function LiveCodingWorkspacePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <CodingWorkspace sessionId={sessionId} />;
}
