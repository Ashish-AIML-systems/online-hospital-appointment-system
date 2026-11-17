# Online Hospital Appointment Management System

A small web app where **patients book and cancel appointments**, **doctors manage their schedules**, and an **admin** adds doctors. It has only the features the project requires.

---

## 1. Features

| Role | What they can do |
|---|---|
| **Patient** | Register, log in, see doctors, pick a date, see free slots, book a slot, see own appointments, cancel an appointment, read notifications |
| **Doctor** | Log in, add and delete availability slots, see own appointments, cancel an appointment, read notifications |
| **Admin** | Log in, add a doctor, see all doctors, see all appointments, cancel any appointment |
| **Notifications** | Booking and cancellation create an in-app notification for both the patient and the doctor |

**Not included (on purpose):** payments, email or SMS, rescheduling, video calls, medical records, reviews, search filters, password reset, file uploads.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend + backend | Next.js 14 (App Router, JavaScript) | One project, one deploy; pages and API routes live together |
| Database | PostgreSQL on Neon (free) | Works with Vercel; plain SQL through the `pg` package |
| Auth | `bcryptjs` + `jsonwebtoken`, JWT in an httpOnly cookie | Simple, no extra service |
| Hosting | Vercel (free Hobby plan) | One-click deploy from GitHub |

Prerequisites: Node.js **20.6 or newer**, npm, Git, a free Neon account, a free Vercel account, a GitHub account.

---

## 3. Project structure

```
hospital/
├─ README.md
├─ package.json            next.config.js      .env.example      .gitignore
├─ db/
│  └─ schema.sql                      tables
├─ scripts/
│  ├─ init-db.js                      runs db/schema.sql      (npm run db:init)
│  └─ seed.js                         demo users and slots    (npm run db:seed)
├─ lib/
│  ├─ db.js                           query(), withTransaction()
│  ├─ auth.js                         password hashing, JWT cookie, getSessionUser()
│  ├─ respond.js                      ok(), fail()
│  ├─ notify.js                       createNotification()
│  └─ api.js                          browser helper: api(), getMe()
├─ components/
│  ├─ Navbar.js
│  └─ NotificationList.js
├─ app/
│  ├─ layout.js    globals.css    page.js
│  ├─ login/page.js        register/page.js
│  ├─ patient/page.js      patient/appointments/page.js
│  ├─ doctor/page.js       admin/page.js
│  └─ api/                            all backend routes
└─ docs/
   ├─ CONTRACT.md                     shared names, tables, endpoints (read this first)
   ├─ requirements.md   architecture.md   test-report.md
   ├─ tasks/                          one file per team member
   └─ project/                        cost, schedule, risks, final report
```

---

## 4. Setup and run locally

1. **Install**
   ```bash
   npm install
   ```
