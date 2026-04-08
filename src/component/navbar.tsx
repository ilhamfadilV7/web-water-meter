"use client";

import { Menu } from "lucide-react";

export default function Navbar({ collapsed, setCollapsed }: any) {
  return (
    <div className="navbar bg-white border-b border-slate-200 text-white">
      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="btn btn-ghost text-neutral">
        <Menu size={20} />
      </button>

      <div className="flex-1 px-4 font-bold text-neutral"></div>

      <div className="flex gap-4 pr-4">🔔 👤</div>
    </div>
  );
}
