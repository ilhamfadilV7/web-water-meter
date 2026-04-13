"use client";

import { useState, useEffect } from "react";
import { Bell, LogOut, User, BatteryLow, Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getDevices } from "@/services/deviceService";
import { logoutUser } from "@/services/authService";

export default function Navbar({ collapsed, setCollapsed }: any) {
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);

  const [timeLeft, setTimeLeft] = useState<string>();

  useEffect(() => {
    const updateTimer = () => {
      const expireStr = localStorage.getItem("token_expire");
      if (!expireStr) return;

      const expireTime = parseInt(expireStr, 10);
      const now = Date.now();
      const diff = expireTime - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: devices } = useSWR("getAllDevices", getDevices);

  const lowBatteryDevices =
    devices?.filter((d: any) => {
      const battery = d.electricity || d.batteryCapacity || 100;
      return battery < 100;
    }) || [];

  const handleLogoutClick = () => {
    logoutUser();
    router.push("/");
  };

  return (
    <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-[60]">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-slate-100 rounded-lg lg:hidden">
          <div className="w-6 h-0.5 bg-slate-600 mb-1"></div>
          <div className="w-6 h-0.5 bg-slate-600 mb-1"></div>
          <div className="w-6 h-0.5 bg-slate-600"></div>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700">
          <div
            className={`badge badge-outline gap-1 font-bold px-2 py-3 sm:px-3 sm:py-3 ${timeLeft === "Expired" ? "text-red-500 border-red-200 bg-red-50" : "text-orange-600 border-orange-200 bg-orange-50"}`}>
            <Timer size={14} className="sm:block" />
            Sesi berakhir dalam = {""}
            {timeLeft}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
            <Bell size={20} className="sm:w-[22px] sm:h-[22px]" />
            {lowBatteryDevices.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center font-bold shadow-sm">
                  {lowBatteryDevices.length}
                </span>
              </span>
            )}
          </button>

          {showNotif && (
            <>
              <div
                className="fixed inset-0 z-[90]"
                onClick={() => setShowNotif(false)}></div>

              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-700 flex justify-between items-center relative z-[101]">
                  <span>Peringatan Perangkat</span>
                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                    {lowBatteryDevices.length}
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto bg-white relative z-[101]">
                  {lowBatteryDevices.length > 0 ? (
                    lowBatteryDevices.map((device: any) => (
                      <div
                        key={device.id}
                        className="p-3 border-b border-slate-50 hover:bg-slate-50 flex items-start gap-3 bg-white">
                        <BatteryLow
                          size={18}
                          className="text-orange-500 mt-0.5 shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">
                            {device.houseNumber || device.deviceName}
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5">
                            Baterai rendah:{" "}
                            <strong className="text-orange-600">
                              {device.electricity || device.batteryCapacity}%
                            </strong>
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400 bg-white">
                      Semua perangkat dalam kondisi normal.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="dropdown dropdown-end z-[70]">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-circle avatar border border-slate-200 bg-slate-50 w-8 h-8 sm:w-10 sm:h-10 min-h-0">
            <User size={18} className="text-slate-700 sm:w-5 sm:h-5" />
          </label>
          <ul
            tabIndex={0}
            className="mt-3 z-[100] p-2 shadow-2xl menu menu-sm dropdown-content bg-white rounded-xl w-52 border border-slate-200">
            <li className="menu-title text-slate-400">Akun Saya</li>
            <li>
              <a className="hover:bg-slate-50 py-2 font-medium text-slate-700">
                <User size={14} /> Profil
              </a>
            </li>
            <div className="divider my-1"></div>
            <li>
              <button
                onClick={handleLogoutClick}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 py-2 font-bold">
                <LogOut size={14} /> Keluar Aplikasi
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
