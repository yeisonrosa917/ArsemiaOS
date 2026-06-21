"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import type { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  kind?: "driver" | "pickup" | "delivery";
}

export interface LiveMapInnerProps {
  markers?: MapMarker[];
  route?: [number, number][];
  center?: [number, number];
  zoom?: number;
  height?: number | string;
  className?: string;
}

export default function LiveMapImpl({
  markers = [],
  route,
  center,
  zoom = 11,
  height = 360,
  className,
}: LiveMapInnerProps) {
  const computedCenter = useMemo<[number, number]>(() => {
    if (center) return center;
    if (markers.length > 0) return [markers[0].lat, markers[0].lng];
    return [40.7128, -74.006];
  }, [center, markers]);

  const [icons, setIcons] = useState<Record<string, DivIcon | undefined>>({});

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
      setIcons({
        driver: mk("#3b62ff"),
        pickup: mk("#10b981"),
        delivery: mk("#f97316"),
        default: mk("#64748b"),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        height,
        width: "100%",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
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
          const icon = icons[m.kind ?? "default"];
          if (!icon) return null;
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
