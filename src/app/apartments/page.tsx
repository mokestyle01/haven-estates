import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublishedApartments } from "@/lib/properties.server";
import { ApartmentSearch } from "@/components/apartment-search";
import { BRAND, SERVICE_LOCATIONS } from "@/lib/brand";
export const metadata: Metadata = { title: "Apartments", description: `Explore homes and illustrative listings in ${BRAND.serviceArea}.` };
export default async function ApartmentsPage() {
  const apartments = await getPublishedApartments();
  return <main className="container" style={{ paddingBlock: 65 }}>
    <p className="eyebrow">A thoughtful place to start · {BRAND.serviceArea}</p><h1 className="serif" style={{ fontSize: 48, fontWeight: 400, margin: "9px 0 12px" }}>Find your next home.</h1><p style={{ maxWidth: 650, color: "var(--muted)", lineHeight: 1.8, marginBottom: 32 }}>Explore homes across {SERVICE_LOCATIONS.slice(0, 3).map((location) => location.name).join(", ")} and surrounding communities. Sample listings are fictional demonstrations; availability is not confirmed.</p>
    <Suspense fallback={<p>Loading homes…</p>}><ApartmentSearch items={apartments}/></Suspense>
  </main>;
}
