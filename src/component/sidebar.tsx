// src/component/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Settings, Droplets } from "lucide-react";

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Devices", href: "/devices", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`transition-all duration-300 flex flex-col h-full
      bg-gradient-to-b from-sky-800 to-blue-950 border-r border-sky-900 shadow-2xl
      ${collapsed ? "w-20" : "w-64"}
      text-white relative z-20`}>
      {/* LOGO AREA */}
      <div className="p-6 flex items-center justify-center sm:justify-start gap-3 font-bold text-2xl border-b border-white/10 shrink-0">
        <Droplets className="text-cyan-400 min-w-8 min-h-8 drop-shadow-md" />
        {!collapsed && (
          <span className="tracking-wider truncate">WaterMeter</span>
        )}
      </div>

      {/* MENU */}
      <ul className="flex flex-col p-4 gap-2 mt-4 font-medium flex-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          // Cek apakah tab aktif
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          // Mengambil icon secara dinamis dari array navItems
          const Icon = item.icon;

          // LOGIKA RESPONSIVE:
          // Jika menu adalah Dashboard atau Settings, tandai sebagai hidden di mobile
          const isHiddenOnMobile =
            item.name === "Dashboard" || item.name === "Settings";

          return (
            <li
              key={item.name}
              // Terapkan class 'hidden md:block' agar Dashboard & Settings HILANG di HP
              className={isHiddenOnMobile ? "hidden md:block" : "block"}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-sky-600/50 text-white font-semibold border border-sky-500/30 shadow-sm"
                      : "text-sky-100/70 hover:bg-sky-800/50 hover:text-white"
                  }
                  ${collapsed ? "justify-center px-0" : ""}
                `}
                title={collapsed ? item.name : ""}>
                {/* Render Ikon Secara Dinamis */}
                <Icon className="w-5 h-5 shrink-0" />

                {/* Render Teks (Hanya jika tidak di-collapse) */}
                {!collapsed && (
                  <span className="whitespace-nowrap">{item.name}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* FOOTER SIDEBAR */}
      {!collapsed && (
        <div className="p-4 text-[10px] text-sky-200/40 text-center border-t border-white/10 font-mono shrink-0">
          © 2026 PT Raharja Sinergi Komunikasi
        </div>
      )}
    </aside>
  );
}
