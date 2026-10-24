"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BRAND } from "@/lib/brand";

export function PropertyActions({ apartmentId, title }: { apartmentId: string; title: string }) {
  const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  async function favorite() {
    setBusy(true); setStatus("");
    try {
      const supabase = createClient(); const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) { router.push(`/auth/sign-in?next=${encodeURIComponent(`/apartments/${apartmentId}`)}`); return; }
      const { data, error } = await supabase.from("favorites").select("id").eq("apartment_id", apartmentId).maybeSingle();
      if (error) throw error;
      const result = data
        ? await supabase.from("favorites").delete().eq("id", data.id)
        : await supabase.from("favorites").insert({ apartment_id: apartmentId });
      if (result.error) throw result.error;
      setStatus(data ? "Removed from saved homes." : "Added to saved homes.");
    } catch (e) { setStatus(e instanceof Error ? e.message : "Could not update saved homes."); }
    finally { setBusy(false); }
  }
  async function inquire(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("");
    const form = event.currentTarget; const values = Object.fromEntries(new FormData(form));
    if (typeof values.message !== "string" || values.message.trim().length < 10 || values.message.length > 3000) { setStatus("Please enter a message between 10 and 3,000 characters."); setBusy(false); return; }
    try {
      const supabase = createClient(); const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) { router.push(`/auth/sign-in?next=${encodeURIComponent(`/apartments/${apartmentId}`)}`); return; }
      const { error } = await supabase.from("inquiries").insert({ apartment_id: apartmentId, user_id: user.id, message: values.message, contact_name: user.user_metadata.full_name || "", contact_email: user.email || "", contact_phone: values.phone || null });
      if (error) throw error;
      form.reset(); setStatus("Your enquiry has been recorded. An agent has not been notified; this demo has no notification delivery configured.");
    } catch (e) { setStatus(e instanceof Error ? e.message : "Unable to submit your enquiry."); }
    finally { setBusy(false); }
  }
  return <><button className="btn btn-outline" onClick={favorite} disabled={busy} style={{ width: "100%", marginTop: 10 }}><Bookmark size={15}/>Save this home</button>
    <form onSubmit={inquire} style={{ borderTop: "1px solid #e7eae7", marginTop: 22, paddingTop: 18, display: "grid", gap: 12 }}>
      <b style={{ fontSize: 14 }}>Ask us about this home</b>
      <label className="field">Phone (optional)<input name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder={BRAND.contact.phonePlaceholder}/></label>
      <label className="field">Message<textarea name="message" rows={4} minLength={10} maxLength={3000} required defaultValue={`Hello, I'm interested in ${title}.`} /></label>
      <button className="btn" disabled={busy}><Send size={15}/>{busy ? "Sending…" : "Send enquiry"}</button>
      {status && <p role="status" style={{ fontSize: 12, lineHeight: 1.6, color: status.startsWith("Your enquiry") || status.startsWith("Added") || status.startsWith("Removed") ? "#37664a" : "#a63b32" }}>{status}</p>}
      <small style={{ color: "var(--muted)", lineHeight: 1.6 }}>Sign in required. Submission is recorded only; no agent notification is configured.</small>
    </form>
  </>;
}
