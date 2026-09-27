"use client";

import dynamic from "next/dynamic";
import type { MapUnit } from "./coverage-map";

// Leaflet touches `window` at import time, so it cannot render on the
// server. This wrapper is the one place that's allowed to know that.
const CoverageMap = dynamic(() => import("./coverage-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 w-full items-center justify-center rounded-lg border border-border text-sm text-muted-foreground">
      Cargando mapa...
    </div>
  ),
});

export default function CoverageMapClient({ units }: { units: MapUnit[] }) {
  return <CoverageMap units={units} />;
}
