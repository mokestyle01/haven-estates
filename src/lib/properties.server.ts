import "server-only";
import { apartments as demoApartments, APARTMENT_PUBLIC_COLUMNS, fromApartmentRow, type Apartment, type ApartmentRow } from "@/lib/properties";
import { createClient } from "@/lib/supabase/server";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const LEGACY_APARTMENT_COLUMNS = "id,title,display_location,description,price,currency,listing_type,property_type,city,bedrooms,bathrooms,area,image_urls,amenities,published,is_demo,created_at";

function isMissingLocationColumnError(error: { code?: string; message: string }) {
  if (error.code === "42703") return true;
  const mentionsLocationColumn = /\b(state|country|neighborhood|latitude|longitude|location_precision)\b/i.test(error.message);
  return mentionsLocationColumn && /column.*(?:does not exist|not found|schema cache)|schema cache.*column/i.test(error.message);
}

export async function getPublishedApartments(): Promise<Apartment[]> {
  if (!configured) return demoApartments;
  const supabase = await createClient();
  const { data, error } = await supabase.from("apartments").select(APARTMENT_PUBLIC_COLUMNS).eq("published", true).order("created_at", { ascending: false });
  if (error && isMissingLocationColumnError(error)) {
    const legacy = await supabase.from("apartments").select(LEGACY_APARTMENT_COLUMNS).eq("published", true).order("created_at", { ascending: false });
    if (legacy.error) throw new Error(`Could not load published apartments: ${legacy.error.message} (new-schema query: ${error.message})`);
    console.warn("The apartments location migration is not available; loading listings without coordinates. Apply the Osun location fields migration to enable map locations.");
    return (legacy.data ?? []).map((row) => fromApartmentRow(row as ApartmentRow));
  }
  if (error) throw new Error(`Could not load published apartments: ${error.message}`);
  return (data ?? []).map((row) => fromApartmentRow(row as ApartmentRow));
}

export async function getPublishedApartment(id: string): Promise<Apartment | undefined> {
  if (!configured) return demoApartments.find((item) => item.id === id);
  const supabase = await createClient();
  const { data, error } = await supabase.from("apartments").select(APARTMENT_PUBLIC_COLUMNS).eq("id", id).eq("published", true).maybeSingle();
  if (error && isMissingLocationColumnError(error)) {
    const legacy = await supabase.from("apartments").select(LEGACY_APARTMENT_COLUMNS).eq("id", id).eq("published", true).maybeSingle();
    if (legacy.error) throw new Error(`Could not load property details: ${legacy.error.message} (new-schema query: ${error.message})`);
    console.warn("The apartments location migration is not available; loading property details without coordinates. Apply the Osun location fields migration to enable map locations.");
    return legacy.data ? fromApartmentRow(legacy.data as ApartmentRow) : undefined;
  }
  if (error) throw new Error(`Could not load property details: ${error.message}`);
  return data ? fromApartmentRow(data as ApartmentRow) : undefined;
}
