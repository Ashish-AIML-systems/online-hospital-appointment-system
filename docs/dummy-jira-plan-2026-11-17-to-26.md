# Dummy Jira Sprint Plan — Online Hospital Appointment System

**Planning window:** 17–26 November 2026  
**Status:** Illustrative planning data only; not a record of work completed  
**Repository:** https://github.com/Ashish-AIML-systems/online-hospital-appointment-system  
**Timezone:** IST (Asia/Kolkata)

## Team allocation

| Person | Repository-defined responsibility | Planned effort |
|---|---|---:|
| Ashish | Environment, backend APIs, integration and testing | 34 h |
| Medha | Requirements, shared frontend and patient pages | 24 h |
| Nithin | Database, architecture, doctor/admin dashboards and deployment | 24 h |
| Manya | Cost, schedule, risk analysis and final report | 20 h |
| **Total** | | **102 h** |

The assignments follow README §9 and the individual files in `docs/tasks/`. Epic estimates are zero because effort is recorded on the child tasks, avoiding double counting.

## Date-wise ticket schedule

| Jira key | Summary | Type | Assignee | Planned start | Due date | Estimate (h) | Priority | Parent epic |
|---|---|---|---|---|---|---:|---|---|
| OHAMS-1 | Requirements and scope definition | Epic | Medha | 17 Nov 2026 | 21 Nov 2026 | 0 | Medium | — |
| OHAMS-2 | Database and architecture design | Epic | Nithin | 17 Nov 2026 | 20 Nov 2026 | 0 | Medium | — |
| OHAMS-3 | Backend API implementation | Epic | Ashish | 18 Nov 2026 | 24 Nov 2026 | 0 | High | — |
| OHAMS-4 | Shared frontend foundation | Epic | Medha | 18 Nov 2026 | 23 Nov 2026 | 0 | Medium | — |
| OHAMS-5 | Application integration and testing | Epic | Ashish | 24 Nov 2026 | 26 Nov 2026 | 0 | High | — |
| OHAMS-6 | Production deployment | Epic | Nithin | 25 Nov 2026 | 26 Nov 2026 | 0 | Medium | — |
| OHAMS-7 | Project documentation and submission | Epic | Manya | 18 Nov 2026 | 26 Nov 2026 | 0 | Medium | — |
| OHAMS-8 | Prepare requirements specification | Task | Medha | 17 Nov 2026 | 18 Nov 2026 | 4 | Medium | OHAMS-1 |
| OHAMS-9 | Document technology stack decision | Task | Medha | 18 Nov 2026 | 19 Nov 2026 | 2 | Low | OHAMS-1 |
| OHAMS-10 | Create PostgreSQL schema and database helper | Task | Nithin | 18 Nov 2026 | 19 Nov 2026 | 6 | High | OHAMS-2 |
| OHAMS-11 | Write system architecture and appointment workflow | Task | Nithin | 18 Nov 2026 | 20 Nov 2026 | 4 | Medium | OHAMS-2 |
| OHAMS-12 | Create database initialization and seed scripts | Task | Nithin | 19 Nov 2026 | 20 Nov 2026 | 4 | High | OHAMS-2 |
| OHAMS-13 | Implement transactional appointment booking API | Task | Ashish | 20 Nov 2026 | 23 Nov 2026 | 5 | High | OHAMS-3 |
| OHAMS-14 | Implement appointment cancellation API | Task | Ashish | 23 Nov 2026 | 24 Nov 2026 | 4 | High | OHAMS-3 |
| OHAMS-15 | Implement in-app notifications API | Task | Ashish | 23 Nov 2026 | 24 Nov 2026 | 3 | Medium | OHAMS-3 |
| OHAMS-16 | Implement doctor listing and slot management APIs | Task | Ashish | 20 Nov 2026 | 23 Nov 2026 | 5 | High | OHAMS-3 |
| OHAMS-17 | Build patient pages and appointment flows | Task | Medha | 19 Nov 2026 | 23 Nov 2026 | 18 | High | OHAMS-4 |
| OHAMS-18 | Build doctor and admin dashboards | Task | Nithin | 20 Nov 2026 | 23 Nov 2026 | 6 | High | OHAMS-2 |
| OHAMS-19 | Integrate frontend and backend modules | Task | Ashish | 24 Nov 2026 | 25 Nov 2026 | 8 | High | OHAMS-5 |
| OHAMS-20 | Run end-to-end test suite and prepare test report | Task | Ashish | 25 Nov 2026 | 26 Nov 2026 | 6 | High | OHAMS-5 |
| OHAMS-21 | Deploy to Vercel and run production smoke tests | Task | Nithin | 26 Nov 2026 | 26 Nov 2026 | 4 | High | OHAMS-6 |
| OHAMS-22 | Prepare effort-based project cost estimate | Task | Manya | 18 Nov 2026 | 20 Nov 2026 | 3 | Medium | OHAMS-7 |
| OHAMS-23 | Prepare project schedule and Gantt chart | Task | Manya | 19 Nov 2026 | 24 Nov 2026 | 5 | Medium | OHAMS-7 |
| OHAMS-24 | Prepare risk register and mitigation plan | Task | Manya | 20 Nov 2026 | 24 Nov 2026 | 4 | Medium | OHAMS-7 |
| OHAMS-25 | Compile final project report and contribution summary | Task | Manya | 25 Nov 2026 | 26 Nov 2026 | 8 | Medium | OHAMS-7 |
| OHAMS-26 | Initialize Next.js project and development environment | Task | Ashish | 17 Nov 2026 | 17 Nov 2026 | 3 | High | — |

