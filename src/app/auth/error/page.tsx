import Link from "next/link";
export default function AuthErrorPage() { return <main className="container" style={{ paddingBlock: 90 }}><h1 className="serif">We couldn’t complete that request.</h1><p>Please try again or return to sign in.</p><Link className="btn" href="/auth/sign-in">Sign in</Link></main>; }
