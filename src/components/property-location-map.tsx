"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { BRAND, getServiceLocation } from "@/lib/brand";
import type { Apartment } from "@/lib/properties";

const ApartmentMap = dynamic(
  () => import("@/components/apartment-map").then((module) => module.ApartmentMap),
  { ssr: false, loading: () => <div className="map-loading" role="status">Loading location map…</div> }
);

export function PropertyLocationMap({ apartment }: { apartment: Apartment }) {
  const town = getServiceLocation(apartment.city);
  const hasCoordinates = apartment.latitude !== null && apartment.longitude !== null;
  const center = hasCoordinates
    ? [apartment.latitude as number, apartment.longitude as number] as [number, number]
    : town?.center;
  const locationQuery = hasCoordinates
    ? `${apartment.latitude},${apartment.longitude}`
    : [apartment.neighborhood, apartment.city, apartment.state || BRAND.state, BRAND.country].filter(Boolean).join(", ");
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationQuery)}`;

  return <section className="property-location">
    <div className="property-location-heading">
      <div>
        <p className="eyebrow">Location</p>
        <h2 className="serif">Around {apartment.neighborhood || apartment.city}</h2>
        <p>{[apartment.neighborhood, apartment.city, apartment.state || BRAND.state].filter(Boolean).join(", ")}</p>
      </div>
      <Link href={directionsUrl} target="_blank" rel="noreferrer">Get directions</Link>
    </div>
    {center
      ? <ApartmentMap
          items={hasCoordinates ? [apartment] : []}
          center={center}
          referenceLabel={!hasCoordinates && town ? `${town.name} town-center reference` : undefined}
          zoom={hasCoordinates ? apartment.locationPrecision === "exact" ? 15 : 12 : 11}
          height={360}
        />
      : <div className="property-location-fallback" role="status">
          Map coordinates are not available for this listing. Its stated area is {apartment.location}.
        </div>}
    {apartment.locationPrecision === "approximate" || !hasCoordinates
      ? <p className="map-precision-note">This is an approximate area reference only. It is not the property address or an exact pin.</p>
      : <p className="map-precision-note">The marker uses the location shared for this property.</p>}
  </section>;
}
