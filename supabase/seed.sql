-- Fictional Osun State examples only. Coordinates indicate approximate town
-- centers, not verified homes or exact apartment addresses.
insert into public.apartments
(id, title, slug, description, price, currency, listing_type, property_type, display_location, city, state, country, neighborhood, display_address, latitude, longitude, location_precision, bedrooms, bathrooms, area, image_urls, amenities, published, is_demo, created_at)
values
('demo-01','Oke-Fia Courtyard Home','oke-fia-courtyard-home','Fictional demonstration listing in Oke-Fia, Osogbo. Property, details, price and availability are not verified or real inventory.',350000,'NGN','rent','Apartment','Oke-Fia, Osogbo, Osun','Osogbo','Osun','Nigeria','Oke-Fia','Oke-Fia area, Osogbo',7.782700,4.541800,'approximate',2,2,105,array['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85'],array['Secure entry','Fitted kitchen','Water storage'],true,true,'2026-10-20T00:00:00Z'),
('demo-02','Iremo Garden Residence','iremo-garden-residence','Fictional demonstration listing in Iremo, Ile-Ife. Property, details, price and availability are not verified or real inventory.',280000,'NGN','rent','Apartment','Iremo, Ile-Ife, Osun','Ile-Ife','Osun','Nigeria','Iremo','Iremo area, Ile-Ife',7.482400,4.560300,'approximate',2,1,84,array['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85'],array['Shared garden','Storage','Fitted kitchen'],true,true,'2026-10-18T00:00:00Z'),
('demo-03','Irojo Family House','irojo-family-house','Fictional demonstration listing in Irojo, Ilesa. Property, details, price and availability are not verified or real inventory.',58000000,'NGN','sale','House','Irojo, Ilesa, Osun','Ilesa','Osun','Nigeria','Irojo','Irojo area, Ilesa',7.627900,4.741600,'approximate',3,2,150,array['https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85'],array['Private entrance','Parking','Outdoor space'],true,true,'2026-10-16T00:00:00Z'),
('demo-04','Ede North Modern Flat','ede-north-modern-flat','Fictional demonstration listing in Ede North, Ede. Property, details, price and availability are not verified or real inventory.',220000,'NGN','rent','Apartment','Ede North, Ede, Osun','Ede','Osun','Nigeria','Ede North','Ede North area, Ede',7.716700,4.433300,'approximate',1,1,62,array['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85'],array['Secure entry','Water storage','Fitted kitchen'],true,true,'2026-10-14T00:00:00Z'),
('demo-05','Ikirun Open-Plan Home','ikirun-open-plan-home','Fictional demonstration listing in Ikirun. Property, details, price and availability are not verified or real inventory.',32000000,'NGN','sale','House','Ikirun, Osun','Ikirun','Osun','Nigeria','Ikirun','Ikirun town area',7.916700,4.666700,'approximate',3,2,138,array['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85'],array['Private entrance','Parking','Outdoor space'],true,true,'2026-10-12T00:00:00Z'),
('demo-06','Iwo Family Apartment','iwo-family-apartment','Fictional demonstration listing in Iwo. Property, details, price and availability are not verified or real inventory.',250000,'NGN','rent','Apartment','Iwo, Osun','Iwo','Osun','Nigeria','Iwo','Iwo town area',7.633300,4.183300,'approximate',2,1,78,array['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85'],array['Secure entry','Fitted kitchen','Water storage'],true,true,'2026-10-10T00:00:00Z')
on conflict (id) do update set
title = excluded.title, slug = excluded.slug, description = excluded.description,
price = excluded.price, currency = excluded.currency, listing_type = excluded.listing_type,
property_type = excluded.property_type, display_location = excluded.display_location,
city = excluded.city, state = excluded.state, country = excluded.country,
neighborhood = excluded.neighborhood, display_address = excluded.display_address,
latitude = excluded.latitude, longitude = excluded.longitude, location_precision = excluded.location_precision,
bedrooms = excluded.bedrooms, bathrooms = excluded.bathrooms, area = excluded.area,
image_urls = excluded.image_urls, amenities = excluded.amenities, published = excluded.published,
is_demo = excluded.is_demo
where public.apartments.is_demo;
