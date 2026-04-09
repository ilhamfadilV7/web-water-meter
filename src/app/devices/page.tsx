"use client";

import { useEffect, useState } from "react";
import useSWR from "swr"; // <-- Tambahkan SWR
import Image from "next/image";
import Link from "next/link"; // <-- Tambahkan Link Next.js
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <span className="text-2xl text-neutral font-bold">Device Menu</span>
        <div className="breadcrumbs text-md text-slate-500">
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

      <div className="flex justify-end">
        <button
          onClick={() => setOpenModal(true)}
          className="btn bg-sky-700 hover:bg-sky-800 text-white btn-md w-auto shadow-sm border-none">
          + ADD DEVICE
        </button>
      </div>

      <div className="overflow-visible rounded-box border border-base-content/10 bg-base-100 shadow-sm pb-10">
        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner text-sky-600 loading-lg"></span>
          </div>
        ) : (
          <table className="table table-zebra w-full">
            {/* head */}
            <thead className="sticky top-0 bg-slate-100 z-10 font-bold text-slate-700 text-sm shadow-sm">
              <tr>
                <th className="rounded-tl-box">No</th>
                <th>Name WP</th>
                <th>Alamat</th>
                <th>Tipe</th>
                <th>Status</th>
                <th>Data</th>
                <th>Picture</th>
                <th className="rounded-tr-box text-center">Manage</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device, index) => {
                const status = getDeviceStatus(device.deviceStatus);
                const dvctype = deviceTypes(device.networkType);

                return (
                  <tr
                    key={device.id}
                    className="border-b border-slate-100 hover:bg-sky-50 transition-colors duration-200 group">
                    <th>{index + 1}</th>
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
                        className={`badge badge-sm ${device.deviceStatus === 1 ? "badge-success text-white" : "badge-ghost"}`}>
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
                    <td className="text-center">
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
                            {/* LINK MENUJU HALAMAN DETAIL YANG KITA BUAT */}
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
              {devices.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-500">
                    Tidak ada device ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      <ModalAddDevice isOpen={openModal} onClose={() => setOpenModal(false)} />
    </div>
  );
};

export default DevicePage;
