"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/component/sidebar";
import Navbar from "@/component/navbar";
import SessionGuard from "@/component/SessionGuard"; // <-- Import

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // 1. Efek mendeteksi layar HP atau PC
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true); // HP: Sidebar disembunyikan
      } else {
        setCollapsed(false); // PC: Sidebar terbuka
      }
    };

    handleResize(); // Jalankan saat pertama kali dirender
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Efek otomatis menutup sidebar di HP ketika user nge-klik menu pindah halaman
  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">
      <SessionGuard />
      {/* ================= OVERLAY GELAP DI MOBILE ================= */}
      {/* Muncul jika di layar HP dan Hamburger Menu diklik */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setCollapsed(true)} // Tutup jika area gelap diklik
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <div
        className={`fixed md:relative top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out
          /* -translate-x-full = Sembunyi di luar layar kiri (Mobile Mode)
             translate-x-0 = Muncul ke layar (Mobile Mode saat diklik / PC Mode)
          */
          ${collapsed ? "-translate-x-full md:translate-x-0" : "translate-x-0"}
        `}>
        <Sidebar collapsed={collapsed} />
      </div>

      {/* ================= KONTEN UTAMA ================= */}
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden relative">
        {/* Navbar */}
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Area Page (Devices/Dashboard) */}
        {/* Menggunakan p-4 di HP agar tidak terlalu lebar, p-8 di PC */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
