"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { apartments, APARTMENT_PUBLIC_COLUMNS, fromApartmentRow, LOCALE, type Apartment, type ApartmentRow } from "@/lib/properties";
import { BRAND, SERVICE_LOCATIONS } from "@/lib/brand";
import { PropertyCard } from "@/components/property-card";
import { Bookmark, LayoutDashboard, LogOut, MessageSquareText, UserRound } from "lucide-react";

const links = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/dashboard/profile", "Profile", UserRound],
  ["/dashboard/favorites", "Saved homes", Bookmark],
  ["/dashboard/inquiries", "My enquiries", MessageSquareText]
] as const;

export function DashboardShell({ children, title }: { children: React.ReactNode; title: string }) {
  const pathname = usePathname(); const router = useRouter(); const [name, setName] = useState("Your Haven");
  useEffect(() => { createClient().auth.getUser().then(({ data }) => setName(data.user?.user_metadata?.full_name || data.user?.email || "Your Haven")); }, []);
  async function signOut() { const { error } = await createClient().auth.signOut(); if (error) { window.alert(error.message); return; } router.push("/"); router.refresh(); }
  return <div className="container dashboard-layout" style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 42, minHeight: 490, paddingBlock: 48 }}>
    <aside style={{ borderRight: "1px solid #e8ece9", paddingRight: 22 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 28 }}><div style={{ width: 42, height: 42, background: "var(--cream)", color: "var(--gold)", display: "grid", placeItems: "center", borderRadius: "50%" }}><UserRound size={20}/></div><div><b style={{ fontSize: 13 }}>{name}</b><div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>Your account</div></div></div>
      <nav style={{ display: "grid", gap: 5 }}>{links.map(([href, label, Icon]) => <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: 11, padding: 12, background: pathname === href ? "var(--cream)" : "transparent", color: pathname === href ? "var(--navy)" : "#657176", fontSize: 13, borderRadius: 3 }}><Icon size={17}/>{label}</Link>)}</nav>
      <button onClick={signOut} style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 24, padding: 12, background: "transparent", border: 0, color: "#657176", cursor: "pointer", fontSize: 13 }}><LogOut size={17}/>Sign out</button>
    </aside>
    <main><p className="eyebrow">Your Haven · {BRAND.state}</p><h1 className="serif" style={{ fontWeight: 400, fontSize: 38, margin: "7px 0 28px" }}>{title}</h1>{children}</main>
    <style>{`@media(max-width:700px){.dashboard-layout{grid-template-columns:1fr!important;gap:18px!important}.dashboard-layout aside{border-right:0;border-bottom:1px solid #e8ece9;padding:0 0 12px}.dashboard-layout aside nav{grid-template-columns:repeat(2,1fr)}}`}</style>
  </div>;
}

export function DashboardOverview() {
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);
  const [counts, setCounts] = useState({ favorites: 0, inquiries: 0 });
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      const supabase = createClient(); const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      setUser({ id: auth.user.id, email: auth.user.email });
      const [favorites, inquiries] = await Promise.all([supabase.from("favorites").select("id", { count: "exact", head: true }), supabase.from("inquiries").select("id", { count: "exact", head: true })]);
      if (favorites.error || inquiries.error) setError(favorites.error?.message || inquiries.error?.message || "Could not load dashboard data.");
      setCounts({ favorites: favorites.count ?? 0, inquiries: inquiries.count ?? 0 });
    }
    load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load dashboard."));
  }, []);
  return <><p style={{ color: "var(--muted)", marginTop: -12 }}>A little space to keep your {BRAND.serviceArea} home search organised.</p>{error && <p role="alert" style={{ color: "#a63b32" }}>{error}</p>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginTop: 24 }}>{[["Saved homes", counts.favorites, "/dashboard/favorites"],["Enquiries", counts.inquiries, "/dashboard/inquiries"]].map(([label, count, href]) => <Link href={href as string} key={label} style={{ padding: 21, border: "1px solid #e8ece9" }}><div style={{ fontSize: 12, color: "var(--muted)" }}>{label}</div><strong className="serif" style={{ display: "block", fontWeight: 400, fontSize: 34, marginTop: 6 }}>{count}</strong></Link>)}</div>
    <div style={{ marginTop: 34, padding: 24, background: "var(--cream)" }}><h2 className="serif" style={{ marginTop: 0, fontWeight: 400 }}>Your next step</h2><p style={{ color: "var(--muted)", fontSize: 13 }}>{user?.email ? `Signed in as ${user.email}.` : "Your property search is ready when you are."}</p><Link className="btn" href="/apartments">Explore homes</Link></div>
  </>;
}

