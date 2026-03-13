import Link from "next/link";

export default function Home() {
  return (
    <main className="container-page flex flex-col gap-6">
      <div className="card card-gradient p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-600">Analytics Platform</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">Restaurant Performance Control Center</h1>
        <p className="mt-4 max-w-3xl text-slate-700">
          Monitor daily sales, identify best sellers, track profit margins, and optimize staffing with a unified
          analytics layer. Jump into the dashboard to explore live insights.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-medium text-white shadow-lg shadow-slate-900/30 hover:bg-slate-800 transition"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

