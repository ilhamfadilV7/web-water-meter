import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const originalPath = request.nextUrl.pathname;
    // Tembak langsung ke IP Backend asli
    const targetUrl = `http://10.20.10.252:2229${originalPath}`;

    const body = await request.json();
    const siteDestination = request.headers.get("Site-Destination") || "";

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Site-Destination": siteDestination,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Proxy Error:", error);
    return NextResponse.json(
      { message: "Internal Proxy Error", error: error.message },
      { status: 500 },
    );
  }
}
