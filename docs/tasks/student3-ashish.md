# Student 3 — Ashish

**Your part:** environment setup, the whole backend API, integration, and testing.
**Jira:** OHAMS-26, OHAMS-3 (epic), OHAMS-13, OHAMS-14, OHAMS-15, OHAMS-16, OHAMS-5 (epic), OHAMS-19, OHAMS-20.
**Read first:** [README](../../README.md) and [CONTRACT](../CONTRACT.md). Every endpoint must return **exactly** the shapes in CONTRACT §4.

---

## 1. Your hand-offs (copied from CONTRACT §8 — do not change)

| # | START (must already exist) | END (you hand over, exact paths) | Needed by |
|---|---|---|---|
| **H0** environment | README, CONTRACT | `package.json`, `next.config.js`, `.env.example`, `.gitignore`, empty folders `app/ lib/ components/ db/ scripts/ docs/`, `npm install` works, pushed to `main` | everyone |
| **H3** backend | H0, H2 (Nithin's `db/schema.sql`, `lib/db.js`, seed), CONTRACT §4 and §5 | `lib/respond.js`, `lib/auth.js`, `lib/notify.js`, every `route.js` listed in section 4 below; each endpoint returns exactly the shapes in CONTRACT §4 | Medha, Nithin |
| **H7** integration + testing | H3, H5 (Medha's pages), H6 (Nithin's pages) all on `main` | whole app works on `npm run dev`; every case in README §8 passes; `docs/test-report.md` | Nithin, Manya |

## 2. Files you own (only edit these)

```
package.json  next.config.js  .env.example  .gitignore
lib/respond.js  lib/auth.js  lib/notify.js  lib/appointments.js
app/api/**            (all backend routes, listed in section 4)
docs/test-report.md
```

---

## 3. Part A — Environment (H0, ticket OHAMS-26) — do this first

Create these files, run `npm install`, check `npm run dev` starts, push to `main`, and tell the team.

**`package.json`**
```json
{
  "name": "hospital-appointment-system",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:init": "node --env-file=.env.local scripts/init-db.js",
    "db:seed": "node --env-file=.env.local scripts/seed.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "next": "14.2.15",
    "pg": "^8.12.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

**`next.config.js`**
```js
/** @type {import('next').NextConfig} */
module.exports = {
  experimental: { serverComponentsExternalPackages: ['pg'] },
};
```

**`.env.example`**
```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=change-me-to-a-long-random-string
```

**`.gitignore`**
```
node_modules
.next
.env.local
.env
```

Also create the empty folders (put a `.gitkeep` file in each): `app`, `lib`, `components`, `db`, `scripts`, `docs`.

**END of H0:** pushed to `main`.

---

## 4. Part B — Backend (H3, tickets OHAMS-13, 14, 16, 15)

Start after Nithin's H2 is merged (you need `lib/db.js`). Build in this order and test each step with the seeded accounts (use a REST client such as Thunder Client, or `curl`).

### Routes (13 files)

```
app/api/auth/register/route.js            POST
app/api/auth/login/route.js               POST
app/api/auth/logout/route.js              POST
app/api/auth/me/route.js                  GET
app/api/doctors/route.js                  GET
app/api/doctors/[id]/slots/route.js       GET
app/api/slots/route.js                    GET, POST
app/api/slots/[id]/route.js               DELETE
app/api/appointments/route.js             GET, POST
app/api/appointments/[id]/cancel/route.js PATCH
app/api/admin/doctors/route.js            POST
app/api/notifications/route.js            GET
app/api/notifications/read/route.js       PATCH
```

Every file starts with `export const dynamic = 'force-dynamic';` and uses `ok()` / `fail()` from `lib/respond.js`. Dynamic ids come from `{ params }` (`export async function PATCH(request, { params }) { const id = Number(params.id); … }`).

### Step 1 — `lib/respond.js` and `lib/auth.js`
Copy `respond.js` from CONTRACT §3. For `auth.js` implement the six functions in the CONTRACT §3 table with `bcryptjs`, `jsonwebtoken` (secret `process.env.JWT_SECRET`, expiry `1d`) and `cookies()` from `next/headers` (`cookies().get('token')?.value`; `getSessionUser()` returns `null` for a missing or invalid token).

### Step 2 — Auth routes
- **register:** validate name, email (contains `@`), password ≥ 6 → `400`. If the email exists → `409 "Email already registered"`. Insert with role `patient`. Return `201` `{ id, name, role }`.
- **login:** look up by email, `checkPassword`; wrong → `401 "Invalid email or password"`. On success `signToken`, `setSessionCookie`, return `200` `{ id, name, role }`.
- **logout:** `clearSessionCookie`, `200` `null`.
- **me:** `getSessionUser()` or `401 "Not logged in"`; return it.

A small repeated check is fine to copy into each route:
```js
const user = getSessionUser();
if (!user) return fail('Not logged in', 401);
if (user.role !== 'patient') return fail('Not allowed', 403);   // role check where needed
```

### Step 3 — Doctors and slots (ticket OHAMS-16)
- **GET /api/doctors:** `SELECT d.id, u.name, d.specialization FROM doctors d JOIN users u ON u.id = d.user_id ORDER BY u.name`.
- **GET /api/doctors/:id/slots?date=:** `404` if the doctor does not exist; `400` if `date` is not `YYYY-MM-DD`. Return unbooked slots with `slot_date >= CURRENT_DATE` (and `= date` when given), mapped to the Slot shape with `to_char(...)` for date and times, `isBooked` always `false`.
- **POST /api/slots (doctor):** find the doctor row with `WHERE user_id = user.id`. Validate formats, date not in the past, `endTime > startTime` → `400`. Duplicate (doctor, date, start) → `409 "Slot already exists"`. Return `201` Slot.
- **GET /api/slots (doctor):** own slots with `slot_date >= CURRENT_DATE`, including booked.
- **DELETE /api/slots/:id (doctor):** `404` missing, `403` if it is not their slot, `409 "Slot has appointments"` if any row exists in `appointments` for it, else delete and return `200` `null`.

### Step 4 — Appointment helper `lib/appointments.js`
One reusable SELECT so POST, GET and cancel all return the same shape (CONTRACT §4 "Appointment"):
```sql
SELECT a.id, a.slot_id AS "slotId", a.status, a.reason,
       to_char(s.slot_date,  'YYYY-MM-DD') AS "date",
       to_char(s.start_time, 'HH24:MI')    AS "startTime",
       to_char(s.end_time,   'HH24:MI')    AS "endTime",
       d.id AS "doctorId", du.name AS "doctorName",
       a.patient_id AS "patientId", pu.name AS "patientName",
       d.user_id AS "doctorUserId"
FROM appointments a
JOIN slots s    ON s.id = a.slot_id
JOIN doctors d  ON d.id = s.doctor_id
JOIN users du   ON du.id = d.user_id
JOIN users pu   ON pu.id = a.patient_id
```
Export `getAppointmentById(run, id)` and the SQL string. `doctorUserId` is for internal use (notifications and permission checks) — **remove it** before sending the JSON, because it is not in the contract shape.

### Step 5 — Booking and cancelling (tickets OHAMS-13 and OHAMS-14)
**POST /api/appointments** (patient only), inside `withTransaction`:
1. `slotId` must be a positive integer → else `400`.
2. `UPDATE slots SET is_booked = true WHERE id = $1 AND is_booked = false RETURNING id`. If no row came back, check whether the slot exists: missing → `404`, else `409 "Slot already booked"`.
3. `INSERT INTO appointments (slot_id, patient_id, reason) VALUES (...) RETURNING id`.
4. Load the appointment with the helper, call `createNotification` twice (patient and doctor, messages from CONTRACT §5), return `201`.

**GET /api/appointments:** add `WHERE a.patient_id = $1` for patients, `WHERE d.user_id = $1` for doctors, nothing for admin. `ORDER BY s.slot_date, s.start_time`.

**PATCH /api/appointments/:id/cancel**, inside `withTransaction`:
1. Load with the helper → `404` if missing.
2. Permission: patient must be `patientId`; doctor must be `doctorUserId`; admin always. Otherwise `403`.
3. Already `CANCELLED` → `409 "Already cancelled"`.
4. `UPDATE appointments SET status='CANCELLED', cancelled_at=now() WHERE id=$1`, `UPDATE slots SET is_booked=false WHERE id=$2`.
5. Two notifications (CONTRACT §5), return `200` the updated appointment.

### Step 6 — Admin
**POST /api/admin/doctors** (admin only): validate all four fields (`400`), email exists → `409 "Email already registered"`. Inside a transaction insert the `users` row (role `doctor`, hashed password) then the `doctors` row. Return `201` `{ id, name, specialization }` where `id` is `doctors.id`.

### Step 7 — Notification module (ticket OHAMS-15) — do this last
Until now `lib/notify.js` is a stub with the final signature so Step 5 stays unchanged:
```js
import { query } from './db';
export async function createNotification(userId, message, run = query) {
  // stub until Step 7
}
```
In Step 7 fill it in: `await run('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [userId, message]);`.

Then add:
- **GET /api/notifications:** `SELECT id, message, is_read AS "isRead", created_at AS "createdAt" FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`.
- **PATCH /api/notifications/read:** `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`; return `200` `{ updated: rowCount }`.

**END of H3:** all files above merged to `main`, and every endpoint returns exactly the contract shape. Quick self-test: log in as each seeded user, call every endpoint once, compare the JSON to CONTRACT §4.

---

## 5. Part C — Integration and testing (H7, tickets OHAMS-19 and OHAMS-20)

Start when H3, H5 and H6 are all on `main`.

1. `git pull`, `npm install`, `npm run db:init`, `npm run db:seed`, `npm run dev`.
2. **Integration (OHAMS-19):** click through every page as patient, doctor and admin against the real API. When a page and an endpoint disagree, **CONTRACT wins**: whoever deviates from it fixes their own side. Message the owner of the other side; do not edit their files.
3. **Testing (OHAMS-20):** run T1–T15 from README §8.
4. Write `docs/test-report.md`:

| Column | Content |
|---|---|
| Test ID | T1 … T15 |
| Steps | copied from README §8 |
| Expected | copied from README §8 |
| Actual | what really happened |
| Result | PASS / FAIL |
| Fix / note | for each FAIL: the problem, which file was fixed, by whom |

   Add a line at the top with the date the tests were run (the real one), and a summary: total, passed, failed, and the list of bugs found and fixed. Every real bug you found should also be a Jira **Bug** ticket linked to the story it came from.
5. Do a production build check: `npm run build` must finish without errors.

**END of H7:** all tests PASS, `docs/test-report.md` on `main`.

---

## 6. Done checklist

- [ ] H0 files merged; a teammate can clone, `npm install` and `npm run dev` without help
- [ ] All 13 routes exist and match CONTRACT §4 (shapes, status codes, error messages)
- [ ] Booking the same slot twice gives `409`; two simultaneous bookings give exactly one success
- [ ] Notification text matches CONTRACT §5 character for character
- [ ] `npm run build` passes
- [ ] README §8 tests T1–T15 all PASS and are recorded
- [ ] You only changed files from section 2
- [ ] Your Jira tickets are moved to Done after each pull request is merged

## 7. Git

Branch `student3-ashish` → pull requests into `main` in this order: (1) H0 (2) H3 (3) test report. Commit messages start with the Jira key, e.g. `OHAMS-13 add booking endpoint`.
