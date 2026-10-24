"use client";

import { LayoutGrid, Map } from "lucide-react";

export type ApartmentView = "grid" | "map";

export function MapViewToggle({ view, onChange }: { view: ApartmentView; onChange: (view: ApartmentView) => void }) {
  return <div className="map-view-toggle" role="group" aria-label="Property results view">
    <button type="button" aria-pressed={view === "grid"} className={view === "grid" ? "active" : ""} onClick={() => onChange("grid")}><LayoutGrid size={16}/>Grid view</button>
    <button type="button" aria-pressed={view === "map"} className={view === "map" ? "active" : ""} onClick={() => onChange("map")}><Map size={16}/>Map view</button>
  </div>;
}
