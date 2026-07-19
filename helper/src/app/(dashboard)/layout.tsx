import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col md:flex-row min-w-0 min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen max-w-full">
        <Navbar />
        <main className="flex-grow p-4 md:p-6 lg:p-8 min-w-0 w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6 w-full pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
