"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Signal, Battery, Activity, Info, X, Settings } from "lucide-react";

import { getDeviceStatus } from "@/utils/deviceStatus";
import { deviceTypes } from "@/utils/deviceType";
import { isTokenExpired } from "@/utils/auth";
import sui from "../../../../public/drop.png";
import { getDeviceDetail, getDeviceData } from "@/services/deviceService";
import { adjustMinusOneHour } from "@/utils/date";
import { getPictures } from "@/services/getPictureService";

// --- KOMPONEN UTAMA ---
function DeviceDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deviceName = searchParams.get("id");

  // State untuk Info Device
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  // State untuk Data Capture (Pagination Kanan)
  const [captureDataList, setCaptureDataList] = useState<any[]>([]);
  const [loadingCapture, setLoadingCapture] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ==========================================
  // State Galeri Gambar (Tab Tengah)
  // ==========================================
  const [pictureList, setPictureList] = useState<any[]>([]);
  const [loadingPictures, setLoadingPictures] = useState(false);
  const [currentPicPage, setCurrentPicPage] = useState(1);
  const [totalPicPages, setTotalPicPages] = useState(1);

  // State untuk Modal Gambar (Image Preview)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ==========================================
  // FETCH 1: Device Information (Jalan 1 Kali)
  // ==========================================
  useEffect(() => {
    const fetchInfo = async () => {
      if (!deviceName) return;

      const token = localStorage.getItem("token");
      if (!token || isTokenExpired()) {
        localStorage.removeItem("token");
        localStorage.removeItem("token_expire");
        router.push("/");
        return;
      }

      setLoadingInfo(true);
      try {
        const dataInfo = await getDeviceDetail(deviceName);
        if (dataInfo.code === 200) {
          setDeviceInfo(dataInfo.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data device:", error);
      } finally {
        setLoadingInfo(false);
      }
    };

    fetchInfo();
  }, [deviceName, router]);

  // ==========================================
  // FETCH 2: Data Capture (Jalan saat ganti halaman list)
  // ==========================================
  useEffect(() => {
    const fetchCapture = async () => {
      if (!deviceName) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingCapture(true);
      try {
        const endStamp = Math.floor(Date.now() / 1000);
        const startStamp = endStamp - 30 * 24 * 60 * 60;

        const dataCapture = await getDeviceData(
          deviceName,
          startStamp,
          endStamp,
          currentPage,
          10,
        );

        if (dataCapture.code === 200) {
          setCaptureDataList(dataCapture.data.list || []);
          setTotalPages(dataCapture.data.pages || 1);
        }
      } catch (error) {
        console.error("Gagal mengambil data capture:", error);
      } finally {
        setLoadingCapture(false);
      }
    };

    fetchCapture();
  }, [deviceName, currentPage]);

  // ==========================================
  // 3. Fetch Galeri Gambar (Tab Tengah)
  // ==========================================
  useEffect(() => {
    const fetchGallery = async () => {
      if (!deviceName) return;
      setLoadingPictures(true);
      try {
        const data = await getPictures(deviceName, currentPicPage, 10);
        if (data) {
          setPictureList(data.list || []);
          setTotalPicPages(data.pages || 1);
        }
      } catch (error) {
        console.error("Gagal mengambil galeri gambar:", error);
      } finally {
        setLoadingPictures(false);
      }
    };
    fetchGallery();
  }, [deviceName, currentPicPage]);

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

  return (
    // PERBAIKAN: Hapus batas 'h-[calc...]' agar layout memanjang alami, tambahkan 'items-start'
    <div className="flex flex-col lg:flex-row gap-4 w-full min-h-[calc(100vh-6rem)] p-4 relative items-start">
      {/* ================= BAGIAN KIRI ================= */}
      <div className="flex flex-col gap-4 w-full lg:w-2/3">
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
              <div className="flex items-center gap-1 font-bold text-sky-700">
                <Battery className="w-5 h-5 text-green-500" />
                <span className="text-xl">
                  {deviceInfo.electricity || "-"}%
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
                Data terakhir
              </span>
              <span className="text-sm font-medium text-slate-700 leading-relaxed">
                {/* {deviceInfo.address || ""}{" "}
                {deviceInfo.description ? `(${deviceInfo.description})` : ""} */}
                {adjustMinusOneHour(deviceInfo.lastTime)}
              </span>
            </div>
          </div>
        </div>

        {/* --- TABS --- */}
        {/* PERBAIKAN: Hapus pembatas internal, biarkan tab box menyesuaikan isi konten */}
        <div className="tabs tabs-box bg-white border border-slate-300 rounded-lg shadow-sm w-full">
          {/* TAB 1 */}
          <input
            type="radio"
            name="my_tabs_6"
            className="tab"
            aria-label="History Data"
          />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            <p className="font-semibold text-slate-600 flex items-center gap-2">
              <Activity className="w-5 h-5" /> Grafik Penggunaan (Coming Soon)
            </p>
          </div>

          {/* TAB 2 */}
          <input
            type="radio"
            name="my_tabs_6"
            className="tab"
            aria-label="Galeri Gambar"
            defaultChecked
          />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            <div className="mb-6">
              <p className="font-semibold text-slate-800 text-lg">
                Galeri Gambar
              </p>
            </div>

            {/* AREA GALERI: Hapus overflow-y-auto agar halamannya yang scroll, bukan kotaknya */}
            <div className="w-full">
              {loadingPictures ? (
                <div className="flex justify-center items-center h-32">
                  <span className="loading loading-spinner text-sky-500"></span>
                </div>
              ) : pictureList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {pictureList.map((pic, index) => (
                    <div
                      key={index}
                      className="flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all group">
                      <div
                        className="relative w-full aspect-[4/3] bg-slate-900 border-b border-slate-200 overflow-hidden"
                        onClick={() => pic.path && setSelectedImage(pic.path)}>
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
                        <span className="text-[13px] font-semibold text-slate-500">
                          {pic.createTime
                            ? adjustMinusOneHour(pic.createTime)
                            : "-"}
                        </span>
                        {pic.value ? (
                          <span className="text-sm">
                            value: {""}
                            <span className="text-sm font-bold text-sky-700">
                              {pic.value}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[12px] font-bold text-red-500">
                            data tidak terbaca
                          </span>
                        )}
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

          {/* TAB 3 (Perbaikan label) */}
          <input
            type="radio"
            name="my_tabs_6"
            className="tab"
            aria-label="Setting Device"
          />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            <p className="font-semibold text-slate-600 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Setting Device (Coming Soon)
            </p>
          </div>
        </div>
      </div>

      {/* ================= BAGIAN KANAN (List Capture Data) ================= */}
      {/* PERBAIKAN: Menambahkan 'sticky top-4 h-[calc(100vh-2rem)]' agar kotak kanan menetap saat di scroll */}
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
            captureDataList.map((item, index) => (
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
                  }}
                  title={item.path ? "Klik untuk memperbesar gambar" : ""}>
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
    </div>
  );
}

export default function DeviceDetailPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center">Loading Content...</div>}>
      <DeviceDetailContent />
    </Suspense>
  );
}
