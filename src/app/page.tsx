import Link from "next/link";
import { ArrowRight, Compass, KeyRound, MessageCircle } from "lucide-react";
import { getPublishedApartments } from "@/lib/properties.server";
import { PropertyCard } from "@/components/property-card";
import { BRAND, SERVICE_LOCATIONS } from "@/lib/brand";

const locationImages = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80"
];

export default async function Home() {
  const apartments = await getPublishedApartments();
  return <main>
    <section style={{ minHeight: 560, position: "relative", display: "grid", alignItems: "center", background: "linear-gradient(90deg, rgba(14,29,37,.77), rgba(14,29,37,.24)), url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=90') center/cover" }}>
      <div className="container" style={{ color: "white", paddingBlock: 85 }}>
        <p className="eyebrow">Property guidance in {BRAND.serviceArea}</p>
        <h1 className="serif" style={{ fontSize: "clamp(45px,7vw,78px)", lineHeight: 1.02, fontWeight: 400, maxWidth: 620, margin: "23px 0" }}>Find a place<br/>to <i style={{ color: "#d4b47c" }}>belong.</i></h1>
        <p style={{ maxWidth: 475, color: "#e1e6e4", lineHeight: 1.8, fontSize: 16 }}>Thoughtful property guidance across Osun State, starting in {BRAND.primaryTown}, Nigeria.</p>
        <form action="/apartments" style={{ display: "flex", gap: 0, maxWidth: 600, marginTop: 34, background: "white", padding: 6, borderRadius: 3 }}>
          <label className="field" style={{ flex: 1 }}><span className="sr-only">Location</span><input name="location" placeholder={`Search ${BRAND.primaryTown}, Ile-Ife, Ilesa…`} aria-label="Search Osun State location" list="service-locations"/></label><datalist id="service-locations">{SERVICE_LOCATIONS.map((entry) => <option key={entry.name} value={entry.name}/>)}</datalist>
          <button className="btn" type="submit" style={{ borderRadius: 2 }}>Explore homes <ArrowRight size={16}/></button>
        </form>
        <p style={{ fontSize: 10, color: "#e1e6e4", marginTop: 13 }}>Fictional demonstration listings shown; details and availability are not verified.</p>
      </div>
    </section>
    <section className="container" style={{ paddingBlock: 86 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, marginBottom: 30 }}><div><p className="eyebrow">A few places to begin</p><h2 className="serif" style={{ fontWeight: 400, fontSize: 38, margin: "10px 0 0" }}>Homes with a little more <i>meaning.</i></h2></div><Link href="/apartments" className="btn btn-outline">View all homes <ArrowRight size={15}/></Link></div>
      <div className="grid-cards"><style>{`.grid-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}@media(max-width:850px){.grid-cards{grid-template-columns:repeat(2,1fr)}}@media(max-width:600px){.grid-cards{grid-template-columns:1fr}}`}</style>{apartments.slice(0, 3).map((a) => <PropertyCard key={a.id} apartment={a}/>)}</div>
    </section>
    <section style={{ background: "var(--cream)", paddingBlock: 80 }}>
      <div className="container"><p className="eyebrow">Find your kind of place</p><h2 className="serif" style={{ fontSize: 38, fontWeight: 400, margin: "10px 0 30px" }}>Good things happen locally.</h2><div className="location-grid"><style>{`.location-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}@media(max-width:650px){.location-grid{grid-template-columns:1fr}}`}</style>
        {SERVICE_LOCATIONS.slice(0, 3).map((entry, index) => <Link key={entry.name} href={`/apartments?location=${encodeURIComponent(entry.name)}`} style={{ height: 250, padding: 22, display: "flex", flexDirection: "column", justifyContent: "end", color: "white", background: `linear-gradient(0deg,rgba(15,28,35,.75),transparent 75%),url("${locationImages[index]}") center/cover` }}><span className="eyebrow" style={{ color: "#e1c58e" }}>Explore {BRAND.state}</span><span className="serif" style={{ fontSize: 30 }}>{entry.name}</span></Link>)}
      </div></div>
    </section>
    <section className="container" style={{ paddingBlock: 85, display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 70, alignItems: "center" }}>
      <div><p className="eyebrow">The Haven difference</p><h2 className="serif" style={{ fontWeight: 400, fontSize: 42, lineHeight: 1.15 }}>A good move starts with <i>good people.</i></h2><p style={{ color: "var(--muted)", lineHeight: 1.9 }}>Finding a home is personal. We listen first, guide with care, and make the process feel a little less like a process.</p><Link className="btn" href="/about" style={{ marginTop: 16 }}>Get to know us <ArrowRight size={15}/></Link></div>
      <div style={{ display: "grid", gap: 22 }}>{[[Compass, "Local knowledge", "Honest insight into the places and details that make a neighbourhood feel right."],[MessageCircle, "Advice that listens", "Clear, considered support shaped around what matters to you."],[KeyRound, "Here through the details", "A steady hand from your first viewing to your next chapter."]].map(([Icon, title, text]) => { const I = Icon as typeof Compass; return <div key={title as string} style={{ display: "flex", gap: 18 }}><I color="var(--gold)" size={22}/><div><b>{title as string}</b><p style={{ margin: "6px 0 0", color: "var(--muted)", lineHeight: 1.7, fontSize: 13 }}>{text as string}</p></div></div>; })}</div>
    </section>
    <section style={{ background: "var(--navy)", color: "white", paddingBlock: 64 }}><div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}><div><p className="eyebrow">Your next chapter</p><h2 className="serif" style={{ fontWeight: 400, fontSize: 36, margin: "9px 0" }}>Let’s find the right place.</h2></div><Link className="btn" href="/contact" style={{ background: "var(--gold)", borderColor: "var(--gold)" }}>Talk to our team <ArrowRight size={15}/></Link></div></section>
  </main>;
}
