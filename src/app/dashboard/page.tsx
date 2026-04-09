"use client";

import { useEffect } from "react";
import useSWR from "swr"; // <-- Tambahkan SWR
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Signal } from "lucide-react";

import { Device } from "@/types/device";
import { getDevices } from "@/services/deviceService";
import { getDeviceStatus } from "@/utils/deviceStatus";
import { deviceTypes } from "@/utils/deviceType";
import { isTokenExpired } from "@/utils/auth";
import { ChartAreaGradient } from "@/component/chart";
import { adjustMinusOneHour } from "@/utils/date";

const MapLeaflet = dynamic(() => import("@/component/MapLeaflet"), {
  ssr: false,
});

const Dashboard = () => {
  const router = useRouter();

  // 1. Pengecekan Token Auth (Tetap menggunakan useEffect karena ini butuh akses window/localStorage)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired()) {
      localStorage.removeItem("token");
      localStorage.removeItem("token_expire");
      router.push("/");
    }
  }, [router]);

  // 2. FETCH DATA DENGAN SWR
  // Menggantikan useState(devices) dan useState(deviceLoading)
  const { data, isLoading } = useSWR("getAllDevices", getDevices);

  // Jika data SWR belum ada, berikan array kosong sebagai default
  const devices: Device[] = data || [];

  // 3. DERIVED STATE (Otomatis terhitung ulang jika 'devices' berubah, tanpa perlu useState!)
  const onlineCount = devices.filter((d) => d.deviceStatus === 1).length;
  const sleepCount = devices.filter((d) => d.deviceStatus === 2).length;
  const offlineCount = devices.filter((d) => d.deviceStatus === 3).length;
  const notActiveCount = devices.filter((d) => d.deviceStatus === 4).length;

  // 4. Loading UI (Opsional)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-6rem)]">
        <span className="loading loading-spinner loading-lg text-sky-600"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-3 sm:px-0">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <span className="text-xl sm:text-2xl font-semibold">
          Welcome Back, User
        </span>

        <div className="breadcrumbs text-sm opacity-70">
          <ul>
            <li>
              <a>Home</a>
            </li>
            <li>
              <a>Dashboard</a>
            </li>
          </ul>
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= DEVICE STATUS ================= */}
        <div className="bg-white p-4 sm:p-6 rounded-box shadow-md space-y-6">
          <span className="font-semibold">Device Status</span>

          {/* STATUS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Online",
                value: onlineCount,
                colorClass: "status-success",
              },
              {
                label: "Offline",
                value: offlineCount,
                colorClass: "status-error",
              },
              {
                label: "Sleep",
                value: sleepCount,
                colorClass: "status-warning",
              },
              {
                label: "Total",
                value: devices.length,
                colorClass: "status-neutral",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center p-3 rounded-lg shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-1 text-sm">
                  <span className={`status ${item.colorClass}`}></span>
                  {item.label}
                </div>
                <span className="text-xl sm:text-2xl font-bold">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* ================= DEVICE LIST ================= */}
          {/* ---------- MOBILE CARD LIST ---------- */}
          <div className="sm:hidden space-y-3 overflow-y-auto max-h-96 pr-2">
            {devices.map((device) => {
              const status = getDeviceStatus(device.deviceStatus);
              const dvctype = deviceTypes(device.networkType);

              return (
                <div
                  key={device.id}
                  className="p-3 rounded-lg border shadow-sm space-y-1 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      {device.houseNumber || "-"}
                    </span>
                    <span
                      className={`badge badge-sm ${device.deviceStatus === 1 ? "badge-success text-white" : "badge-ghost"}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-sm opacity-70">
                    Tipe: {dvctype.label}
                  </div>
                  <div className="text-sm flex items-center gap-1">
                    Signal: <Signal className="w-4 h-4 text-sky-500" />{" "}
                    {device.signal || "-"}
                  </div>
                  <div className="text-xs opacity-60">
                    Update:{" "}
                    {device.lastTime
                      ? adjustMinusOneHour(device.lastTime)
                      : "-"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---------- DESKTOP TABLE ---------- */}
          <div className="hidden sm:block">
            <div className="overflow-y-auto max-h-[400px] border rounded-box shadow-inner">
              <table className="table table-zebra table-sm">
                <thead className="sticky top-0 bg-base-200 z-10 shadow-sm">
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Tipe</th>
                    <th>Status</th>
                    <th>Signal</th>
                    <th>Baterai</th>
                    <th>Last update</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device, index) => {
                    const status = getDeviceStatus(device.deviceStatus);
                    const dvctype = deviceTypes(device.networkType);

                    return (
                      <tr key={device.id}>
                        <th>{index + 1}</th>
                        <td className="font-medium">
                          {device.houseNumber || "-"}
                        </td>
                        <td>{dvctype.label}</td>
                        <td>
                          <span
                            className={`badge badge-sm ${device.deviceStatus === 1 ? "badge-success text-white" : "badge-ghost"}`}>
                            {status.label}
                          </span>
                        </td>
                        <td>{device.signal || "-"}</td>
                        <td>{device.batteryCapacity || "-"}</td>
                        <td className="text-xs">
                          {device.lastTime
                            ? adjustMinusOneHour(device.lastTime)
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                  {devices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        Tidak ada device ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================= CHART ================= */}
        <div className="w-full min-h-65 sm:min-h-85">
          <ChartAreaGradient />
        </div>
      </div>

      {/* ================= MAP ================= */}
      <div className="bg-white p-4 sm:p-6 rounded-box shadow-sm hidden md:block">
        <div className="h-64 sm:h-112 z-0 relative">
          <MapLeaflet devices={devices} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
