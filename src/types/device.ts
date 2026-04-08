export interface Device {
  id: number;
  deviceName: string;
  deviceStatus: number;
  address: string | null;
  longitude: number | null;
  latitude: number | null;
  signal: string;
  version: string;
  houseNumber: string | null;
  networkType: number;
  lastTime: string;
  cValue: number;
  cloudIncrement: number;
  batteryCapacity: number;
  recentPicPath: string;
}
