"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import useSWR, { mutate } from "swr";
import { queryDeviceRegisterInfo, getDevices } from "@/services/deviceService";
import { deviceTypes } from "@/utils/deviceType";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Info,
} from "lucide-react";

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-56 bg-slate-100 animate-pulse rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
      Memuat Peta...
    </div>
  ),
});

interface ProcessStage {
  id: string;
  label: string;
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

interface ModalAddDeviceProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSN?: string | null;
}

export default function ModalAddDevice({
  isOpen,
  onClose,
  selectedSN,
}: ModalAddDeviceProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errormsg, setErrorMsg] = useState("");

  // state 1
  const [serialNumber, setSerialNumber] = useState("");
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  // state form data
  const [namaWp, setNamaWp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [provinsi, setProvinsi] = useState("pob_demo");
  const [kota, setKota] = useState("pob_demo");
  const [kategori, setKategori] = useState("AIR BAWAH TANAH");
  const [persentase, setPersentase] = useState("");
  const [tipepajak, setTipePajak] = useState("include");
  const [nop, setNop] = useState("");
  const [kontak, setKontak] = useState("");
  const [tglpasang, setTglPasang] = useState("");
  const [email, setEmail] = useState("");
  const [namadevice, setNamaDevice] = useState("");

  const [showMap, setShowMap] = useState(false);

  const { data: lydarDevices } = useSWR("getAllDevicesTable", getDevices);

  const [isProcessFinished, setIsProcessFinished] = useState(false);
  const [processHasError, setProcessHasError] = useState(false);

  const [processStages, setProcessStages] = useState<ProcessStage[]>([
    {
      id: "merchant",
      label: "Membuat Data Merchant Baru",
      status: "idle",
      message: "",
    },
    {
      id: "device",
      label: "Menautkan Device ke Merchant",
      status: "idle",
      message: "",
    },
    {
      id: "local",
      label: "Menyimpan ke Database Lokal",
      status: "idle",
      message: "",
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      if (selectedSN) {
        setSerialNumber(selectedSN);
        handleAutoFetchDevice(selectedSN);
      } else {
        setStep(1);
      }
    } else {
      setStep(1);
      setSerialNumber("");
      setErrorMsg("");
      setDeviceInfo(null);
      setNamaWp("");
      setAlamat("");
      setDeskripsi("");
      setLatitude("");
      setLongitude("");
      setPersentase("");
      setNop("");
      setKontak("");
      setTglPasang("");
      setEmail("");
      setNamaDevice("");
      setShowMap(false);
      setProcessStages((prev) =>
        prev.map((s) => ({ ...s, status: "idle", message: "" })),
      );
      setIsProcessFinished(false);
      setProcessHasError(false);
    }
  }, [isOpen, selectedSN]);

  // =====================================================================
  // SMART FETCHER: Mencari Tipe Device & Auto-Fill Data Lydar
  // =====================================================================
  const fetchAndSetDeviceInfo = async (sn: string) => {
    const existingInLydar = lydarDevices?.find((d: any) => d.deviceName === sn);

    if (existingInLydar) {
      setNamaWp(existingInLydar.houseNumber || "");
      setAlamat(existingInLydar.address || "");
      setDeskripsi(existingInLydar.description || existingInLydar.remark || "");
      setLatitude(existingInLydar.latitude || existingInLydar.lat || "");
      setLongitude(existingInLydar.longitude || existingInLydar.lng || "");
      setNamaDevice(existingInLydar.deviceName || sn);
    }

    try {
      const response = await queryDeviceRegisterInfo(sn);
      if (response.data && response.data.accessType) {
        setDeviceInfo(response.data);
        return;
      }
    } catch (error) {}

    if (existingInLydar && existingInLydar.networkType) {
      setDeviceInfo({ accessType: existingInLydar.networkType });
    } else {
      setDeviceInfo(null);
    }
  };

  const handleAutoFetchDevice = async (sn: string) => {
    setLoading(true);
    await fetchAndSetDeviceInfo(sn);
    setLoading(false);
    setStep(2);
  };

  const handleNextStep1 = async () => {
    if (!serialNumber.trim()) {
      setErrorMsg("Serial number tidak boleh kosong");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    await fetchAndSetDeviceInfo(serialNumber);

    setLoading(false);
    setStep(2);
  };
  // =====================================================================

  const updateStage = (
    index: number,
    status: ProcessStage["status"],
    message = "",
  ) => {
    setProcessStages((prev) => {
      const newStages = [...prev];
      newStages[index] = { ...newStages[index], status, message };
      return newStages;
    });
  };

  const handleSave = async () => {
    setStep(4);
    setIsProcessFinished(false);
    setProcessHasError(false);
    setProcessStages((prev) =>
      prev.map((s) => ({ ...s, status: "idle", message: "" })),
    );

    try {
      updateStage(0, "loading");
      const payloadMerchant = {
        name: namaWp,
        tax_category: kategori || "AIR BAWAH TANAH",
        nop: nop,
        address: alamat,
        persentase_pajak: parseFloat(persentase || "0"),
        city: kota,
        contact: kontak,
        email: email,
        status: 1,
        lattitude: latitude,
        longitude: longitude,
      };

      const resMerchant = await fetch("/api/v3/merchants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Site-Destination": kota,
        },
        body: JSON.stringify(payloadMerchant),
      });
      const dataMerchant = await resMerchant.json();

      if (dataMerchant.status !== 201 && dataMerchant.status !== 200) {
        throw new Error(dataMerchant.message || "Gagal membuat Merchant baru.");
      }
      const merchantId = dataMerchant.data._id;
      updateStage(0, "success");

      updateStage(1, "loading");
      const payloadDevicePOB = {
        merchant_id: merchantId,
        devices: [
          {
            name: namadevice || serialNumber,
            pmt: "Water Meter Reader",
            device_metode: "API",
            sn: serialNumber,
            kode: "-",
            keterangan: deskripsi || null,
            tgl_pasang: tglpasang,
          },
        ],
      };

      const resDevicePOB = await fetch("/api/v3/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Site-Destination": kota,
        },
        body: JSON.stringify(payloadDevicePOB),
      });
      const dataDevicePOB = await resDevicePOB.json();

      if (dataDevicePOB.status !== 201 && dataDevicePOB.status !== 200) {
        throw new Error(
          dataDevicePOB.message || "Gagal menautkan device ke Merchant.",
        );
      }
      const newDeviceId = dataDevicePOB?.data?.[0]?._id;
      if (!newDeviceId) {
        throw new Error("Device ID tidak ditemukan pada respon POB!");
      }
      updateStage(1, "success");

      updateStage(2, "loading");
      const payloadLokal = {
        merchantId: merchantId,
        deviceName: namadevice,
        deviceId: newDeviceId,
        status: 1,
        wilayah: kota,
        serialNumber: serialNumber,
        type: deviceTypes(deviceInfo?.accessType || 1).label,
      };

      const resLokal = await fetch(`/api/proxy-lokal/api/device/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadLokal),
      });
      const dataLokal = await resLokal.json();

      if (!resLokal.ok) {
        throw new Error(
          dataLokal.message || "Gagal menyimpan relasi ke database lokal.",
        );
      }
      updateStage(2, "success");

      mutate("getAllDevicesTable");
      mutate("getLocalDevices");
    } catch (error: any) {
      setProcessStages((prev) => {
        const newStages = [...prev];
        const loadingIndex = newStages.findIndex((s) => s.status === "loading");
        if (loadingIndex !== -1) {
          newStages[loadingIndex] = {
            ...newStages[loadingIndex],
            status: "error",
            message: error.message,
          };
        }
        return newStages;
      });
      setProcessHasError(true);
    } finally {
      setIsProcessFinished(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="bg-white shadow-2xl rounded-2xl w-full max-w-lg p-6 space-y-4 relative">
          <div className="border-b border-slate-100 pb-3 mb-2">
            <h2 className="text-xl font-bold text-slate-800">
              {step === 4
                ? "Status Sinkronisasi"
                : selectedSN
                  ? "Sinkronisasi Device POB"
                  : "Registrasi Device Baru"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {step === 4
                ? "Sistem sedang memproses data secara berurutan."
                : "Lengkapi formulir berikut untuk menyinkronkan device."}
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <label className="form-control w-full">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend font-medium text-slate-600">
                    Masukkan Serial Number
                  </legend>
                  <input
                    type="text"
                    className={`input input-bordered w-full bg-slate-50 border-slate-200 focus:border-sky-500 ${
                      errormsg ? "input-error bg-red-50" : ""
                    }`}
                    placeholder="Contoh: 86385105466..."
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    disabled={loading}
                  />
                </fieldset>
              </label>

              {errormsg && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle size={14} /> {errormsg}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                <button
                  className="btn btn-ghost text-slate-600 hover:bg-slate-100"
                  onClick={onClose}
                  disabled={loading}>
                  Batal
                </button>
                <button
                  className="btn bg-sky-600 hover:bg-sky-700 text-white border-none px-8"
                  onClick={handleNextStep1}
                  disabled={loading}>
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Lanjut"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100 text-sm mb-4 font-semibold flex items-center gap-2">
                <CheckCircle2 size={18} /> Device Siap Disinkronkan!
              </div>

              <div className="flex flex-col gap-1 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                <span className="text-xs text-slate-500 font-medium">
                  Serial Number:{" "}
                  <span className="font-bold text-slate-800">
                    {serialNumber}
                  </span>
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Tipe Device:{" "}
                  <span className="font-bold text-sky-700">
                    {deviceInfo
                      ? deviceTypes(deviceInfo.accessType).label
                      : "Memuat Data Tipe..."}
                  </span>
                </span>
              </div>

              <fieldset className="fieldset">
                <legend className="fieldset-legend font-medium text-slate-600">
                  Nama Wajib Pajak
                </legend>
                <input
                  type="text"
                  className="input input-sm input-bordered w-full bg-slate-50"
                  placeholder="..."
                  value={namaWp}
                  onChange={(e) => setNamaWp(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend font-medium text-slate-600">
                  Alamat Pemasangan
                </legend>
                <input
                  type="text"
                  className="input input-sm input-bordered w-full bg-slate-50"
                  placeholder="..."
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend font-medium text-slate-600">
                  Deskripsi
                </legend>
                <input
                  type="text"
                  className="input input-sm input-bordered w-full bg-slate-50"
                  placeholder="..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                />
              </fieldset>

              {/* KOORDINAT & PETA */}
              <div className="flex gap-4">
                <fieldset className="fieldset flex-1">
                  <legend className="fieldset-legend font-medium text-slate-600">
                    Latitude
                  </legend>
                  <input
                    type="text"
                    className="input input-sm input-bordered w-full bg-slate-50"
                    placeholder="..."
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </fieldset>
                <fieldset className="fieldset flex-1">
                  <legend className="fieldset-legend font-medium text-slate-600">
                    Longitude
                  </legend>
                  <input
                    type="text"
                    className="input input-sm input-bordered w-full bg-slate-50"
                    placeholder="..."
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </fieldset>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="text-sm font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1 w-fit transition-colors bg-sky-50 px-3 py-1.5 rounded-md">
                  <MapPin size={16} />{" "}
                  {showMap ? "Sembunyikan Peta" : "Pilih Lokasi dari Peta"}
                </button>

                {showMap && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <MapPicker
                      onLocationSelect={(lat, lng) => {
                        setLatitude(lat);
                        setLongitude(lng);
                      }}
                    />
                    <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-medium px-1">
                      <Info size={12} className="text-sky-500" /> Klik di area
                      peta untuk mengisi Latitude & Longitude.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                <button
                  className="btn btn-ghost text-slate-600 hover:bg-slate-100"
                  onClick={() => {
                    if (selectedSN) onClose();
                    else setStep(1);
                  }}>
                  {selectedSN ? "Batal" : "Kembali"}
                </button>
                <button
                  className="btn bg-sky-600 hover:bg-sky-700 text-white border-none px-8"
                  onClick={() => setStep(3)}>
                  Lanjut
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 font-medium mb-4">
                Langkah terakhir, lengkapi data untuk sinkronisasi device ke
                sistem Pajak Lokal. Pastikan semua data sudah benar sebelum
                memproses sinkronisasi.
              </p>

              <div className="flex gap-4">
                <fieldset className="fieldset flex-1">
                  <legend className="fieldset-legend font-medium text-slate-600">
                    Provinsi
                  </legend>
                  <select className="select select-sm select-bordered w-full bg-slate-50">
                    <option value="demo">Sumatera Utara</option>
                  </select>
                </fieldset>
                <fieldset className="fieldset flex-1">
                  <legend className="fieldset-legend font-medium text-slate-600">
                    Kota
                  </legend>
                  <select
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    className="select select-sm select-bordered w-full bg-slate-50">
                    <option value="asahan">Asahan</option>
                    <option value="labuhanbatu">Labuhan Batu</option>
                  </select>
                </fieldset>
              </div>

              <fieldset className="fieldset">
                <legend className="fieldset-legend font-medium text-slate-600">
                  Kategori Objek Pajak
                </legend>
                <input
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="input input-sm input-bordered w-full bg-slate-100 text-slate-500 cursor-not-allowed"
                  disabled
                />
              </fieldset>

              <div className="flex gap-4">
                <fieldset className="fieldset flex-1">
                  <legend className="fieldset-legend font-medium text-slate-600">
                    Persentase Pajak (%)
                  </legend>
                  <input
                    value={persentase}
                    onChange={(e) => setPersentase(e.target.value)}
                    type="text"
                    className="input input-sm input-bordered w-full bg-slate-50"
                    placeholder="Contoh: 10"
                  />
                </fieldset>
                <fieldset className="fieldset flex-1">
                  <legend className="fieldset-legend font-medium text-slate-600">
                    Tipe Pajak
                  </legend>
                  <select
                    value={tipepajak}
                    onChange={(e) => setTipePajak(e.target.value)}
                    className="select select-sm select-bordered w-full bg-slate-50">
                    <option value="include">Include</option>
                    <option value="exclude">Exclude</option>
                  </select>
                </fieldset>
              </div>

              <fieldset className="fieldset">
                <legend className="fieldset-legend font-medium text-slate-600">
                  Nama Device
                </legend>
                <input
                  value={namadevice}
                  onChange={(e) => setNamaDevice(e.target.value)}
                  type="text"
                  className="input input-sm input-bordered w-full bg-slate-50"
                  placeholder="Contoh: Device_Utama_01"
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend font-medium text-slate-600">
                  Nomor Objek Pajak (NOP)
                </legend>
                <input
                  value={nop}
                  onChange={(e) => setNop(e.target.value)}
                  type="text"
                  className="input input-sm input-bordered w-full bg-slate-50"
                  placeholder="..."
                />
              </fieldset>

              <div className="flex gap-4">
                <fieldset className="fieldset flex-1">
                  <legend className="fieldset-legend font-medium text-slate-600">
                    Kontak Pengurus
                  </legend>
                  <input
                    type="text"
                    className="input input-sm input-bordered w-full bg-slate-50"
                    placeholder="..."
                    value={kontak}
                    onChange={(e) => setKontak(e.target.value)}
                  />
                </fieldset>
                <fieldset className="fieldset flex-1">
                  <legend className="fieldset-legend font-medium text-slate-600">
                    Email Valid
                  </legend>
                  <input
                    type="email"
                    className="input input-sm input-bordered w-full bg-slate-50"
                    placeholder="..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </fieldset>
              </div>

              <fieldset className="fieldset">
                <legend className="fieldset-legend font-medium text-slate-600">
                  Tanggal Pemasangan
                </legend>
                <input
                  type="date"
                  className="input input-sm input-bordered w-full bg-slate-50"
                  value={tglpasang}
                  onChange={(e) => setTglPasang(e.target.value)}
                />
              </fieldset>

              {errormsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={16} /> {errormsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                <button
                  className="btn btn-ghost text-slate-600 hover:bg-slate-100"
                  onClick={() => setStep(2)}>
                  Kembali
                </button>
                <button
                  className="btn bg-sky-600 hover:bg-sky-700 text-white border-none px-8 shadow-md"
                  onClick={handleSave}>
                  Proses Sinkronisasi
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2 mt-4">
                {processStages.map((stage) => {
                  let badgeClass =
                    "bg-slate-100 text-slate-500 border-slate-200";
                  let Icon = Clock;
                  let iconClass = "";
                  let statusText = "MENUNGGU";

                  if (stage.status === "loading") {
                    badgeClass = "bg-blue-100 text-blue-700 border-blue-200";
                    Icon = Loader2;
                    iconClass = "animate-spin";
                    statusText = "MEMPROSES";
                  } else if (stage.status === "success") {
                    badgeClass =
                      "bg-emerald-100 text-emerald-700 border-emerald-200";
                    Icon = CheckCircle2;
                    statusText = "BERHASIL";
                  } else if (stage.status === "error") {
                    badgeClass = "bg-red-100 text-red-700 border-red-200";
                    Icon = AlertCircle;
                    statusText = "GAGAL";
                  }

                  return (
                    <div
                      key={stage.id}
                      className="flex flex-col bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm hover:border-sky-200 transition-colors gap-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`badge font-bold text-[10px] px-2 py-3 uppercase tracking-wider ${badgeClass}`}>
                          <Icon size={12} className={`mr-1 ${iconClass}`} />{" "}
                          {statusText}
                        </span>
                        <span
                          className={`text-sm font-semibold ${stage.status === "idle" ? "text-slate-400" : "text-slate-700"}`}>
                          {stage.label}
                        </span>
                      </div>

                      {stage.status === "error" && stage.message && (
                        <div className="text-[11px] text-red-500 font-medium bg-red-50/50 p-2.5 rounded-lg border border-red-100 mt-2">
                          Detail Error: {stage.message}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                <button
                  className={`btn border-none px-8 text-white shadow-md ${
                    !isProcessFinished
                      ? "bg-slate-300 pointer-events-none"
                      : processHasError
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                  onClick={onClose}
                  disabled={!isProcessFinished}>
                  {!isProcessFinished
                    ? "Mohon Tunggu..."
                    : processHasError
                      ? "Tutup & Coba Lagi"
                      : "Selesai"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
