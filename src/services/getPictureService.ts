export async function getPictures(
  deviceName: string,
  currentPage: number = 1,
  pageSize: number = 12, // Ubah ke 12 agar grid 6 kolom terisi rata
  token: string,
) {
  const params = new URLSearchParams({
    currentPage: currentPage.toString(),
    pageSize: pageSize.toString(),
    deviceName: deviceName,
    productKey: "BPecljyVCy3",
    access_token: token || "",
  });

  const res = await fetch(
    `https://api.lydar.tech/manage/picture?${params.toString()}`,
    { method: "GET" },
  );

  if (!res.ok) {
    throw new Error("Gagal menghubungi server untuk mendapatkan gambar");
  }

  const data = await res.json();
  // KEMBALIKAN SELURUH DATA AGAR BISA MENGAMBIL .pages dan .list
  return data.data;
}
