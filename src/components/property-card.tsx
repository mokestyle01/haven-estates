import Link from "next/link";
import { Bath, BedDouble, MapPin, MoveUpRight } from "lucide-react";
import type { Apartment } from "@/lib/properties";
import { formatPrice } from "@/lib/properties";

export function PropertyCard({ apartment, isActive = false, onShowOnMap }: { apartment: Apartment; isActive?: boolean; onShowOnMap?: () => void }) {
  return <article style={{ border: isActive ? "2px solid var(--gold)" : "1px solid #eceeeb", borderRadius: 5, overflow: "hidden", background: "white" }}>
    <Link href={`/apartments/${apartment.id}`} aria-label={`View ${apartment.title}`}>
      <div className="property-image" style={{ height: 245, backgroundImage: apartment.image ? `url("${apartment.image}")` : undefined, backgroundColor: "#e9e6de", position: "relative", display: "grid", placeItems: "center" }}>
        {!apartment.image && <span style={{ color: "var(--muted)", fontSize: 13 }}>No property image available</span>}
        <span style={{ position: "absolute", left: 14, top: 14, background: "white", padding: "7px 10px", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase" }}>{apartment.listing}</span>
        <span style={{ position: "absolute", right: 14, bottom: 14, background: "var(--navy)", color: "white", padding: "9px 11px", fontSize: 13 }}>{formatPrice(apartment.price, apartment.listing, apartment.currency)}</span>
      </div>
    </Link>
    <div style={{ padding: "19px 20px 17px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--muted)", fontSize: 11 }}><MapPin size={13}/>{apartment.location}</div>
      <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, margin: "9px 0 15px", color: "var(--navy)" }}><Link href={`/apartments/${apartment.id}`}>{apartment.title}</Link></h3>
      <div style={{ display: "flex", gap: 18, color: "#637075", fontSize: 12, borderTop: "1px solid #eef0ed", paddingTop: 14 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><BedDouble size={15}/>{apartment.bedrooms} beds</span><span style={{ display: "flex", alignItems: "center", gap: 5 }}><Bath size={15}/>{apartment.bathrooms} baths</span><span>{apartment.type}</span>
        <Link aria-label={`Details for ${apartment.title}`} href={`/apartments/${apartment.id}`} style={{ marginLeft: "auto", color: "var(--gold)" }}><MoveUpRight size={17}/></Link>
      </div>
      {apartment.demo && <p style={{ color: "#8a7047", fontSize: 10, margin: "12px 0 0" }}>Illustrative demo listing · availability unconfirmed</p>}
      {onShowOnMap && <button type="button" className="map-focus-button" onClick={onShowOnMap}>Show this area on map</button>}
    </div>
  </article>;
}
