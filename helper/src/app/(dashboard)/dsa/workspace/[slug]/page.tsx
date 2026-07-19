import CodingWorkspace from '@/components/live-coding/CodingWorkspace';
import {
  getProblemBySlugAction,
  getProblemNavigationAction,
} from '@backend/features/liveCoding/actions';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LiveCodingWorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const problem = await getProblemBySlugAction(slug);

  if (!problem) {
    notFound();
  }

  const navigation = await getProblemNavigationAction(problem.slug);

  return <CodingWorkspace key={slug} problem={problem} navigation={navigation} />;
}