export function ProfileEditor() {
  const router = useRouter();
  const [profile, setProfile] = useState({ full_name: "", email: "", phone: "", bio: "", preferred_location: "", avatar_url: "" });
  const [avatar, setAvatar] = useState(""); const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    async function load() {
      const supabase = createClient(); const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError; if (!user) return;
      const { data, error } = await supabase.from("profiles").select("full_name,email,phone,bio,preferred_location,avatar_url").eq("id", user.id).maybeSingle();
      if (error) throw error;
      const next = { full_name: data?.full_name ?? String(user.user_metadata.full_name ?? ""), email: user.email ?? "", phone: data?.phone ?? "", bio: data?.bio ?? "", preferred_location: data?.preferred_location ?? "", avatar_url: data?.avatar_url ?? "" };
      setProfile(next);
      if (next.avatar_url) { const { data: signed, error: signedError } = await supabase.storage.from("avatars").createSignedUrl(next.avatar_url, 3600); if (signedError) throw signedError; setAvatar(signed.signedUrl); }
    }
    load().catch((e: unknown) => setStatus(e instanceof Error ? e.message : "Could not load your profile."));
  }, []);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("");
    try {
      const supabase = createClient(); const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError; if (!user) throw new Error("Please sign in again.");
      if (!profile.full_name.trim() || profile.full_name.length > 100 || profile.phone.length > 40 || profile.bio.length > 1000 || profile.preferred_location.length > 120) throw new Error("Please check the profile fields and their lengths.");
      if (profile.email !== user.email) {
        const { error } = await supabase.auth.updateUser({ email: profile.email });
        if (error) throw error;
        setStatus("Email change requested. Check both inboxes for verification; your current sign-in email remains active until confirmed.");
      }
      const { error } = await supabase.from("profiles").update({ full_name: profile.full_name.trim(), phone: profile.phone || null, bio: profile.bio || null, preferred_location: profile.preferred_location || null, avatar_url: profile.avatar_url || null }).eq("id", user.id);
      if (error) throw error;
      if (profile.email === user.email) setStatus("Your profile has been updated.");
    } catch (e) { setStatus(e instanceof Error ? e.message : "Could not update profile."); }
    finally { setBusy(false); }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setStatus("Choose a JPEG, PNG or WebP image under 5 MB."); return; }
    setBusy(true); setStatus("");
    try {
      const supabase = createClient(); const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError; if (!user) throw new Error("Please sign in again.");
      const path = `${user.id}/${crypto.randomUUID()}.${file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data: signed, error: signError } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
      if (signError) { const cleanup = await supabase.storage.from("avatars").remove([path]); throw new Error(cleanup.error ? `${signError.message}; cleanup failed: ${cleanup.error.message}` : signError.message); }
      const { error: profileError } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
      if (profileError) { const cleanup = await supabase.storage.from("avatars").remove([path]); throw new Error(cleanup.error ? `${profileError.message}; cleanup failed: ${cleanup.error.message}` : profileError.message); }
      const old = profile.avatar_url; setProfile((p) => ({ ...p, avatar_url: path })); setAvatar(signed.signedUrl);
      if (old) { const { error: removeError } = await supabase.storage.from("avatars").remove([old]); if (removeError) setStatus(`New image is saved, but the previous file could not be removed: ${removeError.message}`); else setStatus("Profile image updated."); }
      else setStatus("Profile image updated.");
    } catch (e) { setStatus(e instanceof Error ? e.message : "Image upload failed."); }
    finally { setBusy(false); }
  }
  async function removeAvatar() {
    if (!profile.avatar_url) return;
    setBusy(true);
    try {
      const supabase = createClient(); const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError; if (!user) throw new Error("Please sign in again.");
      const { error: profileError } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
      if (profileError) throw profileError;
      const { error } = await supabase.storage.from("avatars").remove([profile.avatar_url]); if (error) throw error;
      setProfile((p) => ({ ...p, avatar_url: "" })); setAvatar(""); setStatus("Profile image removed.");
    }
    catch (e) { setStatus(e instanceof Error ? e.message : "Could not remove image."); } finally { setBusy(false); }
  }
  async function deleteAccount() {
    if (!window.confirm("Permanently delete your Haven account? This action cannot be undone. Your profile and private avatar uploads will be deleted.")) return;
    setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/account/delete", { method: "DELETE" }); const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Account deletion failed.");
      await createClient().auth.signOut(); router.replace("/");
    } catch (e) { setStatus(e instanceof Error ? e.message : "Account deletion failed."); } finally { setBusy(false); }
  }
  const fields: [keyof typeof profile, string][] = [["full_name", "Full name"],["email","Email address"],["phone","Phone"],["preferred_location","Preferred location"],["bio","About you"]];
  return <div style={{ maxWidth: 620 }}><div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 24 }}><div style={{ width: 76, height: 76, borderRadius: "50%", overflow: "hidden", background: "var(--cream)", display: "grid", placeItems: "center", color: "var(--gold)" }}>{avatar ? <Image src={avatar} alt="Your profile" width={76} height={76} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : <UserRound size={30}/>}</div><div><label className="btn btn-outline" style={{ cursor: "pointer" }}>Choose image<input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files?.[0])}/></label>{profile.avatar_url && <button onClick={removeAvatar} style={{ display: "block", marginTop: 7, border: 0, background: "none", padding: 0, color: "#8b504b", cursor: "pointer", fontSize: 12 }}>Remove image</button>}</div></div>
    <form onSubmit={save} style={{ display: "grid", gap: 15 }}>{fields.map(([key, label]) => <label className="field" key={key}>{label}{key === "bio" ? <textarea rows={4} maxLength={1000} value={profile[key]} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}/> : <input type={key === "email" ? "email" : "text"} list={key === "preferred_location" ? "profile-service-locations" : undefined} placeholder={key === "preferred_location" ? `Choose or enter a location in ${BRAND.state}` : key === "phone" ? BRAND.contact.phonePlaceholder : undefined} required={key === "full_name" || key === "email"} maxLength={key === "full_name" ? 100 : key === "email" ? 254 : key === "phone" ? 40 : 120} value={profile[key]} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}/>}</label>)}<datalist id="profile-service-locations">{SERVICE_LOCATIONS.flatMap((location) => [location.name, ...location.neighborhoods]).map((location) => <option key={location} value={location}/>)}</datalist><button className="btn" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button></form>
    {status && <p role="status" style={{ color: status.includes("could not") || status.includes("failed") || status.includes("error") ? "#a63b32" : "#37664a" }}>{status}</p>}
    <section style={{ marginTop: 48, borderTop: "1px solid #e7eae7", paddingTop: 24 }}><h2 style={{ fontSize: 16 }}>Delete your account</h2><p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>Permanent deletion removes your account and associated profile data. Inquiries are retained in de-identified form for business records. The server requires a Supabase service role key configured privately.</p><button onClick={deleteAccount} disabled={busy} style={{ border: "1px solid #a63b32", color: "#a63b32", background: "white", padding: "11px 14px", cursor: "pointer" }}>Permanently delete account</button></section>
  </div>;
}

export function FavoritesList() {
  const [rows, setRows] = useState<Apartment[]>([]); const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      const { data, error: queryError } = await createClient().from("favorites").select(`apartments!inner(${APARTMENT_PUBLIC_COLUMNS})`).order("created_at", { ascending: false });
      if (queryError) throw queryError;
      const records = (data ?? []) as unknown as { apartments: ApartmentRow }[];
      setRows(records.filter((row) => row.apartments?.published).map((row) => fromApartmentRow(row.apartments)));
    }
    load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load saved homes."));
  }, []);
  async function remove(id: string) {
    const supabase = createClient(); const { error: queryError } = await supabase.from("favorites").delete().eq("apartment_id", id);
    if (queryError) { setError(queryError.message); return; }
    setRows((current) => current.filter((apartment) => apartment.id !== id));
  }
  return <>{error && <p role="alert" style={{ color: "#a63b32" }}>{error}</p>}{rows.length ? <div className="favorite-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }}>{rows.map((a) => <div key={a.id}><PropertyCard apartment={a}/><button onClick={() => remove(a.id)} style={{ marginTop: 8, border: 0, padding: 8, background: "transparent", color: "#8b504b", cursor: "pointer" }}>Remove from saved homes</button></div>)}</div> : <div style={{ background: "var(--cream)", padding: 28 }}><p style={{ color: "var(--muted)" }}>You have no saved homes yet. Browse our illustrative listings to get started.</p><Link className="btn" href="/apartments">Explore homes</Link></div>}<style>{`@media(max-width:650px){.favorite-grid{grid-template-columns:1fr!important}}`}</style></>;
}

export function InquiriesList() {
  const [items, setItems] = useState<{ id: string; message: string; status: string; created_at: string; apartment_id: string }[]>([]); const [error, setError] = useState("");
  useEffect(() => { createClient().from("inquiries").select("id,message,status,created_at,apartment_id").order("created_at", { ascending: false }).then(({ data, error: e }) => { if (e) setError(e.message); else setItems(data ?? []); }); }, []);
  return <>{error && <p role="alert" style={{ color: "#a63b32" }}>{error}</p>}{items.length ? items.map((item) => <article key={item.id} style={{ border: "1px solid #e8ece9", padding: 18, marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><b style={{ fontSize: 14 }}>{apartments.find((a) => a.id === item.apartment_id)?.title ?? "Property enquiry"}</b><small>{new Date(item.created_at).toLocaleDateString(LOCALE)}</small></div><p style={{ color: "var(--muted)", fontSize: 13 }}>{item.message}</p><span style={{ fontSize: 11, background: "var(--cream)", padding: "5px 8px" }}>{item.status}</span></article>) : <p style={{ background: "var(--cream)", padding: 22, color: "var(--muted)" }}>Your submitted enquiries will appear here.</p>}</>;
}
