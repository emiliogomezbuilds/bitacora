"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { UnitStatus } from "@/lib/status";

export type MapUnit = {
  id: string;
  label: string;
  status: UnitStatus;
  lat: number | null;
  lng: number | null;
};

const COLORS: Record<UnitStatus, string> = {
  en_cumplimiento: "#16a34a",
  sin_senal: "#dc2626",
  sin_datos: "#9ca3af",
};

export default function CoverageMap({ units }: { units: MapUnit[] }) {
  const withLocation = units.filter((u) => u.lat !== null && u.lng !== null);
  const center: [number, number] =
    withLocation.length > 0 ? [withLocation[0].lat!, withLocation[0].lng!] : [19.4784, -99.2394];

  return (
    <div className="h-80 w-full overflow-hidden rounded-lg border border-border">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withLocation.map((u) => (
          <CircleMarker
            key={u.id}
            center={[u.lat!, u.lng!]}
            radius={9}
            pathOptions={{ color: COLORS[u.status], fillColor: COLORS[u.status], fillOpacity: 0.8 }}
          >
            <Popup>{u.label}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
