# Abanyabiraka Frontend

Next.js App Router + Tailwind CSS, with a white/orange visual system. Talks to the Spring Boot API in `../backend`.

## Scripts

- `npm install`
- `cp .env.example .env`: sets `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080/api`)
- `npm run dev`: starts the app at http://localhost:3000 (start the backend first)
- `npm run build` / `npm run start`: production build and serve

## Layout

- `app/`: one folder per route. Protected areas have a `layout.js` that wraps them in `RequireRole`
  (`admin` → ADMIN, `dashboard/client` + `booking` → CLIENT, `dashboard/worker` → WORKER, `chat` → CLIENT/WORKER).
- `lib/api/`: `client.js` (axios, JWT header, session expiry, error messages) and `index.js` (one function per endpoint).
- `lib/session.js`: the logged-in session in localStorage. `lib/format.js`: display helpers. `lib/rwanda.js`: districts.
- `components/AuthProvider.js`: `useAuth()` gives `{ session, profile, ready, signIn, signOut }`.
  `profile` comes from `GET /api/auth/me` and includes `workerId` / `clientId`.
- `components/ui.js`: Spinner, ErrorNote, PreviewBanner, AccountLinks, LogoutButton.
- `locales/`: en/fr/ki translation files (not wired up yet).
- Brand tokens are in `tailwind.config.js`: orange `500` is `#F97316`, with white, warm canvas, and ink neutrals.

## Status

Live against the API: auth (login, register, OTP, reset), worker search and profile, booking, client and worker dashboards, reviews, worker profile editor with uploads, admin categories and approvals.

Preview data (yellow banner): chat and admin dashboard/users/reports/bookings. Their backend is on unmerged branches or doesn't exist yet.

Details, the backend gaps found, and how to test: [`../docs/frontend-api-integration.md`](../docs/frontend-api-integration.md).
