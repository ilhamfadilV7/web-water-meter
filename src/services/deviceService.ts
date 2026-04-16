const baseUrl = process.env.NEXT_PUBLIC_API_LYDAR;
const urlPob = process.env.NEXT_PUBLIC_LOCAL_SERVER;
const proxyUrl = "/api/proxy-lokal";

export async function getDevices() {
  const token = localStorage.getItem("access_token");

  const params = new URLSearchParams({
    currentPage: "1",
    pageSize: "10",
    productKey: "BPecljyVCy3",
    access_token: token || "",
  });

  const res = await fetch(`${baseUrl}/manage/v3/device?${params.toString()}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed fetch devices");
  }

  const data = await res.json();

  return data.data.list;
}

export async function queryDeviceRegisterInfo(deviceName: string) {
  const token = localStorage.getItem("access_token");

  const params = new URLSearchParams({
    deviceName: deviceName,
    access_token: token || "",
    type: "1",
  });

  const res = await fetch(
    `${baseUrl}/manage/queryDeviceRegisterInfo?${params.toString()}`,
    {
      method: "GET",
    },
  );

  if (!res.ok) {
    throw new Error("Gagal menghubungi server untuk pengecekan device");
  }

  return res.json();
}

export async function getDeviceDetail(deviceName: string, token: string) {
  const params = new URLSearchParams({
    deviceName: deviceName,
    access_token: token || "",
  });

  const resInfo = await fetch(
    `${baseUrl}/manage/v2/device/deviceName?${params.toString()}`,
    { method: "GET" },
  );

  if (!resInfo.ok) {
    throw new Error("Gagal menghubungi server untuk mendapatkan detail device");
  }

  return resInfo.json();
}

export async function getDeviceData(
  deviceName: string,
  startTime: number,
  endTime: number,
  currentPage: number = 1,
  pageSize: number = 10,
  token: string,
) {
  const params = new URLSearchParams({
    currentPage: currentPage.toString(),
    pageSize: pageSize.toString(),
    deviceName: deviceName,
    productKey: "BPecljyVCy3",
    startTimeStamp: "1775001600",
    endTimeStamp: "1777593599",
    access_token: token || "",
  });

  const resData = await fetch(
    `${baseUrl}/data/v1/dataAndPic?${params.toString()}`,
    { method: "GET" },
  );

  if (!resData.ok) {
    throw new Error("Gagal menghubungi server untuk mendapatkan data device");
  }

  return resData.json();
}

export async function getDeviceConfig(deviceName: string, token: string) {
  const params = new URLSearchParams({
    deviceName: deviceName,
    access_token: token || "",
  });

  const resConfig = await fetch(
    `${baseUrl}/manage/deviceSet/deviceName?${params.toString()}`,
    { method: "GET" },
  );

  if (!resConfig.ok) {
    throw new Error(
      "Gagal menghubungi server untuk mendapatkan konfigurasi device",
    );
  }

  return resConfig.json();
}

export async function getDeviceQWakeupInfo(deviceName: string, token: string) {
  const params = new URLSearchParams({
    deviceName: deviceName,
    productKey: "BPecljyVCy3",
    access_token: token || "",
  });

  const resQWakeup = await fetch(
    `${baseUrl}/manage/wakeConfig/keyAndName?${params.toString()}`,
    { method: "GET" },
  );

  if (!resQWakeup.ok) {
    throw new Error(
      "Gagal menghubungi server untuk mendapatkan informasi quick wakeup device",
    );
  }

  return resQWakeup.json();
}

export async function updateDeviceSettings(
  deviceName: string,
  picQuality: number,
  token: string,
) {
  const params = new URLSearchParams({
    productKey: "BPecljyVCy3",
    deviceName: deviceName,
    access_token: token || "",
    rotate: "0",
    picMode: "1",
    dataReportInterval: "1",
    picQuality: picQuality.toString(),
    recognizeMode: "1",
  });

  const res = await fetch(`${baseUrl}/manage/deviceSet`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error("Gagal menyimpan pengaturan device");
  }

  return res.json();
}

export async function getDeviceLogs(
  deviceName: String,
  startTime: number,
  endTime: number,
  currentPage: number = 1,
  pageSize: number = 10,
  token: string,
) {
  const params = new URLSearchParams({
    currentPage: currentPage.toString(),
    deviceName: deviceName.toString(),
    endTimeStamp: endTime.toString(),
    startTimeStamp: startTime.toString(),
    pageSize: pageSize.toString(),
    productKey: "BPecljyVCy3",
    access_token: token || "",
  });

  const resLogs = await fetch(`${baseUrl}/data/v1/error?${params.toString()}`, {
    method: "GET",
  });

  if (!resLogs.ok) {
    throw new Error("Gagal menghubungi server untuk mendapatkan logs device");
  }

  return resLogs.json();
}

export async function getSyncLogs(deviceName: string) {
  const res = await fetch(`${urlPob}/api/wm/sync-logs/${deviceName}`, {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "69420",
    },
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil histori sinkronisasi");
  }

  return res.json();
}

export async function startSync(deviceName: string) {
  const res = await fetch(`${proxyUrl}/api/wm/sync/device`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "69420", // <--- TAMBAHKAN BARIS INI
    },
    // Sesuaikan key JSON ini ("device_name" atau "deviceName") dengan ekspektasi Backend Anda
    body: JSON.stringify({
      deviceName: deviceName,
    }),
  });

  console.log(res);

  if (!res.ok) {
    throw new Error("Gagal memicu sinkronisasi");
  }

  return res.json();
}

export async function addParams(deviceName: string) {
  const token = localStorage.getItem("access_token");

  const params = new URLSearchParams({
    deviceName: deviceName,
    value: "true",
    productKey: "BPecljyVCy3",
    access_token: token || "",
    type: "0",
    desc: "Mengidentifikasi nilai atribut secara otomatis",
  });

  const res = await fetch(
    `${baseUrl}/manage/addDeviceParam?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    },
  );
  if (!res.ok) {
    throw new Error("Gagal menambahkan parameter");
  }

  return res.json();
}

// Fungsi untuk mengambil semua device dari Database Lokal (187)
export async function getLocalDevices() {
  const res = await fetch(`${urlPob}/api/wm/device/all`, {
    method: "GET",
    // Tambahkan headers ini untuk memastikan response berupa JSON
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Gagal menghubungi server lokal untuk mengambil devices");
  }

  const result = await res.json();

  // 2. SESUAIKAN DENGAN POSTMAN: Ambil dari result.devices, bukan result.data
  return result.devices || [];
}

// Fungsi utama: Membandingkan Lydar vs Lokal
export async function getUnsyncedDevices() {
  try {
    // 1. Tarik semua data dari Lydar
    const lydarDevices = await getDevices();

    // 2. Tarik semua data dari DB Lokal 187
    const localDevices = await getLocalDevices();

    // 3. Ekstrak Serial Number dari DB Lokal ke dalam bentuk array sederhana
    // Sesuaikan "serialNumber" dengan nama field di database lokal Anda
    const localSerialNumbers = localDevices.map((dev: any) => dev.serialNumber);

    // 4. Lakukan Filtering
    const unsyncedList = lydarDevices.filter((lydarDev: any) => {
      // Jika deviceName (SN) Lydar TIDAK ADA di array lokal, maka masukkan ke list unsynced
      return !localSerialNumbers.includes(lydarDev.deviceName);
    });

    return unsyncedList;
  } catch (error) {
    console.error("Gagal mendeteksi device Unsynced:", error);
    return [];
  }
}
