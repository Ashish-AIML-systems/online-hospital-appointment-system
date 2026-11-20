# Requirements — Online Hospital Appointment Management System

Owner: Medha · Jira: OHAMS-8, OHAMS-9 (epic OHAMS-1) · Hand-off H1

## 1. Purpose

The system lets patients book and cancel hospital appointments online, in free time slots that doctors publish.
It is used by patients, by doctors who manage their own slots and appointments, and by an admin who adds doctors and oversees all appointments.

## 2. Users

| User | Description |
|---|---|
| **Patient** | Registers, finds a doctor, books a free slot, sees and cancels their own appointments, reads notifications. |
| **Doctor** | Account created by the admin. Adds and deletes availability slots, sees and cancels appointments on their slots, reads notifications. |
| **Admin** | Seeded account. Adds doctors, sees all doctors and all appointments, and can cancel any appointment. |

## 3. Functional requirements

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

## 4. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Security:** passwords are stored only as bcrypt hashes, never in plain text. The login token is kept in an httpOnly cookie. |
| NFR-2 | **Compatibility:** the app works in a current desktop browser (Chrome, Safari, Firefox, Edge). |
| NFR-3 | **Data integrity:** a slot is never double-booked, even when two requests arrive at the same time. Booking claims the slot inside one database transaction. |

## 5. Out of scope

Not included on purpose (from README §1):

- payments
- email or SMS
- rescheduling
- video calls
- medical records
- reviews
- search filters
- password reset
- file uploads

## 6. Tech stack decision (OHAMS-9)

| Layer | Choice | Reason |
|---|---|---|
| Frontend + backend | Next.js 14 (App Router, JavaScript) | One project and one deployment: pages and API routes live together. |
| Database | PostgreSQL on Neon (free tier) | Relational data with transactions, which is what prevents double booking (FR-6). Neon works directly with Vercel. |
| Database access | `pg` package (plain SQL) | Simple and easy to review; we control the booking transaction ourselves. |
| Authentication | `bcryptjs` + `jsonwebtoken`, JWT in an httpOnly cookie | Simple and needs no extra service; the role in the token drives role checks (FR-13). |
| Hosting | Vercel (free Hobby plan) | One-click deploy from GitHub; secrets kept as environment variables. |

**Alternative considered:** a separate React single-page app with a Node/Express REST API (proposed early in OHAMS-32).
We did not choose it because it needs two projects, two deployments and cross-origin (CORS) setup, while Next.js gives us both parts in one project, which suits a four-person team on a short schedule.
