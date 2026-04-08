"use client";

import { useState } from "react";
import Sidebar from "@/component/sidebar";
import Navbar from "@/component/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* SIDEBAR */}
      <Sidebar collapsed={collapsed} />

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col">
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
