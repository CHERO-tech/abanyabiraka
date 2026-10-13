# Frontend ↔ backend integration (Oct 2026)

Branch: `agnes/frontend-cleanup-and-api` (built on top of `agnes/hotfix-register-and-access-denied`).

This document explains what was changed to turn the Next.js frontend from a clickable mockup into a working app that talks to the Spring Boot API. It covers why each change was needed, how the pieces fit together, and what is still left.

---

## 1. Why the login page said "Authentication is not connected yet"

The message was hardcoded. The original `app/login/page.js` never called the backend. Its submit handler waited 0.7 s with `setTimeout` and then showed that message:

```js
window.setTimeout(() => {
  setIsSubmitting(false);
  setError('Authentication is not connected yet. Your form is ready for the backend login endpoint.');
}, 700);
```

Every page worked the same way: hardcoded sample data plus fake `setTimeout` "saves". The pages were built as visual mockups (PR #8), and the API wiring was left for later. That wiring is what this branch adds.

---

## 2. Cleanup

| What | Why |
|---|---|
| Deleted `frontend/src/` (old Vite + React Router app), `vite.config.js`, `index.html`, `dist/` | `package.json` runs Next.js (`next dev`), so none of this ran anymore. The frontend README already planned to remove it once pages moved to `app/`. Recover anything from git history if needed: commit `d6c2999` holds the Vite marketplace build. |
| Moved `src/shared/i18n/*.json` → `frontend/locales/` | Kept the translation files (en/fr/ki) for later. Nothing uses them yet. |
| `VITE_API_BASE_URL` → `NEXT_PUBLIC_API_BASE_URL` in `.env` and `.env.example` | Next.js only exposes env vars to the browser when they start with `NEXT_PUBLIC_`. `import.meta.env.VITE_*` is Vite-only and is `undefined` in Next. |
| Added `axios`, removed `react-router-dom` | The old API client imported axios but it was never installed. Next has its own router. |
| Untracked `frontend/.next/` (145 files) and added it to `.gitignore` | `.next` is Next's build cache. It was committed by accident in `48b70d2`, so every `npm run dev` showed up as dozens of changed files. |
| Added `backend/uploads/` to `.gitignore` | Uploaded portfolio photos and ID documents are user data. They must never be committed. |
| `font-sans` on `<body>` (`app/layout.js`) | The Geist font was loaded but never applied, so the whole site rendered in the browser's serif fallback font (visible in the original login screenshot). |
| `jsconfig.json` with `@/` alias | Lets pages write `import { authApi } from '@/lib/api'` instead of `../../../lib/api`. |
| Tailwind `content` now includes `./lib/**` | Status-pill colours live in `lib/format.js`. Without this, Tailwind would strip those classes. |

---

## 3. How the frontend now talks to the backend

```
frontend/
├── lib/
│   ├── api/client.js     axios instance: base URL, adds "Authorization: Bearer <token>",
│   │                     handles expired sessions, turns errors into readable messages
│   ├── api/index.js      one function per backend endpoint (authApi, workersApi, categoriesApi,
│   │                     bookingsApi, reviewsApi)
│   ├── session.js        save/read/clear the logged-in session in localStorage
│   ├── format.js         display helpers (initials, dates, ratings, booking status pill,
│   │                     profile-completion checklist)
│   └── rwanda.js         the 30 districts (backend filters by exact district name)
├── components/
│   ├── AuthProvider.js   React context: who is logged in (useAuth())
│   ├── RequireRole.js    page guard: must be logged in + have the right role
│   ├── ui.js             Spinner, ErrorNote, PreviewBanner, AccountLinks, LogoutButton
│   └── InfoPage.js       layout for /about, /help, /how-it-works, /for-workers, /terms
└── app/
    ├── admin/layout.js             → RequireRole ADMIN
    ├── dashboard/client/layout.js  → RequireRole CLIENT
    ├── dashboard/worker/layout.js  → RequireRole WORKER
    ├── booking/layout.js           → RequireRole CLIENT
    └── chat/layout.js              → RequireRole CLIENT or WORKER
```

### The login lifecycle

1. **Login** (`POST /api/auth/login`) returns `{ token, userId, fullName, role }`.
2. `AuthProvider.signIn()` stores that in `localStorage` under `abanyabiraka.session`, then calls **`GET /api/auth/me`**. That call returns the user's `workerId` / `clientId` (see §4 for why it exists).
3. From then on, `lib/api/client.js` attaches `Authorization: Bearer <token>` to every request.
4. On page reload, `AuthProvider` reads `localStorage` and calls `/me` again. If the token is no longer valid, it logs out quietly.
5. **Expired token mid-session.** Spring answers **403 with an empty body**: the JWT filter just ignores a bad token, so the request is treated as anonymous. A real permission problem is also 403, but carries `{ message }`. So the rule in `isSessionError()` is: 401, or 403 *without* a message, means the session is gone. The client then clears it and redirects to `/login?next=<page>&expired=1`.
6. **Logout** clears storage and does a full page load. A React-only logout let the page guard redirect to `/login?next=<previous user's page>` first. The next person to log in on that browser would then land on the wrong page (an E2E test caught this).

### Role guards

`RequireRole` is a **user-experience guard only**. It redirects logged-out users to login, and shows a "This page isn't for your account" screen to the wrong role. Real security is still the backend: every protected endpoint checks the JWT and the role.

### Errors and loading

The backend's error body is `{ success: false, message: "..." }`. `getErrorMessage(error)` shows that message as-is, so users see "Incorrect email/phone or password", "This booking has already been reviewed", and so on. If the backend is down, users get "Cannot reach the server at … Is the backend running?". Every page that loads data shows a spinner, and errors offer a Retry button where it makes sense.

---

## 4. Backend changes (and why they were unavoidable)

Small, focused changes. Without the first two, the worker side of the app could not work at all. Without the third, *no* logged-in feature could work from a browser.

### 4.1 CORS preflight was blocked (bug), `config/SecurityConfig.java`

Browsers send an `OPTIONS` "preflight" request before any cross-origin request that carries an `Authorization` header. `CorsConfig` existed, but Spring Security never applied it, so every preflight to a protected endpoint got **403**:

```
OPTIONS /api/categories -> 403   (before)
OPTIONS /api/categories -> 200   (after)
```

curl and Postman don't send preflights, which is why backend testing never caught this. The fix is one line, `.cors(Customizer.withDefaults())`.

### 4.2 Worker / Client profile rows are created at OTP verification, `auth/service/AuthService.java`

Registering as `WORKER` created a `users` row but **never a `workers` row**. That worker could not edit a profile, could not be searched, and could not receive bookings. `Client` rows were only created lazily on the first booking, which left the client dashboard with no `clientId` to list bookings by.

Now `verifyRegistrationOtp()` calls `createProfileFor(user)`, which creates the matching `workers` or `clients` row. It runs at verification (not at register) so unverified sign-ups don't create profiles.

> Accounts that were verified **before** this change have no worker/client row. The worker dashboard shows a "No worker profile found" message for them. Fix existing data with a one-off SQL insert, or re-register.

### 4.3 New endpoint `GET /api/auth/me`

Login returns only the UUID `userId`, but bookings are listed by numeric `clientId`/`workerId`, and the worker profile is edited at `PUT /api/workers/{workerId}`. `/me` returns:

```json
{ "userId": "1435…", "fullName": "Test Worker", "email": null, "phone": "0788000001",
  "role": "WORKER", "workerId": 1, "clientId": null }
```

Files: `auth/controller/AuthController.java`, `auth/dto/CurrentUserResponse.java` (new), `worker/repository/WorkerRepository.java` (`findByUserId`). It requires a token (`SecurityConfig` marks `/api/auth/me` as `authenticated()` *before* the `/api/auth/**` permitAll rule).

---

## 5. Page by page

| Page | Status | Endpoints used |
|---|---|---|
| `/login` | ✅ live | `POST /auth/login`, `GET /auth/me`. Redirects by role (ADMIN→`/admin`, WORKER→`/dashboard/worker`, CLIENT→`/dashboard/client`) or to `?next=`. An unverified account gets a link to enter its code. |
| `/register` | ✅ live | `POST /auth/register`. One "email or phone" field: contains `@` → sent as `email`, otherwise `phone`. Then goes to `/verify-otp`. |
| `/verify-otp` | ✅ live | `POST /auth/verify-otp`. This also logs the user in. Workers are sent on to set up their profile. |
| `/reset-password` | ✅ live | `POST /auth/forgot-password`, then `POST /auth/reset-password` |
| `/` (home) | ✅ header + search | The search box submits to `/workers?q=`. The header shows "My dashboard / Log out" when logged in. The featured professionals and "2,400+" stat are still marketing copy. |
| `/workers` | ✅ live | `GET /workers?verified=true&categoryId&district&minRating&available`, `GET /categories`. Free-text search and sorting run in the browser (the backend has no text search). Only **approved** workers are listed. |
| `/workers/[id]` | ✅ live | `GET /workers/{id}`, `GET /reviews?workerId=`. Portfolio images come from `/uploads/...`. |
| `/booking?worker=ID` | ✅ live, CLIENT only | `POST /bookings` with `bookingDate` like `2026-10-20T08:00:00` |
| `/dashboard/client` | ✅ live | `GET /bookings?clientId=`. **Review dialog** for completed bookings: `POST /bookings/{id}/review`. This replaces the review page that never existed. |
| `/dashboard/worker` | ✅ live | `GET /workers/{id}`, `GET /bookings?workerId=`, `PATCH /bookings/{id}/accept\|reject\|complete`. Profile completion is computed from real fields. |
| `/dashboard/worker/profile` | ✅ live | `PUT /workers/{id}`, `GET /categories/{id}/professions`, `POST /workers/{id}/portfolio`, `POST /workers/{id}/qualification-documents` |
| `/admin/categories` | ✅ live | Full CRUD on `/categories` and `/categories/professions` |
| `/admin/approvals` | ✅ live | `GET /workers?verified=false`, `PATCH /workers/{id}/verify-identity` |
| `/admin` | 🟡 preview banner | Sample data. Real stats live on the unmerged branch `agnes/7-admin-api`. |
| `/admin/users`, `/admin/reports` | 🟡 preview banner | Backend on the unmerged branch `agnes/7-admin-api` |
| `/admin/bookings` | 🟡 preview banner | No "all bookings" admin endpoint exists anywhere yet |
| `/chat` | 🟡 preview banner | Backend on the unmerged branch `agnes/6-chat-notifications-api` |
| `/how-it-works`, `/for-workers`, `/about`, `/help`, `/terms` | ✅ new | Were 404 before. `/terms` is explicitly a placeholder: real terms need to be written by the team. |

---

## 6. Running it locally

```bash
# backend (port 8080); point it at your DB with env vars if application.yml doesn't match
cd backend
mvn clean spring-boot:run          # use "clean" after switching branches (see below)

# frontend (port 3000)
cd frontend
cp .env.example .env               # NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
npm install
npm run dev
```

**OTP codes by email.** Put a Gmail address and a Google **App Password** (myaccount.google.com/apppasswords, needs 2-Step Verification) in `backend/.env`:

```
MAIL_USERNAME=you@gmail.com
MAIL_PASSWORD=abcdefghijklmnop
```

`application.yml` imports `backend/.env` (`spring.config.import: optional:file:.env[.properties]`), so the secret never goes in git. With these set, accounts registered with an **email** get the code by email. **Phone numbers** still have no SMS provider, so their codes, and any email that fails to send, only appear in the backend console, like:

```
OTP for 0788000001 [REGISTRATION]: 482913 (expires in 10 min)
```

**There is no admin sign-up.** Register a normal account, then promote it in the database:

```sql
UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'ADMIN') WHERE phone = '0788...';
```

**Gotcha: run `mvn clean` after switching branches.** `target/classes` keeps migration files from other branches. After building `agnes/6-…` or `agnes/7-…`, the V12/V13 migrations stayed in `target/` and were applied to a fresh database, which then failed Hibernate validation on this branch (`messages.receiver_id: found uuid, expecting bigint`). Your main `abanyabiraka` database is already at V13 for this reason. This branch's code will fail validation against it until Phase 6 is merged, so test this branch with a separate database:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/abanyabiraka_frontend_test \
SPRING_DATASOURCE_USERNAME=postgres SPRING_DATASOURCE_PASSWORD=... mvn spring-boot:run
```

---

## 7. How this was tested

A headless-browser script (Playwright, run outside the repo) drove the real UI against the real backend and a fresh PostgreSQL database. **26 of 26 checks passed, with no browser console errors:**

- logged-out user → `/dashboard/client` redirects to `/login?next=…`
- wrong password → backend message shown
- worker registers via the UI → wrong OTP rejected → correct OTP signs in
- admin creates the category "Home repairs" and the profession "Plumber"
- worker fills in profile (category, profession, district, bio, experience), uploads a portfolio photo and an ID document
- unapproved worker is **hidden** from public search → admin approves → worker appears
- client registers with an email → empty dashboard → visiting `/admin` shows access denied
- search district filter (Gasabo shows the worker, Huye hides them)
- client books → worker accepts → worker marks complete → client leaves a 4★ review → a second review is refused → public profile shows "4.0 rating · 1 review"
- session survives reload, logout works, forgot/reset password end to end, garbage token → logged out
- all five former 404 pages return 200

`npm run build` passes for all 24 routes.

---

## 8. What's still left

**Backend gaps found while wiring (the frontend shows honest messages for these):**

1. ~~No "resend OTP" endpoint~~ → added `POST /api/auth/resend-otp { identifier }` and a "resend code" button on `/verify-otp`.
2. ~~OTP isn't sent~~ → email codes are sent through Gmail SMTP when `MAIL_USERNAME`/`MAIL_PASSWORD` are set. **SMS for phone numbers is still missing** (e.g. Africa's Talking).
3. **No endpoint to list a worker's qualification documents.** The admin can't see uploaded IDs before approving, and the worker only sees what they uploaded in the current visit. Document approve/reject endpoints exist but have no UI for that reason.
4. **No "reject / return worker application" endpoint.** Only approve exists.
5. **No backend text search** for workers (the frontend filters in the browser), and no pagination.
6. **`POST/PUT/DELETE /api/categories` only require *a* login, not ADMIN.** Any client could edit categories through the API. Add `@PreAuthorize("hasRole('ADMIN')")`.
7. **Booking date and slot.** The frontend sends the slot's start time (08:00 / 12:00 / 16:00). There's no end time or duration in the model.
8. A booking response doesn't say whether it was already reviewed. The frontend relies on the backend's 409.

**Frontend work waiting on backend merges:**

- `/chat` + notifications → merge `agnes/6-chat-notifications-api`, then connect REST + `/ws/chat?token=…`
- `/admin`, `/admin/users`, `/admin/reports` → merge `agnes/7-admin-api`
- `/admin/bookings` → needs a new admin endpoint

**Other frontend items:**

- Translations (`locales/en|fr|ki.json`) aren't wired up. This needs an i18n library and a language switcher.
- Homepage featured professionals and stats are still static copy. They could come from `GET /workers?verified=true`.
- The session token lives in `localStorage`. That's simple and fine for now, but any XSS bug could read it. An httpOnly cookie set by the backend is safer long term.
- The real terms of service and privacy policy need writing.
