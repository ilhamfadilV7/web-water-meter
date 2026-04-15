import { NextRequest, NextResponse } from "next/server";

// 1. Tentukan tipe params sebagai Promise sesuai aturan Next.js terbaru
type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  // 2. Wajib gunakan 'await' untuk membuka Promise params
  const resolvedParams = await context.params;
  return handleProxy(request, resolvedParams.path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  // 2. Wajib gunakan 'await' untuk membuka Promise params
  const resolvedParams = await context.params;
  return handleProxy(request, resolvedParams.path);
}

// Logika Utama Proxy Server-to-Server (Bebas CORS!)
async function handleProxy(request: NextRequest, pathArray: string[]) {
  try {
    // Gabungkan path (misal: ["api", "wm", "sync-logs"] menjadi "api/wm/sync-logs")
    const pathString = pathArray.join("/");

    // Ambil URL Ngrok dari variabel yang benar sesuai .env Anda
    const localDbUrl = process.env.NEXT_PUBLIC_LOCAL_SERVER;
    const targetUrl = `${localDbUrl}/${pathString}`;

    // Siapkan opsi fetch
    const options: RequestInit = {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        // Header sakti agar Ngrok tidak menampilkan halaman HTML peringatan
        "ngrok-skip-browser-warning": "69420",
      },
    };

    // Jika POST, teruskan body/payload-nya
    if (request.method !== "GET") {
      options.body = await request.text();
    }

    // Lakukan Fetch dari Server Next.js ke Ngrok
    const response = await fetch(targetUrl, options);

    // Kembalikan hasilnya ke Browser
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
