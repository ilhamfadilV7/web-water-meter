"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Search, MapPin, Loader2 } from "lucide-react";

const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPickerProps {
  onLocationSelect: (lat: string, lng: string) => void;
}

function MapUpdater({ center }: { center: L.LatLngTuple | null }) {
  const map = useMap();
  if (center) {
    map.flyTo(center, 16, { animate: true, duration: 1.5 });
  }
  return null;
}

function LocationMarker({ position, setPosition, onLocationSelect }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
}

export default function MapPicker({ onLocationSelect }: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [mapCenter, setMapCenter] = useState<L.LatLngTuple | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const defaultCenter: L.LatLngTuple = [-6.914744, 107.60981];

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowDropdown(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery,
        )}&limit=5`,
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Gagal mencari lokasi:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const newPos = new L.LatLng(lat, lng);

    setPosition(newPos);
    setMapCenter([lat, lng]);
    onLocationSelect(lat.toFixed(6), lng.toFixed(6));

    setShowDropdown(false);
    setSearchQuery(result.display_name);
  };

  return (
    <div className="flex flex-col gap-3 relative w-full">
      <form onSubmit={handleSearch} className="relative z-[1000] w-full">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (showDropdown) setShowDropdown(false);
            }}
            placeholder="Cari nama jalan, kota, atau wilayah..."
            className="input input-sm input-bordered w-full pr-10 bg-white shadow-sm border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-slate-700"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors">
            {isSearching ? (
              <Loader2 size={16} className="animate-spin text-sky-600" />
            ) : (
              <Search size={16} />
            )}
          </button>
        </div>

        {showDropdown && searchResults.length > 0 && (
          <ul className="absolute top-full left-0 w-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-[1001] divide-y divider-slate-50">
            {searchResults.map((result) => (
              <li
                key={result.place_id}
                onClick={() => handleSelectLocation(result)}
                className="p-3 hover:bg-sky-50 cursor-pointer text-xs text-slate-700 flex items-start gap-2.5 transition-colors">
                <MapPin size={16} className="text-sky-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2 font-medium leading-relaxed">
                  {result.display_name}
                </span>
              </li>
            ))}
          </ul>
        )}
        {showDropdown && searchResults.length === 0 && !isSearching && (
          <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl p-4 text-center text-xs font-medium text-slate-500 z-[1001]">
            Lokasi tidak ditemukan. Coba kata kunci lain.
          </div>
        )}
      </form>

      <div className="h-[250px] w-full rounded-xl overflow-hidden border border-slate-200 z-0 relative shadow-inner">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", zIndex: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapUpdater center={mapCenter} />

          <LocationMarker
            position={position}
            setPosition={setPosition}
            onLocationSelect={onLocationSelect}
          />
        </MapContainer>
      </div>
    </div>
  );
}
