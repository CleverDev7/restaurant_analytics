import "../styles/globals.css";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Restaurant Analytics Dashboard",
  description: "Full-stack analytics & reporting for restaurants"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-100 bg-slate-950">
        {children}
      </body>
    </html>
  );
}
