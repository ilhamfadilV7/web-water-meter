"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Device } from "@/types/device";

type Props = {
  devices: Device[];
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapLeaflet({ devices }: Props) {
  const firstDevice = devices.find((d) => d.latitude && d.longitude);

  const defaultCenter: [number, number] = firstDevice
    ? [firstDevice.latitude!, firstDevice.longitude!]
    : [-6.2, 106.816666]; // fallback Jakarta

  return (
    <MapContainer
      center={defaultCenter}
      zoom={17}
      scrollWheelZoom={true}
      className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {devices
        .filter((device) => device.latitude && device.longitude)
        .map((device) => (
          <Marker
            key={device.id}
            position={[device.latitude!, device.longitude!]}
            icon={markerIcon}>
            <Popup>
              <b>{device.houseNumber}</b>
              <br />
              {device.address || "No address"}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
