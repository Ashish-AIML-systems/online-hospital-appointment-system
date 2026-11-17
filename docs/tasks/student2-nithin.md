# Student 2 — Nithin

**Your part:** database, architecture and workflow, the doctor and admin pages, and deployment.
**Jira:** OHAMS-2 (epic), OHAMS-10, OHAMS-11, OHAMS-12, OHAMS-18, OHAMS-6 (epic), OHAMS-21.
**Read first:** [README](../../README.md) and [CONTRACT](../CONTRACT.md). Build exactly to the contract.

---

## 1. Your hand-offs (copied from CONTRACT §8 — do not change)

| # | START (must already exist) | END (you hand over, exact paths) | Needed by |
|---|---|---|---|
| **H2** database + design | H0 (Ashish's skeleton on `main`), `docs/requirements.md` | `db/schema.sql`, `lib/db.js`, `scripts/init-db.js`, `scripts/seed.js`, `docs/architecture.md`; `npm run db:init` and `npm run db:seed` succeed | Ashish, Manya |
| **H6** dashboards | H4 (Medha's `lib/api.js`, `app/globals.css`, `components/NotificationList.js`, `components/Navbar.js`, `app/layout.js`), CONTRACT §4 and §6 | `app/doctor/page.js`, `app/admin/page.js` | Ashish (integration) |
| **H8** deployment | H7 (whole app tested on `main`) | live Vercel URL written in README "Live demo"; seed run on the production DB | Manya |

## 2. Files you own (only edit these)

```
db/schema.sql
lib/db.js
scripts/init-db.js        scripts/seed.js
docs/architecture.md
app/doctor/page.js        app/admin/page.js
README.md  → only the section "10. Live demo"
```

---

## 3. Part A — Database (H2, tickets OHAMS-10 and OHAMS-12 inputs)

1. **`db/schema.sql`** — copy the SQL from CONTRACT §2 exactly (tables `users`, `doctors`, `slots`, `appointments`, `notifications` and the two indexes).
2. **`lib/db.js`** — copy the code from CONTRACT §3 exactly. Ashish imports `query` and `withTransaction` from it, so the names and return shapes must not change.
3. **`scripts/init-db.js`** (CommonJS, plain Node):
   - reads `process.env.DATABASE_URL` (loaded by `node --env-file=.env.local`)
   - creates a `pg` `Pool` (SSL `{ rejectUnauthorized: false }` unless the URL contains `localhost`)
   - reads `db/schema.sql`, runs it with one `pool.query(sql)`, prints `Schema created`, closes the pool
   - on error prints the error and exits with code 1
4. **`scripts/seed.js`** (CommonJS, uses `pg` and `bcryptjs` directly — do not import Ashish's files):
   - inserts the four users from CONTRACT §2 "Seed data" with `bcrypt.hash(password, 10)`; skip if the email already exists (`ON CONFLICT (email) DO NOTHING`)
   - inserts a `doctors` row for each doctor user (name and specialization from the table); skip duplicates
   - inserts three slots for **tomorrow's date** per doctor: `09:00-09:30`, `09:30-10:00`, `10:00-10:30` (`ON CONFLICT DO NOTHING`)
   - prints what it created; safe to run twice
5. Check it: run `npm run db:init` and `npm run db:seed` on a Neon database, then in the Neon SQL editor run `SELECT * FROM users;` and `SELECT * FROM slots;` and confirm the rows.

### `docs/architecture.md` (tickets OHAMS-11 and OHAMS-12)

Write these sections:

1. **Architecture diagram** — a simple text or Mermaid diagram: Browser → Next.js pages → `/api` routes → `lib/db.js` → PostgreSQL (Neon), all hosted on Vercel.
2. **Components** — one line for each of: pages, API routes, `lib/auth.js`, `lib/db.js`, `lib/notify.js`.
3. **Database design** — the five tables, their keys and relationships (from CONTRACT §2), and why `appointments` is separate from `slots`.
4. **Appointment workflow** — the life of a slot:
   `slot created by doctor (is_booked=false)` → `patient books (is_booked=true, appointment BOOKED, 2 notifications)` → `patient/doctor/admin cancels (appointment CANCELLED, is_booked=false, 2 notifications)` → slot free again.
   Add a short numbered list for "Booking" and for "Cancelling", and one line on how double-booking is prevented (`UPDATE … WHERE is_booked = false` inside a transaction).
5. **Security notes** — password hashing, JWT in an httpOnly cookie, role checks in every route.

**END of H2:** all of the above merged to `main`.

---

## 4. Part B — Doctor and admin pages (H6, ticket OHAMS-18)

Start only after Medha's H4 pull request is merged. Pages are `'use client'`, default export, no props. Use `api` and `getMe` from `lib/api.js`, and the CSS classes from `globals.css` (`container`, `card`, `btn`, `error`, `success`). On load call `getMe()`; if `null` or the wrong role, `router.replace('/login')`. Show `error.message` when `api()` throws.

### `app/doctor/page.js` — `/doctor` (role `doctor`)
1. **Add slot form:** date (`type="date"`), start time (`type="time"`), end time (`type="time"`). Submit → `api('/slots', { method: 'POST', body: { date, startTime, endTime } })`. Values are `YYYY-MM-DD` and `HH:MM`. On success reload the list.
2. **My slots table:** `api('/slots')` → `[{ id, doctorId, date, startTime, endTime, isBooked }]`. Columns: date, start, end, booked (Yes/No). Rows with `isBooked === false` get **Delete** → `api('/slots/' + id, { method: 'DELETE' })`, then reload. Show the error if the server answers "Slot has appointments".
3. **My appointments table:** `api('/appointments')` → Appointment[] (CONTRACT §4). Columns: date, time, patientName, reason, status. Rows with `status === 'BOOKED'` get **Cancel** → `api('/appointments/' + id + '/cancel', { method: 'PATCH' })`, then reload both tables.
4. At the bottom render `<NotificationList />` (import from `../../components/NotificationList`).

### `app/admin/page.js` — `/admin` (role `admin`)
1. **Add doctor form:** name, email, password, specialization. Submit → `api('/admin/doctors', { method: 'POST', body: { name, email, password, specialization } })`. On success clear the form, show "Doctor added", reload the doctors table.
2. **Doctors table:** `api('/doctors')` → `[{ id, name, specialization }]`.
3. **All appointments table:** `api('/appointments')` → Appointment[]. Columns: date, time, doctorName, patientName, status. Rows with `status === 'BOOKED'` get **Cancel** (same call as above), then reload.

### Building before the backend is ready
Use temporary sample data in exactly the CONTRACT shapes (see Medha's file §6) and remove it before your pull request.

**END of H6:** `app/doctor/page.js` and `app/admin/page.js` merged to `main`.

---

## 5. Part C — Deployment (H8, ticket OHAMS-21)

Start only after Ashish's H7 (everything tested on `main`).

1. Make sure `.env.local` is **not** committed (it is in `.gitignore`).
2. Push `main` to GitHub.
3. Follow README §5: import the repo on Vercel, add `DATABASE_URL` and `JWT_SECRET`, deploy.
4. Run `npm run db:init` and `npm run db:seed` once against the production Neon database (from your laptop, with that `DATABASE_URL` in `.env.local`).
5. Open the Vercel URL and run tests T1, T5, T6, T11 and T13 from README §8.
6. Write the URL under README **"10. Live demo"**. If something fails only on Vercel (usually a missing environment variable), fix it, redeploy, and write the cause and the fix in two lines under the same "10. Live demo" heading.

**END of H8:** live URL in README; production DB seeded.

---

## 6. Done checklist

- [ ] `db/schema.sql` and `lib/db.js` are identical to CONTRACT §2 and §3
- [ ] `npm run db:init` and `npm run db:seed` both work, and running seed twice causes no error
- [ ] `docs/architecture.md` has all five sections
- [ ] Doctor page: add slot, delete free slot, cancel appointment, notifications all work
- [ ] Admin page: add doctor, doctors table, all appointments with cancel
- [ ] Wrong-role access redirects to `/login` on both pages
- [ ] Live URL is in the README
- [ ] You only changed files from section 2
- [ ] Your Jira tickets are moved to Done after each pull request is merged

## 7. Git

Branch `student2-nithin` → pull requests into `main` in this order: (1) H2 files (2) H6 files (3) README live-demo line after deployment. Commit messages start with the Jira key, e.g. `OHAMS-10 add database schema`.
