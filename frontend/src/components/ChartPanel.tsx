"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

export type ChartKind = "line" | "bar";

interface ChartPanelProps {
  title: string;
  labels: string[];
  dataset: { label: string; data: number[]; backgroundColor: string; borderColor?: string }[];
  kind?: ChartKind;
}

export function ChartPanel({ title, labels, dataset, kind = "line" }: ChartPanelProps) {
  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: "#cbd5e1" } },
      tooltip: { intersect: false }
    },
    scales: {
      x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(148,163,184,0.2)" } },
      y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(148,163,184,0.2)" } }
    }
  } as const;

  const data = { labels, datasets: dataset };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {kind === "line" ? <Line data={data} options={options} /> : <Bar data={data} options={options} />}
    </div>
  );
}
