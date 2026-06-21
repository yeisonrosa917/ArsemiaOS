"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false },
);

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  kind?: "driver" | "pickup" | "delivery";
}

export interface LiveMapProps {
  markers?: MapMarker[];
  route?: [number, number][];
  center?: [number, number];
  zoom?: number;
  height?: number | string;
  className?: string;
}

export function LiveMap({
  markers = [],
  route,
  center,
  zoom = 11,
  height = 360,
  className,
}: LiveMapProps) {
  const computedCenter = useMemo<[number, number]>(() => {
    if (center) return center;
    if (markers.length > 0) return [markers[0].lat, markers[0].lng];
    return [40.7128, -74.006];
  }, [center, markers]);

  const iconsRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const L = await import("leaflet");
      if (cancelled) return;
      const mk = (color: string) =>
        L.divIcon({
          className: "arsemia-map-marker",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          html: `<div style="width:18px;height:18px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
        });
      iconsRef.current = {
        driver: mk("hsl(var(--primary))"),
        pickup: mk("#10b981"),
        delivery: mk("#f97316"),
        default: mk("#64748b"),
      };
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={className}
      style={{ height, width: "100%", borderRadius: "0.75rem", overflow: "hidden" }}
    >
      <MapContainer
        center={computedCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {route && route.length > 1 && (
          <Polyline
            positions={route}
            pathOptions={{ color: "#3b62ff", weight: 4, opacity: 0.85 }}
          />
        )}
        {markers.map((m) => {
          const icon =
            (iconsRef.current[m.kind ?? "default"] as never) ?? undefined;
          return (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={icon}>
              <Popup>{m.label}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
