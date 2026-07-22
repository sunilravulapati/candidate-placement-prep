import { redirect } from 'next/navigation';
import { syncUserAction, checkOnboardingStatusAction } from '@backend/features/user/actions';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DashboardContent from '../../components/DashboardContent';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sync Clerk user to Prisma on every dashboard page load
  try {
    await syncUserAction();
  } catch {
    // If sync fails (e.g., not authenticated), middleware will handle redirect
  }

  // Check onboarding status — redirect to onboarding if profile not completed
  try {
    const profileCompleted = await checkOnboardingStatusAction();
    if (!profileCompleted) {
      redirect('/onboarding');
    }
  } catch {
    // If user not found in DB yet (race condition), allow through — sync will fix it
  }

  return (
    <div className="flex flex-col md:flex-row min-w-0 h-screen w-screen overflow-hidden bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden max-w-full">
        <Navbar />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </div>
  );
}
