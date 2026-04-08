"use client";

import { useEffect, useState } from "react";
import { Device } from "@/types/device";
import { getDevices } from "@/services/deviceService";
import dynamic from "next/dynamic";
import { getDeviceStatus } from "@/utils/deviceStatus";
import { deviceTypes } from "@/utils/deviceType";
import { Signal } from "lucide-react";
import { isTokenExpired } from "@/utils/auth";
import { useRouter } from "next/navigation";

import { ChartAreaGradient } from "@/component/chart";
import { adjustMinusOneHour } from "@/utils/date";

const Dashboard = () => {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [deviceLoading, setDeviceLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [sleepCount, setSleepCount] = useState(0);
  const [offlineCount, setOfflineCount] = useState(0);
  const [notActiveCount, setNotActiveCount] = useState(0);

  const MapLeaflet = dynamic(() => import("@/component/MapLeaflet"), {
    ssr: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token || isTokenExpired()) {
          localStorage.removeItem("token");
          localStorage.removeItem("token_expire");

          router.push("/");
        }

        const data = await getDevices();
        setDevices(data);

        setOnlineCount(data.filter((d) => d.deviceStatus === 1).length);
        setSleepCount(data.filter((d) => d.deviceStatus === 2).length);
        setOfflineCount(data.filter((d) => d.deviceStatus === 3).length);
        setNotActiveCount(data.filter((d) => d.deviceStatus === 4).length);
      } catch (e) {
        console.log(e);
      }

      setDeviceLoading(false);
    };

    fetchData();
  }, []);

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
              { label: "Total", value: 0, colorClass: "status-neutral" },
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
          <div className="sm:hidden space-y-3">
            {devices.map((device, i) => {
              const status = getDeviceStatus(device.deviceStatus);
              const dvctype = deviceTypes(device.networkType);

              return (
                <div
                  key={device.id}
                  className="p-3 rounded-lg border shadow-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">{device.houseNumber}</span>

                    <span className="badge badge-soft">{status.label}</span>
                  </div>

                  <div className="text-sm opacity-70">
                    Tipe: {dvctype.label}
                  </div>

                  <div className="text-sm">Signal: {device.signal}</div>

                  <div className="text-xs opacity-60">
                    {adjustMinusOneHour(device.lastTime)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---------- DESKTOP TABLE ---------- */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto max-h-112 border rounded-box">
              <table className="table table-zebra table-sm sm:table-md">
                <thead className="sticky top-0 bg-base-200 z-10">
                  <tr>
                    <th></th>
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
                        <td>{device.houseNumber}</td>
                        <td>{dvctype.label}</td>
                        <td>{status.label}</td>
                        <td>{device.signal}</td>
                        <td>{device.batteryCapacity}</td>
                        <td>{adjustMinusOneHour(device.lastTime)}</td>
                      </tr>
                    );
                  })}
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
        <div className="h-64 sm:h-112">
          <MapLeaflet devices={devices} />
        </div>
      </div>

      {/* ================= SECOND TABLE ================= */}
      <div className="overflow-x-auto rounded-box border shadow-sm">
        <table className="table table-sm sm:table-md">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Job</th>
              <th>Favorite Color</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>1</th>
              <td>Cy Ganderton</td>
              <td>Quality Control Specialist</td>
              <td>Blue</td>
            </tr>
            <tr>
              <th>2</th>
              <td>Hart Hagerty</td>
              <td>Desktop Support Technician</td>
              <td>Purple</td>
            </tr>
            <tr>
              <th>3</th>
              <td>Brice Swyre</td>
              <td>Tax Accountant</td>
              <td>Red</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
