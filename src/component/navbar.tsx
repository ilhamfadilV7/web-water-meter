"use client";

import { Menu, Timer } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar({ collapsed, setCollapsed }: any) {
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    // Fungsi untuk menghitung dan memformat sisa waktu
    const calculateTimeLeft = () => {
      const expireStr = localStorage.getItem("token_expire");

      if (!expireStr) {
        setCountdown("");
        return;
      }

      const expireTime = Number(expireStr);
      const now = Date.now();
      const difference = expireTime - now;

      // Jika waktu sudah habis
      if (difference <= 0) {
        setCountdown("Expired");
        return;
      }

      // Konversi milidetik ke menit dan detik
      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Format menjadi MM:SS (tambahkan angka 0 di depan jika detik < 10)
      const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      setCountdown(formattedTime);
    };

    // Panggil sekali saat komponen pertama kali dirender
    calculateTimeLeft();

    // Jalankan interval setiap 1 detik (1000 ms)
    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    // Bersihkan interval saat komponen dilepas (unmount) untuk mencegah memory leak
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="navbar bg-white border-b border-slate-200 text-neutral">
      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="btn btn-ghost text-neutral">
        <Menu size={20} />
      </button>

      <div className="flex-1 px-4 font-bold text-neutral"></div>

      <div className="flex items-center gap-4 pr-4">
        <span className="text-neutral font-semibold">
          Sesi akan berakhir dalam :{" "}
        </span>
        {/* BUBBLE COUNTDOWN TOKEN */}
        {countdown && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold shadow-sm border ${
              countdown === "Expired"
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-orange-50 text-orange-600 border-orange-200"
            }`}>
            <Timer size={16} />
            <span>{countdown}</span>
          </div>
        )}

        <div className="cursor-pointer hover:opacity-80 transition-opacity">
          🔔
        </div>
        <div className="cursor-pointer hover:opacity-80 transition-opacity">
          👤
        </div>
      </div>
    </div>
  );
}
