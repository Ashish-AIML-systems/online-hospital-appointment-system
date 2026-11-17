# Dummy Jira Sprint Plan — Online Hospital Appointment System

**Planning window:** 17–26 November 2026  
**Status:** Illustrative / dummy plan — not evidence of actual work performed  
**Repository:** https://github.com/Ashish-AIML-systems/online-hospital-appointment-system

## Team

| Member | Workstream |
|---|---|
| Ashish | Environment, backend, integration and testing |
| Medha | Requirements, shared frontend and patient pages |
| Nithin | Database, architecture, doctor/admin pages and deployment |
| Manya | Cost, schedule, risk and final report |

## Ticket plan

| Ticket | Type | Assignee | Start | Due | Estimate (h) | Priority |
|---|---|---|---|---|---:|---|
| OHAMS-26 — Initialize Next.js project and development environment | Story | Ashish | 17 Nov 2026 | 17 Nov 2026 | 4 | High |
| OHAMS-1 — Gather requirements and define project scope | Story | Medha | 17 Nov 2026 | 18 Nov 2026 | 4 | Medium |
| OHAMS-2 — Design database schema and data relationships | Epic | Nithin | 17 Nov 2026 | 19 Nov 2026 | 5 | Medium |
| OHAMS-3 — Backend implementation epic | Epic | Ashish | 18 Nov 2026 | 25 Nov 2026 | 0 | Medium |
| OHAMS-4 — Build shared frontend components and API helper | Story | Medha | 18 Nov 2026 | 19 Nov 2026 | 5 | Medium |
| OHAMS-5 — Integration and testing epic | Epic | Ashish | 24 Nov 2026 | 26 Nov 2026 | 0 | Medium |
| OHAMS-6 — Deploy application to Vercel | Story | Nithin | 25 Nov 2026 | 26 Nov 2026 | 3 | Medium |
| OHAMS-7 — Project documentation epic | Epic | Manya | 18 Nov 2026 | 26 Nov 2026 | 0 | Medium |
| OHAMS-8 — Implement patient-facing pages | Story | Medha | 19 Nov 2026 | 21 Nov 2026 | 6 | Medium |
| OHAMS-9 — Build patient appointment booking interface | Story | Medha | 19 Nov 2026 | 21 Nov 2026 | 5 | Medium |
| OHAMS-10 — Implement PostgreSQL schema and database helpers | Story | Nithin | 18 Nov 2026 | 19 Nov 2026 | 6 | Medium |
| OHAMS-11 — Build doctor dashboard and slot management | Story | Nithin | 20 Nov 2026 | 23 Nov 2026 | 7 | Medium |
| OHAMS-12 — Build admin dashboard and doctor management | Story | Nithin | 20 Nov 2026 | 23 Nov 2026 | 6 | Medium |
| OHAMS-13 — Implement appointment booking API | Story | Ashish | 20 Nov 2026 | 23 Nov 2026 | 6 | High |
| OHAMS-14 — Implement appointment cancellation API | Story | Ashish | 23 Nov 2026 | 24 Nov 2026 | 4 | High |
| OHAMS-15 — Implement notifications API and helper | Story | Ashish | 23 Nov 2026 | 24 Nov 2026 | 4 | Medium |
| OHAMS-16 — Implement doctor and slot APIs | Story | Ashish | 20 Nov 2026 | 23 Nov 2026 | 5 | Medium |
| OHAMS-17 — Complete patient appointment listing and notifications UI | Story | Medha | 21 Nov 2026 | 24 Nov 2026 | 4 | Medium |
| OHAMS-18 — Configure deployment and production environment | Story | Nithin | 24 Nov 2026 | 25 Nov 2026 | 3 | Medium |
| OHAMS-19 — Integrate frontend and backend modules | Story | Ashish | 24 Nov 2026 | 25 Nov 2026 | 5 | High |
| OHAMS-20 — Execute end-to-end test suite and record results | Story | Ashish | 25 Nov 2026 | 26 Nov 2026 | 6 | High |
| OHAMS-21 — Complete deployment smoke test | Story | Nithin | 25 Nov 2026 | 26 Nov 2026 | 2 | Medium |
| OHAMS-22 — Prepare cost estimation | Story | Manya | 18 Nov 2026 | 20 Nov 2026 | 4 | Medium |
| OHAMS-23 — Prepare project schedule and Gantt chart | Story | Manya | 19 Nov 2026 | 24 Nov 2026 | 4 | Medium |
| OHAMS-24 — Prepare risk analysis and mitigation register | Story | Manya | 20 Nov 2026 | 24 Nov 2026 | 4 | Medium |
| OHAMS-25 — Prepare final project report | Story | Manya | 25 Nov 2026 | 26 Nov 2026 | 8 | Medium |
| OHAMS-26 — Initialize development environment | Story | Ashish | 17 Nov 2026 | 17 Nov 2026 | 4 | Medium |

## Daily breakdown

### 17 Nov
Kick-off, environment bootstrap, requirements and schema planning.

### 18 Nov
Database foundation, shared UI helper, architecture and initial documentation.

### 19 Nov
Patient pages and booking UI; database validation; cost and schedule documentation.

### 20 Nov
Doctor/admin dashboard work begins; backend doctor/slot and booking endpoints; patient UI integration.

### 21 Nov
Complete patient flows; doctor/admin dashboard development continues; review progress.

### 22 Nov
Sunday buffer: optional async review, backlog grooming and blocker resolution only.

### 23 Nov
Complete doctor/admin pages; cancellation and notification APIs; API contract verification.

### 24 Nov
Frontend/backend integration, test preparation, production deployment configuration, risk register.

### 25 Nov
Execute E2E suite, fix defects, run build, prepare final deployment checks and report draft.

### 26 Nov
Deployment smoke test, final report consolidation, acceptance review and sprint close.

## Person-wise effort (illustrative)

| Member | Work breakdown | Planned hours |
|---|---|---:|
| Ashish | Environment 4h; backend 19h; integration 5h; testing 6h | 34 |
| Medha | Requirements 4h; shared UI 5h; patient pages and flows 15h | 24 |
| Nithin | Database 6h; doctor/admin UI 13h; deployment 5h | 24 |
| Manya | Cost 4h; schedule 4h; risk 4h; final report 8h | 20 |
| **Total** | | **102** |

## Dependencies / hand-offs

1. H0: Ashish environment setup → available to everyone.
2. H1: Medha requirements and shared frontend foundations.
3. H2: Nithin database schema/helpers and architecture.
4. H3: Ashish backend API, built after H2.
5. H4/H5: Medha patient pages and integration with API.
6. H6: Nithin doctor/admin screens.
7. H7: Ashish integration and end-to-end testing.
8. H8: Nithin deployment.
9. H9: Manya final documentation after test/deployment evidence exists.

## Assumptions

- Estimates are person-hours, not elapsed calendar hours.
- Sunday 22 November is a low-intensity buffer day.
- Epic rows are parent trackers; their estimate is 0 to avoid double counting story effort.
- The existing README and CONTRACT define scope; payments, SMS/email, rescheduling and medical records are excluded.
- Planned start/due dates are dummy schedule fields. Actual finish dates and actual status must be updated only from real work and Jira history.
- Do not backdate Jira activity or present this plan as actual completed work.

## Acceptance checks

- Contract-compliant auth, doctor/slot, booking, cancellation and notification APIs.
- Patient, doctor and admin workflows integrated.
- README T1–T15 tested and test report populated with actual outcomes.
- Production build succeeds and deployed smoke tests pass.
- Project documents refer to actual evidence, not assumed outcomes.
