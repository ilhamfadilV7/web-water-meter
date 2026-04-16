"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/component/sidebar";
import Navbar from "@/component/navbar";
import SessionGuard from "@/component/SessionGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">
      <SessionGuard />

      {/* ================= OVERLAY GELAP DI MOBILE ================= */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* ================= SIDEBAR CONTAINER ================= */}
      {/* Di HP: Menggunakan translate (-translate-x-full) untuk sembunyi */}
      {/* Di PC: Menggunakan width (md:w-20 atau md:w-64) untuk menyusut */}
      <div
        className={`fixed md:relative top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out shrink-0
          ${collapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "translate-x-0 md:w-64"}
        `}>
        {/* Lempar props collapsed & setCollapsed ke Sidebar */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* ================= KONTEN UTAMA ================= */}
      {/* flex-1 akan otomatis menyesuaikan ruang saat sidebar membesar/mengecil */}
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden relative transition-all duration-300">
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
