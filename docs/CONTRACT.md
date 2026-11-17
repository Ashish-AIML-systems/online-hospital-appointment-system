# Shared Contract (single source of truth)

Every person's task file points here. If a name, field, path, status code or message is written here, **use it exactly**. Do not rename anything. If something here is wrong, tell the team and change it **here first**, then in the code.

Stack: Next.js 14 (App Router, JavaScript) + PostgreSQL (`pg`) + JWT cookie auth. See [README](../README.md) for setup.

---

## 1. Global rules

| Topic | Rule |
|---|---|
| Roles | `patient`, `doctor`, `admin` (lowercase strings) |
| DB naming | `snake_case` columns |
| JSON naming | `camelCase` keys (backend converts) |
| Date in JSON | string `"YYYY-MM-DD"` (use `to_char(slot_date,'YYYY-MM-DD')` in SQL) |
| Time in JSON | string `"HH:MM"` 24-hour (use `to_char(start_time,'HH24:MI')` in SQL) |
| Timestamps in JSON | ISO string (`createdAt`) |
| Response envelope | success: `{ "ok": true, "data": <value> }` / error: `{ "ok": false, "error": "<message>" }` |
| Status codes | `200` ok, `201` created, `400` bad input, `401` not logged in, `403` wrong role / not yours, `404` not found, `409` conflict, `500` server error |
| Auth | httpOnly cookie named `token` holding a JWT `{ id, name, role }`, 1 day expiry |
| Route files | every `route.js` starts with `export const dynamic = 'force-dynamic';` |
| Env vars | `DATABASE_URL`, `JWT_SECRET` (nothing else) |
| API base | all endpoints live under `/api` |

---

## 2. Database (owner: Nithin → file `db/schema.sql`)

Copy this exactly into `db/schema.sql`.

```sql
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('patient','doctor','admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS doctors (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS slots (
  id         SERIAL PRIMARY KEY,
  doctor_id  INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  slot_date  DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time   TIME NOT NULL,
  is_booked  BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (doctor_id, slot_date, start_time),
  CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS appointments (
  id           SERIAL PRIMARY KEY,
  slot_id      INTEGER NOT NULL REFERENCES slots(id),
  patient_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'BOOKED' CHECK (status IN ('BOOKED','CANCELLED')),
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_slots_doctor_date ON slots (doctor_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, created_at DESC);
```

Relationships: `users 1—1 doctors` (only for role `doctor`) · `doctors 1—N slots` · `slots 1—N appointments` (at most one `BOOKED` at a time) · `users 1—N appointments` (patient) · `users 1—N notifications`.

### Seed data (`scripts/seed.js`, owner: Nithin)

| Email | Password | Role | Extra |
|---|---|---|---|
| `admin@hospital.test` | `admin123` | admin | name "Admin" |
| `doctor1@hospital.test` | `doctor123` | doctor | "Dr. Asha Rao", General Medicine |
| `doctor2@hospital.test` | `doctor123` | doctor | "Dr. Ravi Menon", Cardiology |
| `patient@hospital.test` | `patient123` | patient | "Test Patient" |

Also insert three slots for tomorrow for each doctor: `09:00-09:30`, `09:30-10:00`, `10:00-10:30`.
The seed script must be safe to run twice (use `ON CONFLICT DO NOTHING`).

---

## 3. Shared helper signatures

### `lib/db.js` (owner: Nithin, used by Ashish)

```js
import { Pool } from 'pg';

const g = globalThis;
const pool =
  g.__pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: (process.env.DATABASE_URL || '').includes('localhost')
      ? false
      : { rejectUnauthorized: false },
  });
if (process.env.NODE_ENV !== 'production') g.__pgPool = pool;

// START: (text: string, params?: any[])   END: Promise<{ rows: object[], rowCount: number }>
export async function query(text, params = []) {
  return pool.query(text, params);
}

// START: fn(run) where run = (text, params?) => Promise<{rows,rowCount}>
// END:   whatever fn returns. Commits on success, rolls back (and rethrows) on error.
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn((text, params = []) => client.query(text, params));
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

### `lib/respond.js` (owner: Ashish)

```js
import { NextResponse } from 'next/server';

