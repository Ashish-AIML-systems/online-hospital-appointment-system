# Student 1 — Medha

**Your part:** requirements, the shared frontend pieces, and the patient pages.
**Jira:** OHAMS-1 (epic), OHAMS-8, OHAMS-9, OHAMS-4 (epic), OHAMS-17.
**Read first:** [README](../../README.md) and [CONTRACT](../CONTRACT.md). Build exactly to the contract.

---

## 1. Your hand-offs (copied from CONTRACT §8 — do not change)

| # | START (must already exist) | END (you hand over, exact paths) | Needed by |
|---|---|---|---|
| **H1** requirements | README §1 Features | `docs/requirements.md` | Nithin, Manya |
| **H4** shared frontend pieces | H0 (Ashish's skeleton on `main`), CONTRACT §3 `lib/api.js`, CONTRACT §6 | `lib/api.js`, `app/globals.css`, `components/NotificationList.js`, `components/Navbar.js`, `app/layout.js` — committed **first**, as a small separate pull request | Nithin |
| **H5** patient pages | H4, CONTRACT §4 (or sample data in the same shape) | `app/page.js`, `app/login/page.js`, `app/register/page.js`, `app/patient/page.js`, `app/patient/appointments/page.js` | Ashish (integration) |

## 2. Files you own (only edit these)

```
docs/requirements.md
lib/api.js
app/layout.js            app/globals.css          app/page.js
app/login/page.js        app/register/page.js
app/patient/page.js      app/patient/appointments/page.js
components/Navbar.js     components/NotificationList.js
```

---

## 3. Part A — Requirements (H1, tickets OHAMS-8 and OHAMS-9)

Create `docs/requirements.md` with these headings:

1. **Purpose** — two sentences: what the system does and who uses it.
2. **Users** — patient, doctor, admin, with one line each.
3. **Functional requirements** — use exactly these IDs so the report and tests can refer to them:

| ID | Requirement |
|---|---|
| FR-1 | A visitor can register as a patient (name, email, password) |
| FR-2 | A user can log in and log out; the system knows their role |
| FR-3 | A patient can see the list of doctors with their specialization |
| FR-4 | A patient can see a doctor's free slots, optionally for one date |
| FR-5 | A patient can book one free slot with an optional reason |
| FR-6 | A slot cannot be booked twice |
| FR-7 | A patient can see their own appointments and cancel them |
| FR-8 | A doctor can add and delete availability slots |
| FR-9 | A doctor can see appointments on their slots and cancel them |
| FR-10 | An admin can add a doctor |
| FR-11 | An admin can see all doctors and all appointments, and cancel any appointment |
| FR-12 | Booking and cancelling create an in-app notification for the patient and the doctor |
| FR-13 | Every page checks the user's role and redirects to login when it does not match |

4. **Non-functional requirements** — passwords stored hashed; works in a current desktop browser; no double-booking even with simultaneous requests.
5. **Out of scope** — copy the list from README §1.
6. **Tech stack decision (OHAMS-9)** — a table with the chosen stack (Next.js + PostgreSQL on Neon + Vercel) and one reason each, plus one sentence on one alternative the team considered and why it was not chosen. Write what the team really discussed.

**END of H1:** `docs/requirements.md` is on `main`.

---

## 4. Part B — Shared frontend pieces (H4) — do this FIRST in the frontend phase

Open a small pull request with only these files so Nithin can build on them.

| File | What to write |
|---|---|
| `lib/api.js` | Copy the code from CONTRACT §3 **exactly**. Do not change names or behaviour |
| `app/globals.css` | Plain CSS defining: `.container` (max-width 900px, centered, padding), `.card` (border, padding, margin), `.btn` (button look), `.error` (red text), `.success` (green text), plus simple `table`, `th`, `td`, `input`, `select` styling. Nothing else |
| `components/NotificationList.js` | `'use client'`, default export, **no props**. On load call `api('/notifications')` and list `message` and `createdAt` (newest first). A "Mark all read" button calls `api('/notifications/read', { method: 'PATCH' })` then reloads the list. Unread items shown in bold. Empty list shows "No notifications" |
| `components/Navbar.js` | `'use client'`, default export, no props. Call `getMe()`. Logged out: links Home, Login, Register. Patient: Book, My appointments, Logout. Doctor: Dashboard (`/doctor`), Logout. Admin: Admin (`/admin`), Logout. Logout calls `api('/auth/logout', { method: 'POST' })` then goes to `/login` |
| `app/layout.js` | Root layout: imports `./globals.css`, renders `<Navbar />` then `<main className="container">{children}</main>`. Title "Hospital Appointments" |

**END of H4:** these five files merged to `main`.

---

## 5. Part C — Patient pages (H5, ticket OHAMS-17)

Every page is `'use client'`, default export, no props. Call `getMe()` on load; if the result is `null` or the role is not the expected one, `router.replace('/login')` (`useRouter` from `next/navigation`). Show `error.message` in a `<p className="error">` when `api()` throws.

### `app/page.js` — `/`
Heading, one sentence about the system, links to `/login` and `/register`.

### `app/register/page.js` — `/register`
Form: name, email, password (min 6). Submit → `api('/auth/register', { method: 'POST', body: { name, email, password } })`. On success go to `/login`. Show errors (e.g. "Email already registered").

### `app/login/page.js` — `/login`
Form: email, password. Submit → `api('/auth/login', { method: 'POST', body: { email, password } })`. The result is `{ id, name, role }`. Redirect: `patient` → `/patient`, `doctor` → `/doctor`, `admin` → `/admin`. Show errors (e.g. "Invalid email or password").

### `app/patient/page.js` — `/patient` (role `patient`)
1. On load: `api('/doctors')` → `[{ id, name, specialization }]`; show in a `<select>`.
2. A date input (`type="date"`, value `YYYY-MM-DD`).
3. When a doctor is chosen (and optionally a date): `api('/doctors/' + doctorId + '/slots' + (date ? '?date=' + date : ''))` → `[{ id, doctorId, date, startTime, endTime, isBooked }]`. Show a table: date, start, end, **Book** button.
4. Optional text input "Reason".
5. **Book** → `api('/appointments', { method: 'POST', body: { slotId, reason } })`. On success show "Booked" (`.success`), reload the slots. On error (e.g. "Slot already booked") show it and reload the slots.

### `app/patient/appointments/page.js` — `/patient/appointments` (role `patient`)
1. On load: `api('/appointments')` → Appointment[] (see CONTRACT §4 shape). Table: date, startTime–endTime, doctorName, reason, status.
2. Rows with `status === 'BOOKED'` have a **Cancel** button → `api('/appointments/' + id + '/cancel', { method: 'PATCH' })`, then reload.
3. Below the table render `<NotificationList />`.

**END of H5:** the five page files merged to `main`.

---

## 6. Building before the backend is ready

Ashish delivers H3 in parallel. Until it is merged, temporarily replace the `api(...)` result with sample data **in exactly the CONTRACT shape**, for example:

```js
const doctors = [{ id: 1, name: 'Dr. Asha Rao', specialization: 'General Medicine' }];
const slots = [{ id: 10, doctorId: 1, date: '2026-11-20', startTime: '09:00', endTime: '09:30', isBooked: false }];
```
Remove the sample data before you open the pull request for H5.

---

## 7. Done checklist

- [ ] `docs/requirements.md` has FR-1 to FR-13 with these exact IDs and the stack decision
- [ ] `lib/api.js` is identical to CONTRACT §3
- [ ] `NotificationList` takes no props and works on its own
- [ ] Wrong-role access redirects to `/login` on both patient pages
- [ ] No hard-coded sample data left in any page
- [ ] You only changed files from section 2
- [ ] Your Jira tickets are moved to Done after the pull request is merged

## 8. Git

Branch `student1-medha` → pull requests into `main` in this order: (1) `docs/requirements.md` (2) H4 files (3) H5 files. Commit messages start with the Jira key, e.g. `OHAMS-17 patient booking page`.
