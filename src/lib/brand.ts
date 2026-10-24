export const BRAND = {
  name: "Haven Estates",
  serviceArea: "Osun State, Nigeria",
  primaryTown: "Osogbo",
  country: "Nigeria",
  state: "Osun",
  locale: "en-NG",
  currency: "NGN",
  map: {
    defaultCenter: [7.7827, 4.5418] as [number, number],
    defaultZoom: 11,
    tileUrl: process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  contact: {
    officeAddress: "Contact us to arrange a meeting",
    telephone: "Contact details are shared directly by our team",
    phonePlaceholder: "Optional Nigerian phone number"
  }
} as const;

export const SERVICE_LOCATIONS = [
  { name: "Osogbo", center: [7.7827, 4.5418] as [number, number], neighborhoods: ["Oke-Fia", "Alekuwodo", "Dada Estate", "Ogo-Oluwa"] },
  { name: "Ile-Ife", center: [7.4824, 4.5603] as [number, number], neighborhoods: ["Iremo", "Oke-Ogbo", "Mayfair"] },
  { name: "Ilesa", center: [7.6279, 4.7416] as [number, number], neighborhoods: ["Irojo", "Isokun", "Oke-Omiru"] },
  { name: "Ede", center: [7.7167, 4.4333] as [number, number], neighborhoods: ["Ede North", "Ede South"] },
  { name: "Ikirun", center: [7.9167, 4.6667] as [number, number], neighborhoods: ["Ikirun"] },
  { name: "Iwo", center: [7.6333, 4.1833] as [number, number], neighborhoods: ["Iwo"] }
] as const;

export function getServiceLocation(name?: string | null) {
  const search = name?.trim().toLowerCase();
  return SERVICE_LOCATIONS.find((location) => location.name.toLowerCase() === search
    || location.neighborhoods.some((neighborhood) => neighborhood.toLowerCase() === search));
}
