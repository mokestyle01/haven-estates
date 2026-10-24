"use client";

import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { BRAND, getServiceLocation, SERVICE_LOCATIONS } from "@/lib/brand";
import type { Apartment } from "@/lib/properties";
import { PropertyCard } from "@/components/property-card";
import { MapViewToggle, type ApartmentView } from "@/components/map-view-toggle";

const ApartmentMap = dynamic(
  () => import("@/components/apartment-map").then((module) => module.ApartmentMap),
  { ssr: false, loading: () => <div className="map-loading" role="status">Loading map…</div> }
);

export function ApartmentSearch({ items }: { items: Apartment[] }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [location, setLocation] = useState(params.get("location") ?? "");
  const [listing, setListing] = useState(params.get("listing") ?? "");
  const [type, setType] = useState(params.get("type") ?? "");
  const [beds, setBeds] = useState(params.get("beds") ?? "");
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");
  const [sort, setSort] = useState(params.get("sort") ?? "newest");
  const [view, setView] = useState<ApartmentView>(params.get("view") === "map" ? "map" : "grid");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filterKey = JSON.stringify([query, location, listing, type, beds, min, max, sort]);
  const [pagination, setPagination] = useState({ filterKey, limit: 6 });
  const limit = pagination.filterKey === filterKey ? pagination.limit : 6;
  const invalidPriceRange = min !== "" && max !== "" && Number(min) > Number(max);

  const filtered = useMemo(() => items
    .filter((apartment) => {
      const searchable = `${apartment.title} ${apartment.location} ${apartment.city} ${apartment.state} ${apartment.neighborhood} ${apartment.displayAddress} ${apartment.type}`.toLowerCase();
      return (!query || searchable.includes(query.trim().toLowerCase()))
        && (!location || apartment.city.toLowerCase() === location.toLowerCase())
        && (!listing || apartment.listing.toLowerCase() === listing)
        && (!type || apartment.type === type)
        && (!beds || apartment.bedrooms >= Number(beds))
        && (!min || apartment.price >= Number(min))
        && (!max || apartment.price <= Number(max));
    })
    .sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : b.createdAt.localeCompare(a.createdAt)),
  [items, query, location, listing, type, beds, min, max, sort]);

  useEffect(() => {
    const next = new URLSearchParams(params.toString());
    for (const key of ["q", "location", "listing", "type", "beds", "min", "max", "sort", "view"]) next.delete(key);
    if (query) next.set("q", query);
    if (location) next.set("location", location);
    if (listing) next.set("listing", listing);
    if (type) next.set("type", type);
    if (beds) next.set("beds", beds);
    if (min) next.set("min", min);
    if (max) next.set("max", max);
    if (sort !== "newest") next.set("sort", sort);
    if (view !== "grid") next.set("view", view);
    const queryString = next.toString();
    if (queryString !== params.toString()) {
      window.history.replaceState(null, "", queryString ? `${pathname}?${queryString}` : pathname);
    }
  }, [beds, listing, location, max, min, params, pathname, query, sort, type, view]);

  const clear = () => {
    setQuery("");
    setLocation("");
    setListing("");
    setType("");
    setBeds("");
    setMin("");
    setMax("");
    setSort("newest");
    setSelectedId(null);
  };
  const selectedLocation = getServiceLocation(location || query);
  const mapCenter = selectedLocation?.center ?? BRAND.map.defaultCenter;

  return <div>
    <div className="apartment-filters">
      <label className="field"><span>Town or service area</span><select value={location} onChange={(event) => setLocation(event.target.value)}><option value="">All Osun State</option>{SERVICE_LOCATIONS.map((entry) => <option key={entry.name} value={entry.name}>{entry.name}</option>)}</select></label>
      <label className="field"><span>Neighborhood or keyword</span><input placeholder="e.g. Oke-Fia, garden, apartment" value={query} onChange={(event) => setQuery(event.target.value)}/></label>
      <label className="field"><span>Listing type</span><select value={listing} onChange={(event) => setListing(event.target.value)}><option value="">Rent or sale</option><option value="rent">To rent</option><option value="sale">For sale</option></select></label>
      <label className="field"><span>Property type</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="">Any type</option>{[...new Set(items.map((apartment) => apartment.type))].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="field"><span>Bedrooms (minimum)</span><select value={beds} onChange={(event) => setBeds(event.target.value)}><option value="">Any</option>{[1, 2, 3, 4].map((value) => <option key={value} value={value}>{value}+</option>)}</select></label>
      <label className="field"><span>Minimum price ({BRAND.currency})</span><input type="number" min="0" step="1000" placeholder="No minimum" value={min} onChange={(event) => setMin(event.target.value)}/></label>
      <label className="field"><span>Maximum price ({BRAND.currency})</span><input type="number" min="0" step="1000" placeholder="No maximum" value={max} onChange={(event) => setMax(event.target.value)}/></label>
    </div>
    {invalidPriceRange && <p role="alert" className="filter-error">Minimum price must not exceed maximum price.</p>}
    <div className="apartment-results-toolbar">
      <span className="apartment-results-count"><Search size={14}/>{invalidPriceRange ? 0 : filtered.length} {filtered.length === 1 ? "listing" : "listings"} in {location || BRAND.serviceArea}</span>
      <div className="apartment-results-controls">
        <label htmlFor="sort" className="sort-label">Sort</label>
        <select id="sort" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select>
        <MapViewToggle view={view} onChange={setView}/>
        <button type="button" className="filter-reset" onClick={clear}><X size={14}/>Clear filters</button>
      </div>
    </div>

    {filtered.length && !invalidPriceRange ? view === "grid"
      ? <div className="results-grid">{filtered.slice(0, limit).map((apartment) => <PropertyCard key={apartment.id} apartment={apartment}/>)}</div>
      : <div className="map-search-layout">
          <div className="map-search-list" aria-label="Filtered property listings">
            {filtered.map((apartment) => <div key={apartment.id} id={`listing-${apartment.id}`} className={`map-search-card${selectedId === apartment.id ? " selected" : ""}`}>
              <PropertyCard apartment={apartment} isActive={selectedId === apartment.id} onShowOnMap={() => {
                setSelectedId(apartment.id);
                document.getElementById("apartment-map")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}/>
            </div>)}
          </div>
          <div className="map-search-canvas"><ApartmentMap items={filtered} selectedId={selectedId} onSelect={setSelectedId} center={mapCenter} height={650}/></div>
        </div>
      : <div className="apartment-empty-state"><h2 className="serif">{invalidPriceRange ? "Check your price range" : "No homes found just yet"}</h2><p>{invalidPriceRange ? "Adjust your minimum or maximum price to continue." : `Try another town or clear filters to see illustrative listings across ${BRAND.serviceArea}.`}</p><button type="button" className="btn btn-outline" onClick={clear}>Clear filters</button></div>}

    {view === "grid" && filtered.length > limit && !invalidPriceRange && <div className="load-more-wrap"><button type="button" className="btn btn-outline" onClick={() => setPagination({ filterKey, limit: limit + 6 })}>Load more homes</button></div>}
    <p className="demo-disclaimer">All sample listings are fictional demonstrations. Prices, coordinates, details and availability are not verified and do not represent real inventory.</p>
  </div>;
}
