import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/auth/");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    if (isAuthRoute || pathname.startsWith("/api/")) return NextResponse.next({ request });
    return NextResponse.redirect(new URL("/auth/sign-in?error=configuration", request.url));
  }
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
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error && error.name !== "AuthSessionMissingError") throw error;
  if (pathname.startsWith("/api/")) return response;
  if (!isAuthRoute && !user) {
    const target = request.nextUrl.clone(); target.pathname = "/auth/sign-in"; target.search = ""; target.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(target);
  }
  if (isAuthRoute && user && !["/auth/callback", "/auth/reset-password"].includes(pathname)) {
    const target = request.nextUrl.clone(); target.pathname = "/dashboard"; target.search = "";
    return NextResponse.redirect(target);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"]
};
