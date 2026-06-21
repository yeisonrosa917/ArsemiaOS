"use client";

import dynamic from "next/dynamic";
import type { LiveMapInnerProps } from "./live-map-impl";

const LiveMapImpl = dynamic(() => import("./live-map-impl"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        borderRadius: "0.75rem",
        background:
          "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--accent)) 100%)",
      }}
    />
  ),
});

export type { MapMarker } from "./live-map-impl";
export type LiveMapProps = LiveMapInnerProps;

export function LiveMap(props: LiveMapProps) {
  return <LiveMapImpl {...props} />;
}
