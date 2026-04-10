// src/app/devices/detail/ClientView.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import useSWR, { useSWRConfig } from "swr";
import {
  Signal,
  Battery,
  Activity,
  Info,
  X,
  Settings,
  Download,
  Database,
  AlertCircle,
  RefreshCw,
  Play,
} from "lucide-react";
import { errorCode } from "@/utils/errorCode";

import { getDeviceStatus } from "@/utils/deviceStatus";
import { deviceTypes } from "@/utils/deviceType";
import sui from "../../../../public/drop.png";
import {
  getDeviceDetail,
  getDeviceData,
  getDeviceConfig,
  getDeviceQWakeupInfo,
  updateDeviceSettings,
  getDeviceLogs,
  getSyncLogs,
  startSync,
} from "@/services/deviceService";
import { adjustMinusOneHour, formatToWIB } from "@/utils/date";
import { getPictures } from "@/services/getPictureService";

// KOMPONEN INI SEKARANG MENERIMA TOKEN & DEVICENAME DARI SERVER
export default function ClientView({
  deviceName,
  token,
}: {
  deviceName: string;
  token: string;
}) {
  // State UI Lokal
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPicPage, setCurrentPicPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedError, setSelectedError] = useState<{
    code: number;
    label: string;
    solution?: string;
  } | null>(null);
  const { mutate } = useSWRConfig();
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showCustomAlert = (type: "success" | "error", message: string) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo(null);
    }, 3000); // Alert hilang setelah 3000ms (3 detik)
  };

  // ==========================================
  // TIDAK ADA LAGI USE-EFFECT UNTUK AUTH!
  // ==========================================

  // SWR 1: FETCH DEVICE INFO
  const { data: infoData, isLoading: loadingInfo } = useSWR(
    ["deviceInfo", deviceName],
    ([_, name]) => getDeviceDetail(name as string, token),
  );

  // SWR 2: FETCH DATA CAPTURE (Kanan)
  const { data: captureData, isLoading: loadingCapture } = useSWR(
    ["deviceData", deviceName, currentPage],
    ([_, name, page]) => {
      const endStamp = Math.floor(Date.now() / 1000);
      const startStamp = endStamp - 30 * 24 * 60 * 60;
      return getDeviceData(
        name as string,
        startStamp,
        endStamp,
        page as number,
        10,
        token,
      );
    },
    { keepPreviousData: true },
  );

  // SWR 3: FETCH GALERI GAMBAR (Tab)
  const { data: pictureData, isLoading: loadingPictures } = useSWR(
    ["devicePictures", deviceName, currentPicPage],
    ([_, name, page]) => getPictures(name as string, page as number, 10, token),
    { keepPreviousData: true },
  );

  //fetch data device config
  const { data: deviceConfigData } = useSWR(
    ["deviceConfig", deviceName],
    ([_, name]) => getDeviceConfig(name as string, token),
  );

  //fetch data qWakeupInfo
  const { data: qWakeupInfoData } = useSWR(
    ["deviceQWakeupInfo", deviceName],
    ([_, name]) => getDeviceQWakeupInfo(name as string, token),
  );

  // SWR 4: FETCH DEVICE LOGS (Tab 4)
  const { data: logsData, isLoading: loadingLogs } = useSWR(
    ["deviceLogs", deviceName, currentPage], // Opsional: Buat logPage terpisah jika ingin beda paginasi dengan Data Capture
    ([_, name, page]) =>
      getDeviceLogs(name as string, 0, Date.now(), page as number, 10, token),
    { keepPreviousData: true },
  );

  // SWR 5: FETCH SYNC LOGS (API Lokal)
  const { data: syncData, isLoading: loadingSync } = useSWR(
    ["syncLogs", deviceName],
    ([_, name]) => getSyncLogs(name as string),
    { refreshInterval: 5000 }, // Opsional: Auto-refresh setiap 5 detik agar status "RUNNING" bisa terupdate otomatis
  );

  // --- EKSTRAKSI DATA ---
  const deviceInfo = infoData?.code === 200 ? infoData.data : null;
  const captureDataList =
    captureData?.code === 200 ? captureData.data?.list || [] : [];
  const totalPages =
    captureData?.code === 200 ? captureData.data?.pages || 1 : 1;
  const pictureList = pictureData?.list || [];
  const totalPicPages = pictureData?.pages || 1;
  const deviceConfig =
    deviceConfigData?.code === 200 ? deviceConfigData.data : null;
  const currentPicQuality = deviceConfig?.picQuality || 5;
  const displayQuality =
    selectedQuality !== null ? selectedQuality : currentPicQuality;
  const wakeupinfo =
    qWakeupInfoData?.code === 200 ? qWakeupInfoData.data : null;
  const logsList = logsData?.code === 200 ? logsData.data?.content || [] : [];
  const syncList = syncData?.success ? syncData.data : [];

  const handleSaveSettings = async () => {
    // Jika tidak ada perubahan atau sedang loading, batalkan
    if (
      selectedQuality === null ||
      selectedQuality === currentPicQuality ||
      isSaving
    )
      return;

    setIsSaving(true);
    try {
      const result = await updateDeviceSettings(
        deviceName,
        selectedQuality,
        token,
      );

      if (result.code === 200) {
        // Refresh data device info secara background agar UI sinkron dengan database
        await mutate(["deviceInfo", deviceName]);
        setSelectedQuality(null); // Reset pilihan lokal karena SWR sudah memiliki data baru

        showCustomAlert("success", "Pengaturan berhasil disimpan!");
      } else {
        showCustomAlert("error", "Gagal menyimpan pengaturan: " + result.msg);
      }
    } catch (error) {
      showCustomAlert("error", "Terjadi kesalahan saat menghubungi server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncNow = async () => {
    if (isSyncingNow) return; // Mencegah double klik

    setIsSyncingNow(true);
    try {
      const result = await startSync(deviceName);

      // Asumsi API Anda mengembalikan { success: true } seperti GET sync-logs
      if (result.success || result.code === 200) {
        showCustomAlert("success", "Perintah sinkronisasi berhasil dikirim!");
        // Langsung refresh tabel agar muncul baris status "SYNC IS RUNNING"
        mutate(["syncLogs", deviceName]);
      } else {
        showCustomAlert(
          "error",
          "Gagal sinkronisasi: " + (result.message || "Unknown error"),
        );
      }
    } catch (error) {
      showCustomAlert(
        "error",
        "Terjadi kesalahan pada server saat sinkronisasi.",
      );
    } finally {
      setIsSyncingNow(false);
    }
  };

  if (loadingInfo) {
    return (
      <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-sky-600"></span>
      </div>
    );
  }

  if (!deviceInfo) {
    return (
      <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center text-slate-500">
        Data device tidak ditemukan. Pastikan URL valid.
      </div>
    );
  }

  const statusInfo = getDeviceStatus(deviceInfo.deviceStatus);
  const networkInfo = deviceTypes(deviceInfo.networkType);

  // --- HELPER KHUSUS UNTUK MEMAKSA WAKTU SYNC KE WIB ---
  const formatSyncUTCtoWIB = (
    dateString: string | null,
    isTimeOnly = false,
  ) => {
    if (!dateString) return "-";

    // 1. Parsing tanggal dari API apa adanya
    const dateObj = new Date(dateString);

    // 2. FIX BUG DARI BACKEND: Tambahkan ekstra 7 Jam secara manual
    // Ini mengompensasi backend yang secara keliru telah mengurangi 7 jam sebelumnya.
    dateObj.setHours(dateObj.getHours());

    // 3. Konfigurasi format jam (Tetap kunci ke Jakarta)
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Jakarta",
      hour12: false,
    };

    if (!isTimeOnly) {
      options.day = "2-digit";
      options.month = "short";
      options.year = "numeric";
    }

    return new Intl.DateTimeFormat("id-ID", options)
      .format(dateObj)
      .replace(/\./g, ":");
  };

  const calculateDuration = (start: string, finish: string) => {
    // Karena start dan finish dua-duanya salah 7 jam, selisih durasinya tetap akan akurat
    // Jadi kita tidak perlu memodifikasi apapun di sini
    const startMs = new Date(start).getTime();
    const finishMs = new Date(finish).getTime();
    return ((finishMs - startMs) / 1000).toFixed(1);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full min-h-[calc(100vh-6rem)] p-4 relative items-start">
      {/* ================= TOAST ALERT ================= */}
      {alertInfo && (
        <div className="toast toast-top toast-center z-[9999] mt-14 animate-in slide-in-from-right fade-in duration-300">
          <div
            className={`alert ${alertInfo.type === "success" ? "alert-success text-white" : "alert-error text-white"} shadow-lg flex items-center`}>
            {alertInfo.type === "success" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <span className="font-medium">{alertInfo.message}</span>
          </div>
        </div>
      )}
      {/* ================= BAGIAN KIRI ================= */}
      <div className="flex flex-col gap-4 w-full lg:w-2/3">
        {/* KOTAK INFORMASI */}
        <div className="h-auto min-h-[120px] rounded-lg border border-slate-300 bg-white shadow-sm p-5 flex flex-col gap-6 shrink-0">
          <p className="font-semibold text-slate-800 text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-sky-600" /> Informasi Device
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-xl transition-shadow hover:border-sky-500">
              <span className="text-sm font-semibold text-slate-500 mb-1">
                Sinyal
              </span>
              <div className="flex items-center gap-1 font-bold text-sky-700">
                <Signal className="w-5 h-5 text-sky-500" />
                {deviceInfo.signal || "-"}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-xl transition-shadow hover:border-sky-500">
              <span className="text-sm font-semibold text-slate-500 mb-1">
                Baterai
              </span>
              <div className="flex flex-col items-center gap-1 font-bold text-sky-700">
                <Battery className="w-5 h-5 text-green-500" />
                <span className="text-xl">{deviceInfo.electricity}%</span>
                <span className="text-sm">
                  dari {deviceInfo.batteryCapacity} mAh
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-xl transition-shadow hover:border-sky-500">
              <span className="text-sm font-semibold text-slate-500 mb-1">
                Tipe
              </span>
              <span className="text-2xl font-bold text-sky-700">
                {networkInfo.label}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-xl transition-shadow hover:border-sky-500">
              <span className="text-sm font-semibold text-slate-500 mb-1">
                Status
              </span>
              <span
                className={`text-xl font-bold ${deviceInfo.deviceStatus === 1 ? "text-green-600" : "text-slate-600"}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-100">
            <div className="flex flex-col items-start p-2">
              <span className="text-sm font-semibold text-slate-400 mb-1">
                Device Name
              </span>
              <span className="font-medium text-slate-700">
                {deviceInfo.houseNumber || "-"}
              </span>
            </div>
            <div className="flex flex-col items-start p-2">
              <span className="text-sm font-semibold text-slate-400 mb-1">
                Serial Number
              </span>
              <span className="font-medium text-slate-700 font-mono">
                {deviceInfo.deviceName}
              </span>
            </div>
            <div className="flex flex-col items-start p-2">
              <span className="text-sm font-semibold text-slate-400 mb-1">
                Alamat Pemasangan
              </span>
              <span className="text-sm font-medium text-slate-700 leading-relaxed">
                {deviceInfo.address || ""}{" "}
                {deviceInfo.description ? `(${deviceInfo.description})` : ""}
              </span>
            </div>
            <div className="flex flex-col items-start p-2">
              <span className="text-sm font-semibold text-slate-400 mb-1">
                Data terakhir diperbarui
              </span>
              <span className="text-sm font-medium text-slate-700 leading-relaxed">
                {adjustMinusOneHour(deviceInfo.lastTime)}
              </span>
            </div>
          </div>
        </div>

        {/* ================= TABS ================= */}
        {/* Menggunakan format murni DaisyUI v5: tabs-box */}
        <div className="tabs tabs-box bg-white border border-slate-300 rounded-lg shadow-sm w-full">
          {/* TAB 1: GRAFIK PENGGUNAAN */}
          <input
            type="radio"
            name="my_tabs_6"
            className="tab px-4 font-medium text-slate-600"
            aria-label="Grafik Penggunaan"
          />
          <div className="tab-content bg-base-100 border-base-300 p-6 mt-2">
            <p className="font-semibold text-slate-600 flex items-center gap-2">
              <Activity className="w-5 h-5" /> Grafik Penggunaan (Coming Soon)
            </p>
          </div>

          {/* TAB 2: GALERI GAMBAR */}
          <input
            type="radio"
            name="my_tabs_6"
            className="tab px-4 font-medium text-slate-600"
            aria-label="Galeri Gambar"
          />
          {/* PERBAIKAN: Jangan taruh flex di tab-content */}
          <div className="tab-content bg-base-100 border-base-300 p-6 mt-2">
            {/* Bungkus isinya dengan div baru untuk flex layout */}
            <div className="flex flex-col w-full">
              <div className="mb-6">
                <p className="font-semibold text-slate-800 text-lg">
                  Galeri Gambar
                </p>
              </div>

              <div className="w-full">
                {loadingPictures ? (
                  <div className="flex justify-center items-center h-32">
                    <span className="loading loading-spinner text-sky-500"></span>
                  </div>
                ) : pictureList.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {pictureList.map((pic: any, index: number) => (
                      <div
                        key={index}
                        className="flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all group">
                        <div
                          className="relative w-full aspect-[4/3] bg-slate-900 border-b border-slate-200 overflow-hidden"
                          onClick={() =>
                            pic.path && setSelectedImage(pic.path)
                          }>
                          {pic.path ? (
                            <Image
                              src={pic.path}
                              alt={`Capture ${index}`}
                              fill
                              className="object-cover group-hover:opacity-75 group-hover:scale-105 transition-all duration-300 cursor-pointer"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100">
                              <Image
                                src={sui}
                                alt="No pic"
                                width={30}
                                height={30}
                                className="opacity-30"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col p-3 gap-1 bg-slate-50">
                          <span className="text-[11px] font-semibold text-slate-400">
                            {pic.createTime
                              ? adjustMinusOneHour(pic.createTime)
                              : "-"}
                          </span>
                          <span className="text-sm font-bold text-sky-700">
                            {pic.value || 0}{" "}
                            <span className="text-xs font-normal text-slate-500">
                              m³
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-32 text-slate-400">
                    Belum ada gambar tersedia.
                  </div>
                )}
              </div>

              {/* PAGINATION GALERI */}
              <div className="flex justify-center pt-6 mt-6 border-t border-slate-100">
                <div className="join shadow-sm">
                  <button
                    className="join-item btn btn-sm bg-white border-slate-300 text-slate-600 hover:bg-slate-100"
                    onClick={() =>
                      setCurrentPicPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPicPage === 1 || loadingPictures}>
                    «
                  </button>
                  <button className="join-item btn btn-sm bg-white border-slate-300 text-slate-700 pointer-events-none">
                    Page {currentPicPage} of {totalPicPages}
                  </button>
                  <button
                    className="join-item btn btn-sm bg-white border-slate-300 text-slate-600 hover:bg-slate-100"
                    onClick={() =>
                      setCurrentPicPage((prev) =>
                        Math.min(totalPicPages, prev + 1),
                      )
                    }
                    disabled={
                      currentPicPage === totalPicPages || loadingPictures
                    }>
                    »
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 3: PENGATURAN */}
          <input
            type="radio"
            name="my_tabs_6"
            className="tab px-4 font-medium text-slate-600"
            aria-label="Pengaturan"
            defaultChecked
          />
          <div className="tab-content bg-base-100 border-base-300 p-6 mt-2">
            <div className="flex flex-col w-full">
              <div className="shrink-0 mb-6">
                <p className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-sky-600" /> Pengaturan
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-6 w-full">
                {/* CARD 1: PENGATURAN GAMBAR */}
                <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="border-b border-slate-100 pb-3 mb-4">
                    <h3 className="font-semibold text-slate-800">
                      Pengaturan Gambar
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Atur kualitas gambar yang dikirim oleh device ke server.
                    </p>
                  </div>

                  <div className="flex flex-col gap-5 flex-1">
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-sm font-medium text-slate-600">
                        Kualitas Saat Ini
                      </span>
                      <span className="badge bg-sky-100 text-sky-700 border-sky-200 font-semibold px-3">
                        {currentPicQuality === 5
                          ? "Rendah"
                          : currentPicQuality === 3
                            ? "Sedang"
                            : currentPicQuality === 1
                              ? "Bagus"
                              : "Unknown"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <span className="text-sm font-medium text-slate-700">
                        Ubah Kualitas:
                      </span>
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-white border border-slate-100 p-3 rounded-lg">
                        <label
                          className={`flex items-center gap-2 ${currentPicQuality === 5 ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}>
                          <input
                            type="radio"
                            name="picQuality"
                            value="5"
                            className="radio radio-sm radio-info"
                            checked={displayQuality === 5}
                            disabled={currentPicQuality === 5 || isSaving}
                            onChange={() => setSelectedQuality(5)}
                          />
                          <span className="text-sm text-slate-700 font-medium">
                            Rendah
                          </span>
                        </label>

                        <label
                          className={`flex items-center gap-2 ${currentPicQuality === 3 ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}>
                          <input
                            type="radio"
                            name="picQuality"
                            value="3"
                            className="radio radio-sm radio-info"
                            checked={displayQuality === 3}
                            disabled={currentPicQuality === 3 || isSaving}
                            onChange={() => setSelectedQuality(3)}
                          />
                          <span className="text-sm text-slate-700 font-medium">
                            Sedang
                          </span>
                        </label>

                        <label
                          className={`flex items-center gap-2 ${currentPicQuality === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}>
                          <input
                            type="radio"
                            name="picQuality"
                            value="1"
                            className="radio radio-sm radio-info"
                            checked={displayQuality === 1}
                            disabled={currentPicQuality === 1 || isSaving}
                            onChange={() => setSelectedQuality(1)}
                          />
                          <span className="text-sm text-slate-700 font-medium">
                            Bagus
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      disabled={
                        selectedQuality === null ||
                        selectedQuality === currentPicQuality ||
                        isSaving
                      }
                      className="btn btn-sm bg-sky-600 hover:bg-sky-700 text-white border-none shadow-sm px-6">
                      {isSaving ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        "Simpan"
                      )}
                    </button>
                  </div>
                </div>

                {/* CARD 2: CAPTURE INFO */}
                <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="border-b border-slate-100 pb-3 mb-4">
                    <h3 className="font-semibold text-slate-800">
                      Pengaturan Capture
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      pengaturan pengambilan gambar oleh device
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-sm font-medium text-slate-600">
                        Periode Capture
                      </span>

                      <span className="text-sm font-bold text-slate-700">
                        {wakeupinfo?.interval === 1440
                          ? "Setiap 24 jam"
                          : wakeupinfo?.interval
                            ? `Setiap ${wakeupinfo.interval} menit`
                            : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-sm font-medium text-slate-600">
                        Mode Capture
                      </span>

                      <span className="text-sm font-bold text-slate-700">
                        {wakeupinfo?.mode === 2 ? "Daily" : "-"}
                      </span>
                    </div>

                    {/* <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-lg bg-slate-50 opacity-60 mt-2 min-h-[80px]">
                      <span className="text-xs font-medium text-slate-400">
                        Tidak ada informasi tambahan
                      </span>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ================= TAB 4: LOG SISTEM ================= */}
          <input
            type="radio"
            name="my_tabs_6"
            className="tab px-4 font-medium text-slate-600"
            aria-label="Log Sistem"
          />
          <div className="tab-content bg-base-100 border-base-300 p-6 mt-2">
            <div className="flex flex-col w-full">
              <div className="shrink-0 mb-6">
                <p className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-sky-600" /> Log Sistem
                </p>
              </div>

              <div className="flex flex-col gap-6 w-full">
                {/* ================= CARD 3: RIWAYAT SINKRONISASI ================= */}
                <div className="w-full flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Riwayat Sinkronisasi Data
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Log proses penarikan data dari server ke web dinas.
                      </p>
                    </div>

                    {/* Bungkus KEDUA tombol di dalam satu DIV baru */}
                    <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto mt-2 sm:mt-0">
                      <button
                        onClick={handleSyncNow}
                        disabled={isSyncingNow || loadingSync}
                        className="btn btn-xs btn-ghost text-sky-600 hover:bg-sky-50 disabled:bg-transparent disabled:text-sky-300 flex-1 sm:flex-none justify-center">
                        {isSyncingNow ? (
                          <span className="loading loading-spinner loading-xs mr-1"></span>
                        ) : (
                          <Play size={14} className="mr-1" />
                        )}
                        {isSyncingNow ? "Memulai..." : "Sinkron Data"}
                      </button>
                      <button
                        onClick={() => mutate(["syncLogs", deviceName])}
                        className="btn btn-xs btn-ghost text-sky-600 hover:bg-sky-50 flex-1 sm:flex-none justify-center">
                        <RefreshCw
                          size={14}
                          className={loadingSync ? "animate-spin" : ""}
                        />{" "}
                        Refresh
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2">
                    {loadingSync && syncList.length === 0 ? (
                      <div className="flex justify-center items-center h-24">
                        <span className="loading loading-spinner text-sky-500"></span>
                      </div>
                    ) : syncList.length > 0 ? (
                      syncList.map((sync: any) => {
                        // Menentukan warna badge berdasarkan status
                        const isRunning = sync.status === "SYNC IS RUNNING";
                        const isSuccess = sync.status === "SUCCESS";

                        const badgeClass = isRunning
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : isSuccess
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-red-100 text-red-700 border-red-200";

                        return (
                          <div
                            key={sync.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100 shadow-sm hover:border-sky-200 transition-all gap-4">
                            <div className="flex flex-col gap-2 flex-1">
                              {/* Header Baris Log */}
                              <div className="flex items-center gap-3">
                                <span
                                  className={`badge font-bold text-[10px] px-2 py-3 uppercase tracking-wider ${badgeClass}`}>
                                  {isRunning && (
                                    <RefreshCw
                                      size={12}
                                      className="mr-1 animate-spin"
                                    />
                                  )}
                                  {sync.status}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                  {formatSyncUTCtoWIB(sync.started_at)}
                                </span>
                              </div>

                              {/* Statistik Sync */}
                              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-1">
                                <div
                                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600"
                                  title="Total data ditarik dari Lydar">
                                  <Download
                                    size={14}
                                    className="text-slate-400"
                                  />
                                  <span>
                                    Fetched:{" "}
                                    <strong className="text-slate-800">
                                      {sync.total_fetched}
                                    </strong>
                                  </span>
                                </div>
                                <div
                                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-600"
                                  title="Total data berhasil disimpan ke lokal">
                                  <Database
                                    size={14}
                                    className="text-emerald-500"
                                  />
                                  <span>
                                    Inserted:{" "}
                                    <strong className="text-emerald-700">
                                      {sync.total_inserted}
                                    </strong>
                                  </span>
                                </div>
                                <div
                                  className="flex items-center gap-1.5 text-xs font-medium text-red-600"
                                  title="Total data gagal diproses">
                                  <AlertCircle
                                    size={14}
                                    className="text-red-500"
                                  />
                                  <span>
                                    Failed:{" "}
                                    <strong className="text-red-700">
                                      {sync.total_failed}
                                    </strong>
                                  </span>
                                </div>
                              </div>

                              {/* Tampilkan pesan error jika ada (selain "no error") */}
                              {sync.error_message &&
                                sync.error_message !== "no error" && (
                                  <div className="text-[11px] text-red-500 font-medium bg-red-50/50 p-2 rounded border border-red-100 mt-1">
                                    Error: {sync.error_message}
                                  </div>
                                )}
                            </div>

                            {/* Waktu Selesai & Durasi */}
                            <div className="flex flex-col sm:items-end gap-1 shrink-0">
                              {sync.finished ? (
                                <>
                                  <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                                    Selesai
                                  </span>
                                  <span className="text-xs font-bold text-slate-600">
                                    {formatSyncUTCtoWIB(sync.finished, true)}
                                  </span>
                                  <span className="text-[10px] text-slate-400 mt-1">
                                    Durasi:{" "}
                                    {calculateDuration(
                                      sync.started_at,
                                      sync.finished,
                                    )}
                                    s
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs font-medium text-blue-500 animate-pulse flex items-center gap-1">
                                  Memproses...
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-24 opacity-60">
                        <span className="text-sm font-medium text-slate-400">
                          Belum ada riwayat sinkronisasi
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ================= CARD 1: LOG DEVICE ================= */}
                <div className="flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="border-b border-slate-100 pb-3 mb-4">
                    <h3 className="font-semibold text-slate-800">
                      Log Device Water Meter
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Log error atau event yang terjadi pada device.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[400px] pr-2">
                    {loadingLogs ? (
                      <div className="flex justify-center items-center h-32">
                        <span className="loading loading-spinner text-sky-500"></span>
                      </div>
                    ) : logsList.length > 0 ? (
                      logsList.map((log: any, index: number) => {
                        // Ambil error code dan konversi ke number
                        const errNum = parseInt(log.data?.errorNum || "0");
                        // Dapatkan label, ikon, dan warna dari helper errorCode Anda
                        const errDetail = errorCode(errNum);

                        return (
                          <div
                            key={log.id || index}
                            className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] font-semibold text-slate-400">
                                {log.createTime
                                  ? adjustMinusOneHour(log.createTime)
                                  : "-"}
                              </span>

                              {/* Menampilkan Ikon dan Pesan Error */}
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-700">
                                  {errDetail.label}
                                </span>
                              </div>

                              <span className="text-xs font-medium text-sky-700 mt-1">
                                Code: {log.data?.errorNum || "Unknown"}
                              </span>
                            </div>

                            <span
                              onClick={() =>
                                setSelectedError({
                                  code: errNum,
                                  label: errDetail.label,
                                  solution: errDetail.Solution, // Mengambil key Solution dari errorCode.ts Anda
                                })
                              }
                              className="badge bg-white text-slate-600 border-slate-200 font-medium px-3 text-xs shrink-0 cursor-pointer hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition-colors">
                              Detail
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 opacity-60">
                        <span className="text-sm font-medium text-slate-400">
                          Tidak ada log tercatat
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BAGIAN KANAN (List Capture Data) ================= */}
      <div className="w-full lg:w-1/3 rounded-lg border border-slate-300 bg-white shadow-sm p-5 flex flex-col gap-4 sticky top-4 h-[calc(100vh-2rem)]">
        <div className="shrink-0">
          <p className="font-semibold text-slate-800 text-lg">Data Capture</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
          {loadingCapture ? (
            <div className="flex justify-center items-center h-32">
              <span className="loading loading-spinner text-sky-500"></span>
            </div>
          ) : captureDataList.length > 0 ? (
            captureDataList.map((item: any, index: number) => (
              <div
                key={item.requestId || index}
                className="flex items-center justify-between p-3 bg-slate-50 border border-sky-800 border-t-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-500">
                    {adjustMinusOneHour(item.createTime)}
                  </span>
                  <span className="text-sm font-bold text-sky-700">
                    {item.data?.number || 0}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      m³
                    </span>
                  </span>
                  <span className="text-xs font-medium text-green-600">
                    +{item.data?.cloudIncrement || 0} Increment
                  </span>
                </div>

                <div
                  className={`relative w-[50px] h-[50px] rounded border border-slate-300 bg-black overflow-hidden shrink-0 ${item.path ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                  onClick={() => {
                    if (item.path) setSelectedImage(item.path);
                  }}>
                  {item.path ? (
                    <Image
                      src={item.path}
                      alt="Capture"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100">
                      <Image
                        src={sui}
                        alt="No pic"
                        width={30}
                        height={30}
                        className="opacity-40"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Belum ada data capture tersedia.
            </div>
          )}
        </div>

        {/* Pagination List Kanan */}
        <div className="shrink-0 flex justify-center pt-3 border-t border-slate-100 mt-2">
          <div className="join shadow-sm">
            <button
              className="join-item btn btn-sm bg-white border-slate-300 text-slate-600 hover:bg-slate-100"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loadingCapture}>
              «
            </button>
            <button className="join-item btn btn-sm bg-white border-slate-300 text-slate-700 pointer-events-none">
              Page {currentPage} of {totalPages}
            </button>
            <button
              className="join-item btn btn-sm bg-white border-slate-300 text-slate-600 hover:bg-slate-100"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages || loadingCapture}>
              »
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL GAMBAR MEMBESAR ================= */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}>
          <div
            className="relative w-full max-w-4xl h-[80vh] bg-transparent"
            onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-10 right-0 text-white hover:text-red-400 transition-colors flex items-center gap-1 font-semibold"
              onClick={() => setSelectedImage(null)}>
              <X size={24} /> Close
            </button>
            <Image
              src={selectedImage}
              alt="Enlarged Capture"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* ================= MODAL ERROR DETAIL ================= */}
      {selectedError && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedError(null)} // Tutup jika klik di luar kotak
        >
          {/* Kotak Modal */}
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col scale-in-center"
            onClick={(e) => e.stopPropagation()} // Cegah klik di dalam kotak menutup modal
          >
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                <Info className="w-5 h-5 text-sky-600" />
                Detail Error Code:{" "}
                <span className="text-sky-700">{selectedError.code}</span>
              </h3>
              <button
                className="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                onClick={() => setSelectedError(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Konten Modal */}
            <div className="p-6 flex flex-col gap-5">
              {/* Box Masalah */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  ⚠️ Masalah / Indikasi
                </h4>
                <div className="bg-red-50/50 text-red-700 p-4 rounded-xl border border-red-100 text-sm font-medium leading-relaxed">
                  {selectedError.label}
                </div>
              </div>

              {/* Box Solusi */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  💡 Solusi yang Disarankan
                </h4>
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 text-sm font-medium leading-relaxed whitespace-pre-line">
                  {selectedError.solution ? (
                    selectedError.solution
                  ) : (
                    <span className="italic opacity-80">
                      Belum ada solusi spesifik yang terdokumentasi untuk kode
                      error ini. Silakan periksa koneksi fisik atau hubungi tim
                      teknis.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                className="btn btn-sm bg-slate-200 hover:bg-slate-300 text-slate-700 border-none px-8 rounded-lg"
                onClick={() => setSelectedError(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
