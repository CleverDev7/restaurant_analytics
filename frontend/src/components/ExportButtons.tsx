"use client";

import React from "react";

type BestSeller = { name: string; revenue: number; quantity: number };
type StaffPerformance = { name: string; ordersHandled: number; upsellRate: number };
type CustomerPattern = { customer: string; visits: number; avgTicket: number };

type Props = {
  date: string;
  revenue: number;
  orders: number;
  avgTicket: number;
  profitMargin: number;
  bestSellers: BestSeller[];
  staffPerformance: StaffPerformance[];
  customerPatterns: CustomerPattern[];
};

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButtons({
  date,
  revenue,
  orders,
  avgTicket,
  profitMargin,
  bestSellers,
  staffPerformance,
  customerPatterns
}: Props) {
  const handleCsv = () => {
    const lines: string[] = [];
    lines.push(`Restaurant Analytics Report,${date}`);
    lines.push("");
    lines.push("Daily Sales");
    lines.push("Revenue,Orders,Avg Ticket,Profit Margin");
    lines.push(`${revenue},${orders},${avgTicket.toFixed(2)},${(profitMargin * 100).toFixed(2)}%`);
    lines.push("");

    lines.push("Best Selling Items");
    lines.push("Item,Revenue,Quantity");
    bestSellers.forEach((i) => lines.push(`${i.name},${i.revenue},${i.quantity}`));
    lines.push("");

    lines.push("Staff Performance");
    lines.push("Name,Orders,Upsell Rate");
    staffPerformance.forEach((s) => lines.push(`${s.name},${s.ordersHandled},${(s.upsellRate * 100).toFixed(1)}%`));
    lines.push("");

    lines.push("Customer Spending");
    lines.push("Customer,Visits,Avg Ticket");
    customerPatterns.forEach((c) => lines.push(`${c.customer},${c.visits},${c.avgTicket.toFixed(2)}`));

    download(`analytics-${date}.csv`, lines.join("\n"));
  };

  const handlePdf = () => {
    // Simple approach: trigger browser print dialog; users can save as PDF.
    window.print();
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleCsv}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition shadow-md"
      >
        Export CSV
      </button>
      <button
        onClick={handlePdf}
        className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition"
      >
        Export PDF
      </button>
    </div>
  );
}
