import { BRAND, getServiceLocation } from "@/lib/brand";

export const CURRENCY = BRAND.currency;
export const LOCALE = BRAND.locale;
export const APARTMENT_PUBLIC_COLUMNS = "id,title,slug,description,price,currency,listing_type,property_type,city,state,country,neighborhood,latitude,longitude,location_precision,bedrooms,bathrooms,area,image_urls,amenities,published,is_demo,created_at";

export type Apartment = {
  id: string;
  title: string;
  location: string;
  city: string;
  state: string;
  country: string;
  neighborhood: string;
  displayAddress: string;
  latitude: number | null;
  longitude: number | null;
  locationPrecision: "approximate" | "exact";
  currency: string;
  price: number;
  listing: "Rent" | "Sale";
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  description: string;
  images?: string[];
  amenities: string[];
  published: boolean;
  demo: boolean;
  createdAt: string;
};

export type ApartmentRow = {
  id: string;
  title: string;
  display_location?: string | null;
  city: string;
  state?: string | null;
  country?: string | null;
  neighborhood?: string | null;
  display_address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  location_precision?: "approximate" | "exact";
  currency: string;
  price: number | string;
  listing_type: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area: number | string | null;
  image_urls: string[];
  description: string;
  amenities: string[];
  published: boolean;
  is_demo: boolean;
  created_at: string;
};

export function fromApartmentRow(row: ApartmentRow): Apartment {
  const city = row.city || BRAND.primaryTown;
  const neighborhood = row.neighborhood ?? "";
  const location = row.display_location || [neighborhood, city, row.state].filter(Boolean).join(", ");
  return {
    id: row.id,
    title: row.title,
    location,
    city,
    state: row.state ?? "",
    country: row.country ?? "",
    neighborhood,
    displayAddress: row.display_address ?? "",
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
    locationPrecision: row.location_precision ?? "approximate",
    currency: row.currency || CURRENCY,
    price: Number(row.price),
    listing: row.listing_type === "sale" ? "Sale" : "Rent",
    type: row.property_type,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area: Number(row.area ?? 0),
    image: row.image_urls[0] || "",
    images: row.image_urls,
    description: row.description,
    amenities: row.amenities,
    published: row.published,
    demo: row.is_demo,
    createdAt: row.created_at
  };
}

const photos = {
  one: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
  two: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
  three: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85",
  four: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
  five: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85",
  six: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85"
};

function demoApartment(
  id: string,
  title: string,
  city: string,
  neighborhood: string,
  price: number,
  listing: Apartment["listing"],
  type: string,
  bedrooms: number,
  bathrooms: number,
  area: number,
  image: string,
  description: string,
  amenities: string[],
  createdAt: string
): Apartment {
  const center = getServiceLocation(city)?.center ?? BRAND.map.defaultCenter;
  const location = [neighborhood, city, BRAND.state].filter(Boolean).join(", ");
  return {
    id, title, location, city, state: BRAND.state, country: BRAND.country, neighborhood,
    displayAddress: `${neighborhood}, ${city}`,
    latitude: center[0], longitude: center[1], locationPrecision: "approximate",
    currency: CURRENCY, price, listing, type, bedrooms, bathrooms, area, image,
    description: `Illustrative fictional demonstration listing in ${location}. This property, its details, price and availability are not verified and do not represent real inventory. ${description}`,
    amenities, images: [image], published: true, demo: true, createdAt
  };
}

export const apartments: Apartment[] = [
  demoApartment("demo-01", "Oke-Fia Courtyard Home", "Osogbo", "Oke-Fia", 350000, "Rent", "Apartment", 2, 2, 105, photos.one, "A bright sample home with a practical layout and a shared outdoor space.", ["Secure entry", "Fitted kitchen", "Water storage"], "2026-10-20"),
  demoApartment("demo-02", "Iremo Garden Residence", "Ile-Ife", "Iremo", 280000, "Rent", "Apartment", 2, 1, 84, photos.two, "A comfortable sample apartment with a calm, light-filled living area.", ["Shared garden", "Storage", "Fitted kitchen"], "2026-10-18"),
  demoApartment("demo-03", "Irojo Family House", "Ilesa", "Irojo", 58000000, "Sale", "House", 3, 2, 150, photos.three, "A fictional family-home example with generous indoor and outdoor space.", ["Private entrance", "Parking", "Outdoor space"], "2026-10-16"),
  demoApartment("demo-04", "Ede North Modern Flat", "Ede", "Ede North", 220000, "Rent", "Apartment", 1, 1, 62, photos.four, "A compact demonstration home designed around convenient everyday living.", ["Secure entry", "Water storage", "Fitted kitchen"], "2026-10-14"),
  demoApartment("demo-05", "Ikirun Open-Plan Home", "Ikirun", "Ikirun", 32000000, "Sale", "House", 3, 2, 138, photos.five, "A fictional listing example with an open-plan living and dining area.", ["Private entrance", "Parking", "Outdoor space"], "2026-10-12"),
  demoApartment("demo-06", "Iwo Family Apartment", "Iwo", "Iwo", 250000, "Rent", "Apartment", 2, 1, 78, photos.six, "A practical sample apartment with a straightforward, welcoming layout.", ["Secure entry", "Fitted kitchen", "Water storage"], "2026-10-10")
];

export function formatPrice(price: number, listing: Apartment["listing"], currency: string = CURRENCY) {
  const formatted = new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(price);
  return listing === "Rent" ? `${formatted} / month` : formatted;
}

export function getApartment(id: string) {
  return apartments.find((apartment) => apartment.id === id);
}
