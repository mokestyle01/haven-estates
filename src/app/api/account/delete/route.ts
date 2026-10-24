import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function DELETE(_request: NextRequest) {
  const origin = _request.headers.get("origin");
  if (origin && origin !== _request.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: "Secure account deletion is not configured. Set SUPABASE_SERVICE_ROLE_KEY as a server-only environment variable." }, { status: 503 });
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Sign in again to delete your account." }, { status: 401 });
  const admin = createAdminClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  let offset = 0;
  while (true) {
    const { data: files, error: listError } = await admin.storage.from("avatars").list(user.id, { limit: 1000, offset });
    if (listError) return NextResponse.json({ error: `Could not inspect private avatar files: ${listError.message}` }, { status: 500 });
    const fileNames = (files ?? []).filter((file) => file.id).map((file) => `${user.id}/${file.name}`);
    if (fileNames.length) {
      const { error } = await admin.storage.from("avatars").remove(fileNames);
      if (error) return NextResponse.json({ error: `Could not remove private avatar files: ${error.message}` }, { status: 500 });
    }
    if ((files?.length ?? 0) < 1000) break;
    offset += 1000;
  }
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return NextResponse.json({ error: `Could not delete account: ${deleteError.message}` }, { status: 500 });
  return NextResponse.json({ success: true });
}
