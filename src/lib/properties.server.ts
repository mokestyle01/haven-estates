import "server-only";
import { apartments as demoApartments, APARTMENT_PUBLIC_COLUMNS, fromApartmentRow, type Apartment, type ApartmentRow } from "@/lib/properties";
import { createClient } from "@/lib/supabase/server";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export async function getPublishedApartments(): Promise<Apartment[]> {
  if (!configured) return demoApartments;
  const supabase = await createClient();
  const { data, error } = await supabase.from("apartments").select(APARTMENT_PUBLIC_COLUMNS).eq("published", true).order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load published apartments: ${error.message}`);
  return (data ?? []).map((row) => fromApartmentRow(row as ApartmentRow));
}

export async function getPublishedApartment(id: string): Promise<Apartment | undefined> {
  if (!configured) return demoApartments.find((item) => item.id === id);
  const supabase = await createClient();
  const { data, error } = await supabase.from("apartments").select(APARTMENT_PUBLIC_COLUMNS).eq("id", id).eq("published", true).maybeSingle();
  if (error) throw new Error(`Could not load property details: ${error.message}`);
  return data ? fromApartmentRow(data as ApartmentRow) : undefined;
}
