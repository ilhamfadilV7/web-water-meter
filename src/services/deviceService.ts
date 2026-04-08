export async function getDevices() {
  const token = localStorage.getItem("access_token");

  const params = new URLSearchParams({
    currentPage: "1",
    pageSize: "10",
    productKey: "BPecljyVCy3",
    access_token: token || "",
  });

  const res = await fetch(
    `https://api.lydar.tech/manage/v3/device?${params.toString()}`,
    {
      method: "GET",
    },
  );

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
    `https://api.lydar.tech/manage/queryDeviceRegisterInfo?${params.toString()}`,
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
    `https://api.lydar.tech/manage/v2/device/deviceName?${params.toString()}`,
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
    startTimeStamp: startTime.toString(),
    endTimeStamp: endTime.toString(),
    access_token: token || "",
  });

  const resData = await fetch(
    `https://api.lydar.tech/data/v1/dataAndPic?${params.toString()}`,
    { method: "GET" },
  );

  if (!resData.ok) {
    throw new Error("Gagal menghubungi server untuk mendapatkan data device");
  }

  return resData.json();
}
