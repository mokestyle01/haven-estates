alter table public.apartments
  add column if not exists country text,
  add column if not exists state text,
  add column if not exists neighborhood text,
  add column if not exists display_address text,
  add column if not exists latitude numeric(9, 6),
  add column if not exists longitude numeric(9, 6),
  add column if not exists location_precision text not null default 'approximate';

alter table public.apartments alter column currency set default 'NGN';

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.apartments'::regclass and conname = 'apartments_coordinates_pair_check') then
    alter table public.apartments add constraint apartments_coordinates_pair_check
      check ((latitude is null and longitude is null) or (latitude is not null and longitude is not null));
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.apartments'::regclass and conname = 'apartments_latitude_range_check') then
    alter table public.apartments add constraint apartments_latitude_range_check
      check (latitude is null or latitude between -90 and 90);
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.apartments'::regclass and conname = 'apartments_longitude_range_check') then
    alter table public.apartments add constraint apartments_longitude_range_check
      check (longitude is null or longitude between -180 and 180);
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.apartments'::regclass and conname = 'apartments_location_precision_check') then
    alter table public.apartments add constraint apartments_location_precision_check
      check (location_precision in ('approximate', 'exact'));
  end if;
end
$$;

create index if not exists apartments_published_location_idx
  on public.apartments (state, city, neighborhood) where published;

revoke select on public.apartments from anon, authenticated;
grant select (
  id, title, slug, description, price, currency, listing_type, property_type,
  city, state, country, neighborhood, latitude, longitude,
  location_precision, bedrooms, bathrooms, area, image_urls, amenities, published,
  is_demo, created_at
) on public.apartments to anon, authenticated;

update public.apartments
set
  title = case id
    when 'demo-01' then 'Oke-Fia Courtyard Home'
    when 'demo-02' then 'Iremo Garden Residence'
    when 'demo-03' then 'Irojo Family House'
    when 'demo-04' then 'Ede North Modern Flat'
    when 'demo-05' then 'Ikirun Open-Plan Home'
    when 'demo-06' then 'Iwo Family Apartment'
  end,
  slug = case id
    when 'demo-01' then 'oke-fia-courtyard-home'
    when 'demo-02' then 'iremo-garden-residence'
    when 'demo-03' then 'irojo-family-house'
    when 'demo-04' then 'ede-north-modern-flat'
    when 'demo-05' then 'ikirun-open-plan-home'
    when 'demo-06' then 'iwo-family-apartment'
  end,
  description = case id
    when 'demo-01' then 'Fictional demonstration listing in Oke-Fia, Osogbo. Property, details, price and availability are not verified or real inventory. A bright sample home with a practical layout and shared outdoor space.'
    when 'demo-02' then 'Fictional demonstration listing in Iremo, Ile-Ife. Property, details, price and availability are not verified or real inventory. A comfortable sample apartment with a calm, light-filled living area.'
    when 'demo-03' then 'Fictional demonstration listing in Irojo, Ilesa. Property, details, price and availability are not verified or real inventory. A sample family home with indoor and outdoor space.'
    when 'demo-04' then 'Fictional demonstration listing in Ede North, Ede. Property, details, price and availability are not verified or real inventory. A compact sample home designed around everyday living.'
    when 'demo-05' then 'Fictional demonstration listing in Ikirun. Property, details, price and availability are not verified or real inventory. A sample listing with open-plan living and dining space.'
    when 'demo-06' then 'Fictional demonstration listing in Iwo. Property, details, price and availability are not verified or real inventory. A practical sample apartment with a welcoming layout.'
  end,
  price = case id
    when 'demo-01' then 350000
    when 'demo-02' then 280000
    when 'demo-03' then 58000000
    when 'demo-04' then 220000
    when 'demo-05' then 32000000
    when 'demo-06' then 250000
  end,
  property_type = case id
    when 'demo-01' then 'Apartment'
    when 'demo-02' then 'Apartment'
    when 'demo-03' then 'House'
    when 'demo-04' then 'Apartment'
    when 'demo-05' then 'House'
    when 'demo-06' then 'Apartment'
  end,
  country = 'Nigeria',
  state = 'Osun',
  currency = 'NGN',
  location_precision = 'approximate',
  city = case id
    when 'demo-01' then 'Osogbo'
    when 'demo-02' then 'Ile-Ife'
    when 'demo-03' then 'Ilesa'
    when 'demo-04' then 'Ede'
    when 'demo-05' then 'Ikirun'
    when 'demo-06' then 'Iwo'
  end,
  neighborhood = case id
    when 'demo-01' then 'Oke-Fia'
    when 'demo-02' then 'Iremo'
    when 'demo-03' then 'Irojo'
    when 'demo-04' then 'Ede North'
    when 'demo-05' then 'Ikirun'
    when 'demo-06' then 'Iwo'
  end,
  display_location = case id
    when 'demo-01' then 'Oke-Fia, Osogbo, Osun'
    when 'demo-02' then 'Iremo, Ile-Ife, Osun'
    when 'demo-03' then 'Irojo, Ilesa, Osun'
    when 'demo-04' then 'Ede North, Ede, Osun'
    when 'demo-05' then 'Ikirun, Osun'
    when 'demo-06' then 'Iwo, Osun'
  end,
  display_address = case id
    when 'demo-01' then 'Oke-Fia area, Osogbo'
    when 'demo-02' then 'Iremo area, Ile-Ife'
    when 'demo-03' then 'Irojo area, Ilesa'
    when 'demo-04' then 'Ede North area, Ede'
    when 'demo-05' then 'Ikirun town area'
    when 'demo-06' then 'Iwo town area'
  end,
  latitude = case id
    when 'demo-01' then 7.782700
    when 'demo-02' then 7.482400
    when 'demo-03' then 7.627900
    when 'demo-04' then 7.716700
    when 'demo-05' then 7.916700
    when 'demo-06' then 7.633300
  end,
  longitude = case id
    when 'demo-01' then 4.541800
    when 'demo-02' then 4.560300
    when 'demo-03' then 4.741600
    when 'demo-04' then 4.433300
    when 'demo-05' then 4.666700
    when 'demo-06' then 4.183300
  end
where is_demo
  and id in ('demo-01', 'demo-02', 'demo-03', 'demo-04', 'demo-05', 'demo-06');
