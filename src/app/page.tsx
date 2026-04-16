"use client";

import { useEffect, useState } from "react";
import { loginUser } from "@/services/authService";
import Image from "next/image";
import background from "../../public/water_background.jpg";
import sui from "../../public/drop.png";
import { useRouter } from "next/navigation";
import { isTokenExpired } from "@/utils/auth";
import { User, Lock, Droplets } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalMessage2, setModalMessage2] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      if (isTokenExpired()) {
        localStorage.removeItem("token");
        localStorage.removeItem("token_expire");
        router.push("/");
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginUser({ username, password });
      localStorage.setItem("token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);
      localStorage.setItem(
        "token_expire",
        (Date.now() + result.expires_in * 1000).toString(),
      );

      setModalType("success");
      setModalMessage("Selamat datang kembali di WaterMeter!");
      setModalMessage2("Anda akan segera diarahkan ke dashboard.");
      document.cookie = `token=${result.access_token}; path=/; max-age=${result.expires_in}`;

      (document.getElementById("login_modal") as HTMLDialogElement).showModal();

      router.push("/devices");

      localStorage.setItem("access_token", result.access_token);
    } catch (error) {
      setModalType("error");
      setModalMessage("Username atau password salah");
      setModalMessage2("Silakan periksa kembali kredensial Anda.");

      (document.getElementById("login_modal") as HTMLDialogElement).showModal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={background}
            alt="Background"
            fill
            className="object-cover opacity-90"
            priority
          />

          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/70 via-sky-800/50 to-blue-950/80"></div>
        </div>

        <div className="relative z-10 flex w-full max-w-md flex-col items-center rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-white/85 backdrop-blur-xl border border-white/50 transition-all">
          <div className="flex flex-col items-center w-full mb-8">
            <div className="relative flex items-center justify-center w-20 h-20 mb-4 bg-white rounded-full shadow-md border border-sky-100">
              <Image
                alt="Logo WaterMeter"
                src={sui}
                className="h-12 w-auto object-contain"
              />
            </div>
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              Smart Water Meter
            </h2>
            <p className="mt-2 text-center text-sm font-medium text-slate-500 tracking-wide uppercase">
              PT Raharja Sinergi Komunikasi
            </p>
          </div>

          <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 border-none text-white text-base font-bold shadow-md hover:from-sky-500 hover:to-cyan-500 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 disabled:opacity-70 disabled:shadow-none">
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Loading...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs font-medium text-slate-400 font-mono">
                © 2026 Hak Cipta
                <br />
                PT. Raharja Sinergi Komunikasi
              </p>
            </div>
          </div>
        </div>
      </div>

      <dialog id="login_modal" className="modal">
        <div className="modal-box bg-white rounded-2xl shadow-2xl border border-slate-100 p-0 overflow-hidden">
          <div
            className={`p-6 border-b ${modalType === "success" ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
            <h3
              className={`font-bold text-xl flex items-center justify-center gap-2 ${modalType === "success" ? "text-emerald-700" : "text-red-600"}`}>
              {modalType === "success"
                ? "🎉 Autentikasi Berhasil"
                : "⚠️ Autentikasi Gagal"}
            </h3>
          </div>

          <div className="p-8 text-center space-y-2">
            <p className="text-slate-700 font-medium text-base">
              {modalMessage}
            </p>
            <p className="text-slate-500 text-sm">{modalMessage2}</p>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <form method="dialog" className="w-full sm:w-auto">
              <button className="btn bg-slate-800 hover:bg-slate-700 text-white w-full border-none rounded-xl px-8">
                OK
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
