create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 100),
  email text not null default '',
  phone text check (phone is null or char_length(phone) <= 40),
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 500),
  bio text check (bio is null or char_length(bio) <= 1000),
  preferred_location text check (preferred_location is null or char_length(preferred_location) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.apartments (
  id text primary key,
  title text not null check (char_length(title) between 1 and 180),
  slug text not null unique,
  description text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  currency char(3) not null default 'GBP',
  listing_type text not null check (listing_type in ('rent', 'sale')),
  property_type text not null,
  display_location text not null,
  city text not null,
  bedrooms smallint not null check (bedrooms >= 0),
  bathrooms smallint not null check (bathrooms >= 0),
  area numeric(9, 2) check (area is null or area > 0),
  image_urls text[] not null default '{}',
  amenities text[] not null default '{}',
  published boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index apartments_published_created_idx on public.apartments (published, created_at desc);
create index apartments_search_idx on public.apartments using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(display_location, '') || ' ' || coalesce(city, '')));
create index apartments_filters_idx on public.apartments (listing_type, property_type, bedrooms, price) where published;

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  apartment_id text not null references public.apartments(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, apartment_id)
);
create index favorites_user_created_idx on public.favorites (user_id, created_at desc);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  apartment_id text not null references public.apartments(id) on delete restrict,
  contact_name text not null default '' check (char_length(contact_name) <= 100),
  contact_email text not null default '' check (char_length(contact_email) <= 254),
  contact_phone text check (contact_phone is null or char_length(contact_phone) <= 40),
  message text not null check (char_length(trim(message)) between 10 and 3000),
  status text not null default 'received' check (status in ('received', 'in_review', 'closed')),
  created_at timestamptz not null default now()
);
create index inquiries_user_created_idx on public.inquiries (user_id, created_at desc);
create index inquiries_apartment_idx on public.inquiries (apartment_id, created_at desc);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 100),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  subject text not null default 'Website contact' check (char_length(subject) <= 200),
  message text not null check (char_length(trim(message)) between 10 and 3000),
  created_at timestamptz not null default now()
);
create index contact_messages_created_idx on public.contact_messages (created_at desc);

create function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger apartments_updated_at before update on public.apartments for each row execute function public.set_updated_at();

create function public.create_profile_for_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile_for_auth_user();
create trigger on_auth_user_email_changed after update of email on auth.users for each row
when (old.email is distinct from new.email) execute function public.create_profile_for_auth_user();
insert into public.profiles (id, full_name, email)
select id, coalesce(raw_user_meta_data ->> 'full_name', ''), coalesce(email, '')
from auth.users
on conflict (id) do update set email = excluded.email;

create function public.enforce_inquiry_rate_limit()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.user_id::text));
  if (select count(*) from public.inquiries where user_id = new.user_id and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Inquiry limit reached. Please try again later.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger inquiries_rate_limit before insert on public.inquiries for each row execute function public.enforce_inquiry_rate_limit();

create function public.enforce_contact_rate_limit()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtext(lower(new.email)));
  if (select count(*) from public.contact_messages where lower(email) = lower(new.email) and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Contact message limit reached. Please try again later.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger contact_messages_rate_limit before insert on public.contact_messages for each row execute function public.enforce_contact_rate_limit();

alter table public.profiles enable row level security;
alter table public.apartments enable row level security;
alter table public.favorites enable row level security;
alter table public.inquiries enable row level security;
alter table public.contact_messages enable row level security;

create policy "Users can read their own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users can update their own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
revoke all on public.profiles from anon;
grant select, update on public.profiles to authenticated;
revoke insert, update (id, email, created_at) on public.profiles from authenticated;

grant select on public.apartments to anon, authenticated;
grant insert, update, delete on public.apartments to authenticated;

create policy "Anyone can read published apartments" on public.apartments for select to anon, authenticated using (published);
create policy "Only trusted admins can manage apartments" on public.apartments for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true')
with check ((auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true');

create policy "Users can read their favorites" on public.favorites for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add their favorites" on public.favorites for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.apartments where apartments.id = favorites.apartment_id and apartments.published)
);
create policy "Users can remove their favorites" on public.favorites for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, delete on public.favorites to authenticated;

create policy "Users can read their inquiries" on public.inquiries for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their inquiries" on public.inquiries for insert to authenticated
with check (
  (select auth.uid()) = user_id and status = 'received'
  and exists (select 1 from public.apartments where apartments.id = inquiries.apartment_id and apartments.published)
);
grant select, insert on public.inquiries to authenticated;
revoke update, delete on public.inquiries from authenticated, anon;

create policy "Visitors can submit contact messages" on public.contact_messages for insert to anon, authenticated with check (true);
grant insert on public.contact_messages to anon, authenticated;
revoke select, update, delete on public.contact_messages from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create policy "Users can read their own avatar files" on storage.objects for select to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can upload avatar files in their folder" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text and (select octet_length(metadata::text)) < 1024);
create policy "Users can update avatar files in their folder" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can delete avatar files in their folder" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
