"use client";

import { useEffect, useState } from "react";
import { loginUser } from "@/services/authService";
import Image from "next/image";
import background from "../../public/water_background.jpg";
import sui from "../../public/drop.png";
import { useRouter } from "next/navigation";
import { isTokenExpired } from "@/utils/auth";

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
  }, []);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   setLoading(true);
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const result = await loginUser({ username, password });
      localStorage.setItem("token", result.access_token);
      localStorage.setItem(
        "token_expire",
        (Date.now() + result.expires_in * 1000).toString(),
      );

      setModalType("success");
      setModalMessage("Selamat datang kembali di WaterMeter !");
      setModalMessage2("Anda akan segera diarahkan ke dashboard");
      document.cookie = `token=${result.access_token}; path=/; max-age=${result.expires_in}`;

      (document.getElementById("login_modal") as HTMLDialogElement).showModal();

      router.push("/dashboard");

      localStorage.setItem("access_token", result.access_token);
    } catch (error) {
      setModalType("error");
      setModalMessage("Username atau password salah");

      (document.getElementById("login_modal") as HTMLDialogElement).showModal();
      // Handle login failure (e.g., display error message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-8 bg-sky-200">
        <div className="flex w-full max-w-md flex-col items-center rounded-xl px-6 py-12 shadow-2xl sm:px-12 relative overflow-hidden">
          <Image
            src={background}
            alt="Background Image"
            className="absolute inset-0 h-full w-full object-fill z-0"
          />
          <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <Image
              alt="Your Company"
              src={sui}
              className="mx-auto h-18 w-auto"
            />
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-black/90">
              WaterMeter | PT RSK
            </h2>
          </div>

          <div className="relative z-10 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* <div className="flex flex-col space-y-3">
                <label className="input validator w-full">
                  <svg
                    className="h-[1em] opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24">
                    <g
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                      fill="none"
                      stroke="currentColor">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </g>
                  </svg>
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className=" bg-white text-black/90"
                  />
                </label>

                <label className="input validator w-full">
                  <svg
                    className="h-[1em] opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24">
                    <g
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                      fill="none"
                      stroke="currentColor">
                      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
                      <circle
                        cx="16.5"
                        cy="7.5"
                        r=".5"
                        fill="currentColor"></circle>
                    </g>
                  </svg>

                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className=" bg-white text-black/90"
                  />
                </label>
              </div> */}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md bg-sky-800 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-sky-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500">
                  {loading ? (
                    <>
                      <span className="loading loading-bars loading-sm"></span>
                      <span className="ml-2">Loading...</span>
                    </>
                  ) : (
                    "Masuk"
                  )}
                </button>
              </div>
            </form>

            <dialog id="login_modal" className="modal">
              <div className="modal-box">
                <h3
                  className={`font-bold text-lg ${
                    modalType === "success" ? "text-green-600" : "text-red-500"
                  }`}>
                  {modalType === "success" ? "Login Berhasil" : "Login Gagal"}
                </h3>

                <div className="py-4 text-sm text-gray-600 space-y-1">
                  <p>{modalMessage}</p>
                  <p>{modalMessage2}</p>
                </div>

                <div className="modal-action">
                  <form method="dialog">
                    <button className="btn">OK</button>
                  </form>
                </div>
              </div>
            </dialog>

            <p className="font-bold text-xs mt-5 font--geist-mono text-center text-gray-700">
              © 2026 All rights reserved by PT. Raharja Sinergi Komunikasi
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