// START: (data, status = 200)   END: NextResponse with body { ok: true, data }
export function ok(data, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}
// START: (message, status = 400)   END: NextResponse with body { ok: false, error: message }
export function fail(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}
```

### `lib/auth.js` (owner: Ashish) — signatures

| Function | START (input) | END (output) |
|---|---|---|
| `hashPassword(plain)` | string | `Promise<string>` bcrypt hash |
| `checkPassword(plain, hash)` | string, string | `Promise<boolean>` |
| `signToken(user)` | `{ id, name, role }` | string JWT |
| `setSessionCookie(res, token)` | NextResponse, string | void (sets cookie `token`, httpOnly, path `/`, maxAge 86400) |
| `clearSessionCookie(res)` | NextResponse | void |
| `getSessionUser()` | – | `{ id, name, role }` or `null` |

### `lib/notify.js` (owner: Ashish)

```js
// START: (userId: number, message: string, run = query)
// END:   Promise<void>  — inserts one row into notifications
export async function createNotification(userId, message, run = query) { /* ... */ }
```
Until the notification step is done this function is a **no-op stub with the same signature**, so booking/cancel code never changes.

### `lib/api.js` (owner: Medha, used by Medha and Nithin)

Copy exactly. Paths passed in have **no** `/api` prefix: `api('/doctors')`.

```js
// START: (path: string, { method = 'GET', body } = {})
// END:   resolves to the `data` field; throws Error(message) when ok is false
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('Server error');
  }
  if (!json.ok) throw new Error(json.error || 'Request failed');
  return json.data;
}

// END: { id, name, role } or null when not logged in
export async function getMe() {
  try {
    return await api('/auth/me');
  } catch {
    return null;
  }
}
```

---

## 4. API endpoints (owner: Ashish builds; Medha and Nithin call)

"Login required" = `getSessionUser()` is not null, else `401 "Not logged in"`. Wrong role → `403 "Not allowed"`.

### Object shapes

```jsonc
// User
{ "id": 3, "name": "Test Patient", "role": "patient" }

// Doctor   (id = doctors.id, NOT users.id)
{ "id": 1, "name": "Dr. Asha Rao", "specialization": "General Medicine" }

// Slot
{ "id": 10, "doctorId": 1, "date": "2026-11-20", "startTime": "09:00", "endTime": "09:30", "isBooked": false }

// Appointment
{
  "id": 5, "slotId": 10, "status": "BOOKED",          // "BOOKED" | "CANCELLED"
  "reason": "Fever",                                   // string or null
  "date": "2026-11-20", "startTime": "09:00", "endTime": "09:30",
  "doctorId": 1, "doctorName": "Dr. Asha Rao",
  "patientId": 3, "patientName": "Test Patient"        // users.id
}

