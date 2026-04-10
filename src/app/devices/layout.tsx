"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/component/sidebar";
import Navbar from "@/component/navbar";
import SessionGuard from "@/component/SessionGuard"; // <-- Import

export default function DeviceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // 1. Deteksi layar HP saat pertama kali web dimuat
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true); // HP: Tutup sidebar secara default
      } else {
        setCollapsed(false); // PC/Laptop: Buka sidebar
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Tutup sidebar di HP jika user nge-klik menu (pindah halaman)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 w-full relative">
      {/* ================= OVERLAY GELAP DI MOBILE ================= */}
      {/* Akan muncul menutupi layar saat Hamburger Menu diklik di HP */}
      <SessionGuard />
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity animate-in fade-in"
          onClick={() => setCollapsed(true)} // Klik area gelap untuk menutup
        />
      )}

      {/* ================= WRAPPER SIDEBAR RESPONSIVE ================= */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 h-full transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          /* LOGIKA KUNCI:
             Jika collapsed di HP: Geser 100% ke kiri (-translate-x-full) agar hilang dari layar
             Jika collapsed di PC: (Di-handle oleh sidebar.tsx menjadi w-20)
          */
          ${collapsed ? "-translate-x-full" : "translate-x-0"}
        `}>
        <Sidebar collapsed={collapsed} />
      </div>

      {/* ================= KONTEN UTAMA & NAVBAR ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Padding diperkecil (p-4) di HP agar lebih lega */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
