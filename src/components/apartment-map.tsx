"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { divIcon, latLngBounds, type LatLngExpression } from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { BRAND } from "@/lib/brand";
import { formatPrice, type Apartment } from "@/lib/properties";

type ApartmentMapProps = {
  items: Apartment[];
  selectedId?: string | null;
  onSelect?: (apartmentId: string) => void;
  center?: LatLngExpression;
  referenceLabel?: string;
  zoom?: number;
  height?: number;
};

function hasCoordinates(apartment: Apartment): apartment is Apartment & { latitude: number; longitude: number } {
  return apartment.latitude !== null && apartment.longitude !== null
    && Number.isFinite(apartment.latitude) && Number.isFinite(apartment.longitude)
    && apartment.latitude >= -90 && apartment.latitude <= 90
    && apartment.longitude >= -180 && apartment.longitude <= 180;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character] ?? character);
}

export function ApartmentMapMarker({ apartment, onSelect }: { apartment: Apartment; onSelect?: (id: string) => void }) {
  const icon = useMemo(() => divIcon({
    className: "haven-price-marker-wrap",
    html: `<span class="haven-price-marker">${escapeHtml(formatPrice(apartment.price, apartment.listing, apartment.currency))}</span>`,
    iconSize: [106, 32],
    iconAnchor: [53, 16]
  }), [apartment.currency, apartment.listing, apartment.price]);

  if (!hasCoordinates(apartment)) return null;

  return <Marker
    position={[apartment.latitude, apartment.longitude]}
    icon={icon}
    eventHandlers={{ click: () => onSelect?.(apartment.id) }}
  >
    <ApartmentMapPopup apartment={apartment}/>
  </Marker>;
}

export function ApartmentMapPopup({ apartment }: { apartment: Apartment }) {
  return <Popup>
    <article className="map-popup">
      {apartment.image
        ? <Image src={apartment.image} alt="" width={260} height={130} unoptimized className="map-popup-image"/>
        : <div className="map-popup-image map-popup-image-empty" aria-label="No property image available"/>}
      <p className="eyebrow">{apartment.location}</p>
      <h3>{apartment.title}</h3>
      <p className="map-popup-price">{formatPrice(apartment.price, apartment.listing, apartment.currency)}</p>
      {apartment.locationPrecision === "approximate" && <small>Approximate area only; not an exact property pin.</small>}
      <Link href={`/apartments/${apartment.id}`}>View property</Link>
    </article>
  </Popup>;
}

function MapViewportController({ items, selectedId, center, zoom }: {
  items: Apartment[];
  selectedId?: string | null;
  center: LatLngExpression;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    const selected = items.find((item) => item.id === selectedId);
    if (selected && hasCoordinates(selected)) {
      map.setView([selected.latitude, selected.longitude], Math.max(map.getZoom(), 14));
      return;
    }
    const points = items.filter(hasCoordinates);
    if (points.length > 1) {
      map.fitBounds(latLngBounds(points.map((item) => [item.latitude, item.longitude])), { padding: [32, 32], maxZoom: 13 });
    } else if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 13);
    } else {
      map.setView(center, zoom);
    }
  }, [center, items, map, selectedId, zoom]);
  return null;
}

export function ApartmentMap({ items, selectedId, onSelect, center = BRAND.map.defaultCenter, referenceLabel, zoom = BRAND.map.defaultZoom, height = 460 }: ApartmentMapProps) {
  const [tileError, setTileError] = useState(false);
  const located = items.filter(hasCoordinates);

  return <div id="apartment-map" className="apartment-map-shell" style={{ height }}>
    <MapContainer center={center} zoom={zoom} scrollWheelZoom className="apartment-map">
      <TileLayer
        attribution={BRAND.map.attribution}
        url={BRAND.map.tileUrl}
        eventHandlers={{ tileerror: () => setTileError(true) }}
      />
      <MapViewportController items={items} selectedId={selectedId} center={center} zoom={zoom}/>
      {located.map((apartment) => <ApartmentMapMarker key={apartment.id} apartment={apartment} onSelect={onSelect}/>)}
      {referenceLabel && <CircleMarker center={center} radius={8} pathOptions={{ color: "#fff", weight: 3, fillColor: "#b79358", fillOpacity: 1 }}>
        <Popup><strong>{referenceLabel}</strong><br/>Approximate town-center reference only; this is not an exact property pin.</Popup>
      </CircleMarker>}
    </MapContainer>
    {tileError && <p className="map-status" role="status">Some map tiles could not be loaded. Check your connection or map tile provider.</p>}
    {items.length === 0 && !referenceLabel && <p className="map-status" role="status">No properties match these filters.</p>}
    {items.length > located.length && <p className="map-status map-status-bottom" role="status">{items.length - located.length} matching {items.length - located.length === 1 ? "listing has" : "listings have"} no coordinates and is not shown on the map.</p>}
    <p className="map-location-note">Pins marked approximate show an area reference, not an exact home address.</p>
  </div>;
}
