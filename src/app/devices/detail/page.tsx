import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientView from "./ClientView"; // Import komponen client yang baru kita buat

export default async function DeviceDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const deviceName = resolvedParams.id;

  // Cek Auth di level Server menggunakan Cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Jika tidak ada token (belum login) ATAU tidak ada id device di URL
  // Langsung tendang ke halaman login tanpa kompromi!
  if (!token || !deviceName) {
    redirect("/");
  }

  // Jika aman, render tampilan UI dengan melemparkan data yang dibutuhkan
  return <ClientView deviceName={deviceName} token={token} />;
}
