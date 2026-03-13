import React from "react";

interface StatsCardProps {
  label: string;
  value: string;
  helper?: string;
}

export function StatsCard({ label, value, helper }: StatsCardProps) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {helper && <p className="mt-1 text-sm text-slate-400">{helper}</p>}
    </div>
  );
}

