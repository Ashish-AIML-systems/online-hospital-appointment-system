# Student 4 — Manya

**Your part:** the project management documents — cost estimation, schedule, risk analysis, and the final report.
**Jira:** OHAMS-7 (epic), OHAMS-22, OHAMS-23, OHAMS-24, OHAMS-25.
**Read first:** [README](../../README.md) and [CONTRACT](../CONTRACT.md).

---

## 1. Your hand-off (copied from CONTRACT §8 — do not change)

| # | START (must already exist) | END (you hand over, exact paths) | Needed by |
|---|---|---|---|
| **H9** project documents | README, CONTRACT, H1 (`docs/requirements.md`), H2 (`docs/architecture.md`, database), H7 (`docs/test-report.md`), H8 (live URL), the Jira board | `docs/project/cost-estimation.md`, `docs/project/schedule.md`, `docs/project/risk-analysis.md`, `docs/project/final-report.md` | submission |

## 2. Files you own (only edit these)

```
docs/project/cost-estimation.md
docs/project/schedule.md
docs/project/risk-analysis.md
docs/project/final-report.md
```

You can draft the cost estimate and the risk analysis right away. The schedule needs the Jira board. The final report must wait for H7 and H8.

---

## 3. `cost-estimation.md` (ticket OHAMS-22)

**Method:** effort-based. Cost = estimated hours × a notional hourly rate, plus infrastructure cost.

Starter numbers — replace them with the figures the team agrees on:

| Task group | Owner | Estimated hours |
|---|---|---|
| Requirements and tech stack | Medha | 6 |
| Database and architecture | Nithin | 10 |
| Backend (auth, slots, booking, cancel, notifications) | Ashish | 24 |
| Frontend (patient, doctor, admin pages) | Medha, Nithin | 20 |
| Integration and bug fixing | Ashish | 10 |
| Testing | Ashish | 8 |
| Deployment | Nithin | 4 |
| Documentation and project management | Manya | 12 |
| **Total** | | **94** |

| Item | Amount |
|---|---|
| Labour: 94 h × notional rate ₹300/h (assumption — change if your course gives a rate) | ₹28,200 |
| Infrastructure: Vercel Hobby, Neon Free, GitHub, Jira Free | ₹0 |
| Contingency 10% | ₹2,820 |
| **Total estimated cost** | **₹31,020** |

Sections to write: **Method**, **Assumptions** (rate, free tiers, 4 team members), **Effort table**, **Cost summary**, **Limitations** (estimates, not actuals).

---

## 4. `schedule.md` (ticket OHAMS-23)

Take every date from **Jira**, not from memory: open the OHAMS space → **List** or **Timeline** and read the Start date and Due date columns.

Table to produce (one row per ticket OHAMS-1 to OHAMS-26):

| Ticket | Task | Owner | Planned start | Planned due | Actual finish | Status |
|---|---|---|---|---|---|---|

- **Planned start / due:** from the Jira columns.
- **Actual finish:** the date the ticket was really moved to Done (Jira shows it in the ticket history). Leave it blank until it is true. If the actual date differs from the plan, keep both — that is normal and is good evidence of real tracking.

Also include: a **Gantt view** (a screenshot of Jira Timeline is enough), a **milestone list** (requirements done, design done, backend done, frontend done, integration done, deployed, report submitted), and the **dependency order** from the README §9 hand-off chain (H0 → H1 → H2 → H3 → H4 → H5/H6 → H7 → H8 → H9).

---

## 5. `risk-analysis.md` (ticket OHAMS-24)

Scoring: Likelihood (1 low – 3 high) × Impact (1 low – 3 high) = Score. Starter register — edit, add, or remove rows to match what the team really faces:

| ID | Risk | L | I | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R1 | Two patients book the same slot | 2 | 3 | 6 | Booking runs in one transaction with `UPDATE … WHERE is_booked = false`; test T12 | Ashish |
| R2 | Merge conflicts between team members | 2 | 2 | 4 | One owner per file (CONTRACT §7); pull requests merged in hand-off order | All |
| R3 | Frontend and backend disagree on JSON shapes | 2 | 3 | 6 | CONTRACT.md is the single source; integration step H7 | Ashish |
| R4 | Missing or wrong environment variables on Vercel | 3 | 2 | 6 | `.env.example`; README §5 checklist; redeploy after any change | Nithin |
| R5 | Database connection limits on serverless | 1 | 2 | 2 | One shared pool in `lib/db.js`; Neon pooled connection string | Nithin |
| R6 | Secrets committed to Git | 2 | 3 | 6 | `.env.local` in `.gitignore`; rotate the secret if it leaks | Ashish |
| R7 | A team member is unavailable | 2 | 2 | 4 | Task files describe every step; another member can take over a hand-off | All |
| R8 | Not enough time before the deadline | 3 | 3 | 9 | Minimal scope (README §1 "Not included"); build in hand-off order; no extra features | All |
| R9 | Date or time-zone mismatch | 2 | 1 | 2 | Dates and times are plain `YYYY-MM-DD` / `HH:MM` strings; server date decides "past" | Ashish |

Sections to write: **Method**, **Risk register** (above), **Top 3 risks** (highest scores) with a short plan each, **Risks that actually happened** (fill in from the project — real ones only).

---

## 6. `final-report.md` (ticket OHAMS-25)

Write it last. Headings, in this order:

1. **Introduction** — problem and goal (3–5 sentences)
2. **Requirements** — summary of `docs/requirements.md` (FR-1 to FR-13)
3. **Design** — summary of `docs/architecture.md`: diagram, tables, appointment workflow
4. **Implementation** — stack, modules, and who built what (use the table in README §9)
5. **Testing** — summary of `docs/test-report.md`: how many tests, how many passed, bugs found
6. **Deployment** — the live URL and how it was deployed
7. **Project management** — one paragraph each for cost, schedule, and risks, linking your three files
8. **Issues faced and how they were solved** — copy from the Jira **Bug** tickets and from the "Fix / note" column of the test report. Real issues only
9. **Conclusion and future work** — what was achieved; ideas that were deliberately left out (README §1 "Not included")
10. **Appendix: team contributions** — one row per student: tickets, files, what they did. Take it from Jira and from the Git history

Sections 5, 8 and 10 must come from the real test report, Jira and Git history, so write them after Ashish and Nithin have finished.

**END of H9:** the four files merged to `docs/project/`, and tickets OHAMS-22 to OHAMS-25 moved to Done as each one is finished.

---

## 7. Done checklist

- [ ] Cost estimate has a method, assumptions, an effort table that adds up, and a total
- [ ] Every date in the schedule matches Jira
- [ ] Risk register has scores and an owner for every row
- [ ] Final report has all 10 headings and links to the other documents
- [ ] Sections 5, 8 and 10 of the report match the test report, Jira and Git
- [ ] You only changed files from section 2
- [ ] Your Jira tickets are moved to Done after each pull request is merged

## 8. Git

Branch `student4-manya` → pull requests into `main`. Commit messages start with the Jira key, e.g. `OHAMS-24 risk register`.
