"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export type ChartKind = "line" | "bar";

type Series = { name: string; dataKey: string; color: string };

interface ChartPanelProps<T extends object> {
  title: string;
  data: T[];
  xKey: keyof T & string;
  series: Series[];
  kind?: ChartKind;
  height?: number;
}

export function ChartPanel<T extends object>({
  title,
  data,
  xKey,
  series,
  kind = "line",
  height = 260
}: ChartPanelProps<T>) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          {kind === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey={xKey} tick={{ fill: "#cbd5e1", fontSize: 12 }} stroke="#475569" />
              <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} stroke="#475569" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", color: "#e2e8f0" }}
                labelStyle={{ color: "#cbd5e1" }}
              />
              {series.map((s) => (
                <Line
                  key={s.name}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: s.color }}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey={xKey} tick={{ fill: "#cbd5e1", fontSize: 12 }} stroke="#475569" />
              <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} stroke="#475569" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", color: "#e2e8f0" }}
                labelStyle={{ color: "#cbd5e1" }}
              />
              {series.map((s) => (
                <Bar key={s.name} dataKey={s.dataKey} name={s.name} fill={s.color} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

