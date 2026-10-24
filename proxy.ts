import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next({ request });
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
    const target = request.nextUrl.clone(); target.pathname = "/auth/sign-in"; target.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(target);
  }
  if (request.nextUrl.pathname.startsWith("/auth/") && user && !["/auth/callback", "/auth/reset-password"].includes(request.nextUrl.pathname)) {
    const target = request.nextUrl.clone(); target.pathname = "/dashboard"; target.search = "";
    return NextResponse.redirect(target);
  }
  return response;
}

export const config = { matcher: ["/dashboard/:path*", "/auth/:path*"] };
