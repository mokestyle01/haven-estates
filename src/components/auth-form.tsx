"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" | "forgot" | "reset" }) {
  const router = useRouter(); const params = useSearchParams();
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const schema = z.object({ email: z.string().optional(), password: z.string().optional(), fullName: z.string().optional() }).superRefine((values, context) => {
    if (mode !== "reset" && !z.string().email().safeParse(values.email).success) context.addIssue({ code: "custom", path: ["email"], message: "Enter a valid email address" });
    if (mode !== "forgot" && (!values.password || values.password.length < 8)) context.addIssue({ code: "custom", path: ["password"], message: "Use at least 8 characters" });
  });
  type FormValues = z.infer<typeof schema>;
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ defaultValues: { email: "", password: "", fullName: "" } });
  const heading = mode === "sign-in" ? "Welcome back." : mode === "sign-up" ? "Begin your next chapter." : mode === "forgot" ? "Reset your password." : "Choose a new password.";
  async function submit(values: FormValues) {
    setBusy(true); setError(""); setMessage("");
    try {
      const validated = schema.safeParse(values);
      if (!validated.success) throw new Error(validated.error.issues[0]?.message ?? "Please check the form.");
      const supabase = createClient();
      if (mode === "sign-in") {
        if (!values.password || !values.email) throw new Error("Enter your email and password.");
        const { error: authError } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
        if (authError) throw authError;
        const next = params.get("next");
        router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"); router.refresh();
      } else if (mode === "sign-up") {
        if (!values.password || !values.email) throw new Error("Enter your email and password.");
        const { error: authError } = await supabase.auth.signUp({ email: values.email, password: values.password, options: { data: { full_name: values.fullName }, emailRedirectTo: `${location.origin}/auth/callback` } });
        if (authError) throw authError;
        setMessage("Check your email to verify your account before signing in.");
      } else if (mode === "forgot") {
        if (!values.email) throw new Error("Enter a valid email address.");
        const { error: authError } = await supabase.auth.resetPasswordForEmail(values.email, { redirectTo: `${location.origin}/auth/callback?next=/auth/reset-password` });
        if (authError) throw authError;
        setMessage("If an account exists for that address, a password reset link has been sent.");
      } else {
        if (!values.password) throw new Error("Enter a new password.");
        const { error: authError } = await supabase.auth.updateUser({ password: values.password });
        if (authError) throw authError;
        setMessage("Your password has been updated.");
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }
  async function google() {
    setError(""); setBusy(true);
    try { const { error: authError } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback` } }); if (authError) throw authError; }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to start Google sign-in."); setBusy(false); }
  }
  return <section style={{ width: "min(460px, calc(100% - 36px))", margin: "64px auto 90px", padding: 32, border: "1px solid #eceeeb" }}>
    <p className="eyebrow">Haven Estates</p><h1 className="serif" style={{ fontWeight: 400, fontSize: 34, margin: "8px 0 25px" }}>{heading}</h1>
    {params.get("error") && <p role="alert" style={{ color: "#a63b32", background: "#fff1ef", padding: 12 }}>Sign-in could not be completed: {params.get("error")}</p>}
    {mode !== "forgot" && mode !== "reset" && <button type="button" className="btn btn-outline" onClick={google} disabled={busy} style={{ width: "100%" }}>Continue with Google</button>}
    {mode !== "forgot" && mode !== "reset" && <p style={{ textAlign: "center", color: "#8a9292", fontSize: 12 }}>or use your email address</p>}
    <form onSubmit={handleSubmit(submit)} style={{ display: "grid", gap: 15 }}>
      {mode === "sign-up" && <label className="field">Full name<input {...register("fullName")} autoComplete="name"/></label>}
      {mode !== "reset" && <label className="field">Email address<input type="email" autoComplete="email" {...register("email")}/>{errors.email && <span role="alert" style={{ color: "#a63b32" }}>{errors.email.message}</span>}</label>}
      {mode !== "forgot" && <label className="field">Password<input type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} {...register("password")}/>{errors.password && <span role="alert" style={{ color: "#a63b32" }}>{errors.password.message}</span>}</label>}
      {error && <p role="alert" style={{ color: "#a63b32", margin: 0 }}>{error}</p>}{message && <p role="status" style={{ color: "#37664a", margin: 0 }}>{message}</p>}
      <button className="btn" disabled={busy} type="submit">{busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : mode === "sign-up" ? "Create account" : mode === "forgot" ? "Send reset link" : "Update password"}</button>
    </form>
    <div style={{ display: "grid", gap: 10, marginTop: 20, color: "var(--muted)", fontSize: 13, textAlign: "center" }}>
      {mode === "sign-in" && <><Link href="/auth/forgot-password">Forgot password?</Link><span>New to Haven? <Link href="/auth/sign-up" style={{ color: "var(--gold)" }}>Create an account</Link></span></>}
      {mode === "sign-up" && <span>Already registered? <Link href="/auth/sign-in">Sign in</Link></span>}
      {(mode === "forgot" || mode === "reset") && <Link href="/auth/sign-in">Back to sign in</Link>}
    </div>
  </section>;
}
