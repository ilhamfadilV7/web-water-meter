"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, Search, RefreshCw, AlertCircle } from "lucide-react";

import { Device } from "@/types/device";
import { getDevices, getLocalDevices } from "@/services/deviceService";
import { getDeviceStatus } from "@/utils/deviceStatus";
import { deviceTypes } from "@/utils/deviceType";
import { isTokenExpired } from "@/utils/auth";
import { adjustMinusOneHour } from "@/utils/date";
import ModalAddDevice from "@/component/modalAddDevice";

const DevicePage = () => {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnsyncedSN, setSelectedUnsyncedSN] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired()) {
      localStorage.removeItem("token");
      localStorage.removeItem("token_expire");
      router.push("/");
    }
  }, [router]);

  // ==============================================================
  // 1. AMBIL LIST DARI DB LOKAL (SWR Error Handling Diaktifkan)
  // ==============================================================
  const {
    data: localData,
    isLoading: isLoadingLocal,
    error: localError,
  } = useSWR("getLocalDevices", getLocalDevices);

  const localSerialNumbers = (localData || []).map((d: any) => d.serial_number);

  // ==============================================================
  // 2. AMBIL DATA LYDAR & TENTUKAN STATUS SINKRONISASI
  // ==============================================================
  const { data: lydarData, isLoading: isLoadingLydar } = useSWR(
    "getAllDevicesTable",
    getDevices,
  );
  const lydarDevices: Device[] = lydarData || [];

  const devicesWithSyncStatus = lydarDevices.map((dev) => {
    let syncStatus = "synced";

    if (localError) {
      syncStatus = "error";
    } else if (!localSerialNumbers.includes(dev.deviceName)) {
      syncStatus = "unsynced";
    }

    return {
      ...dev,
      syncStatus,
    };
  });

  const filteredDevices = devicesWithSyncStatus.filter((device) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchName =
      device.houseNumber?.toLowerCase().includes(query) || false;
    const matchSerial =
      device.deviceName?.toLowerCase().includes(query) || false;
    const matchAddress = device.address?.toLowerCase().includes(query) || false;
    return matchName || matchSerial || matchAddress;
  });

  const isDataReady = !isLoadingLydar && !isLoadingLocal;

  const handleOpenSync = (serialNumber: string) => {
    setSelectedUnsyncedSN(serialNumber);
    setOpenModal(true);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <span className="text-2xl text-slate-800 font-bold">Device Menu</span>
        <div className="breadcrumbs text-sm text-slate-500 hidden sm:block">
          <ul>
            <li>
              <a>Home</a>
            </li>
            <li>
              <a>Devices</a>
            </li>
          </ul>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />

          <input
            type="text"
            placeholder="Cari nama WP, serial, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-10 bg-slate-50 border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all relative"
          />
        </div>
      </div>

      {/* TAMPILAN BANNER JIKA SERVER LOKAL ERROR */}
      {localError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-red-800 font-bold">
              Gagal Menghubungi Server Lokal Watermeter
            </span>
            <span className="text-red-600/80 text-sm">
              Status sinkronisasi device tidak dapat dipastikan saat ini. Mohon
              hubungi administrator untuk memastikan server lokal berjalan
              dengan baik.
            </span>
          </div>
        </div>
      )}

      {/* AREA LIST DEVICE */}
      <div className="pb-10">
        {!isDataReady ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <span className="loading loading-spinner text-sky-600 loading-lg"></span>
            <span className="text-sm text-slate-500 animate-pulse">
              Memuat data device...
            </span>
          </div>
        ) : (
          <>
            {/* ---------------------------------------------------
                1. TAMPILAN MOBILE (CARD LIST)
            ----------------------------------------------------- */}
            <div className="flex flex-col gap-4 md:hidden">
              {filteredDevices.map((device) => {
                const syncStatus = device.syncStatus;
                const status = getDeviceStatus(device.deviceStatus);
                const dvctype = deviceTypes(device.networkType || 1);

                return (
                  <div
                    key={device.id}
                    className={`border rounded-xl p-4 shadow-sm flex flex-col gap-4 relative overflow-hidden ${
                      syncStatus === "unsynced"
                        ? "bg-rose-50/20 border-rose-200"
                        : syncStatus === "error"
                          ? "bg-red-50/10 border-red-200 opacity-90"
                          : "bg-white border-slate-200"
                    }`}>
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${
                        syncStatus === "unsynced"
                          ? "bg-rose-400"
                          : syncStatus === "error"
                            ? "bg-red-400"
                            : device.deviceStatus === 1
                              ? "bg-green-500"
                              : "bg-slate-300"
                      }`}></div>

                    <div className="flex justify-between items-start pl-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-lg leading-tight">
                            {device.houseNumber || "-"}
                          </span>
                          {syncStatus === "unsynced" && (
                            <span className="badge badge-xs bg-rose-500 text-white font-bold text-[9px] border-none px-1.5 shadow-sm">
                              NEW
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-mono mt-0.5">
                          {device.deviceName}
                        </span>
                      </div>

                      {/* STATUS BADGE MOBILE */}
                      {syncStatus === "unsynced" ? (
                        <span className="badge badge-sm font-medium bg-rose-100 text-rose-700 border-none p-5 text-center leading-tight shadow-sm">
                          Belum
                          <br />
                          Sinkron
                        </span>
                      ) : syncStatus === "error" ? (
                        <span className="badge badge-sm font-medium bg-red-100 text-red-700 border-none p-5 text-center leading-tight shadow-sm">
                          Server
                          <br />
                          Offline
                        </span>
                      ) : (
                        <span
                          className={`badge badge-sm font-medium ${device.deviceStatus === 1 ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {status?.label}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4 items-center bg-slate-50/50 p-3 rounded-lg border border-slate-100 ml-2">
                      <div className="w-16 h-16 relative rounded-md border border-slate-200 overflow-hidden bg-black shrink-0">
                        {device.recentPicPath?.trim() ? (
                          <Image
                            src={device.recentPicPath}
                            alt="device"
                            fill
                            className="object-cover opacity-90"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-slate-100">
                            <span className="text-[10px] text-slate-400">
                              No Pic
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-xs font-medium text-slate-500 mb-1">
                          Total Pemakaian
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-sky-700 text-2xl leading-none">
                            {device.cValue || 0}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            m³
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-1 pl-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-slate-500">
                          Tipe:{" "}
                          <span className="text-slate-700">
                            {dvctype.label}
                          </span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Upd:{" "}
                          {device.lastTime
                            ? adjustMinusOneHour(device.lastTime)
                            : "-"}
                        </span>
                      </div>

                      {/* ACTION BUTTON MOBILE */}

                      <Link
                        href={`/devices/detail?id=${device.deviceName}`}
                        className="btn btn-sm bg-sky-100 text-sky-700 hover:bg-sky-200 border-none px-4 rounded-lg">
                        Detail
                      </Link>
                    </div>
                  </div>
                );
              })}

              {filteredDevices.length === 0 && (
                <div className="text-center py-10 flex flex-col gap-2 items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
                  <Search className="w-8 h-8 text-slate-300" />
                  <span className="text-slate-500 text-sm">
                    {searchQuery
                      ? `Tidak ada device yang cocok dengan "${searchQuery}"`
                      : "Tidak ada device ditemukan"}
                  </span>
                </div>
              )}
            </div>

            {/* ---------------------------------------------------
                2. TAMPILAN DESKTOP (TABLE)
            ----------------------------------------------------- */}
            <div className="hidden md:block overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="table table-zebra w-full">
                <thead className="sticky top-0 bg-slate-50 z-10 font-bold text-slate-700 text-sm border-b border-slate-200">
                  <tr>
                    <th className="rounded-tl-xl px-4 py-4">No</th>
                    <th>Name WP</th>
                    <th>Status Sinkron</th>
                    <th>Tipe</th>
                    <th>Status Alat</th>
                    <th>Data</th>
                    <th>Picture</th>
                    <th className="rounded-tr-xl text-center">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device, index) => {
                    const syncStatus = device.syncStatus;
                    const status = getDeviceStatus(device.deviceStatus);
                    const dvctype = deviceTypes(device.networkType || 1);

                    return (
                      <tr
                        key={device.id}
                        className={`border-b border-slate-100 hover:bg-sky-50 transition-colors duration-200 group ${
                          syncStatus === "unsynced"
                            ? "bg-rose-50/10"
                            : syncStatus === "error"
                              ? "bg-red-50/10 opacity-80"
                              : ""
                        }`}>
                        {/* 1. KOLOM NO */}
                        <th className="px-4 text-slate-500 font-medium">
                          {syncStatus === "error" ? (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          ) : (
                            index + 1
                          )}
                        </th>

                        {/* 2. KOLOM NAME WP */}
                        <td className="font-semibold text-slate-700">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span>{device.houseNumber || "-"}</span>
                              {syncStatus === "unsynced" && (
                                <span className="badge badge-xs bg-rose-500 text-white font-bold text-[9px] border-none px-1.5 shadow-sm">
                                  NEW
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-normal font-mono">
                              SN: {device.deviceName}
                            </span>
                          </div>
                        </td>

                        {/* 3. KOLOM STATUS SINKRON */}
                        <td>
                          {syncStatus === "unsynced" ? (
                            <span className="p-2 badge badge-sm font-medium bg-rose-100 text-rose-700 border-none">
                              Belum Sinkron
                            </span>
                          ) : syncStatus === "error" ? (
                            <span className="p-2 badge badge-sm font-medium bg-red-100 text-red-700 border-none">
                              Server Offline
                            </span>
                          ) : (
                            <span className="p-2 badge badge-sm font-medium bg-green-100 text-green-700 border-none">
                              Sukses
                            </span>
                          )}
                        </td>

                        {/* 4. KOLOM TIPE */}
                        <td>{dvctype.label}</td>

                        {/* 5. KOLOM STATUS ALAT */}
                        <td>
                          <span
                            className={`p-2 badge badge-sm font-medium ${device.deviceStatus === 1 ? "bg-green-100 text-green-700 border-none" : "bg-slate-100 text-slate-600 border-none"}`}>
                            {status?.label}
                          </span>
                        </td>

                        {/* 6. KOLOM DATA METER */}
                        <td className="text-sm">
                          <div className="flex items-baseline gap-1">
                            <span className="text-slate-500">Value: </span>
                            <span className="font-bold text-sky-700 text-base">
                              {device.cValue || 0}
                            </span>
                            <span className="text-xs text-slate-500">m³</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            upload terakhir:{" "}
                            {device.lastTime
                              ? adjustMinusOneHour(device.lastTime)
                              : "-"}
                          </div>
                        </td>

                        {/* 7. KOLOM PICTURE */}
                        <td>
                          {device.recentPicPath?.trim() ? (
                            <div className="w-16 h-12 relative rounded border border-slate-200 overflow-hidden bg-black">
                              <Image
                                src={device.recentPicPath}
                                alt="device"
                                fill
                                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              Tidak ada gambar
                            </span>
                          )}
                        </td>

                        {/* 8. KOLOM MANAGE (GEAR MENU) */}
                        {/* 8. KOLOM MANAGE (GEAR MENU) */}
                        <td className="text-center px-4">
                          {syncStatus === "error" ? (
                            <div
                              className="btn btn-sm btn-ghost btn-circle cursor-not-allowed opacity-50"
                              title="Aksi Dinonaktifkan (Server Offline)">
                              <Settings className="w-5 h-5 text-red-400" />
                            </div>
                          ) : (
                            <div className="dropdown dropdown-bottom dropdown-end">
                              <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-sm btn-ghost btn-circle">
                                <Settings
                                  className={`w-5 h-5 transition-colors ${
                                    syncStatus === "unsynced"
                                      ? "text-rose-500 animate-pulse"
                                      : "text-slate-600 group-hover:text-sky-600"
                                  }`}
                                />
                              </div>
                              <ul
                                tabIndex={0}
                                className="dropdown-content menu bg-white rounded-box shadow-xl border border-slate-100 w-44 p-2 z-50 mt-1 gap-1">
                                {syncStatus === "unsynced" ? (
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleOpenSync(device.deviceName)
                                      }
                                      className="text-rose-600 font-semibold hover:bg-rose-50 flex items-center gap-2">
                                      <RefreshCw className="w-4 h-4" /> Sinkron
                                      Device
                                    </button>
                                  </li>
                                ) : (
                                  <>
                                    <li>
                                      <Link
                                        href={`/devices/detail?id=${device.deviceName}`}
                                        className="text-sky-600 font-medium hover:bg-sky-50">
                                        Detail
                                      </Link>
                                    </li>
                                    <li>
                                      <a className="text-slate-600 hover:bg-slate-50">
                                        Edit
                                      </a>
                                    </li>
                                    <li>
                                      <a className="text-red-600 hover:bg-red-50">
                                        Delete
                                      </a>
                                    </li>
                                  </>
                                )}
                              </ul>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredDevices.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="w-8 h-8 text-slate-300" />
                          <span className="text-slate-500 font-medium mt-2">
                            {searchQuery
                              ? `Pencarian "${searchQuery}" tidak ditemukan`
                              : "Tidak ada device ditemukan"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      <ModalAddDevice
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        selectedSN={selectedUnsyncedSN}
      />
    </div>
  );
};

export default DevicePage;
