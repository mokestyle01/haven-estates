"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { BRAND } from "@/lib/brand";

const contactSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().email().max(254), phone: z.string().max(40).optional(), message: z.string().trim().min(10).max(3000) });
export function ContactForm() {
  const params = useSearchParams(); const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) { setStatus(parsed.error.issues[0]?.message ?? "Please check the form."); return; }
    setBusy(true);
    try {
      const { error } = await createClient().from("contact_messages").insert({
        name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || null,
        message: parsed.data.message, subject: params.get("property") ? `Property enquiry: ${params.get("property")}` : "Website contact"
      });
      if (error) throw error;
      form.reset(); setStatus("Your message has been recorded. This demo does not send email notifications.");
    } catch (e) { setStatus(e instanceof Error ? e.message : "Unable to save your message."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
    <label className="field">Name<input name="name" required minLength={2} maxLength={100} autoComplete="name"/></label>
    <label className="field">Email<input name="email" type="email" required maxLength={254} autoComplete="email"/></label>
    <label className="field">Phone (optional)<input name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder={BRAND.contact.phonePlaceholder}/></label>
    <label className="field">How can we help?<textarea name="message" rows={5} required minLength={10} maxLength={3000} placeholder={`Tell us what you are looking for in ${BRAND.serviceArea}…`}/></label>
    {status && <p role="status" style={{ color: status.startsWith("Your message") ? "#37664a" : "#a63b32", fontSize: 13 }}>{status}</p>}
    <button className="btn" disabled={busy}>{busy ? "Sending…" : "Send your enquiry"}</button>
    <p style={{ fontSize: 11, lineHeight: 1.6, color: "var(--muted)", margin: 0 }}>Requires Supabase setup. No email delivery is configured; messages are stored only after the contact_messages migration is applied.</p>
  </form>;
}