## Daily work plan

### 17 Nov (Tue)
Kick-off; Ashish completes H0 environment; Medha starts requirements; Nithin reviews data model; Manya outlines documentation.

### 18 Nov (Wed)
Medha completes core requirements and stack choice; Nithin starts schema/architecture; Ashish confirms contract and backend skeleton; Manya drafts cost estimate.

### 19 Nov (Thu)
Nithin completes schema and starts repeatable seed scripts; Medha builds shared components and patient page skeleton; Manya starts schedule.

### 20 Nov (Fri)
Nithin closes H2 database/architecture hand-off and builds dashboards; Ashish starts doctors/slots and booking APIs; Medha continues patient flows; Manya starts risk register.

### 21 Nov (Sat)
Continue patient and role dashboards; backend API implementation and peer review; no new scope.

### 22 Nov (Sun)
Light buffer only: optional async review, backlog grooming and blocker notes. No full-day estimate is assigned.

### 23 Nov (Mon)
Complete patient and doctor/admin page hand-offs; finish core booking/slot APIs; Ashish implements cancellation and notifications; Manya continues schedule/risk docs.

### 24 Nov (Tue)
Close backend H3; begin H7 integration after all H3/H5/H6 branches are merged; fix API mismatches; Manya completes schedule and risk docs.

### 25 Nov (Wed)
Finish integration; execute T1-T15 and production build; Nithin prepares Vercel deployment; Manya drafts final report structure.

### 26 Nov (Thu)
Complete test reruns and actual test report; deploy and smoke test after H7 passes; Manya finalizes report using actual test/deployment evidence; sprint review.

## Dependencies and hand-offs

1. **H0 — OHAMS-26:** Ashish creates the runnable project skeleton.
2. **H1 — OHAMS-8/OHAMS-9:** Medha prepares requirements and stack decision.
3. **H2 — OHAMS-10/OHAMS-11/OHAMS-12:** Nithin hands over schema, database helpers, seed scripts and architecture.
4. **H3 — OHAMS-13/OHAMS-14/OHAMS-15/OHAMS-16:** Ashish completes backend routes using H2.
5. **H4/H5 — OHAMS-4/OHAMS-17:** Medha hands over shared UI components and patient pages.
6. **H6 — OHAMS-18:** Nithin hands over doctor/admin dashboards.
7. **H7 — OHAMS-19/OHAMS-20:** Ashish integrates and executes the test suite after H3, H5 and H6 are merged.
8. **H8 — OHAMS-21:** Nithin deploys only after integration/build/test gates pass.
9. **H9 — OHAMS-22/OHAMS-23/OHAMS-24/OHAMS-25:** Manya completes the final submission pack using the test report, deployment URL and real Jira/Git history.

## Jira setup notes

- Suggested initial status for every task: **To Do**. Update to In Progress / Done only when that reflects real activity.
- Use the planned start and due dates above as schedule fields, not worklog entries.
- Estimates are person-hours. They do not imply that the work was actually performed.
- The parent/epic column is included for Jira CSV import mapping; epic rows themselves carry zero effort.
- Do not fabricate actual start, actual finish, worklogs, comments or completion status.
- The repository currently documents the key-to-owner mapping. This planning file does not create or modify live Jira issues.

## Assumptions and scope

- Sunday 22 November is treated as a light buffer/review day; no full-day task estimate is allocated to it.
- Existing README and CONTRACT define the product scope. Payments, SMS/email, rescheduling, video calls, medical records, reviews and password reset remain out of scope.
- A story's due date is the planned hand-off date. Same-day dependencies require sequencing within the day (for example, deployment after tests pass).
- The final report must use actual test and deployment outcomes, not assumed results.