// Notification
{ "id": 8, "message": "Appointment confirmed ...", "isRead": false, "createdAt": "2026-11-20T04:30:00.000Z" }
```

### Auth

| Method + path | Role | Body | Success | Errors |
|---|---|---|---|---|
| `POST /api/auth/register` | public | `{ name, email, password }` | `201` User (role forced to `patient`) | `400` missing field / bad email / password < 6 chars · `409` "Email already registered" |
| `POST /api/auth/login` | public | `{ email, password }` | `200` User + sets cookie | `400` missing field · `401` "Invalid email or password" |
| `POST /api/auth/logout` | any | – | `200` `null` + clears cookie | – |
| `GET /api/auth/me` | login | – | `200` User | `401` |

### Doctors and slots

| Method + path | Role | Body / query | Success | Errors |
|---|---|---|---|---|
| `GET /api/doctors` | login | – | `200` Doctor[] ordered by name | `401` |
| `GET /api/doctors/:id/slots?date=YYYY-MM-DD` | login | `date` optional | `200` Slot[] — only `isBooked=false` and date ≥ today, ordered by date then start time | `400` bad date · `404` doctor not found |
| `POST /api/slots` | doctor | `{ date, startTime, endTime }` | `201` Slot | `400` bad format / date in the past / end ≤ start · `403` · `409` "Slot already exists" |
| `GET /api/slots` | doctor | – | `200` Slot[] (own, date ≥ today, includes booked) | `403` |
| `DELETE /api/slots/:id` | doctor | – | `200` `null` | `403` not your slot · `404` · `409` "Slot has appointments" (any appointment row exists, booked or cancelled) |

### Appointments

| Method + path | Role | Body | Success | Errors |
|---|---|---|---|---|
| `POST /api/appointments` | patient | `{ slotId, reason? }` | `201` Appointment (status `BOOKED`) | `400` bad slotId · `403` · `404` slot not found · `409` "Slot already booked" |
| `GET /api/appointments` | login | – | `200` Appointment[] — patient: own · doctor: on own slots · admin: all. Ordered by date, startTime. Includes both statuses | `401` |
| `PATCH /api/appointments/:id/cancel` | login | – | `200` Appointment (status `CANCELLED`) | `403` not yours (patient = owner, doctor = owns the slot, admin = any) · `404` · `409` "Already cancelled" |

Rules inside booking and cancel (both inside `withTransaction`):
- **Book:** `UPDATE slots SET is_booked = true WHERE id = $1 AND is_booked = false` → 0 rows means `409`. Then insert the appointment, then notify.
- **Cancel:** set appointment `status='CANCELLED', cancelled_at=now()`, set slot `is_booked=false`, then notify.

### Admin

| Method + path | Role | Body | Success | Errors |
|---|---|---|---|---|
| `POST /api/admin/doctors` | admin | `{ name, email, password, specialization }` | `201` Doctor (creates a `users` row with role `doctor` and a `doctors` row) | `400` · `403` · `409` "Email already registered" |

### Notifications

| Method + path | Role | Body | Success |
|---|---|---|---|
| `GET /api/notifications` | login | – | `200` Notification[] (own, newest first, max 50) |
| `PATCH /api/notifications/read` | login | – | `200` `{ "updated": <number> }` (marks all own as read) |

---

## 5. Notification messages (exact text)

`{date}` = `YYYY-MM-DD`, `{startTime}` = `HH:MM`.

| Event | Goes to | Message |
|---|---|---|
| Booked | patient | `Appointment confirmed with {doctorName} on {date} at {startTime}.` |
| Booked | doctor | `New appointment: {patientName} on {date} at {startTime}.` |
| Cancelled | patient | `Appointment on {date} at {startTime} with {doctorName} was cancelled.` |
| Cancelled | doctor | `Appointment on {date} at {startTime} with {patientName} was cancelled.` |

The doctor's notification goes to the doctor's `users.id` (`doctors.user_id`), not `doctors.id`.

---

## 6. Pages and components

All pages are `'use client'` components, `export default`, **no props**. Each page calls `getMe()` first; if the user is missing or the role is wrong, `router.replace('/login')`.

| Route | File | Role | Owner |
|---|---|---|---|
| `/` | `app/page.js` | public (links to login / register) | Medha |
| `/login` | `app/login/page.js` | public; after login redirect: patient → `/patient`, doctor → `/doctor`, admin → `/admin` | Medha |
| `/register` | `app/register/page.js` | public; after register go to `/login` | Medha |
| `/patient` | `app/patient/page.js` | patient: pick doctor, pick date, list free slots, book | Medha |
| `/patient/appointments` | `app/patient/appointments/page.js` | patient: own appointments, cancel, `<NotificationList />` | Medha |
| `/doctor` | `app/doctor/page.js` | doctor: add / delete slots, own appointments with cancel, `<NotificationList />` | Nithin |
| `/admin` | `app/admin/page.js` | admin: add doctor form, doctors table, all appointments table | Nithin |

Shared UI pieces (owner: Medha, used by Nithin):

| File | START (props) | END |
|---|---|---|
| `components/NotificationList.js` | none | default export; fetches `GET /notifications` itself, shows messages newest first, "Mark all read" button calls `PATCH /notifications/read` |
| `components/Navbar.js` | none | default export; used only in `app/layout.js`; shows links by role and a Logout button |
| `app/globals.css` | – | defines classes `container`, `card`, `btn`, `error`, `success` and basic `table` / `input` styling. Nithin may use these class names but must not edit the file |

---

## 7. File ownership (one owner per file = no merge conflicts)

| Owner | Files |
|---|---|
| **Ashish** | `package.json`, `next.config.js`, `.env.example`, `.gitignore`, `lib/respond.js`, `lib/auth.js`, `lib/notify.js`, `lib/appointments.js`, everything under `app/api/`, `docs/test-report.md` |
| **Nithin** | `db/schema.sql`, `scripts/init-db.js`, `scripts/seed.js`, `lib/db.js`, `docs/architecture.md`, `app/doctor/page.js`, `app/admin/page.js`, README section "Live demo" |
| **Medha** | `docs/requirements.md`, `lib/api.js`, `app/layout.js`, `app/globals.css`, `app/page.js`, `app/login/page.js`, `app/register/page.js`, `app/patient/**`, `components/**` |
| **Manya** | everything under `docs/project/` |
| Shared (read-only for all) | `README.md`, `docs/CONTRACT.md`, `docs/tasks/*` — change only after telling the team |

---

## 8. Hand-offs (what each person STARTS with and ENDS with)

The **END** of one row is exactly the **START** of the next. Nobody starts a row before its START items exist on `main`.

| # | Who | START (must already exist) | END (hand over, exact paths) | Needed by |
|---|---|---|---|---|
| H0 | Ashish — environment | README, this contract | `package.json`, `next.config.js`, `.env.example`, `.gitignore`, empty folders `app/ lib/ components/ db/ scripts/ docs/`, `npm install` works, pushed to `main` | everyone |
| H1 | Medha — requirements | README §1 Features | `docs/requirements.md` | Nithin, Manya |
| H2 | Nithin — database + design | H0, `docs/requirements.md` | `db/schema.sql`, `lib/db.js`, `scripts/init-db.js`, `scripts/seed.js`, `docs/architecture.md`; `npm run db:init` and `npm run db:seed` succeed | Ashish, Manya |
| H3 | Ashish — backend | H0, H2, §4 and §5 of this contract | `lib/respond.js`, `lib/auth.js`, `lib/notify.js`, every `route.js` listed in §4; each endpoint returns exactly the shapes in §4 | Medha, Nithin |
| H4 | Medha — shared frontend pieces | H0, §3 `lib/api.js`, §6 | `lib/api.js`, `app/globals.css`, `components/NotificationList.js`, `components/Navbar.js`, `app/layout.js` (committed **first**, small PR) | Nithin |
| H5 | Medha — patient pages | H4, §4 (or sample data in the same shape) | `app/page.js`, `app/login/page.js`, `app/register/page.js`, `app/patient/page.js`, `app/patient/appointments/page.js` | Ashish (integration) |
| H6 | Nithin — dashboards | H4, §4, §6 | `app/doctor/page.js`, `app/admin/page.js` | Ashish (integration) |
| H7 | Ashish — integration + testing | H3, H5, H6 all on `main` | whole app works on `npm run dev`; every case in README §8 passes; `docs/test-report.md` | Nithin, Manya |
| H8 | Nithin — deployment | H7 | live Vercel URL written in README "Live demo"; seed run on the production DB | Manya |
| H9 | Manya — project documents | README, this contract, H1, H2, H7, H8, Jira board | `docs/project/cost-estimation.md`, `docs/project/schedule.md`, `docs/project/risk-analysis.md`, `docs/project/final-report.md` | submission |
