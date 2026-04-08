"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Settings, Droplets } from "lucide-react";

export default function Sidebar({ collapsed }: any) {
  const pathname = usePathname();
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Devices", href: "/devices", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings }, // Pastikan ada halaman /settings
  ];

  return (
    <aside
      className={`transition-all duration-300 flex flex-col
      bg-gradient-to-b from-sky-800 to-blue-950 border-r border-sky-900 shadow-2xl
      ${collapsed ? "w-20" : "w-64"}
      text-white relative z-20`}>
      {/* LOGO AREA */}
      <div className="p-6 flex items-center justify-center sm:justify-start gap-3 font-bold text-2xl border-b border-white/10">
        {/* Menggunakan icon Droplets untuk nuansa air/sui */}
        <Droplets className="text-cyan-400 min-w-8 min-h-8 drop-shadow-md" />
        {!collapsed && <span className="tracking-wider">WaterMeter</span>}
      </div>

      {/* MENU */}
      <ul className="flex flex-col p-4 gap-2 mt-4 font-medium flex-1">
        {navItems.map((item) => {
          // Cek apakah tab aktif (URL saat ini sama dengan href menu)
          // Menggunakan startsWith agar jika ada sub-menu (misal: /devices/detail), tab tetap aktif
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-4 p-3 transition-all duration-200
                  ${
                    isActive
                      ? "bg-white/20 text-white shadow-inner border-l-4 border-cyan-400" // Style saat Aktif
                      : "text-sky-200 hover:bg-white/10 hover:text-white hover:translate-x-1" // Style saat Tidak Aktif
                  }
                `}
                title={collapsed ? item.name : ""}>
                <Icon
                  size={22}
                  className={`min-w-5.5 ${isActive ? "text-cyan-400 drop-shadow-sm" : "opacity-80"}`}
                />
                {!collapsed && (
                  <span className="text-sm tracking-wide">{item.name}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* FOOTER SIDEBAR (Opsional, hanya tampil jika tidak di-collapse) */}
      {!collapsed && (
        <div className="p-4 text-xs text-sky-200/50 text-center border-t border-white/10 font-mono">
          © 2026 PT Raharja Sinergi Komunikasi
        </div>
      )}
    </aside>
  );
}
