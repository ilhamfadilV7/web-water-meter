"use client";

import React, { useState, useEffect } from "react";
import { AlarmClockPlus, Plus, DollarSign } from "lucide-react";

// --- KONFIGURASI API ---
const urlPob = process.env.NEXT_PUBLIC_LOCAL_SERVER || "/api-bridge";

// ============================================================================
// KOMPONEN: COUNTDOWN TIMER (TETAP SAMA)
// ============================================================================
const CountdownTimer = ({
  targetDate,
  onComplete,
}: {
  targetDate: string | null;
  onComplete: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState<string>("-");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft("-");
      return;
    }

    const targetTime = new Date(targetDate).getTime();
    let intervalId: NodeJS.Timeout;

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        clearInterval(intervalId);
        setIsProcessing(true);
        setTimeLeft("⏳ Memproses...");

        setTimeout(() => {
          onComplete();
          setIsProcessing(false);
        }, 3000);

        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      let timeString = "";
      if (d > 0) timeString += `${d}h `;
      timeString += `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

      setTimeLeft(timeString);
    };

    updateTimer();
    intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  if (timeLeft === "-")
    return <span className="text-gray-400 italic">Belum dijadwalkan</span>;
  if (timeLeft.includes("⏳") || isProcessing)
    return (
      <span className="text-warning font-semibold text-xs">{timeLeft}</span>
    );

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[13px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 shadow-sm">
        ⏱ {timeLeft}
      </span>
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("schedules");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [tariffs, setTariffs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState<any[]>([]);
  const [wilayah, setWilayah] = useState<any[]>([]);

  // -------------------------------------------------------------
  // STATE: JADWAL SINKRONISASI
  // -------------------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeviceOpen, setIsDeviceOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    device_name: "",
    schedule: "* * * * *",
    description: "",
    status: "active",
  });
  const [cronUI, setCronUI] = useState({ type: "hourly", time: "12:00" });
  const [logModalData, setLogModalData] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // STATE: TARIF AIR WILAYAH
  // -------------------------------------------------------------
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isEditTariffMode, setIsEditTariffMode] = useState(false);
  const [tariffFormData, setTariffFormData] = useState({
    id: "",
    wilayah: "",
    harga: "", // format string untuk memudahkan input text, nanti diconvert ke number
  });
  const [deleteTariffConfirmId, setDeleteTariffConfirmId] = useState<
    string | null
  >(null);

  // -------------------------------------------------------------
  // STATE: TOAST NOTIFICATION
  // -------------------------------------------------------------
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // --- FETCH DATA ---
  const fetchSchedules = async () => {
    try {
      const res = await fetch(`${urlPob}/api/schedules`);
      const data = await res.json();
      if (data.success) {
        setSchedules(data.data || []);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error("Gagal mengambil jadwal:", error);
    }
  };

  const fetchTariffs = async () => {
    try {
      const res = await fetch(`${urlPob}/api/harga`);
      const data = await res.json();
      if (data.success) {
        setTariffs(data.data || []);
      } else {
        setTariffs([]);
      }
    } catch (error) {
      console.error("Gagal mengambil tarif:", error);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await fetch(`${urlPob}/api/wm/device/all`);
      const data = await res.json();
      if (data.success || data.devices) {
        setDevices(data.devices || []);
      }
    } catch (error) {
      console.error("Gagal mengambil daftar device:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchSchedules();
      await fetchTariffs();
      await fetchDevices();
      setIsLoading(false);
    };
    loadData();
  }, []);

  // -------------------------------------------------------------
  // HANDLERS: JADWAL SINKRONISASI
  // -------------------------------------------------------------
  const parseCronToUI = (cronString: string) => {
    if (cronString === "0 * * * *") return { type: "hourly", time: "12:00" };
    const dailyMatch = cronString.match(
      /^(\d{1,2})\s+(\d{1,2})\s+\*\s+\*\s+\*$/,
    );
    if (dailyMatch) {
      const m = dailyMatch[1].padStart(2, "0");
      const h = dailyMatch[2].padStart(2, "0");
      return { type: "daily", time: `${h}:${m}` };
    }
    return { type: "custom", time: "12:00" };
  };

  const generateCronFromUI = (type: string, time: string) => {
    if (type === "hourly") return "0 * * * *";
    if (type === "daily") {
      const [hour, minute] = time.split(":");
      return `${Number(minute)} ${Number(hour)} * * *`;
    }
    return formData.schedule;
  };

  const handleOpenModal = (schedule: any = null) => {
    setIsDeviceOpen(false);
    if (schedule) {
      setIsEditMode(true);
      setFormData({
        id: schedule.id,
        device_name: schedule.device_name,
        schedule: schedule.schedule,
        description: schedule.description,
        status: schedule.status,
      });
      setCronUI(parseCronToUI(schedule.schedule));
    } else {
      setIsEditMode(false);
      setFormData({
        id: "",
        device_name: "",
        schedule: "0 * * * *",
        description: "",
        status: "active",
      });
      setCronUI({ type: "hourly", time: "12:00" });
    }
    setIsModalOpen(true);
  };

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isEditMode ? "PUT" : "POST";
      const endpoint = isEditMode
        ? `${urlPob}/api/schedules/${formData.id}`
        : `${urlPob}/api/schedules`;

      const finalCronString =
        cronUI.type === "custom"
          ? formData.schedule
          : generateCronFromUI(cronUI.type, cronUI.time);

      const selectedDevice = devices.find(
        (d) => d.serial_number === formData.device_name,
      );
      const namaWpTarget = selectedDevice ? selectedDevice.nama_wp : "N/A";

      const payload = isEditMode
        ? {
            schedule: finalCronString,
            status: formData.status,
            description: formData.description,
          }
        : {
            device_name: formData.device_name,
            nama_wp: namaWpTarget,
            schedule: finalCronString,
            description: formData.description,
          };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        showToast(result.message, "success");
        setIsModalOpen(false);
        fetchSchedules();
      } else {
        showToast(result.message || "Terjadi kesalahan.", "error");
      }
    } catch (error) {
      showToast("Gagal menyimpan jadwal, periksa koneksi server.", "error");
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await fetch(`${urlPob}/api/schedules/${deleteConfirmId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success || res.ok) {
        showToast("Jadwal berhasil dihapus secara permanen.", "success");
        fetchSchedules();
      } else {
        showToast("Gagal menghapus jadwal.", "error");
      }
    } catch (error) {
      showToast("Gagal terhubung ke server saat menghapus jadwal.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: TARIF AIR WILAYAH (CRUD BARU)
  // -------------------------------------------------------------
  const handleOpenTariffModal = (tariff: any = null) => {
    if (tariff) {
      setIsEditTariffMode(true);
      setTariffFormData({
        id: tariff.id,
        wilayah: tariff.wilayah,
        harga: tariff.harga.toString(),
      });
    } else {
      setIsEditTariffMode(false);
      setTariffFormData({
        id: "",
        wilayah: "",
        harga: "",
      });
    }
    setIsTariffModalOpen(true);
  };

  const handleSubmitTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isEditTariffMode ? "PUT" : "POST";
      const endpoint = isEditTariffMode
        ? `${urlPob}/api/harga/${tariffFormData.id}`
        : `${urlPob}/api/harga`;

      const payload = {
        wilayah: tariffFormData.wilayah,
        harga: Number(tariffFormData.harga),
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success || res.ok) {
        showToast(
          isEditTariffMode
            ? "Tarif berhasil diperbarui!"
            : "Tarif baru berhasil ditambahkan!",
          "success",
        );
        setIsTariffModalOpen(false);
        fetchTariffs();
      } else {
        showToast(result.message || "Gagal menyimpan data tarif.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan jaringan, periksa server.", "error");
    }
  };

  const executeDeleteTariff = async () => {
    if (!deleteTariffConfirmId) return;
    try {
      const res = await fetch(`${urlPob}/api/harga/${deleteTariffConfirmId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success || res.ok) {
        showToast("Tarif berhasil dihapus permanen.", "success");
        fetchTariffs();
      } else {
        showToast("Gagal menghapus tarif.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan server saat menghapus tarif.", "error");
    } finally {
      setDeleteTariffConfirmId(null);
    }
  };

  // --- RENDER UI ---
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      {/* --- TOAST NOTIFICATION MODERN --- */}
      {toast.show && (
        <div className="toast toast-top toast-center z-[9999] animate-fade-in-down mt-4">
          <div
            className={`flex items-center gap-3 px-6 py-3.5 rounded-full shadow-2xl text-white font-medium transition-all duration-300 ${
              toast.type === "success"
                ? "bg-emerald-500 shadow-emerald-500/40"
                : "bg-red-500 shadow-red-500/40"
            }`}>
            {toast.type === "success" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <span className="tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Pengaturan Sistem</h1>
        <p className="text-gray-500">
          Kelola jadwal otomatisasi dan tarif air wilayah.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <button
          onClick={() => setActiveTab("schedules")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm transition-all duration-300 rounded-full ${
            activeTab === "schedules"
              ? "bg-white border border-gray-200 shadow-sm text-primary font-semibold"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-medium border border-transparent"
          }`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Jadwal Sinkronisasi
        </button>

        <button
          onClick={() => setActiveTab("tariffs")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm transition-all duration-300 rounded-full ${
            activeTab === "tariffs"
              ? "bg-white border border-gray-200 shadow-sm text-primary font-semibold"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-medium border border-transparent"
          }`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Tarif Air Wilayah
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          {/* =====================================================================
              TAB 1: SCHEDULES (JADWAL)
          ====================================================================== */}
          {activeTab === "schedules" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Daftar Jadwal (Cron Job)
                </h2>
                <button
                  className="btn btn-md bg-sky-600 hover:bg-sky-700 text-white shadow-lg hover:shadow-sky-500/30 border-none"
                  onClick={() => handleOpenModal()}>
                  <AlarmClockPlus className="w-4 h-4" />
                  Buat Scheduler
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead className="bg-base-200">
                    <tr>
                      <th>Device / SN</th>
                      <th>Deskripsi</th>
                      <th>Jadwal Cron</th>
                      <th>Siklus</th>
                      <th>Jadwal Selanjutnya</th>
                      <th>Status & Log</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.length > 0 ? (
                      schedules.map((item) => (
                        <tr key={item.id} className="hover">
                          <td className="font-medium text-gray-700">
                            {item.nama_wp}
                          </td>
                          <td className="text-gray-600">{item.description}</td>
                          <td>
                            <code className="bg-gray-100 border border-gray-200 px-2 py-1 rounded text-primary text-sm shadow-inner">
                              {item.schedule}
                            </code>
                          </td>
                          <td>
                            <span className="p-2 badge badge-sm bg-blue-100 text-blue-700 border-blue-200">
                              {item.passed} x berjalan
                            </span>
                          </td>
                          <td>
                            <CountdownTimer
                              targetDate={item.next_run_time}
                              onComplete={() => fetchSchedules()}
                            />
                            {item.next_run_time && (
                              <div className="text-[10px] text-gray-400 mt-1 pl-1">
                                Tepatnya:{" "}
                                {new Date(
                                  item.next_run_time,
                                ).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                WIB
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="flex flex-col items-start gap-1">
                              <span
                                className={`p-2 badge badge-sm font-semibold uppercase tracking-wider ${item.status === "active" ? "bg-green-100 text-green-700 border-green-200" : item.status === "error" ? "bg-red-100 text-red-700 border-red-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                {item.status}
                              </span>
                              {item.status === "error" && item.log && (
                                <button
                                  onClick={() => setLogModalData(item.log)}
                                  className="flex items-center gap-1 mt-1 text-[11px] font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors border border-red-100">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                  </svg>
                                  Lihat Log
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="text-right space-x-2">
                            <button
                              className="btn btn-sm btn-ghost hover:bg-blue-50 hover:text-blue-600 text-gray-500"
                              onClick={() => handleOpenModal(item)}>
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-ghost hover:bg-red-50 hover:text-red-600 text-gray-500"
                              onClick={() => setDeleteConfirmId(item.id)}>
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-8 text-gray-400 italic">
                          Tidak ada jadwal yang aktif.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 2: TARIFFS (TARIF AIR WILAYAH)
          ====================================================================== */}
          {activeTab === "tariffs" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Daftar Harga Tarif Air
                </h2>
                <button
                  className="btn btn-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-500/30 border-none"
                  onClick={() => handleOpenTariffModal()}>
                  <Plus className="w-4 h-4" />
                  Tambah Tarif
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead className="bg-base-200">
                    <tr>
                      <th>ID</th>
                      <th>Wilayah</th>
                      <th>Tarif Per m³</th>
                      <th>Terakhir Diupdate</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tariffs.length > 0 ? (
                      tariffs.map((item) => (
                        <tr key={item.id} className="hover">
                          <td className="text-gray-500">{item.id}</td>
                          <td className="capitalize font-medium text-gray-700">
                            {item.wilayah.replace("_", " ")}
                          </td>
                          <td className="font-bold text-green-600 bg-green-50/50 rounded-lg">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            }).format(Number(item.harga))}
                          </td>
                          <td className="text-sm text-gray-500">
                            {new Date(item.updated_time).toLocaleString(
                              "id-ID",
                            )}
                          </td>
                          <td className="text-right space-x-2">
                            <button
                              className="btn btn-sm btn-ghost hover:bg-blue-50 hover:text-blue-600 text-gray-500"
                              onClick={() => handleOpenTariffModal(item)}>
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-ghost hover:bg-red-50 hover:text-red-600 text-gray-500"
                              onClick={() => setDeleteTariffConfirmId(item.id)}>
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-gray-400 italic">
                          Belum ada data tarif yang tersimpan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODAL: KONFIRMASI HAPUS JADWAL
      ====================================================================== */}
      {deleteConfirmId && (
        <div className="modal modal-open bg-black/40 backdrop-blur-sm transition-all">
          <div className="modal-box max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-bold text-lg text-gray-800">Hapus Jadwal?</h3>
            <p className="py-2 text-gray-500 text-sm">
              Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                className="btn btn-ghost px-6"
                onClick={() => setDeleteConfirmId(null)}>
                Batal
              </button>
              <button
                className="btn border-none bg-red-500 hover:bg-red-600 text-white px-6 shadow-lg shadow-red-500/30"
                onClick={executeDelete}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: KONFIRMASI HAPUS TARIF
      ====================================================================== */}
      {deleteTariffConfirmId && (
        <div className="modal modal-open bg-black/40 backdrop-blur-sm transition-all">
          <div className="modal-box max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-bold text-lg text-gray-800">Hapus Tarif?</h3>
            <p className="py-2 text-gray-500 text-sm">
              Apakah Anda yakin ingin menghapus data tarif ini? Tindakan ini
              tidak dapat dibatalkan.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                className="btn btn-ghost px-6"
                onClick={() => setDeleteTariffConfirmId(null)}>
                Batal
              </button>
              <button
                className="btn border-none bg-red-500 hover:bg-red-600 text-white px-6 shadow-lg shadow-red-500/30"
                onClick={executeDeleteTariff}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: FORM JADWAL SINKRONISASI
      ====================================================================== */}
      {isModalOpen && (
        <div className="modal modal-open bg-black/30 backdrop-blur-sm">
          <div className="modal-box border-t-4 border-primary">
            <h3 className="font-bold text-xl mb-6 text-gray-800">
              {isEditMode ? "Edit Jadwal Sinkronisasi" : "Buat Jadwal Baru"}
            </h3>
            <form onSubmit={handleSubmitSchedule} className="space-y-5">
              {!isEditMode && (
                <div className="form-control">
                  <label className="label font-medium text-gray-700">
                    <span className="label-text">Pilih Device</span>
                  </label>

                  {/* CUSTOM DROPDOWN SELECT (REACT CONTROLLED) */}
                  <div
                    className="relative w-full"
                    onBlur={(e) => {
                      // Ini fitur keren: Jika klik di luar area, otomatis tertutup
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setIsDeviceOpen(false);
                      }
                    }}>
                    <div
                      tabIndex={0}
                      role="button"
                      onClick={() => setIsDeviceOpen((prev) => !prev)}
                      className="btn btn-outline w-full justify-between bg-gray-50 border-gray-300 hover:bg-white hover:border-primary normal-case font-normal text-left h-auto py-2.5">
                      {formData.device_name ? (
                        <div className="flex flex-col items-start leading-tight">
                          <span className="font-bold text-gray-800">
                            Nama WP:{" "}
                            {devices.find(
                              (d) => d.serial_number === formData.device_name,
                            )?.nama_wp || "N/A"}
                          </span>
                          <span className="text-[11px] text-gray-500 mt-0.5">
                            Wilayah:{" "}
                            {devices.find(
                              (d) => d.serial_number === formData.device_name,
                            )?.wilayah || "N/A"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          -- Pilih Device --
                        </span>
                      )}

                      {/* Panah akan berputar cantik saat diklik */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 opacity-50 shrink-0 transition-transform duration-200 ${isDeviceOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    <ul
                      className={`absolute left-0 top-[105%] z-[100] flex flex-col p-2 shadow-2xl bg-white border border-gray-100 rounded-xl w-full max-h-64 overflow-y-auto origin-top transition-all duration-200 ${
                        isDeviceOpen
                          ? "opacity-100 scale-y-100 pointer-events-auto"
                          : "opacity-0 scale-y-95 pointer-events-none"
                      }`}>
                      {devices.length > 0 ? (
                        devices.map((dev, index) => (
                          <li
                            key={`${dev.serial_number}-${index}`}
                            className="mb-1 w-full block">
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  device_name: dev.serial_number,
                                });
                                setIsDeviceOpen(false); // Tutup menu setelah dipilih
                              }}
                              className={`w-full flex flex-col items-start p-3 rounded-lg hover:bg-sky-50 transition-colors ${
                                formData.device_name === dev.serial_number
                                  ? "bg-sky-50 border-l-4 border-sky-600"
                                  : ""
                              }`}>
                              <div className="text-sm font-bold text-gray-800">
                                Nama WP: {dev.nama_wp || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Wilayah: {dev.wilayah || "N/A"}
                              </div>
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="p-4 text-center text-gray-400 italic text-sm w-full">
                          Tidak ada device tersinkron.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
              <div className="form-control p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <label className="label font-medium text-blue-900 pb-1">
                  <span className="label-text flex items-center gap-2">
                    ⏱️ Frekuensi Sinkronisasi
                  </span>
                </label>

                <div className="flex flex-col gap-3 mt-2">
                  <select
                    className="select select-bordered w-full bg-white font-medium"
                    value={cronUI.type}
                    onChange={(e) =>
                      setCronUI({ ...cronUI, type: e.target.value })
                    }>
                    <option value="hourly">Setiap 1 Jam Sekali</option>
                    <option value="daily">Setiap Hari pada jam tertentu</option>
                    <option value="custom">
                      Custom (Masukkan Cron String Manual)
                    </option>
                  </select>

                  {cronUI.type === "daily" && (
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 animate-fade-in-down">
                      <span className="text-gray-600 text-sm font-medium w-32">
                        Pilih Jam:
                      </span>
                      <input
                        type="time"
                        required
                        className="input input-bordered w-full"
                        value={cronUI.time}
                        onChange={(e) =>
                          setCronUI({ ...cronUI, time: e.target.value })
                        }
                      />
                    </div>
                  )}

                  {cronUI.type === "custom" && (
                    <div className="animate-fade-in-down">
                      <input
                        type="text"
                        required
                        className="input input-bordered w-full font-mono text-primary bg-white tracking-widest text-lg"
                        placeholder="* * * * *"
                        value={formData.schedule}
                        onChange={(e) =>
                          setFormData({ ...formData, schedule: e.target.value })
                        }
                      />
                      <label className="label">
                        <span className="label-text-alt text-gray-500">
                          Gunakan format Linux Cron standard.
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-right">
                  <span className="text-[11px] text-gray-400 font-mono">
                    Output ke API:{" "}
                    {cronUI.type === "custom"
                      ? formData.schedule
                      : generateCronFromUI(cronUI.type, cronUI.time)}
                  </span>
                </div>
              </div>

              <div className="form-control">
                <label className="label font-medium text-gray-700">
                  <span className="label-text">Deskripsi</span>
                </label>
                <input
                  type="text"
                  required
                  className="input input-bordered w-full bg-gray-50 focus:bg-white"
                  placeholder="Contoh: Sinkronisasi harian Asahan"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              {isEditMode && (
                <div className="form-control">
                  <label className="label font-medium text-gray-700">
                    <span className="label-text">Status Sistem</span>
                  </label>
                  <select
                    className="select select-bordered w-full bg-gray-50 focus:bg-white font-medium"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }>
                    <option value="active">🟢 Active (Berjalan)</option>
                    <option value="inactive">⏸️ Inactive (Jeda)</option>
                  </select>
                </div>
              )}
              <div className="modal-action mt-8 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  className="btn border-none bg-slate-200 hover:bg-slate-300 text-slate-700 px-6"
                  onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-md bg-sky-600 hover:bg-sky-700 text-white shadow-lg hover:shadow-sky-500/30 border-none">
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: FORM TARIF AIR
      ====================================================================== */}
      {isTariffModalOpen && (
        <div className="modal modal-open bg-black/30 backdrop-blur-sm">
          <div className="modal-box border-t-4 border-emerald-500">
            <h3 className="font-bold text-xl mb-6 text-gray-800">
              {isEditTariffMode ? "Edit Tarif Air" : "Tambah Tarif Air Baru"}
            </h3>
            <form onSubmit={handleSubmitTariff} className="space-y-5">
              <div className="form-control">
                <label className="label font-medium text-gray-700">
                  <span className="label-text">Wilayah / Kota</span>
                </label>

                {/* DITAMBAHKAN CLASSNAME DAISYUI DAN REQUIRED */}
                <select
                  required
                  className="select select-bordered w-full bg-gray-50 focus:bg-white transition-colors font-medium"
                  value={tariffFormData.wilayah}
                  onChange={(e) =>
                    setTariffFormData({
                      ...tariffFormData,
                      wilayah: e.target.value,
                    })
                  }>
                  {/* OPTION PERTAMA DIBUAT DISABLED AGAR JADI PLACEHOLDER */}
                  <option value="" disabled>
                    -- Pilih Wilayah --
                  </option>
                  <option value="asahan">Asahan</option>
                  <option value="labuhanbatu">Labuhanbatu</option>
                  <option value="medan">Medan</option>
                  <option value="deliserdang">Deliserdang</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label font-medium text-gray-700">
                  <span className="label-text">
                    Harga Tarif Per Meter Kubik (Rp)
                  </span>
                </label>

                {/* MENGGUNAKAN GAYA NATIVE DAISYUI UNTUK ICON DI DALAM INPUT */}
                <label className="input input-bordered flex items-center gap-3 bg-gray-50 focus-within:bg-white focus-within:border-emerald-500 transition-colors overflow-hidden">
                  <DollarSign className="h-5 w-5 text-gray-400 shrink-0" />
                  <input
                    type="number"
                    required
                    min="0"
                    className="grow font-mono text-lg text-emerald-700 outline-none border-none bg-transparent"
                    placeholder="0"
                    value={tariffFormData.harga}
                    onChange={(e) =>
                      setTariffFormData({
                        ...tariffFormData,
                        harga: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <div className="modal-action mt-8 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  className="btn border-none bg-slate-200 hover:bg-slate-300 text-slate-700 px-6"
                  onClick={() => setIsTariffModalOpen(false)}>
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-500/30 border-none">
                  Simpan Tarif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL UNTUK LOG ERROR --- */}
      {logModalData && (
        <div className="modal modal-open bg-black/60 backdrop-blur-md">
          <div className="modal-box w-11/12 max-w-2xl border-t-4 border-red-500 shadow-2xl bg-white">
            <h3 className="font-bold text-lg flex items-center gap-2 text-red-600 mb-4 border-b pb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Sistem Log (Crash Report)
            </h3>
            <div className="mockup-code bg-[#0d1117] text-red-400 text-sm max-h-[400px] overflow-y-auto shadow-inner rounded-xl border border-gray-800">
              <pre data-prefix="~" className="text-gray-500">
                <code>// Extracted from backend process</code>
              </pre>
              <pre data-prefix=">">
                <code>
                  {typeof logModalData === "object"
                    ? JSON.stringify(logModalData, null, 2)
                    : logModalData}
                </code>
              </pre>
            </div>
            <div className="modal-action mt-6">
              <button
                className="btn btn-outline border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={() => setLogModalData(null)}>
                Tutup Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
