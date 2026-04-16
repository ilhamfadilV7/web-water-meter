"use client";

import { useEffect, useState } from "react";
// Sesuaikan path import ini ke lokasi file deviceService.ts Anda
import { getUnsyncedDevices } from "@/services/deviceService";

export default function UnsyncedDeviceTable() {
  const [unsyncedList, setUnsyncedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnsynced = async () => {
    setLoading(true);
    try {
      const data = await getUnsyncedDevices();
      setUnsyncedList(data);
    } catch (error) {
      console.error("Gagal mengambil data unsynced", error);
    } finally {
      setLoading(false);
    }
  };

  // Jalankan saat komponen pertama kali dirender
  useEffect(() => {
    fetchUnsynced();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-blue-50/50 rounded-xl border border-blue-100">
        <span className="text-blue-600 font-medium animate-pulse">
          🔍 Memindai device baru dari server Lydar...
        </span>
      </div>
    );
  }

  if (unsyncedList.length === 0) {
    return (
      <div className="flex justify-center items-center p-8 bg-green-50 rounded-xl border border-green-100">
        <span className="text-green-700 font-medium">
          🎉 Semua device di Lydar sudah sinkron dengan Database Pajak!
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="bg-red-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-red-700 font-bold">
          ⚠️ Menunggu Sinkronisasi ({unsyncedList.length} Device)
        </h3>
        <p className="text-sm text-red-600/80">
          Device berikut ditemukan di Lydar tetapi belum terdaftar di sistem
          Pajak Lokal.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <th className="px-6 py-3 font-medium">Serial Number (Lydar)</th>
              <th className="px-6 py-3 font-medium">Status Lokal</th>
              <th className="px-6 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {unsyncedList.map((device: any) => (
              <tr
                key={device.deviceName}
                className="hover:bg-blue-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-800">
                  {device.deviceName}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Belum Sinkron
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    // Tombol ini akan kita fungsikan di Tahap 3
                    onClick={() =>
                      alert(
                        `Persiapan buka Modal Sinkronisasi untuk SN: ${device.deviceName}`,
                      )
                    }
                    className="inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                    Sinkronkan ke POB
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
