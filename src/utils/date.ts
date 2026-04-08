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
