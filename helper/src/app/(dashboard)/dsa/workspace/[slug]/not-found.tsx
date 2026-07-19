import Link from 'next/link';

export default function ProblemNotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">Problem Not Found</h1>
        <p className="text-slate-400">
          The requested DSA problem does not exist in the workspace library.
        </p>
        <Link
          href="/dsa/library"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Open Problem Library
        </Link>
      </div>
    </div>
  );
}
