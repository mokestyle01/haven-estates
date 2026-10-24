"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="container" style={{ paddingBlock: 80 }}><p className="eyebrow">Something went wrong</p><h1 className="serif" style={{ fontWeight: 400 }}>We couldn’t load this page.</h1><p>Please try again. If Supabase is configured, check the project connection and policies.</p><button className="btn" onClick={reset}>Try again</button></main>;
}
