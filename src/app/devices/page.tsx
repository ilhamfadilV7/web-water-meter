"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, Search } from "lucide-react"; // <-- Tambahkan icon Search

import { Device } from "@/types/device";
import { getDevices } from "@/services/deviceService";
import { getDeviceStatus } from "@/utils/deviceStatus";
import { deviceTypes } from "@/utils/deviceType";
import { isTokenExpired } from "@/utils/auth";
import { adjustMinusOneHour } from "@/utils/date";
import ModalAddDevice from "@/component/modalAddDevice";

const DevicePage = () => {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);

  // State untuk menyimpan teks pencarian
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Pengecekan Token Auth
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired()) {
      localStorage.removeItem("token");
      localStorage.removeItem("token_expire");
      router.push("/");
    }
  }, [router]);

  // 2. FETCH DATA DENGAN SWR
  const { data, isLoading } = useSWR("getAllDevicesTable", getDevices);
  const devices: Device[] = data || [];

  // 3. LOGIKA PENCARIAN (FILTER)
  const filteredDevices = devices.filter((device) => {
    // Jika tidak ada pencarian, tampilkan semua
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();

    // Cek apakah ada kecocokan di Nama WP, Serial Number, atau Alamat
    const matchName =
      device.houseNumber?.toLowerCase().includes(query) || false;
    const matchSerial =
      device.deviceName?.toLowerCase().includes(query) || false;
    const matchAddress = device.address?.toLowerCase().includes(query) || false;

    return matchName || matchSerial || matchAddress;
  });

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

      {/* ================= ACTION BAR (Pencarian & Add Button) ================= */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Kolom Pencarian */}
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama WP, serial, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-10 bg-slate-50 border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>

        {/* Tombol Add (Hidden di Mobile) */}
        <div className="hidden md:flex shrink-0 w-full md:w-auto">
          <button
            onClick={() => setOpenModal(true)}
            className="btn bg-sky-700 hover:bg-sky-800 text-white btn-md w-full md:w-auto shadow-sm border-none px-6">
            + ADD DEVICE
          </button>
        </div>
      </div>

      {/* ================= AREA LIST DEVICE ================= */}
      <div className="pb-10">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner text-sky-600 loading-lg"></span>
          </div>
        ) : (
          <>
            {/* ---------------------------------------------------
                1. TAMPILAN MOBILE (CARD LIST) - Tampil di bawah md
            ----------------------------------------------------- */}
            <div className="flex flex-col gap-4 md:hidden">
              {filteredDevices.map((device, index) => {
                const status = getDeviceStatus(device.deviceStatus);
                const dvctype = deviceTypes(device.networkType);

                return (
                  <div
                    key={device.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${device.deviceStatus === 1 ? "bg-green-500" : "bg-slate-300"}`}></div>

                    <div className="flex justify-between items-start pl-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-lg leading-tight">
                          {device.houseNumber || "-"}
                        </span>
                        <span className="text-xs text-slate-500 font-mono mt-0.5">
                          {device.deviceName}
                        </span>
                      </div>
                      <span
                        className={`badge badge-sm font-medium ${device.deviceStatus === 1 ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-100 ml-2">
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

                      <Link
                        href={`/devices/detail?id=${device.deviceName}`}
                        className="btn btn-sm bg-sky-100 text-sky-700 hover:bg-sky-200 border-none px-4 rounded-lg">
                        Detail
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* Empty State Mobile */}
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
                2. TAMPILAN DESKTOP (TABLE) - Tampil dari md ke atas
            ----------------------------------------------------- */}
            <div className="hidden md:block overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="table table-zebra w-full">
                {/* head */}
                <thead className="sticky top-0 bg-slate-50 z-10 font-bold text-slate-700 text-sm border-b border-slate-200">
                  <tr>
                    <th className="rounded-tl-xl px-4 py-4">No</th>
                    <th>Name WP</th>
                    <th>Alamat</th>
                    <th>Tipe</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Picture</th>
                    <th className="rounded-tr-xl text-center">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device, index) => {
                    const status = getDeviceStatus(device.deviceStatus);
                    const dvctype = deviceTypes(device.networkType);

                    return (
                      <tr
                        key={device.id}
                        className="border-b border-slate-100 hover:bg-sky-50 transition-colors duration-200 group">
                        <th className="px-4">{index + 1}</th>
                        <td className="font-semibold text-slate-700">
                          {device.houseNumber || "-"}
                        </td>
                        <td
                          className="max-w-[150px] truncate"
                          title={device.address || ""}>
                          {device.address || "-"}
                        </td>
                        <td>{dvctype.label}</td>
                        <td>
                          <span
                            className={`badge badge-sm font-medium ${device.deviceStatus === 1 ? "bg-green-100 text-green-700 border-none" : "bg-slate-100 text-slate-600 border-none"}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="text-sm">
                          <div className="flex items-baseline gap-1">
                            <span className="text-slate-500">Value: </span>
                            <span className="font-bold text-sky-700 text-base">
                              {device.cValue || 0}
                            </span>
                            <span className="text-xs text-slate-500">m³</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Upd:{" "}
                            {device.lastTime
                              ? adjustMinusOneHour(device.lastTime)
                              : "-"}
                          </div>
                        </td>
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
                              No image
                            </span>
                          )}
                        </td>
                        <td className="text-center px-4">
                          <div className="dropdown dropdown-bottom dropdown-end">
                            <div
                              tabIndex={0}
                              role="button"
                              className="btn btn-sm btn-ghost btn-circle">
                              <Settings className="w-5 h-5 text-slate-600" />
                            </div>
                            <ul
                              tabIndex={0}
                              className="dropdown-content menu bg-white rounded-box shadow-xl border border-slate-100 w-36 p-2 z-50 mt-1 gap-1">
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
                            </ul>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty State Desktop */}
                  {filteredDevices.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-16">
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
      <ModalAddDevice isOpen={openModal} onClose={() => setOpenModal(false)} />
    </div>
  );
};

export default DevicePage;
