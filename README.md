# Haven Estates

A Next.js App Router, TypeScript, Tailwind and Supabase property consultancy serving Osun State, Nigeria. The included listings are **fictional illustrative examples**, not verified inventory and not evidence that a property is available in reality. Brand, currency, service towns, contact placeholders and map defaults are centralized in `src/lib/brand.ts`; sample listings are in `src/lib/properties.ts`.

## Prerequisites and install

- Node.js 20.9+ (Node.js 22 LTS recommended)
- npm
- A Supabase project for authentication, Postgres and private avatar storage

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. Public sample pages and maps can run without Supabase. Authentication, profile, favorites, inquiries, and contact persistence require project configuration. Type and lint checks are `npm run typecheck` and `npm run lint`; production output is `npm run build`.

## Supabase setup

1. Create a Supabase project and copy its **Project URL** and **publishable key** (the anon key is accepted where a publishable key is not available) into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
2. Apply `supabase/migrations/202610220001_initial_schema.sql` followed by `supabase/migrations/202610240001_osun_location_fields.sql` using the Supabase SQL Editor or Supabase CLI (`supabase db push` after linking the project). The second migration is repeatable and additive: it adds location/coordinate metadata, checks coordinate ranges and pairs, changes the default currency for new records to NGN, and updates only the six known `is_demo = true` sample IDs. It does not rewrite real inventory. It also narrows public listing column grants so private display-address fields are not readable through the public client. Existing published inventory remains governed by the original published-listing RLS policy and trusted `app_metadata.is_admin` management policy.
3. Load or refresh the explicit demo seed with `supabase/seed.sql` in the SQL Editor after both migrations. The upsert only updates rows already marked `is_demo = true`; rows are fictional and not verified or available inventory. Without Supabase, the public app uses the corresponding local fallback in `src/lib/properties.ts`.
4. The migration creates the private `avatars` bucket, 5 MB maximum file size, JPEG/PNG/WebP MIME restrictions, and policies restricting file operations to an authenticated user's `{auth.uid()}/...` folder. Keep the bucket private. The app saves the object path in `profiles.avatar_url` and presents expiring signed URLs. Never make this bucket public.
5. Auth profile rows are automatically created by an idempotent trigger. RLS policies scope profile, favorites and inquiry access to the signed-in owner. Apartment changes require the server-managed `app_metadata.is_admin = true` claim; never grant admin status through user-editable metadata. Contact submissions are insert-only for visitors; there is no client read access.

### Authentication URLs and email

In Supabase **Authentication → URL Configuration**:

- Set Site URL to `http://localhost:3000` for local work (replace with the production origin on deploy).
- Add Redirect URLs `http://localhost:3000/auth/callback` and `http://localhost:3000/auth/callback?next=/auth/reset-password`; add the equivalent exact HTTPS production URLs.
- Configure email verification and password recovery templates to use Supabase's generated confirmation/recovery URL, which returns through the configured redirect.
- The callback exchanges the one-time auth code for a cookie-backed session. Use HTTPS in production.

### Google OAuth

1. In Google Cloud Console create/configure an OAuth consent screen and OAuth client ID of type **Web application**.
2. Add the Supabase callback URI shown by your Supabase project's Authentication → Providers → Google page (typically `https://<project-ref>.supabase.co/auth/v1/callback`) to Google's Authorized redirect URIs.
3. Add the authorized Haven origin (for example `http://localhost:3000`, and the production HTTPS origin) in Google's Authorized JavaScript origins if required by the provider setup.
4. Enable Google in Supabase Authentication → Providers and enter the Google client ID and client secret there. Save the settings.
5. Add `/auth/callback` to Supabase's allowed redirect URLs. Test with a real Google account. The app's button initiates OAuth, but it does not configure provider credentials or claim OAuth is enabled.

## Osun listings and interactive maps

