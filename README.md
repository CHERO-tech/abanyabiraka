# abanyabiraka
Abanyabiraka is a web marketplace connecting Rwanda's skilled workers, technicians, and artisans with clients who need them. Workers get verified profiles proving their identity and qualifications, clients search by category, location, and rating, then book, chat, and review directly on the platform.

- `backend/`: Spring Boot 3 (Java 21) REST API + PostgreSQL, port **8080**
- `frontend/`: Next.js App Router + Tailwind, port **3000**
- `docs/`: [frontend ↔ API integration](docs/frontend-api-integration.md), [work log](docs/agnes-work-log.md)

---

## Run it locally

You need Java 21, Maven, Node 20+ and PostgreSQL.

### 1. Database

```bash
createdb -U postgres abanyabiraka
```

Tables are created automatically by Flyway migrations when the backend starts.

### 2. Backend

```bash
cd backend
cp .env.example .env        # then edit .env (see "Secrets" below)
mvn clean spring-boot:run
```

Always use `mvn clean` after switching git branches. Old migration files from another branch can stay in `target/` and break startup.

### 3. Frontend

```bash
cd frontend
cp .env.example .env        # NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
npm install
npm run dev                 # http://localhost:3000
```

### 4. First accounts

- **Verification codes** are emailed when the account uses an email address and `MAIL_*` is set (see below). Codes for phone numbers, or for any email that failed to send, are printed in the backend console:
  `OTP for 0788000001 [REGISTRATION]: 482913 (expires in 10 min)`
- **Admin:** there is no admin sign-up. Register a normal account, then:
  ```sql
  UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'ADMIN') WHERE email = 'you@example.com';
  ```
- An admin must create categories (`/admin/categories`) before workers can pick a profession, and approve workers (`/admin/approvals`) before they appear in search.

---

## Secrets: never commit them

All secrets live in **`backend/.env`**, which is in `.gitignore`. Spring loads it on startup (`spring.config.import` in `application.yml`). The committed file **`backend/.env.example`** lists every setting with safe placeholder values.

| Variable | What it is | Required |
|---|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL connection | yes |
| `JWT_SECRET` | Key that signs login tokens. **At least 32 characters**, or the app won't start. Generate one: `openssl rand -base64 48` | yes |
| `JWT_EXPIRATION_MS` | Login lifetime (default 24 h) | no |
| `MAIL_USERNAME` | Gmail address that sends verification codes | no (codes go to the log instead) |
| `MAIL_PASSWORD` | A Google **App Password** for that Gmail account, **not** the normal Gmail password | no |

### Before every push

```bash
git status                       # backend/.env and frontend/.env must NOT appear
git check-ignore backend/.env    # should print "backend/.env"
```

If a secret is ever committed, deleting the file afterwards is not enough, because it stays in git history. **Revoke it immediately** (delete the App Password in Google, change the DB password, generate a new `JWT_SECRET`) and create a new one.

### How teammates get the email settings

Pick one of these. Never share secrets through git, GitHub issues, or PR comments.

- **Recommended: each developer uses their own Gmail.** Turn on 2-Step Verification → open https://myaccount.google.com/apppasswords → create an app password named "Abanyabiraka" → put your Gmail and that password in your own `backend/.env`. Each person can revoke theirs independently.
- **Or skip email locally.** Leave `MAIL_USERNAME`/`MAIL_PASSWORD` empty and read codes from the backend console.
- **The shared project mailbox** (used in production) is only shared with the people who deploy, privately (e.g. a password manager), never in chat history.

---

## Deployment

On a server or hosting platform, don't upload a `.env` file. Set the same variables as **environment variables** in the platform's settings (Render/Railway/Fly "Environment", a Docker `--env-file` kept on the server, or systemd `Environment=`). Real environment variables take priority over `.env` and `application.yml`.

**Backend checklist:**

1. Create a production PostgreSQL database. Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
2. Generate a **new** `JWT_SECRET` for production (`openssl rand -base64 48`). Never reuse a development secret.
3. Set `MAIL_USERNAME` / `MAIL_PASSWORD` with a dedicated project Gmail and its own App Password. For larger volume, switch to a transactional email service (e.g. Brevo, Mailgun) by also setting `MAIL_HOST` and `MAIL_PORT`.
4. Uploaded files are stored in `backend/uploads/`. Use a persistent disk or volume, or they are lost on every redeploy.
5. Build and run: `mvn clean package` → `java -jar target/*.jar`. Migrations run automatically on startup.
6. Restrict CORS to the real frontend domain. `config/CorsConfig.java` currently allows `*`.

**Frontend checklist:**

1. Set `NEXT_PUBLIC_API_BASE_URL=https://<your-api-domain>/api` **before building**. `NEXT_PUBLIC_*` values are baked into the build, so changing them requires a rebuild.
2. `npm ci && npm run build && npm run start` (or deploy to Vercel, which runs the build for you).
3. Never put secrets in `NEXT_PUBLIC_*` variables: they are visible to anyone in the browser.

**Still missing before a real launch:** SMS for phone-number sign-ups (e.g. Africa's Talking), final terms and privacy policy, and the items in [docs/frontend-api-integration.md §8](docs/frontend-api-integration.md#8-whats-still-left).