2. **Create the database.** On [neon.tech](https://neon.tech) create a project and copy its connection string. (A local PostgreSQL also works.)
3. **Create `.env.local`** in the project root (copy `.env.example`):
   ```
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
   JWT_SECRET=put-a-long-random-string-here
   ```
   Make a random secret with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. **Create tables and demo data**
   ```bash
   npm run db:init
   npm run db:seed
   ```
5. **Start the app**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

### Demo accounts (created by `npm run db:seed`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@hospital.test` | `admin123` |
| Doctor | `doctor1@hospital.test` | `doctor123` |
| Doctor | `doctor2@hospital.test` | `doctor123` |
| Patient | `patient@hospital.test` | `patient123` |

> These passwords are public in this repository and are for local testing only. On the live Vercel site, change them (or seed with different passwords) before sharing the link.

---

## 5. Deploy to Vercel

1. Push the project to a GitHub repository.
2. On [vercel.com](https://vercel.com) choose **Add New → Project** and import the repository. Vercel detects Next.js automatically.
3. Under **Environment Variables** add `DATABASE_URL` and `JWT_SECRET` (use the same Neon database; run `npm run db:init` and `npm run db:seed` once from your laptop against it).
4. Click **Deploy**.
5. Open the URL, log in as the admin, and run the checklist in section 8.

If you change an environment variable later, redeploy so it takes effect.

---

## 6. How the pieces fit

- The browser pages call the backend only through `api()` in `lib/api.js`.
- Every endpoint answers with `{ ok: true, data }` or `{ ok: false, error }`.
- Booking and cancelling run inside one database transaction, so a slot can never be booked twice.
- The full list of endpoints, request bodies, response shapes and error codes is in **[docs/CONTRACT.md](docs/CONTRACT.md)**. It is the one file everybody builds against.

---

## 7. Pages

| Route | Who | Purpose |
|---|---|---|
| `/` | public | Landing page with login and register links |
| `/login`, `/register` | public | Sign in / create a patient account |
| `/patient` | patient | Choose doctor and date, book a free slot |
| `/patient/appointments` | patient | See and cancel own appointments, notifications |
| `/doctor` | doctor | Add and delete slots, see and cancel appointments, notifications |
| `/admin` | admin | Add doctors, view all doctors and all appointments |

---

## 8. Testing checklist (end to end)

Run these in order on a fresh seeded database. Record the result of each in `docs/test-report.md`.

| # | Steps | Expected |
|---|---|---|
| T1 | Register a new patient with a new email | Redirected to login; the account can log in |
| T2 | Register again with the same email | Error "Email already registered" |
| T3 | Log in with a wrong password | Error "Invalid email or password" |
| T4 | Log in as the patient, open `/doctor` | Redirected to `/login` (wrong role) |
| T5 | As the patient, choose Dr. Asha Rao and tomorrow's date | Three free slots listed |
| T6 | Book the 09:00 slot with a reason | Appointment appears in "My appointments" as BOOKED; slot no longer listed |
| T7 | Patient's notifications | "Appointment confirmed with Dr. Asha Rao on …" is shown |
| T8 | Log in as `doctor1`, open `/doctor` | The new appointment is listed; notification "New appointment: …" is shown |
| T9 | Doctor adds a new slot for the day after tomorrow | Slot appears in the doctor's list and in the patient's slot list |
| T10 | Doctor tries to delete a slot that has an appointment | Error "Slot has appointments" |
| T11 | Patient cancels the appointment | Status CANCELLED; slot is free again; both users get a cancellation notification |
| T12 | Two browsers book the same slot at the same time | Exactly one succeeds, the other gets "Slot already booked" |
| T13 | Log in as admin, add a doctor | Doctor appears in the doctors table and in the patient's doctor list |
| T14 | Admin opens the appointments table | All appointments from all patients are visible |
| T15 | Log out, press the browser back button, open `/patient` | Redirected to `/login` |

---

## 9. Team, tasks and merge order

| Student | Name | Owns | Jira | Task file |
|---|---|---|---|---|
| 1 | Medha | Requirements, shared frontend pieces, patient pages | OHAMS-1, 8, 9, 4, 17 | [docs/tasks/student1-medha.md](docs/tasks/student1-medha.md) |
| 2 | Nithin | Database, architecture, doctor and admin pages, deployment | OHAMS-2, 10, 11, 12, 18, 6, 21 | [docs/tasks/student2-nithin.md](docs/tasks/student2-nithin.md) |
| 3 | Ashish | Environment, backend API, integration, testing | OHAMS-26, 3, 13, 14, 15, 16, 5, 19, 20 | [docs/tasks/student3-ashish.md](docs/tasks/student3-ashish.md) |
| 4 | Manya | Cost, schedule, risks, final report | OHAMS-7, 22, 23, 24, 25 | [docs/tasks/student4-manya.md](docs/tasks/student4-manya.md) |

**Rules that keep merging painless**

1. Every file has exactly one owner ([CONTRACT §7](docs/CONTRACT.md)). Only edit your own files.
2. Names, paths, JSON shapes and messages come from [CONTRACT](docs/CONTRACT.md). Never rename them in your own code.
3. Hand-offs (CONTRACT §8) go in this order: **H0 Ashish → H1 Medha → H2 Nithin → H3 Ashish → H4 Medha → H5 Medha and H6 Nithin → H7 Ashish → H8 Nithin → H9 Manya**. Each one's END is the next one's START.
4. Work on your own branch (`student1-medha`, `student2-nithin`, `student3-ashish`, `student4-manya`), open a pull request into `main` when your hand-off is ready, and move the matching Jira ticket to Done when it is merged.
5. Commit messages start with the Jira key, for example `OHAMS-13 add booking endpoint`.

---

## 10. Live demo

_To be filled in by Nithin after deployment (hand-off H8):_ `https://…`

---

## 11. Docs index

| File | What it is |
|---|---|
| [docs/CONTRACT.md](docs/CONTRACT.md) | Shared contract: tables, helpers, endpoints, messages, pages, ownership, hand-offs |
| [docs/requirements.md](docs/requirements.md) | Requirements (Medha) |
| [docs/architecture.md](docs/architecture.md) | Architecture and appointment workflow (Nithin) |
| [docs/test-report.md](docs/test-report.md) | Results of the checklist in section 8 (Ashish) |
| [docs/project/](docs/project/) | Cost estimation, schedule, risk analysis, final report (Manya) |
