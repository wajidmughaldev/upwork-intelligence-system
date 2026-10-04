import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 p-6">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">404 - Page Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The requested page could not be found.</p>
        <Link href="/" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
