import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { BRAND } from "@/lib/brand";

export function Header() {
  return <header style={{ borderBottom: "1px solid #eef0ed", background: "rgba(255,255,255,.96)" }}>
    <div className="container" style={{ height: 82, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Link href="/" aria-label="Haven Estates homepage" style={{ display: "grid", lineHeight: 1.05 }}>
        <span className="serif" style={{ color: "var(--navy)", fontSize: 25, letterSpacing: "-.04em" }}>haven<span style={{ color: "var(--gold)" }}>.</span></span><span style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "#778184" }}>{BRAND.serviceArea}</span>
      </Link>
      <nav aria-label="Main navigation" className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 30, fontSize: 13, color: "#435158" }}>
        <Link href="/apartments">Apartments</Link><Link href="/about">Our approach</Link><Link href="/contact">Contact</Link>
      </nav>
      <details className="mobile-nav"><summary aria-label="Open navigation"><Menu size={19}/> Menu</summary><nav aria-label="Mobile navigation"><Link href="/apartments">Apartments</Link><Link href="/about">Our approach</Link><Link href="/contact">Contact</Link><Link href="/auth/sign-in">Sign in</Link></nav></details>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/auth/sign-in" style={{ fontSize: 13 }}>Sign in</Link><Link className="btn" href="/apartments" style={{ minHeight: 42, paddingInline: 16 }}>Find a home <ArrowRight size={15}/></Link>
      </div>
    </div>
    <style>{`.mobile-nav{display:none;position:relative}.mobile-nav summary{display:flex;align-items:center;gap:6px;list-style:none;cursor:pointer;font-size:13px}.mobile-nav summary::-webkit-details-marker{display:none}.mobile-nav nav{position:absolute;right:0;top:32px;z-index:20;width:185px;padding:10px;background:white;box-shadow:0 8px 22px #182a3520;border:1px solid #eceeeb;display:grid;gap:0}.mobile-nav nav a{padding:12px;font-size:13px}@media(max-width:700px){.desktop-nav{display:none!important}.mobile-nav{display:block}.container>div:has(>.mobile-nav){gap:10px!important}.container>div:has(>.mobile-nav)>div:last-child>a:first-child{display:none}}@media(max-width:390px){.container>div:has(>.mobile-nav)>div:last-child>a:last-child{font-size:11px;padding-inline:10px!important}}`}</style>
  </header>;
}

export function Footer() {
  return <footer style={{ background: "var(--navy)", color: "#e7eceb", marginTop: 80 }}>
    <div className="container" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40, paddingBlock: 58 }}>
      <div><div className="serif" style={{ fontSize: 27 }}>haven<span style={{ color: "var(--gold)" }}>.</span></div><p style={{ maxWidth: 350, color: "#b8c3c4", lineHeight: 1.8, fontSize: 14 }}>A more considered way to find a home in {BRAND.serviceArea}. Personal property guidance, shaped around you.</p></div>
      <div><b style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase" }}>Explore</b><div style={{ display: "grid", gap: 12, marginTop: 18, color: "#c5cece", fontSize: 13 }}><Link href="/apartments">Apartments</Link><Link href="/about">Our approach</Link><Link href="/contact">Contact</Link></div></div>
      <div><b style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase" }}>Get in touch</b><p style={{ color: "#c5cece", fontSize: 13, lineHeight: 1.8 }}>{BRAND.contact.officeAddress}.<br/><Link href="/contact" style={{ color: "#d9bb86" }}>Send an enquiry →</Link></p></div>
    </div>
    <div style={{ borderTop: "1px solid #ffffff20" }}><div className="container" style={{ paddingBlock: 18, color: "#aebbbb", fontSize: 11, display: "flex", justifyContent: "space-between" }}><span>© {new Date().getFullYear()} Haven Estates</span><span>Illustrative demo listings — not confirmed availability.</span></div></div>
  </footer>;
}
