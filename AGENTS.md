<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UndieGravity admin dashboard

Admin dashboard for UndieGravity. Manages component metadata by talking to the
`undie_backend` FastAPI admin routes. Does not touch the public site
(`undiegravity_main_frontend`) or the backend directly from the browser.

## Stack

Next.js latest, App Router, TypeScript, Tailwind v4, root `app` directory. Light
mode only, no dark mode.

## Security model (read before changing anything here)

There is a single admin, authenticated with one shared key (`X-Admin-Key` on the
backend). That key is never stored in the browser in any form the browser can
read:

- The key is submitted once on `/login`. `app/api/auth/login/route.ts` validates
  it against the backend (`GET /admin/components`) before doing anything else,
  then sets it as an `httpOnly`, `sameSite: lax` cookie, `secure` in production
  only (a `secure` cookie is dropped by the browser over plain HTTP, which would
  break local development over `http://localhost` if forced on unconditionally).
- `lib/backend.ts` is the only module that reads that cookie and the only module
  that calls the FastAPI backend. It is safe from ever being imported into a
  Client Component by construction: it imports `cookies` from `next/headers`,
  and Next.js itself fails the build if that import reaches client code, so no
  extra guard package is needed for that boundary.
- The browser never calls the backend directly and never sees the admin key.
  Client Components call this app's own `/api/*` routes (through `lib/api.ts`),
  which run server side, read the cookie via `lib/backend.ts`, and forward the
  request with `X-Admin-Key` added.
- The one exception is the Cloudinary upload itself: the browser uploads the
  file straight to `api.cloudinary.com` using a short lived signature obtained
  from `/api/uploads/signature`, never the admin key.

If you add a new backend call, it goes through `lib/backend.ts` and a matching
`app/api/*` route, the same way the existing ones do. Never fetch the backend
URL from a Client Component.

## `proxy.ts`, not `middleware.ts`

The task that first built this app asked for `middleware.ts`. Next.js 16
deprecated that file convention in favor of `proxy.ts` (same mechanism, new
name and export, see the bundled docs at
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`).
This project follows the current convention: `proxy.ts` exporting `proxy()`,
not `middleware.ts` exporting `middleware()`. It does the same job either way:
allow `/login` and `/api/auth/login` through, redirect page requests without
the admin cookie to `/login`, and return 401 JSON for `/api` requests without
it. Cookie presence is a fast, optimistic check; the backend is the actual
authority, since every proxied request still needs a valid `X-Admin-Key` to
succeed there regardless of what the proxy let through.

## Environment variables

All blank in `.env.example`, none of them `NEXT_PUBLIC_` except the Cloudinary
cloud name:

- `BACKEND_API_URL`: base URL of `undie_backend`, read only in `lib/backend.ts`
  (server only).
- `ADMIN_COOKIE_NAME`: name of the httpOnly session cookie. Read in
  `lib/backend.ts` and `proxy.ts`. Defaults to `undiegravity_admin_key` if
  unset, so the app still works without it explicitly configured; set it
  explicitly in any real deployment.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: public Cloudinary cloud name, used to
  build thumbnail preview URLs (`lib/cloudinary.ts`) in both the table and the
  uploader. Not sensitive; the cloud name is already visible in every image
  URL. Never add the Cloudinary API secret here; it lives only in the backend,
  which is the only thing that signs uploads.

The admin key itself is never an environment variable in this app. It only
ever exists as the httpOnly cookie value and as the `X-Admin-Key` header value
forwarded server side.

## `.gitignore` note

The default Next.js `.gitignore` ships `.env*`, which also matches
`.env.example` and silently excludes it from git. Added `!.env.example` to
un-ignore it; without that line, the file exists on disk but git never offers
to track it, which looks like it is present but is invisible to `git status`
and `git add`.

## Thumbnail uploads

`features/uploads/ThumbnailUploader.tsx` requests a signature scoped to a
fixed `undiegravity` Cloudinary folder (no explicit `public_id`, so Cloudinary
assigns one). The FormData sent to Cloudinary includes only `file`, `api_key`,
`timestamp`, `signature`, and `folder`, exactly the fields the signature
response provides and nothing else, since Cloudinary's signature covers only
the params that were actually signed. Adding an unsigned param (or renaming a
signed one) makes the upload fail with a signature mismatch.

## Editing a component that has no matching GET route

The backend's admin API has no `GET /admin/components/{id}`, only
`GET /admin/components` (the full list), `POST`, `PATCH`, and `DELETE` by id.
`lib/backend.ts#getComponentById` fetches the full list and finds the matching
id. This is fine at the current scale (a small personal component library);
if the list grows large enough for this to matter, that is a backend change
(add the missing route), not something to work around further here.

## No new dependencies

Everything is built on `next/headers`, `next/navigation`, `next/image`,
built-in `fetch`, and plain Tailwind classes for forms and tables. No form
library, no data fetching library, no UI kit. The forms are small and
uncontrolled complexity (tags and dependencies as comma separated text
fields, not a chip picker) was chosen deliberately to avoid needing one.
