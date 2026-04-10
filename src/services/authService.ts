import { LoginPayload, LoginResponse } from "@/types/auth";
const baseUrl = process.env.NEXT_PUBLIC_API_LYDAR;

export async function loginUser(payload: LoginPayload) {
  const body = new URLSearchParams();
  body.append("username", "develabt");
  body.append("password", "r4h4rj4p0b");
  body.append("grant_type", "password");

  const response = await fetch(`${baseUrl}/oauth/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

// Tambahkan fungsi ini di authService.ts
export async function refreshAccessToken(refreshToken: string) {
  // Tambahkan fallback URL berjaga-jaga jika .env sedang tidak terbaca
  const baseUrl = process.env.NEXT_PUBLIC_API_LYDAR || "https://api.lydar.tech";
  const body = new URLSearchParams();

  body.append("refresh_token", refreshToken);
  body.append("grant_type", "refresh_token");

  const response = await fetch(`${baseUrl}/oauth/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store", // WAJIB: Mencegah Next.js melakukan caching pada request ini
  });

  if (!response.ok) {
    // BONGKAR ERROR ASLI DARI SERVER
    const errorText = await response.text();
    console.error("❌ Detail Error API Lydar:", response.status, errorText);

    // Lemparkan error asli agar terbaca di console dan UI
    throw new Error(
      `Error ${response.status}: ${errorText || "Gagal memperbarui token"}`,
    );
  }

  return response.json();
}