- The service area, primary town, supported towns/neighborhoods, NGN currency/`en-NG` locale, map center, and contact placeholders live in `src/lib/brand.ts`. Do not add real office/contact details unless the business supplies them.
- The apartment page supports shareable town, keyword, listing, property-type, bedroom, price, sort, and grid/map URL filters. The map uses only the same filtered listing set as the cards. Listings without valid coordinate pairs are excluded from markers and reported to the user.
- Demo coordinates are labeled approximate town-center references; they are not apartment addresses or exact property pins. Live public queries intentionally do not select `display_address` or `display_location`. Keep approximate location precision unless the property owner has authorized publishing exact coordinates. The database stores a `location_precision` value and checks coordinate pairing/ranges.
- Leaflet and React Leaflet are loaded client-side; Leaflet CSS is imported by the application root. `NEXT_PUBLIC_MAP_TILE_URL` and `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` can configure a compatible tile provider. Empty variables use the default OpenStreetMap tile URL and attribution.
- OpenStreetMap's standard tile server is suitable only for reasonable interactive development use. Follow its current tile usage policy, provide attribution, avoid bulk/offline downloads and do not treat it as a guaranteed high-volume production service. For production-scale traffic, choose a commercial or self-hosted provider, configure its permitted tile URL and required attribution, and keep any private provider credentials server-side (only provider-designated public browser tokens belong in `NEXT_PUBLIC_` variables).
- Exact address details are deliberately not granted to public/ordinary authenticated client queries. A private server-side admin workflow should only use exact location data when the owner explicitly permits it.
- Prices in demo records are illustrative NGN values. The formatter uses the row's currency when present so existing records in other currencies are not silently relabeled or converted; audit and explicitly update real inventory before publishing it as Nigerian NGN inventory.

## Profile CRUD, images, and account deletion

- Sign up and verify the email, then sign in. `/dashboard/profile` loads/creates the user's profile through the auth trigger, edits name/phone/bio/preferred location, and requests Auth verification when changing email.
- Avatar upload accepts JPEG, PNG and WebP up to 5 MB. New unique files are uploaded under the user's UUID; the profile path is updated before the previous image is removed. Images use signed URLs; uploaded images are private and not publicly addressable. If old-file cleanup fails, the interface reports it.
- Account deletion requires `SUPABASE_SERVICE_ROLE_KEY` in the server deployment environment. Obtain this secret only from Supabase project settings, store it in local `.env.local` or the deployment's server-only secret store, and **never** prefix it with `NEXT_PUBLIC_`. The endpoint authenticates the caller server-side, removes that account's private avatar files, then deletes the Auth user. The foreign-key cascade deletes profile/favorite data; inquiries are de-identified (`user_id` becomes null) and retained, while contact records are retained. This retention policy avoids erasing the inquiry record and is not a claim of a legal retention period; change it to fit applicable obligations. Without the secret the endpoint returns a clear 503 and does not pretend to delete the account.

## Favorites, inquiries, and contact

- Property favorites require sign-in and are limited by RLS to the current user.
- Property inquiries require sign-in, are stored in `public.inquiries`, and are limited by RLS and a database trigger to five submissions per user per hour. They appear in `/dashboard/inquiries`.
- The contact form stores input in `public.contact_messages` if the migration has been applied. Neither contact nor property inquiries send email or notify an agent. Do not represent submission as delivery.
- Database triggers limit inquiries to five per user per hour and contact messages to three per email address per hour. These are basic safeguards, not robust anonymous abuse prevention (a visitor can rotate email addresses). Production anonymous contact endpoints also need edge/WAF rate limiting by IP and preferably a bot challenge verified by a server endpoint. Add monitoring, retention and spam handling before launch.

## Testing Row Level Security

Use two separate test users. As each authenticated user, verify the SQL editor/API returns only that user's profile, favorites and inquiries. Attempt to select/update another user's profile, remove their favorite, or read their inquiry: requests must be denied or return no rows. With an anon key, verify published apartments are readable, unpublished inventory is not, contact messages can only be inserted and not selected, and private avatar access outside the user's UUID folder is denied. Confirm ordinary users cannot modify apartment inventory, inquiry status, profile id, or profile email. Test admin inventory access only with a trusted server-issued `app_metadata.is_admin` claim.

## Production and deployment

1. Push the project to a private or public Git remote and import it into Vercel.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and (only if enabling account deletion) server-only `SUPABASE_SERVICE_ROLE_KEY` in Vercel's environment settings for the intended environments.
3. Apply the migration and seed to the production Supabase project; update Supabase Site URL and redirect allowlist to the production HTTPS domain.
4. Configure email sender/domain and Google OAuth credentials independently. Test signup verification, Google login, password recovery, profile editing, avatar policies, account deletion and RLS in a staging project before production.
5. Run `npm run lint`, `npm run typecheck`, and `npm run build` before deployment.

### Production security checklist

- Keep all service-role and OAuth client secrets server-side; rotate secrets if exposed.
- Use HTTPS and exact redirect origins; validate OAuth, email confirmation and recovery end-to-end.
- Keep avatar storage private and maintain the restrictive storage policies.
- Review RLS with separate accounts and a non-admin; keep admin claims server-controlled.
- Configure request-level throttling/bot protection for anonymous contact submissions and abuse reporting.
- Configure email delivery before promising notifications; this starter only records messages.
- Verify privacy, consent, data retention and account-deletion behavior against relevant legal requirements.
- Replace fictional demo inventory only after a trusted inventory source and publishing workflow are configured; verify real prices and locations before publishing.
