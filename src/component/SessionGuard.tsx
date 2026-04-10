"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, LogOut } from "lucide-react";
import { isTokenExpired } from "@/utils/auth";
import { refreshAccessToken } from "@/services/authService";

export default function SessionGuard() {
  const router = useRouter();
  const [isExpired, setIsExpired] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Fungsi pengecekan token
    const checkSession = () => {
      const token = localStorage.getItem("token");
      if (!token) return; // Jika tidak ada token, biarkan page/layout yang urus redirect

      if (isTokenExpired() && !isExpired) {
        setIsExpired(true);
      }
    };

    checkSession(); // Cek saat pertama dirender
    const interval = setInterval(checkSession, 5000); // Cek secara berkala setiap 5 detik

    return () => clearInterval(interval);
  }, [isExpired]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) throw new Error("Refresh token tidak ditemukan");

      // Hit API menggunakan authService
      const result = await refreshAccessToken(refreshToken);

      // SIMPAN DATA TOKEN KE SEMUA KEY YANG DIGUNAKAN APLIKASI
      localStorage.setItem("token", result.access_token);
      localStorage.setItem("access_token", result.access_token); // <--- TAMBAHKAN BARIS INI
      localStorage.setItem("refresh_token", result.refresh_token);
      localStorage.setItem(
        "token_expire",
        (Date.now() + result.expires_in * 1000).toString(),
      );
      document.cookie = `token=${result.access_token}; path=/; max-age=${result.expires_in}`;

      // Tutup modal karena sesi sudah diperpanjang
      setIsExpired(false);

      // Reload halaman agar data fetch yang tadi gagal (karena token lama) bisa sukses kembali
      window.location.reload();
    } catch (error) {
      console.error(error);
      handleLogout();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  // Jika belum expired, jangan tampilkan apa-apa di layar
  if (!isExpired) return null;

  // TAMPILAN MODAL KETIKA EXPIRED
  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center space-y-4 transform transition-all scale-in-center">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-orange-500" />
        </div>

        <h2 className="text-xl font-bold text-slate-800">Sesi Kadaluarsa</h2>

        <p className="text-sm text-slate-500 leading-relaxed">
          Waktu akses keamanan Anda telah habis. Silakan perbarui sesi untuk
          melanjutkan aktivitas Anda tanpa harus login ulang.
        </p>

        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={handleRefresh}
            className="btn bg-sky-600 hover:bg-sky-700 text-white w-full border-none shadow-md"
            disabled={isRefreshing}>
            {isRefreshing ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <RefreshCw size={16} />
            )}
            {isRefreshing ? "Memperbarui..." : "Perbarui Sesi"}
          </button>

          <button
            onClick={handleLogout}
            className="btn btn-ghost text-slate-500 hover:text-red-600 hover:bg-red-50 w-full"
            disabled={isRefreshing}>
            <LogOut size={16} className="mr-1" /> Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
