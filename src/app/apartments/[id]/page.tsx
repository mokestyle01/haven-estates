import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Bath, BedDouble, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/properties";
import { getPublishedApartment } from "@/lib/properties.server";
import { PropertyActions } from "@/components/property-actions";
import { PropertyLocationMap } from "@/components/property-location-map";
import { BRAND } from "@/lib/brand";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params; const apartment = await getPublishedApartment(id);
  return {
    title: apartment?.title ?? "Property not found",
    description: apartment ? `${apartment.title} in ${apartment.location}, ${BRAND.country}. Illustrative listing details; confirm all property information directly.` : `Explore property guidance across ${BRAND.serviceArea}.`
  };
}
export default async function ApartmentDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const apartment = await getPublishedApartment(id); if (!apartment) notFound();
  return <main className="container" style={{ paddingBlock: 48 }}>
    <Link href="/apartments" style={{ color: "var(--muted)", fontSize: 13 }}>← All homes</Link>
    <div style={{ marginTop: 23, display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 12 }}>
      <div className="property-image" role="img" aria-label={`${apartment.title} interior photograph`} style={{ minHeight: 420, backgroundImage: apartment.image ? `url("${apartment.image}")` : undefined, backgroundColor: "#e9e6de", display: "grid", placeItems: "center", color: "#657176" }}>
        {!apartment.image && <span>Property image unavailable</span>}
      </div>
      <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 12 }}>
        {apartment.images?.[1] ? (
          <div className="property-image" role="img" aria-label={`${apartment.title} additional interior photograph`} style={{ backgroundImage: `url("${apartment.images[1]}")`, backgroundColor: "#e9e6de" }} />
        ) : (
          <div className="property-image" role="img" aria-label="Additional property image unavailable" style={{ backgroundColor: "#e9e6de", display: "grid", placeItems: "center", color: "#657176" }}>Image unavailable</div>
        )}
        <div style={{ background: "var(--cream)", padding: 25, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="eyebrow">{apartment.type} · {apartment.listing}</span>
          <h1 className="serif" style={{ fontWeight: 400, fontSize: 36, margin: "11px 0" }}>{apartment.title}</h1>
          <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--muted)" }}><MapPin size={15}/>{apartment.location}</span>
        </div>
      </div>
    </div>
    <div className="details-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 60, paddingTop: 42 }}>
      <div><p className="eyebrow">A little about this home</p><h2 className="serif" style={{ fontWeight: 400, fontSize: 30 }}>Room to make it your own.</h2><p style={{ lineHeight: 1.9, color: "#657176" }}>{apartment.description}</p><h3 className="serif" style={{ fontSize: 24, fontWeight: 400, marginTop: 32 }}>The details</h3><div style={{ display: "flex", gap: 22, fontSize: 13, color: "var(--muted)" }}><span><BedDouble size={16}/> {apartment.bedrooms} bedrooms</span><span><Bath size={16}/> {apartment.bathrooms} bathrooms</span><span>{apartment.area} m²</span></div><h3 className="serif" style={{ fontSize: 24, fontWeight: 400, marginTop: 28 }}>Thoughtful touches</h3><ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: 0, listStyle: "none", color: "#5b686d", fontSize: 13 }}>{apartment.amenities.map((a) => <li key={a}>✓ &nbsp;{a}</li>)}</ul>{apartment.demo && <div style={{ marginTop: 30, padding: 15, background: "#faf6ec", color: "#7b6543", fontSize: 12 }}>Fictional demonstration listing only. The property, details, price, location and availability are not verified and do not represent real inventory.</div>}</div>
      <aside style={{ border: "1px solid #e7eae7", padding: 26, height: "fit-content" }}><span className="eyebrow">Indicative price</span><p className="serif" style={{ fontSize: 34, margin: "8px 0" }}>{formatPrice(apartment.price, apartment.listing, apartment.currency)}</p><p style={{ color: "var(--muted)", fontSize: 12 }}>Confirm all pricing and terms directly.</p><PropertyActions apartmentId={apartment.id} title={apartment.title}/></aside>
    </div>
    <PropertyLocationMap apartment={apartment}/>
    <style>{`@media(max-width:700px){main>div:first-of-type{grid-template-columns:1fr!important}.details-grid{grid-template-columns:1fr!important;gap:28px!important}}`}</style>
  </main>;
}
