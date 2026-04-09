export function adjustMinusOneHour(dateString: string) {
  if (!dateString) return "N/A";

  // Ubah jadi format ISO agar aman
  const iso = dateString.replace(" ", "T");

  const date = new Date(iso);

  // Kurangi 1 jam (3600000 ms)
  const adjusted = new Date(date.getTime() - 1 * 60 * 60 * 1000);

  const year = adjusted.getFullYear();
  const month = String(adjusted.getMonth() + 1).padStart(2, "0");
  const day = String(adjusted.getDate()).padStart(2, "0");

  const hours = String(adjusted.getHours()).padStart(2, "0");
  const minutes = String(adjusted.getMinutes()).padStart(2, "0");
  const seconds = String(adjusted.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const formatToWIB = (
  dateParam: string | number | Date | null | undefined,
): string => {
  if (!dateParam) return "-";

  let dateObj: Date;

  // KASUS 1: Format string dari API Lydar (Contoh: "2026-04-08 16:38:51")
  // Waktu dari server mereka adalah UTC+8 (Beijing/Singapura).
  // Kita tambahkan +08:00 agar Javascript tahu zona waktu aslinya.
  if (
    typeof dateParam === "string" &&
    !dateParam.includes("T") &&
    !dateParam.includes("Z")
  ) {
    const formattedString = dateParam.replace(" ", "T") + "+08:00";
    dateObj = new Date(formattedString);
  }
  // KASUS 2: Format standar baku (ISO) seperti "2026-04-08T21:27:49.432Z" atau Timestamp angka
  else {
    dateObj = new Date(dateParam);
  }

  // Jika hasilnya bukan tanggal yang valid (NaN), kembalikan strip
  if (isNaN(dateObj.getTime())) return "-";

  // Konversi dan format ke Waktu Indonesia Barat (WIB)
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta", // Pastikan selalu WIB
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Pakai format 24 jam
  }).format(dateObj);
};
