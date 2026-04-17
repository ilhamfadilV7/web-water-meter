"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Settings,
  Droplets,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Devices", href: "/devices", icon: BarChart3 },
    // { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`transition-all duration-300 flex flex-col h-full
      bg-gradient-to-b from-sky-800 to-blue-950 border-r border-sky-900 shadow-2xl
      ${collapsed ? "w-20" : "w-64"}
      text-white relative z-20`}>
      {/* ================= HEADER / LOGO ================= */}
      <div
        className={`flex items-center h-20 border-b border-white/10 shrink-0 transition-all
        ${collapsed ? "justify-center px-0" : "justify-start px-6 gap-3"}`}>
        <Droplets className="text-cyan-400 w-8 h-8 drop-shadow-md shrink-0" />
        {!collapsed && (
          <span className="font-bold text-2xl tracking-wider truncate animate-in fade-in duration-300">
            WaterMeter
          </span>
        )}
      </div>

      {/* ================= MENU NAVIGASI ================= */}
      <ul className="flex flex-col p-4 gap-2 mt-2 font-medium flex-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          const isHiddenOnMobile =
            item.name === "Dashboard" || item.name === "Settings";

          return (
            <li
              key={item.name}
              className={isHiddenOnMobile ? "hidden md:block" : "block"}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 py-3 rounded-lg transition-colors group
                  ${
                    isActive
                      ? "bg-sky-600/50 text-white font-semibold border border-sky-500/30 shadow-sm"
                      : "text-sky-100/70 hover:bg-sky-800/50 hover:text-white"
                  }
                  ${collapsed ? "justify-center px-0" : "px-4"} 
                `}
                title={collapsed ? item.name : ""}>
                <Icon
                  className={`w-5 h-5 shrink-0 ${!isActive && "group-hover:scale-110 transition-transform"}`}
                />
                {!collapsed && (
                  <span className="whitespace-nowrap animate-in slide-in-from-left-2 duration-200">
                    {item.name}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* ================= FOOTER (TOGGLE & COPYRIGHT) ================= */}
      <div className="flex flex-col border-t border-white/10 shrink-0 bg-black/10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`hidden md:flex items-center py-4 text-sky-100/70 hover:text-white hover:bg-white/5 transition-colors
            ${collapsed ? "justify-center" : "px-6 gap-3"}`}
          title={collapsed ? "Perlebar Sidebar" : "Perkecil Sidebar"}>
          {collapsed ? (
            <ChevronRight className="w-6 h-6" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm whitespace-nowrap">
                Sembunyikan Menu
              </span>
            </>
          )}
        </button>

        {/* Copyright */}
        {!collapsed && (
          <div className="px-4 pb-4 pt-1 text-[10px] text-sky-200/40 text-center font-mono animate-in fade-in duration-300">
            © 2026 PT Raharja Sinergi
          </div>
        )}
      </div>
    </aside>
  );
}
