# Agnes Mbabazi: work log

Everything Agnes has done on Abanyabiraka, reconstructed from git history (git names: `ambabazi` and `Agnes Mbabazi`, `ambabazi00@gmail.com`). Branch states are as of **13 Oct 2026**.

Team, for context: **Rosine** (`Muhoza659` / `muhoza_dagreat`) built the backend phases 1–5. **Cherly** (`CherlyIC`) built the Next.js pages. **Agnes** set up the project, built the first frontend, reviewed and merged everyone's PRs, fixed integration bugs, and built backend phases 6–7.

---

## Timeline

### August 2026: project setup

| Date | Commit | What |
|---|---|---|
| 20 Aug | `cf801a4` | Initial commit (GitHub repo created) |
| 20 Aug | `0288889` | **Initial project structure**: 104 files. A React + Vite frontend organised by feature (`auth`, `worker`, `booking`, `chat`, `admin`, each with `api/`, `pages/`, `store/`), shared components (Button, Input, Badge, Modal), an axios client, i18n files (en/fr/ki), and the Spring Boot backend skeleton (`pom.xml`, `application.yml`). |
| 20 Aug | `be793bf` | Added `.env.example` files for frontend and backend |
| 23 Aug | `d6c2999` | **Built the first marketplace frontend** (Vite): scroll-driven hero (`HeroScroll`), marketplace sections, sample professionals data (`marketplaceData.js`, later reused by Cherly's pages), booking dialog, `marketplace.css`, plus the design reference `Abanyabiraka Scroll.dc.html` at the repo root. |

### September 2026: first merges

| Date | Commit | What |
|---|---|---|
| 9 Sep | `c2d4acd`, `d4b18c1` | PR #1 and PR #2 from `agnes/feature-setup` merged into `main` (the setup and frontend work above) |

### 2 October 2026: integration day

Agnes reviewed and merged the team's work, then live-tested it.

| Commit | What |
|---|---|
| `6b29064` | Merged **PR #8**, Cherly's Next.js frontend (`feature/frontend-d`): all 18 page mockups under `frontend/app/`. On `origin/dev`. |
| `2097032` → `8eb703d` (on GitHub) / `bcecdbb` → `23506f1` (local) | Merged **PRs #3–#7**, Rosine's backend phases: 1 auth & security, 2 workers/categories/search, 3 worker profile & verification, 4 bookings, 5 reviews & ratings. On `origin/main`. |
| `5e9e176` | **Fix:** restored `frontend/vite.config.js`, which Rosine's Phase 1 branch accidentally deleted. Every stacked branch (2–5) had inherited the deletion. |
| `d1e093d` | **Fix, found by live-testing against PostgreSQL:** (1) `register()` never set `User.createdAt` (NOT NULL), so **every registration returned 500**. (2) The catch-all exception handler swallowed Spring's `AccessDeniedException`, so every `@PreAuthorize` failure across the app returned a misleading 500 instead of 403. Verified: register → verify-otp → login → admin endpoint as non-admin (403) → promote → 200. |
| `0c62149` | Phase 6 prep: `Notification` gets `type` + `referenceId`. WebSocket endpoint `/ws/chat` skeleton. Branch `agnes/1-chat-notification-prep-api`. |
| `7052d10` | **Phase 6: Chat & Notifications backend.** Real-time chat over `/ws/chat` (JWT via `?token=`, since browsers can't set headers on a WebSocket), REST send/history/mark-read, attachments, read receipts. Notifications fire from bookings (accepted/rejected/completed), verification (approved) and reviews (received). Migration V12 fixes the chat id columns from BIGINT to UUID. Branch `agnes/6-chat-notifications-api`. |
| `6260494` | **Phase 7: Admin backend.** `GET /api/admin/reports/stats` (worker/client counts, jobs completed, most-hired professions, 6-month registration trend). `/api/admin/users`: list/suspend/ban/reactivate, plus a worker-approve wrapper. Login rejects non-ACTIVE accounts. Migration V13. Documented known gap: a banned user's existing JWT stays valid until it expires. Branch `agnes/7-admin-api`. |

### 13 October 2026: frontend cleanup and API integration (this session)

Branch `agnes/frontend-cleanup-and-api`. Full details are in [frontend-api-integration.md](frontend-api-integration.md).

- **Why login showed "Authentication is not connected yet":** the message was hardcoded. Every page was a mockup with fake `setTimeout` actions.
- **Cleanup:** removed the dead Vite app (`src/`, `vite.config.js`, `index.html`), fixed the env var (`NEXT_PUBLIC_API_BASE_URL`), added axios, untracked the committed `.next/` build cache, fixed the Geist font never being applied, and gitignored `backend/uploads/`.
- **Shared plumbing:** API client with token and session-expiry handling, `AuthProvider` (`useAuth()`), `RequireRole` page guards, loading/error components.
- **Pages wired to the real API:** login, register, verify-OTP, reset password, worker search, worker profile, booking, client dashboard (with the review dialog), worker dashboard (accept/decline/complete), worker profile editor (with photo and document uploads), admin categories, admin approvals.
- **Clearly labelled previews:** chat, admin dashboard/users/reports/bookings (their backend is unmerged or missing).
- **New pages** for the five broken links: how-it-works, for-workers, about, help, terms (placeholder).
- **Backend fixes found while wiring:**
  - **CORS preflight returned 403 for every authenticated request from a browser.** Fixed with `.cors(Customizer.withDefaults())`.
  - Registering as a worker never created a `workers` row. Worker/client rows are now created at OTP verification.
  - New `GET /api/auth/me` endpoint, so the frontend can learn its own `workerId`/`clientId`.
- **OTP by email:** added `spring-boot-starter-mail` and Gmail SMTP sending in `OtpService`. Credentials come from `backend/.env` (`MAIL_USERNAME`, `MAIL_PASSWORD` = Google App Password). Also added `POST /api/auth/resend-otp` and a "resend code" button.
- **Tested:** 26/26 end-to-end browser checks against a real backend and database. `npm run build` passes.

---

## Where every Agnes branch stands

| Branch | State | Action needed |
|---|---|---|
| `agnes/feature-setup` | Fully merged (PR #1/#2) | Can delete |
| `agnes/feature-landing-page` | Fully merged | Can delete |
| `agnes/feature-notifications` | Fully merged (contains no extra commits) | Can delete |
| `agnes/hotfix-register-and-access-denied` | **Local only, not pushed.** Combines `origin/main` (backend) + `origin/dev` (frontend) + fixes `5e9e176`, `d1e093d`. | Push and open a PR. The two backend fixes are the only backend difference from `origin/main`. |
| `agnes/frontend-cleanup-and-api` | **Local only, uncommitted** (this session). Built on the hotfix branch. | Review, commit, PR after the hotfix |
| `agnes/1-chat-notification-prep-api` | Local only, 1 commit (`0c62149`) | Superseded by `agnes/6-…` (which includes it) |
| `agnes/6-chat-notifications-api` | Local only, Phase 6 complete (`7052d10`) | Push + PR. Then the `/chat` page and notifications can be wired up. |
| `agnes/7-admin-api` | Local only, Phase 7 complete (`6260494`) | Push + PR. Then `/admin`, `/admin/users`, `/admin/reports` can be wired up. |

**Remote picture:** `origin/main` has the backend (phases 1–5) but not the Next.js frontend. `origin/dev` has the Next.js frontend but not phases 1–5. The two only come together in the local hotfix branch, so pushing it is the first step to a single integrated branch.

**Local database note:** the `abanyabiraka` database is already migrated to V13 (Phase 6/7 migrations ran when those branches were built). Code from branches *without* Phase 6 will fail Hibernate validation against it. Use a separate database to test them, and run `mvn clean` after switching branches.

## Suggested next steps (in order)

1. Push `agnes/hotfix-register-and-access-denied` → PR into `dev`/`main`.
2. Review and commit `agnes/frontend-cleanup-and-api` → PR. It also contains the CORS fix, without which no browser client works.
3. Push and merge `agnes/6-chat-notifications-api` and `agnes/7-admin-api`. Watch for the conflict in `AuthService` (Phase 7 adds a login status check; this branch adds `createProfileFor`/`currentUser`).
4. Wire up `/chat`, notifications and the admin pages to those APIs.
5. Backend gaps listed in [frontend-api-integration.md §8](frontend-api-integration.md#8-whats-still-left): SMS for phone numbers, list worker documents, ADMIN-only category writes.
