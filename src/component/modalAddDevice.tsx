"use client";

import { useState } from "react";
import { queryDeviceRegisterInfo } from "@/services/deviceService";
import { deviceTypes } from "@/utils/deviceType";
import { error } from "console";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ModalAddDevice({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errormsg, setErrorMsg] = useState("");

  //state 1
  const [serialNumber, setSerialNumber] = useState("");
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  //state 2 & 3 form data
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

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setSerialNumber("");
    setErrorMsg("");
    setDeviceInfo(null);
    //reset form data
    setNamaWp("");
    setAlamat("");
    setDeskripsi("");
    setLatitude("");
    setLongitude("");
    setProvinsi("");
    setKota("");
    setKategori("");
    setPersentase("");
    setTipePajak("");
    setNop("");
    setKontak("");
    setTglPasang("");
    setEmail("");
    setNamaDevice("");

    onClose();
  };

  const handleNextStep1 = async () => {
    if (!serialNumber.trim()) {
      setErrorMsg("Serial number tidak boleh kosong");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await queryDeviceRegisterInfo(serialNumber);

      if (response.code === 200 && response.data) {
        setDeviceInfo(response.data);
        setStep(2);
      } else if (response.code === 1004) {
        setErrorMsg("Device sudah terdaftar !");
      } else {
        if (response.msg && response.msg.toLowerCase().includes("not exist")) {
          setErrorMsg("Serial Number Tidak Valid");
        } else {
          setErrorMsg(
            response.msg || "Device tidak ditemukan atau tidak valid.",
          );
        }
      }
    } catch (error: any) {
      if (error.message && error.message.toLowerCase().includes("not exist")) {
        setErrorMsg("SN tidak valid");
      } else {
        setErrorMsg(error.message || "Terjadi kesalahan sistem.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("access_token") || "";

      //proses 1 HIT LYDAR
      const payload1 = new URLSearchParams({
        deviceName: serialNumber,
        productKey: "BPecljyVCy3",
        access_token: token,
        description: deskripsi,
        powerSupply: "false",
        networkType: deviceInfo.accessType,
        dataFrom: "0",
        houseNumber: namaWp,
        address: alamat,
        extraParams: "",
        newBattery: "1",
        batteryCapacity: "1700",
        useCode: "1",
      });

      const res1 = await fetch(
        "https://api.lydar.tech/manage/device/newCreateDevice",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: payload1.toString(),
        },
      );
      const data1 = await res1.json();

      if (data1.code !== 200) {
        throw new Error(
          data1.msg || "Gagal mendaftarkan device di server utama (Lydar).",
        );
      }

      //proses 2 daftar merchant
      const payload2 = {
        name: namaWp,
        tax_category: kategori || "AIR BAWAH TANAH", // Default jika state kosong
        nop: nop,
        address: alamat,
        persentase_pajak: parseFloat(persentase),
        city: kota,
        contact: kontak,
        email: email,
        status: 1,
        lattitude: latitude, // Mengikuti typo dari API (lattitude)
        longitude: longitude,
      };

      const res2 = await fetch("/api/v3/merchants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Site-Destination": kota,
        },
        body: JSON.stringify(payload2),
      });
      const data2 = await res2.json();

      if (data2.status !== 201 && data2.status !== 200) {
        throw new Error(data2.message || "Gagal membuat Merchant baru.");
      }

      const merchantId = data2.data._id; // Ambil ID untuk Proses 3

      //proses 3 daftar device
      const payload3 = {
        merchant_id: merchantId,
        devices: [
          {
            name: namadevice,
            pmt: "server",
            device_metode: "API",
            sn: serialNumber,
            kode: "-",
            keterangan: deskripsi || null,
            tgl_pasang: tglpasang,
          },
        ],
      };

      const res3 = await fetch("/api/v3/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Site-Destination": kota,
        },
        body: JSON.stringify(payload3),
      });
      const data3 = await res3.json();

      if (data3.status !== 201 && data3.status !== 200) {
        throw new Error(data3.message || "Gagal menautkan device ke Merchant.");
      }

      const newDeviceId = data3?.data?.[0]?._id;

      if (!newDeviceId) {
        throw new Error("Device ID tidak ditemukan pada respon server!");
      }

      const payload4 = {
        merchantId: merchantId,
        deviceName: serialNumber,
        deviceId: newDeviceId, // ID device dari response Proses 3
        status: 1,
        wilayah: kota,
        serialNumber: serialNumber,
        type: deviceTypes(deviceInfo.accessType).label,
      };

      const res4 = await fetch("http://10.20.10.187:3130/api/device/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload4),
      });
      const data4 = await res4.json();

      console.log(data4);

      if (!res4.ok) {
        throw new Error(
          data4.message || "Gagal menyimpan data device ke database lokal.",
        );
      }

      alert("Berhasil! Device dan Merchant telah tersimpan.");
      handleClose();
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-999 overflow-y-auto bg-black/50">
      {/* Modal Box */}
      <div className="flex min-h-screen items-start justify-center px-4 py-12">
        <div className="bg-white shadow-xl w-full max-w-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Registrasi Device Baru</h2>

          {step === 1 && (
            <div className="space-y-3">
              <label className="form-control w-full">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Masukan Serial Number
                  </legend>
                  <input
                    type="text"
                    className={`input  border border-gray-300 w-full ${
                      errormsg ? "input error" : ""
                    }`}
                    placeholder="Type here"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    disabled={loading}
                  />
                </fieldset>
              </label>

              {errormsg && (
                <p className="text-sm text-red-500 font-medium">{errormsg}</p>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  className="btn btn-ghost border border-gray-200"
                  onClick={handleClose}
                  disabled={loading}>
                  Cancel
                </button>
                <button
                  className="btn text-white"
                  style={{ backgroundColor: "#00d5b5", borderColor: "#00d5b5" }} // Menyesuaikan warna tosca dari gambar
                  onClick={handleNextStep1}
                  disabled={loading}>
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Next"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm mb-4 font-bold">
                Serial Number Valid !
              </div>

              {/* Anda bisa menampilkan data readonly dari API di sini sebagai info tambahan */}
              <div className="text-xs text-gray-500 font-mono mb-4 font-semibold">
                Serial Number: {deviceInfo?.deviceName}
              </div>
              <div className="text-xs text-gray-500 font-mono mb-4 font-semibold">
                Tipe Device:{" "}
                {deviceInfo
                  ? deviceTypes(deviceInfo.accessType).label
                  : "Unknown"}
              </div>

              {/* Form detail yang sebelumnya sudah Anda buat, pindahkan ke sini */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Nama Wajib Pajak</legend>
                <input
                  type="text"
                  className="input w-full border border-gray-300"
                  placeholder="masukan nama wajib pajak..."
                  value={namaWp}
                  onChange={(e) => setNamaWp(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Alamat Pemasangan</legend>
                <input
                  type="text"
                  className="input w-full border border-gray-300"
                  placeholder="masukan alamat pemasangan..."
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Deskripsi</legend>
                <input
                  type="text"
                  placeholder="masukan deskripsi..."
                  className="input w-full border border-gray-300"
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Latitude</legend>
                <input
                  type="text"
                  className="input w-full border border-gray-300"
                  placeholder="masukan latitude..."
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Longitude</legend>
                <input
                  type="text"
                  className="input w-full border border-gray-300"
                  placeholder="masukan longitude..."
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </fieldset>

              {/* Action Buttons Step 2 */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  className="btn btn-ghost border border-gray-200"
                  onClick={() => setStep(1)} // Kembali ke step 1
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="btn text-white"
                  style={{
                    backgroundColor: "#00d5b5",
                    borderColor: "#00d5b5",
                  }}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Langkah terakhir, data untuk POB
              </p>

              <fieldset className="fieldset mt-4">
                <legend className="fieldset-legend">Provinsi</legend>
                <select className="select border border-gray-300 w-full">
                  <option value="demo">Demo</option>
                </select>
              </fieldset>

              <fieldset className="fieldset mt-4">
                <legend className="fieldset-legend">Kota</legend>
                <select
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  className="select border border-gray-300 w-full">
                  <option value="pob_demo">Demo</option>
                </select>
              </fieldset>

              <fieldset className="fieldset mt-4">
                <legend className="fieldset-legend">
                  Kategori Objek Pajak
                </legend>
                <input
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="select border border-gray-300 w-full"
                  placeholder="AIR BAWAH TANAH"
                  disabled></input>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Persentase Pajak</legend>
                <input
                  value={persentase}
                  onChange={(e) => setPersentase(e.target.value)}
                  type="text"
                  className="input w-full border border-gray-300"
                  placeholder="Contoh: 10"
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Nama Device</legend>
                <input
                  value={namadevice}
                  onChange={(e) => setNamaDevice(e.target.value)}
                  type="text"
                  className="input w-full border border-gray-300"
                  placeholder="Contoh: testNamaDevice"
                />
              </fieldset>

              <fieldset className="fieldset mt-4">
                <legend className="fieldset-legend">Tipe Pajak</legend>
                <select
                  value={tipepajak}
                  onChange={(e) => setTipePajak(e.target.value)}
                  className="select border border-gray-300 w-full">
                  <option value="include">Include</option>
                  <option value="exclude">Exclude</option>
                </select>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">NOP</legend>
                <input
                  value={nop}
                  onChange={(e) => setNop(e.target.value)}
                  type="text"
                  className="input w-full border border-gray-300"
                  placeholder="masukan nop..."
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Kontak</legend>
                <input
                  type="text"
                  className="input w-full border border-gray-300"
                  placeholder="masukan kontak..."
                  value={kontak}
                  onChange={(e) => setKontak(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Email</legend>
                <input
                  type="text"
                  className="input w-full border border-gray-300"
                  placeholder="masukan email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Tanggal Pemasangan</legend>
                <input
                  type="date"
                  className="input border border-gray-300 w-full"
                  value={tglpasang}
                  onChange={(e) => setTglPasang(e.target.value)}
                />
              </fieldset>

              {errormsg && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4 border border-red-200">
                  {errormsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6">
                <button
                  className="btn btn-ghost border border-gray-200"
                  onClick={() => setStep(2)}>
                  Back
                </button>
                <button
                  className="btn text-white"
                  style={{ backgroundColor: "#00d5b5", borderColor: "#00d5b5" }}
                  onClick={handleSave}
                  disabled={loading}>
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Process"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
