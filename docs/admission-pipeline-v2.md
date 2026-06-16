# BSP v4 — Admission Pipeline v2 (6 Phases)

**Last updated:** 2026-06-09
**Status:** Spec confirmed by KC, ready for development
**Supersedes:** Earlier 7-phase spec (App / Interview / Decision / Offer / Docs / Visa / Enrolled)

---

## 1. Phase Overview

| # | Phase | Trigger In | Activities | Trigger Out |
|---|-------|-----------|-----------|-------------|
| **P1** | Application | Student submit | School / Consultant receive | → P2 |
| **P2** | Interview + Decision | P1 done | Schedule interview, multi-round reports, Manager decision | Approve → P3, Reject → Closed |
| **P3** | Deposit Exchange | P2 approved | School uploads deposit docs (PDF) → student pays + uploads proof → school confirms | Confirmed → P4 |
| **P4** | Documents | P3 accepted | Submit docs, School verify | Verified → P5 |
| **P5** | Visa / Travel | P4 verified | Apply visa (if needed), Travel arrangement | Arrived → P6 |
| **P6** | Enrolled | P5 arrived | Official enrollment | Done |

---

## 2. P2 — Interview + Decision (Detailed)

### 2.1 Participants

- **Interviewer** — Can be School self-managed OR Consultant (if assigned to lead Phase 2)
- **Manager** — School recruitment manager, sees all reports, makes final decision
- **Reopen authority** — School manager (per phase rules)

### 2.2 P2 Page Layout (single page, role-aware)

```
┌──────────────────────────────────────────────────┐
│  P2 Status: Active | [Mark P2 Complete] button   │
├──────────────────────────────────────────────────┤
│  Section A: Schedule New Interview              │
│  - Default: collapsed if past interviews exist  │
│    / hidden if application closed               │
│  - Date / Time / Location / Interviewer          │
│  - [Schedule Interview] / [Schedule New Round]   │
├──────────────────────────────────────────────────┤
│  Section B: Current Interview (latest round)     │
│  - Round #N details                              │
│  - Interviewer: [Submit Report] button           │
│  - Manager: report displayed inline              │
├──────────────────────────────────────────────────┤
│  Section C: Past Interviews (collapsed default)  │
│  - "Show N past interviews" expandable           │
│  - Each shows: date, interviewer, report summary │
├──────────────────────────────────────────────────┤
│  Section D: Manager Decision Panel (P2 bottom)   │
│  - Lists all submitted reports                   │
│  - [Approve] button → transition to P3 (Offer)   │
│  - [Reject] button → requires reason → closed    │
└──────────────────────────────────────────────────┘
```

### 2.3 Multi-Round Interview Support

- Section A (Schedule New Interview) visibility:
  - **No past interviews** → form open by default
  - **Past interviews exist** → collapsed; click "Schedule New Round" to expand
  - **Application closed** (Approved / Rejected) → Section A hidden
- After schedule submitted: form auto-resets and collapses back (round shown in Section B)
- After report submitted, user can immediately schedule next round via "Schedule New Round"
- Each round = 1 immutable report
- All reports kept in phase history (Section C collapsed by default)
- Use case: 1st interview time unsuitable → schedule 2nd round

### 2.4 Report Submission (per round)

**Form fields:**
- Overall Rating: 1–5 ⭐
- Recommendation: `Recommend` / `Maybe` / `Not Recommend`
- Notes: free text, max 200 chars (short report)

**Behavior:**
- After submit: report **immutable** (cannot edit)
- New round → new report (append mode, never overwrite)
- Report data bound to phase (P2)

### 2.5 Manager Decision Panel (Section D)

**Visible to:** School recruitment manager only (not consultant, not student)

**Inputs:**
- `[Approve]` button → automatic transition to P3 (Offer)
- `[Reject]` button → requires reason text (min 20 chars) → application closed

**P2 → P3 Gate:**
- At least 1 report must be submitted
- Manager decision recorded (Approve or Reject)
- No decision → cannot transition

**No "Hold" outcome option** — Hold effect achieved by scheduling new interview round instead.

### 2.6 P3 (Offer) Manager View of P2 History

When manager opens an application in P3:
- P2 phase card shows "Interview Reports (N rounds)"
- Inline: latest report rating + recommendation badge + interviewer name + date
- Click expand → view notes (200 chars)
- Click "View all reports" → list of all rounds (time-ordered, new → old)
- No aggregation / average — manager judges all reports

---

## 3. Reject & Reopen Rules

**Reopen allowed at:** P1 (Application), P3 (Offer), P5 (Visa)
**No reopen at:** P2 (Interview+Decision), P4 (Documents), P6 (Enrolled)

**Re-open behavior:**
- Re-open resets phase to Active
- All prior reports / data preserved (P2 case keeps report history)
- Can schedule new interview round (P2) or re-issue offer (P3) or re-apply visa (P5)

---

## 4. Cross-Portal Visibility

| Portal | P2 View |
|--------|---------|
| School | Full (Sections A, B, C, D + decision) |
| Consultant (assigned to P2) | Sections A, B, C (can schedule + submit report, no Section D) |
| Consultant (not assigned) | Zero access |
| Student | Read-only: Section B current + Section C history |
| BSP Staff | Full read, write only when assigned |

---

## 5. Ref Format

`YYYY-XXXXXXXX` (year first, no BSP prefix, random 8 chars)
Example: `2026-X7K9M2P4`

---

## 6. Data Lifecycle

- 365d active → 365d archive → delete at 730d
- Auto-notify day 700 / 720 / 729 before deletion
- PDF export available for all stakeholders

---

## 7. Pages Affected by This Spec

| Page | Change Required |
|------|-----------------|
| `/school/applications/[ref]/` | Add Section D (Manager Decision Panel) |
| `/school/admissions/` | List view: add "Decision Pending" status |
| `/student/applications/[ref]/` | Display P2 reports (read-only) |
| `/consultant/applications/[ref]/` | Show P2 reports + submit UI if assigned |
| Phase status badges | Update labels for new 6-phase structure |

---

## 8. Out of Scope (Future)

- Re-apply flow after rejection
- Bulk decision (multi-application approval)
- Email notification on decision
- Manager delegation (assigning decision authority)

---

## 9. Rejected State Display Pattern (Global)

**Scope:** All reject buttons across P2, P3, P4, P5, P6 (and any future reject action) MUST use the same display pattern.

**Component:** `components/RejectedBanner.vue` (reusable, drop-in)

**Placement:** Top of any application detail page, immediately after the demo banner and before the phase timeline. Banner must be the first content the user sees on a rejected application.

**Required content:**
- ❌ icon (visual cue)
- "APPLICATION REJECTED" title (uppercase, prominent)
- Reason text (highlighted box, from the decision record)
- "Decided by <name>" + "Decided at <datetime>" metadata
- Warning note: "This application is closed. No further actions can be taken."

**Visibility rule:** Banner shows only when `decision.outcome === 'rejected'`. Approved / Pending decisions do NOT show this banner.

**Accessibility:** `role="alert"` + `aria-live="assertive"` so screen readers announce the rejected state.

**Reuse:** Any phase page (P2, P3, P4, P5, P6) that has a reject button MUST mount this banner using the latest decision for that phase. Example:
```vue
<RejectedBanner :decision="latestDecision" />
```

---

## 10. Reopen Authority

(Pending)

---

## 11. Rejected State — Hidden Action Buttons (Global)

**Scope:** All phases of the application detail page (P1, P2, P3, P4, P5, P6, P7) when the application is in `rejected` status.

**Rule:** When `application.status === 'rejected'`, **all action buttons MUST be hidden**. The page should become **read-only** for previously entered data. The **only interactive element permitted** is the **Reopen Application** button.

**Buttons to hide on rejection (NOT exhaustive — apply the principle to any new action):**

| Location | Button | Reason |
|---|---|---|
| Header | `Restart` | Reset control — not allowed on closed apps |
| P1 — Student Info | `✏️ Update Info` | Data correction — frozen once rejected |
| P1 — School Actions | `📅 Schedule Interview (In-House)`, `🤝 Delegate to Consultant`, `❌ Reject` | No further action allowed |
| P2 — Section B | `📤 Submit Report` | No new reports after rejection |
| P2 — Section D | `✅ Approve`, `❌ Reject`, `Confirm Reject`, `Cancel` | Already gated by `!latestDecision`, but verify the form is hidden on rejection too |
| P2 — Section D | `✅ Mark P2 Complete` | No phase transition after rejection |
| P3 — School Actions | `🎓 Make Offer`, `❌ Reject` | No further action |
| P4 — School Actions | `📄 Upload Offer Letter`, `💰 Mark Deposit Received` | No further action |
| P5 — School Actions | `📁 Upload Documents`, `✅ Mark Documents Ready` | No further action |
| P6 — School Actions | `🛂 Update Visa Status`, `✈️ Confirm Travel Arranged` | No further action |
| P7 — School Actions | `📋 View Student Record` | No further action (P7 not reachable when rejected) |
| All phases | Consultant Assignment (`👤 Assign / Change Consultant`) | No further state change |

**Consultant Assignment — Phase Lock (2026-06-15 update):**

- Consultant can be **assigned or changed** in **P1 (Application)** and **P2 (Interview + Decision)**.
- Once the application enters **P3 (Deposit Exchange) or later**, the consultant assignment is **locked** — the section becomes read-only and shows the assigned consultant's name with a 🔒 indicator and a short reason. The P1 phase header still shows the consultant name in the info grid (read-only display).
- **Reason:** P3 = financial transaction. The consultant of record is part of the deposit audit trail; changing it post-P3 would break chain-of-custody.
- **Applies to both** the current `window.prompt()` handler (legacy) and the future pool picker modal (per pending pool picker spec).
- **Click-test scenarios:**
  - (a) P1 active, no consultant assigned → section shows `👤 Assign Consultant` button. Click opens picker.
  - (b) P2 active, consultant assigned → section shows `👤 Change Consultant` button. Click opens picker.
  - (c) P3+ active (any phase ≥ 3) → section shows `🔒 Consultant (Locked)` with name + reason, no button.
  - (d) Restart app back to P1 → section reverts to editable (button visible again).

**What stays visible (read-only data):**

- `RejectedBanner` at top (always shown on rejection — see Section 9)
- Phase Timeline (full history)
- Phase 1: Student Info display, Application Details, Notes, Attachments
- Phase 2 Section B: Current Interview details (read-only — no form)
- Phase 2 Section C: Past Interviews list (read-only — show/hide toggle OK as UI control)
- Phase 2 Section D: All Reports list, Decision Summary (✅ Approved / ❌ Rejected + reason + decidedBy + decidedAt)
- All past-phase cards (collapsed, expandable for review)
- `🔄 Reopen Application` button (the ONE action allowed)

**Allowed UI controls on a rejected page:**

- The phase row chevron (▸/▾) to expand/collapse past phases — data viewing only
- The "Show N past interviews" toggle in P2 Section C — data viewing only
- Any purely informational disclosure (no state mutation)

**Implementation hint:**

```vue
<!-- Add a computed for clarity -->
const isRejected = computed(() => application.value.status === 'rejected')

<!-- Wrap any action button / button group with v-if="!isRejected" -->
<div v-if="!isRejected" class="action-buttons">
  <button class="btn-approve" @click="scheduleInHouse">📅 Schedule Interview (In-House)</button>
  ...
</div>
```

**Rationale:**

- Prevents accidental data mutation on a closed application
- Reinforces that rejection is a terminal state (only Reopen can revive it)
- Makes the Reopen button the single obvious escape hatch
- Read-only data display preserves the audit trail (why rejected, when, by whom) for review

**Reuse:** This rule applies to ALL phases globally, not just P2. When new phase action sections are added, apply the same `v-if="!isRejected"` guard.

**State sync (P2 reject path):** When the user rejects via the P2 Manager Decision Panel (`onMakeDecision('rejected')`), the function MUST update **both** the p2 store (canonical P2 data) AND the local `application.value.status` (drives the page header badge + `isRejected` guard). Forgetting the local update leaves `isRejected === false` even though the p2 store correctly recorded the rejection — all action buttons would remain visible, breaking the read-only contract.

---

## 12. Reopen Restores to Prior Phase (Reject Phase Preservation)

**Rule:** When the school reopens a rejected application, the application returns to **the phase it was in at the moment of rejection** (not always Phase 1). The reject-time phase is stored in a new `application.previousPhase` field, recorded by every reject path immediately before flipping `status = 'rejected'`.

**Examples:**

| Reject Path | `currentPhase` at reject | `previousPhase` stored | Reopen returns to |
|---|---|---|---|
| P1 — ❌ Reject | 1 | 1 | P1 (Application Submitted) |
| P2 — Manager ❌ Reject | 2 | 2 | P2 (Interview + Decision) |
| (Future) P3 — ❌ Reject | 3 | 3 | P3 (Offer) |
| (Future) P4 — ❌ Reject | 4 | 4 | P4 (Offer & Acceptance) |
| ... | ... | ... | ... |

**Why this rule (and not always P1):** Rejecting in P2 (after interview + report) and being forced to redo P1 (Application Submitted) wastes the work already done. The reopen should put the school back at the decision point so they can correct course without re-entering data they've already collected.

**Implementation hint:**

```js
// Reject path (any phase) — record before mutating status
application.value.previousPhase = application.value.currentPhase
application.value.status = 'rejected'

// Reopen path — read back
const targetPhase = application.value.previousPhase || 1   // legacy fallback
application.value.currentPhase = targetPhase
application.value.subStatus = phaseLabelOf(targetPhase)
application.value.previousPhase = null  // clear so next reject records fresh
```

**Phase history reset on reopen (preserve audit trail):**

- Phases **before** `targetPhase`: leave intact ("Completed", with original `date` and `notes`) — these are audit trail
- Phase **equal to** `targetPhase`: mark "In Progress" and stamp today's date
- Phases **after** `targetPhase`: reset to "Pending" (clear `date` and `notes`)

**Legacy data:** For applications rejected before this field existed (no `previousPhase` set), the reopen falls back to Phase 1. The user is shown "It will return to Phase 1 (Application Submitted)." in the confirm dialog.

**Confirm message:** The confirm dialog MUST reflect the actual target phase so the user sees where the application will land before confirming:
- "Reopen this rejected application? It will return to Phase 1 (Application Submitted)."
- "Reopen this rejected application? It will return to Phase 2 (Interview + Decision)."
- etc.

**Reopen also clears the manager decision (P2 + future phases):**

When an application is rejected in P2 (or any future phase that has a Manager Decision), the manager's reject decision is recorded in the p2 store's `_decisions` array. On Reopen, that decision MUST be voided so the user can make a fresh decision at the restored phase.

**P2 store function `reopenApp(appRef)`:**

```ts
function reopenApp(appRef: string): void {
  // 1. Remove all decisions for this app (they were voided by reopen)
  _decisions.value = _decisions.value.filter(d => d.applicationRef !== appRef)
  saveArray(KEYS.decisions, _decisions.value)
  // 2. Reset the app's status from 'rejected' back to a sensible default.
  const app = getApplication(appRef)
  if (app && app.status === 'rejected') {
    const reports = getReports(appRef)
    if (reports.length > 0) {
      app.status = 'pending-decision'
      app.subStatus = 'Decision Pending'
    } else {
      app.status = 'active'
      app.subStatus = app.currentPhase >= 2 ? 'Interview & Assessment' : 'Application Submitted'
    }
    _applications.value = [..._applications.value]
    saveArray(KEYS.applications, _applications.value)
  }
}
```

**Page reopenApplication flow (updated):**

```js
function reopenApplication() {
  const targetPhase = application.value.previousPhase || 1
  const phaseLabel = /* look up phase label */
  if (!confirm(`Reopen this rejected application? It will return to Phase ${targetPhase} (${phaseLabel}).`)) return
  // 0. Clear the manager decision(s) for this app in the p2 store so the
  //    Manager Decision form (gated by `!latestDecision`) reappears.
  p2.reopenApp(id)
  // 1. Update local application ref
  application.value.status = 'active'
  application.value.currentPhase = targetPhase
  application.value.subStatus = phaseLabel
  // ... phase history reset
}
```

**What stays after reopen (audit trail):**
- All interview rounds and reports (the work the school did is preserved)
- Phase history for earlier phases (still marked "Completed")
- The rejected banner is gone (because `isRejected === false`)

**What is cleared on reopen:**
- Manager decision(s) for this app — the user can make a fresh decision
- The app's `status` and `subStatus` in the p2 store (reset to `pending-decision` or `active`)
- **Schedule section UI state** (`scheduleExpanded = false`, `scheduleForm` cleared) — see "Reopen restores Schedule section UI state" below

**Reopen restores Schedule section UI state (P2):**

When the user clicks Reopen after a P2 reject, the Schedule section (P2 Section A) must show the **collapsed default state** with the "➕ Schedule New Round" button — NOT a stale expanded form with old input values.

**Why:** Before rejecting, the user may have already expanded the Schedule form (e.g. clicked "➕ Schedule New Round" or opened the form to schedule another round). That expansion was a transient UI state (`scheduleExpanded.value = true`) and the form fields may hold partial input. After reopen, the user is back at P2 with rounds + reports preserved as audit trail — so the natural next action is to **schedule another round**, which means the user expects to see the collapsed "➕ Schedule New Round" button (not a leftover expanded form). Forgetting this reset also makes it look like "Schedule button not showing after reopen" because the visible button is in the form body, not the prominent collapsed-state affordance the user expects.

**Implementation (page `reopenApplication` flow):**

```ts
function reopenApplication() {
  // ... existing targetPhase + p2.reopenApp(id) + application.value reset ...

  // Reset Schedule section UI state so the collapsed "Schedule New Round"
  // button shows (not a stale expanded form from before the rejection).
  // See docs §12 "Reopen restores Schedule section UI state".
  scheduleExpanded.value = false
  scheduleForm.value = { date: '', time: '', location: '', interviewer: '', agenda: '' }
}
```

**Where this matters in the order:**

This reset is a UI concern (Schedule section's local ref state), separate from the p2 store's data state (interviews, reports, decisions). Both must be cleared for the post-reopen UX to be correct: store-side data must reflect the reopen (already handled by `p2.reopenApp(id)`), and page-side UI must reflect the reopen (this reset).

**Click-through demo flow after P2 reject + reopen:**

1. After Reopen, the user is back at P2 with all interviews + reports visible
2. **Schedule section (Section A) shows collapsed state** with "➕ Schedule New Round" button (NOT a stale expanded form)
3. The "Make a Decision" form reappears with ✅ Approve / ❌ Reject buttons (since `latestDecision` is now undefined)
4. Click ✅ Approve → new decision recorded, form hides, summary shows ✅ Approved
5. Click ✅ Mark P2 Complete → advance to P3
6. Continue P3 → P4 → ... → P7

---

## 13. Confirm Reject Button — No Silent Disabled (UX rule)

**Rule:** The "Confirm Reject" button in the P2 reject form MUST NOT use the `:disabled` attribute. Always allow the click. If there is any required-field validation, it happens inside the `onMakeDecision` handler with a clear, actionable alert.

**Rationale:**
- A disabled button with no visual disabled state (no `cursor: not-allowed`, no greyed-out color) looks identical to an enabled button. Users click it and nothing happens → bug report.
- Allowing the click + showing a descriptive alert gives the user immediate, actionable feedback.

**Current P2 form fields:** The rejection reason textarea is **optional** (no minimum length, no required check). This was a deliberate relaxation: the manager may reject with a short reason ("Insufficient academic evidence") or no reason at all. The Confirm Reject button is therefore always clickable, with no validation in the handler at all.

**Scope:** This rule applies to the **Confirm Reject** button in the P2 decision form. Other "submit" buttons in the app (Schedule Interview, Submit Report, etc.) keep their existing validation patterns.

**Implementation:**
```vue
<!-- ✅ Good: always clickable, no validation needed (reason is optional) -->
<button @click="onMakeDecision('rejected')">Confirm Reject</button>
```

```js
function onMakeDecision(outcome) {
  // For P2, no min-length validation on rejection reason — reason is optional.
  // Only the "at least 1 report submitted" guard remains.
  if (allReports.value.length === 0) {
    alert('At least 1 interview report must be submitted before deciding.')
    return
  }
  // ... continue with decision logic
}
```

---

## 14. Restart = Full Clean Slate (No Preset Records)

**Rule:** Clicking the **Restart** button (top-right of the application detail page) MUST fully reset the application to a clean P1-fresh state with **no pre-populated records**. This enables the click-through demo: after Restart, the user can advance P1 → P2 → P3 → … → P7 from a clean slate.

**What Restart MUST clear:**

1. **Page-level state** (in `pages/school/applications/[id].vue`):
   - The `application` ref resets to `defaultMock` (P1 fresh, status=`active`, currentPhase=1, subStatus=`Application Submitted`)
   - `expandedPhases` is reset to `[]` (collapse all past-phase cards)
   - The page's localStorage key (`bsp:school:app:<id>`) is removed
2. **P2 store state** (in `composables/useP2Store.ts`):
   - `_interviews` → `[]` (no pre-populated rounds)
   - `_reports` → `[]` (no pre-populated reports)
   - `_decisions` → `[]` (no pre-populated decisions)
   - All three keys persist empty arrays to their respective localStorage entries
3. **Seed data (no preset records at all):**
   - `SEED_INTERVIEWS = []` — never auto-load any sample interviews
   - `SEED_REPORTS = []` — never auto-load any sample reports
   - `SEED_APP` starts at **P1** (not P2), `status: 'active'`, `subStatus: 'Application Submitted'`, `consultantAssignedToP2: false`
   - This way, even a hard refresh of `/school/applications/2026-X7K9M2P4/` lands the user at a clean P1 with no preset data

**Why no preset records:** Previous versions seeded two completed interview rounds + two reports to make the P2 demo page "look real". This backfired when the school wanted to do a fresh end-to-end demo — old data kept reappearing, and the user had to manually delete rounds to start clean. Now there is no seed data to clean up; the user starts at P1 and creates everything themselves.

**P2 store function `clearAllData()`:**

```ts
// Wipes interviews, reports, decisions. Persists empty arrays to localStorage.
// Applications is intentionally kept so getApplication(id) still resolves.
function clearAllData() {
  _interviews.value = []
  _reports.value = []
  _decisions.value = []
  saveArray(KEYS.interviews, _interviews.value)
  saveArray(KEYS.reports, _reports.value)
  saveArray(KEYS.decisions, _decisions.value)
}
```

**Page `restartApplication` flow:**

```js
function restartApplication() {
  if (!confirm('Restart this application? ...')) return
  // 1. Clear P2 store (interviews, reports, decisions) and persist
  p2.clearAllData()
  // 2. Clear page's own localStorage for this app
  localStorage.removeItem(STORAGE_KEY.value)
  // 3. Reset application ref to defaultMock (P1 fresh)
  application.value = clone(defaultMock)
  // 4. Reset UI: collapse expanded phases, scroll to top
  expandedPhases.value = []
  saveState()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

**Click-through demo flow (post-Restart):**

1. Land on P1, status=`active`, subStatus=`Application Submitted` — no preset data
2. Click `📅 Schedule Interview (In-House)` → advance to P2
3. P2 Section A: fill in date/time/location/interviewer → click `Schedule` → 1 round appears in Section B
4. Fill in report form → click `📤 Submit Report` → report shows in Section D's reports list
5. Manager Decision: `✅ Approve` (or `❌ Reject` with optional reason) → Decision Summary appears
6. Click `✅ Mark P2 Complete` → advance to P3
7. P3: `🎓 Make Offer` → advance to P4
8. P4: `📄 Upload Offer Letter` or `💰 Mark Deposit Received` → advance to P5
9. P5: `✅ Mark Documents Ready` → advance to P6
10. P6: `🛂 Update Visa Status` or `✈️ Confirm Travel Arranged` → advance to P7
11. P7: `📋 View Student Record` → "Enrolled"

**Audit trail preserved:** The `phaseHistory` is reset by the underlying `application.value = clone(defaultMock)` (P1 only has P1 marked "In Progress"; P2-P7 are "Pending"). This is the same shape as a fresh application.

---

## 15. P2 Action-Priority Section Ordering (2026-06-11)

**Rule:** The P2 page (🎤 Phase 2 — Interview + Decision) renders its 4 sub-sections (A: Schedule, B: Current Interview, C: Past Interviews, D: Manager Decision) in a **dynamic order determined by action priority**, so the school sees the most relevant action at the top — no scrolling required.

**Plus:** A persistent "Next Action" callout at the top of the P2 container states the single most important next step in plain language.

### 15.1 Why

P2 has 4 distinct sub-states (no interview / awaiting report / ready to decide / decision made). A fixed order [A, B, C, D] always puts "Schedule New Interview" at the top, but for a school that has already scheduled an interview and submitted a report, the most relevant action is the **Manager Decision form**, not scheduling another round. The user should not have to scroll to find the right CTA.

### 15.2 Section order by state

| State | Condition | Section order (top → bottom) | Why |
|-------|-----------|------------------------------|-----|
| S0 — No interview | `!hasAnyInterview` | **A** (expanded), B, C, D | School needs to schedule the first round |
| S1 — Awaiting report (current user is interviewer) | `latestInterview && !currentInterviewReport && isCurrentUserInterviewer` | **B** (with report form), A (collapsed), C, D | School must submit the report to unblock decision |
| S2 — Awaiting report (current user is NOT interviewer) | `latestInterview && !currentInterviewReport && !isCurrentUserInterviewer` | **B** (with "awaiting" message), A (collapsed), C, D | School waits for the interviewer; can optionally schedule another round |
| S3 — Reports in, no decision | `allReports.length > 0 && !latestDecision && interviews.length > 0` | **D** (with Approve/Reject form), B (report summary), A (collapsed), C | School must make the final decision |
| S4 — Decision made (approved) | `latestDecision.outcome === 'approved'` | **D** (summary + Mark P2 Complete), B (report summary), A (hidden), C | School should now mark P2 complete to advance |
| S4 — Decision made (rejected) | `latestDecision.outcome === 'rejected'` | **D** (summary), B (interview data), C (past) | (n/a — rejection triggers read-only state; RejectedBanner shows the rejection + Reopen button at the top of the page) |

**Legend:** A = Schedule, B = Current Interview, C = Past Interviews, D = Manager Decision

### 15.3 Implementation

**File:** `pages/school/applications/[id].vue`

**Two computeds:**

```js
const p2SectionOrder = computed(() => {
  const hasIv = hasAnyInterview.value
  const latestIv = latestInterview.value
  const latestHasReport = !!currentInterviewReport.value
  const hasDec = !!latestDecision.value

  if (isRejected.value) return ['B', 'C', 'D']   // no actions
  if (hasDec) return ['D', 'B', 'A', 'C']        // summary + Mark Complete at top
  if (!hasIv) return ['A', 'B', 'C', 'D']        // schedule first
  if (latestIv && !latestHasReport) return ['B', 'A', 'C', 'D']  // submit report
  return ['D', 'B', 'A', 'C']                    // make decision
})

const p2NextAction = computed(() => {
  if (isRejected.value) return null
  if (latestDecision.value) return { title: '✅ Decision Made', subtitle: 'Review the decision summary below and click "Mark P2 Complete" to proceed to Phase 3 (Offer).' }
  if (!hasAnyInterview.value) return { title: '📅 Schedule the First Interview', subtitle: 'No interview has been scheduled yet. Start by scheduling Round 1 in the section below.' }
  if (latestInterview.value && !currentInterviewReport.value) {
    if (isCurrentUserInterviewer.value) return { title: '📝 Submit Your Report', subtitle: `Round #${latestInterview.value.roundNumber} is complete. Fill in your rating and notes, then submit.` }
    return { title: '⏳ Awaiting Report', subtitle: `Waiting for ${latestInterview.value.interviewer} to submit their report for Round #${latestInterview.value.roundNumber}.` }
  }
  return { title: '👔 Make a Decision', subtitle: 'All interview reports are in. Review them below and click Approve or Reject.' }
})
```

**Template:** Sections are rendered inside a `<template v-for="sectionKey in p2SectionOrder" :key="sectionKey">` loop. Each section is gated by `v-if="sectionKey === 'A' | 'B' | 'C' | 'D'"`. The Next Action callout sits above the loop.

**CSS:** New `.p2-next-action` class — light blue gradient banner with a thick left border, "NEXT ACTION" label, title, and subtitle. Distinct from `.p2-toast` (success-green) and `.p2-section` (neutral).

### 15.4 Empty-state message fix

The old message in Section B's empty state said "Use Section A above to schedule the first round." — this is misleading when Section A is rendered *below* Section B (states S1/S2). Replaced with neutral copy: "No interview scheduled yet. Schedule one to begin Phase 2."

### 15.5 Click-test scenarios (post-deploy)

| Scenario | Expected section order (top → bottom) | Expected callout |
|----------|--------------------------------------|------------------|
| Open P2 demo, no interview yet | A (Schedule, expanded) → B (empty) → C (empty) → D (empty) | "📅 Schedule the First Interview" |
| Schedule Round 1, switch to interviewer account | B (with report form) → A (collapsed) → C (empty) → D (no decision) | "📝 Submit Your Report" |
| Submit the report | D (Approve/Reject form) → B (report summary) → A (collapsed) → C (empty) | "👔 Make a Decision" |
| Click ✅ Approve | D (summary + Mark P2 Complete) → B (report summary) → A (hidden) → C (empty) | "✅ Decision Made" |
| Reopen after rejection (state S5) | B (read-only data) → C (empty) → D (summary) | (no callout — `p2NextAction` returns null when rejected) |

**Verification:** `grep -c "p2-next-action\|NEXT ACTION\|Schedule the First Interview\|Submit Your Report\|Make a Decision\|Awaiting Report\|Decision Made"` against the deployed `_id_.*.js` bundle — all markers should return ≥ 1.

## 16. P3 — Deposit Exchange (2026-06-15)

**Rule:** P3 is a 3-step deposit exchange: (1) School uploads deposit documents (PDF/JPG/PNG, max 5MB each) — bank details, amount, deadline, payment instructions must be ON the uploaded file, NOT in a separate form; (2) Student downloads documents, pays, and uploads payment proof; (3) School confirms receipt. P3 is "confirmed" → P4 unlocked.

**Layout (school page):**

```
┌─────────────────────────────────────────────────┐
│  💰 Phase 3 — Deposit Exchange     [Status pill]│
│  Upload deposit documents for the student,      │
│  receive proof, confirm receipt.                │
├─────────────────────────────────────────────────┤
│  📎 Documents for Student                       │
│  Upload deposit form, payment instructions, or  │
│  any document the student needs. PDF/JPG/PNG.   │
│  ─────────────────────────────────────────────  │
│  [📄 Sent files list — already uploaded]        │
│  ─────────────────────────────────────────────  │
│  [📎 Pending files queue — not yet sent]        │
│  ─────────────────────────────────────────────  │
│  [Choose file]  [Send to Student] or            │
│                  [Add to Student]               │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  📥 Student Submitted Files  ▶️ (N)  [✅]       │  ← collapsible toggle
│  ─────────────────────────────────────────────  │
│  [📄 Student files list (download links)]       │
│  ─────────────────────────────────────────────  │
│  📥 Confirm Deposit Receipt                     │  ← only when status !== 'sent_to_student'
│  [Student's uploaded proof + Confirm button]    │
│  [Helper text variants — see §16.1.1 rev 2.1]  │
└─────────────────────────────────────────────────┘
[✅ Confirmed banner — P3 complete]
```

**Sections:**
- **Section A: Documents for Student** (primary action, always present)
  - File input is ALWAYS available — only hidden when `p3Latest?.status === 'confirmed'`
  - Two button states based on `p3Latest`:
    - `!p3Latest` → button: **"📤 Send to Student"** (`btn-primary`, disabled when `p3NewFiles.length === 0`). Calls `onP3Send` which creates a new deposit record with queued files + empty `bankInfo: {}`.
    - `p3Latest && p3Latest.status !== 'confirmed'` → button: **"📎 Add to Student"** (`btn-secondary`, disabled when `p3NewFiles.length === 0`). Calls `onP3AddFiles` which appends to the existing record.
  - "📤 Send to Student" validation: requires ≥1 file queued. No bank details required (those are on the file).
- **Section B: ~~Bank / Payment Details~~ — REMOVED.** Bank info lives on the uploaded PDF. No typed bank form. The deposit record stores `bankInfo: {}` (empty).
- **Section B2: Student Submitted Files + Confirm Receipt** (collapsible toggle, when `p3Latest` exists). Toggle shows `▶️ / 🔽` icon, count badge `(N)` = `studentFiles.length`, and `✅` indicator when `studentReadyForReview` is true. When expanded, the body shows:
  1. The student's uploaded files list (download links + timestamps, read-only audit trail).
  2. The student's uploaded proof display + "✅ Confirm Receipt" button (when `status !== 'sent_to_student'`). Enablement + helper text per §16.1.1 rev 2.1.
- **Confirmed banner** (only when `p3Latest.status === 'confirmed'`).

**Sent files are read-only (2026-06-15 update):**
- Once a file is in `p3Latest.schoolFiles` (i.e. has been sent to the student via "Send to Student" or "Add to Student"), the school CANNOT delete it. The file row shows only the download link (`<a>` tag with the file name as anchor text), upload timestamp, and **NO remove button** — not before, not after student proof upload, not after confirmation.
- This applies to ALL statuses: `sent_to_student`, `proof_uploaded`, and `confirmed`.
- Rationale: the student may have already seen / paid / acted on the file. Removing it would break the audit trail. If a wrong file was sent, the school should send a corrected file via "Add to Student" (the old one remains visible for both parties).
- Pending files in the queue (`p3NewFiles`, not yet sent) CAN be removed via the queue's remove button. This is local state — only becomes a sent file when the user clicks "Send to Student" or "Add to Student".
- Implementation: the `<button class="p3-file-remove">` on the sent files list is removed entirely. The pending queue's button is unchanged. The store's `removeSchoolFile` function is kept (dormant) for potential future admin / correction flows.
- Defensive note: the spec rule is a UI rule. The store primitive is not gated. A future agent who re-introduces the button should also add an explicit "Why sent files are read-only" comment so they don't reverse the rule by accident.

### 16.1 Student-to-school file exchange (2026-06-15 update)

**Rule:** Asymmetric to the school's `schoolFiles` mechanism, the student can now also send **multiple** files to the school via a new "📤 Send Files to School" section on the student P3 view. Once sent, files are read-only on the student side (mirror of the school's read-only rule above). The school sees them in a new "📥 Files from Student" section, also read-only (audit trail).

**Why this exists:** The school's `schoolFiles` already supports N files. The student's contribution was limited to a **single** deposit proof (`proofFileName/proofFileData/proofUploadedAt`) which doubles as a status-changing action. KC needs a general-purpose multi-file channel for the student to send back signed forms, additional supporting documents, replies to school questions, etc. — without conflating those exchanges with the canonical "I have paid" proof.

**Storage:** New `studentFiles: P3Attachment[]` field on `P3Deposit` (mirror of `schoolFiles`):

```ts
interface P3Deposit {
  // ... existing fields ...
  schoolFiles: P3Attachment[]   // documents school sends to student
  studentFiles: P3Attachment[]  // documents student sends to school (NEW, 2026-06-15)
  // ... existing fields ...
}
```

**localStorage migration:** Existing deposit records persisted before this change are missing `studentFiles`. The store's `load()` MUST back-fill `studentFiles: []` on every read so old records don't crash the read path. Same defensive pattern as the existing `schoolFiles` migration.

**Distinction from deposit proof (do not conflate):**
- The existing `proofFileName / proofFileData / proofUploadedAt` fields stay as-is. They represent the **single** payment proof that drives the `sent_to_student → proof_uploaded` status transition.
- The new `studentFiles` is **general-purpose, multi-file, and does NOT change P3 status**. Uploading files to `studentFiles` is a side-channel for attachments only.
- The student page keeps two completely separate UI surfaces: (1) the "💳 Upload Deposit Proof" action button (existing — drives status), and (2) the "📤 Send Files to School" section (new — general attachments). The two flows MUST NOT collide: use `p3StudentNewFiles` (plural) and `p3StudentFileInput` ref for the new flow, leaving `p3StudentFile` (singular) and `student-p3-file-input` for the existing proof flow.

**Status rules:**
- Student can send files in any non-terminal P3 status: `sent_to_student`, `proof_uploaded`. (Mirror of schoolFiles: cannot add once `confirmed`.)
- Files are **append-only** on the student side after send — no delete button is exposed in the student UI. The store's `removeStudentFile` is kept dormant for potential future admin / correction flows.
- Adding to `studentFiles` does NOT change `status` and does NOT write a `from`/`to` field in the audit log (the `to` field of the audit entry reflects the current unchanged status — purely informational).

**School-side display:** New "📥 Files from Student" section on the school page, rendered as a **collapsible button row** (default collapsed) on the school P3 view. Always visible once a P3 record exists, regardless of whether `studentFiles` has content. Click the button to expand the download list. The school CANNOT delete student files from this list.

**Collapsible button UX (2026-06-15 update):**
- The button is the **primary visual indicator** that the student has submitted files — the count badge `(N)` shows at a glance whether the student has uploaded anything yet.
- Default state: collapsed, shows `▶️ 📥 Student Submitted Files (N)` where N = `studentFiles.length`. Green left-border accent when N > 0.
- Expanded state: shows `🔽 📥 Student Submitted Files (N)` with the file list (download links + upload timestamps) below, or "No files submitted yet — waiting for student." empty state.
- Toggle state is local page state (`showStudentFiles` ref), not persisted. Each page load starts collapsed.
- Same button is rendered in **all P3 statuses** (sent_to_student, proof_uploaded, confirmed) — the count simply stays at the latest value as students append files.

**Click-test scenarios (post-deploy):**

| Scenario | Expected |
|----------|----------|
| (a) Open P3 student page (status = `sent_to_student`) | "📤 Send Files to School" section visible, file input + "➕ Add File" button. No sent files yet → "No files sent yet" empty state. |
| (b) Student adds 1 PDF, then clicks "📤 Send to School" | Section shows PDF in sent list (read-only, no delete). Pending queue empty. New "📥 Files from Student" section appears on school page with same PDF. |
| (c) School refreshes P3 page | New "📥 Files from Student" section visible with the PDF, download link works. |
| (d) Student adds 2nd PDF after sending 1st | First PDF still in sent list (read-only). Second PDF appears in pending queue with ✕ button. Send it → both PDFs in sent list. |
| (e) Status = `confirmed` | Student page: "📤 Send Files to School" section STILL VISIBLE (file input + send button remain open for late submissions / follow-ups). School page: "📎 Documents for Student" file input + "Add to Student" button STILL VISIBLE. The "📥 Files from Student" section remains visible (read-only audit trail). See §16.1.1 (rev 2). |
| (f) Open browser console, check `localStorage['bsp-v4-deposits']` | Each P3 record has both `schoolFiles: [...]` and `studentFiles: [...]`. Audit log has `add-student-file` entries. |

### 16.1.1 School unilateral confirmation + always-open P3 file exchange (2026-06-15, rev 2.1)

**Rule (rev 2.1, supersedes rev 2):** The P3 → P4 advance is controlled by the school **unilaterally** once BOTH:
- `status === 'proof_uploaded'` (student has uploaded the deposit payment proof)
- `studentFiles.length >= 1` (student has sent at least 1 file through the 📤 Send Files to School general file channel)

The school's "✅ Confirm Receipt" button is enabled when both conditions hold. The student's "✅ I've uploaded everything" button is retained as an **advisory notification** (school sees a ✅ indicator on the "📥 Student Submitted Files" toggle) but is **not a prerequisite** for the school to advance.

**Why this changed (rev 2 → rev 2.1):** Rev 2 allowed the school to confirm with `status === 'proof_uploaded'` alone, which meant a student who uploaded only the payment proof (and never sent any other deposit documents like signed forms, refund agreements, etc.) would still let the school advance to P4. That bypassed the file exchange entirely. Rev 2.1 closes that hole by requiring at least one `studentFiles` entry — the student must have used the general file channel at least once. The proof file itself does NOT count (it's a status-changing field, not a general exchange entry). Late supplementary uploads are still always permitted (the file channel is still open after confirm; see below).

**Always-open file exchange:** Both `schoolFiles` and `studentFiles` arrays remain **writable at any phase** — even after `status === 'confirmed'` and `currentPhase >= 4`. This handles real production cases: student discovers they forgot a form AFTER confirmation; school wants to send a follow-up clarification document; auditor asks for a re-scan. The pre-existing read-only rule (each side cannot delete files that have been sent to the other side) is unchanged. The new rule is about *adding* files, not deleting.

**`studentReadyForReview` is now an advisory indicator, not a gate:**
- Student clicks "✅ I've uploaded everything" → `studentReadyForReview = true`. School sees a `✅` indicator on the "📥 Student Submitted Files" toggle button.
- Either side adds a file after student marked ready → `studentReadyForReview` resets to `false` (self-correcting UI, no longer blocking).
- Student can manually click "↩️ Mark as not ready" to undo their confirmation.
- **None of this affects the school's "Confirm Receipt" button enablement** — that button is gated only by `status === 'proof_uploaded' AND studentFiles.length >= 1`.

**Store method changes (rev 2, retained in 2.1):**
- `p3store.addSchoolFile(id, file)` — filter `d.status !== 'confirmed'` removed. Late uploads accepted. `sentAt` only updated when `status !== 'confirmed'` (don't overwrite original send time).
- `p3store.addStudentFile(id, file)` — filter `d.status !== 'confirmed'` removed. Late uploads accepted.
- `p3store.sendDepositForm(id, ...)` — unchanged. Still creates the initial record.
- `p3store.markStudentReady(id)` / `markStudentNotReady(id)` — unchanged. Still advisory.
- `p3store.confirmDeposit(id)` — unchanged. School is the only caller.

**UI changes (rev 2.1):**

Student page (`pages/student/applications/[id].vue`):
- "📤 Send Files to School" section — **always visible** when `p3Latest` exists. File input + queue + send button all stay open.
- "✅ I've uploaded everything" + "↩️ Mark as not ready" buttons — **always visible** when `p3Latest` exists. They continue to set/clear `studentReadyForReview` for the advisory indicator, but the indicator now has no gate function.
- Hint text on the "I've uploaded everything" button: explains it's a courtesy signal AND reminds the student to use the 📤 Send Files to School channel for any documents the school needs to see.

School page (`pages/school/applications/[id].vue`):
- "📎 Documents for Student" file input row — **always visible** when `p3Latest` exists. "📤 Send to Student" / "📎 Add to Student" button stays open. After `confirmed` it stays as "📎 Add to Student" (appendable).
- "📥 Confirm Deposit Receipt" button — enablement binding (relocated into the "📥 Student Submitted Files" toggle body in rev 2.2; see §16.1.2):
  ```vue
  <button
    v-if="p3Latest.status === 'proof_uploaded'"
    class="btn-approve"
    :disabled="!p3Latest.studentFiles || p3Latest.studentFiles.length === 0"
    :title="(!p3Latest.studentFiles || p3Latest.studentFiles.length === 0) ? 'Student has not sent any files through the file exchange yet' : 'Click to confirm deposit receipt and advance to P4 (school is the final authority)'"
    @click="onP3Confirm"
  >✅ Confirm Receipt</button>
  ```
  Helper text variants (replaces the rev 2 hints — three cases now):
  - `studentFiles.length === 0` (gate not met): `⏳ Waiting for student to send at least 1 file through "📤 Send Files to School". Proof alone is not enough — the school needs at least one supplementary document (signed form, refund agreement, etc.).`
  - `studentFiles.length >= 1 && studentReadyForReview === true`: `✅ Student has indicated they're done — you can confirm anytime.`
  - `studentFiles.length >= 1 && studentReadyForReview === false`: `ℹ️ Student hasn't clicked "✅ I've uploaded everything" — but you can confirm anytime if you have what you need.`
- "📥 Student Submitted Files" toggle button — `✅` indicator behavior unchanged (reflects `studentReadyForReview`), but is now informational only.

**State transitions (rev 2.1):**

| From | To | Trigger |
|------|----|---------|
| (none) | `sent_to_student` | School clicks "Send to Student" with ≥1 queued file |
| `sent_to_student` | `proof_uploaded` | Student uploads deposit proof |
| `proof_uploaded` | `proof_uploaded` (indicator reset) | Either side adds a file after student marked ready (advisory flag flips; no status change) |
| `proof_uploaded` | `confirmed` + `currentPhase = 4` | School clicks "Confirm Receipt" — **enabled only when `studentFiles.length >= 1`**. No waiting on `studentReadyForReview`. |
| `confirmed` | `confirmed` (file appended) | Either side adds a file post-confirm (no status change, but audit log entry created) |

**Click-test scenarios (rev 2.1, post-deploy):**

| # | Scenario | Expected |
|---|----------|----------|
| (g) Student uploaded proof, has NOT sent any file through file exchange | School's "Confirm Receipt" button **DISABLED** (new in rev 2.1). Helper text: "⏳ Waiting for student to send at least 1 file through '📤 Send Files to School'. Proof alone is not enough." |
| (h) Student uploaded proof, sent 1 PDF through file exchange, has NOT clicked "I've uploaded everything" | School's "Confirm Receipt" button **ENABLED** (gate met because `studentFiles.length >= 1`). Helper text: "ℹ️ Student hasn't clicked '✅ I've uploaded everything' — but you can confirm anytime if you have what you need." |
| (i) Student uploaded proof, sent 1 PDF, then clicked "✅ I've uploaded everything" | School's "Confirm Receipt" button **ENABLED**. Toggle shows ✅ indicator. Helper text: "✅ Student has indicated they're done — you can confirm anytime." |
| (j) After (i), student adds another file (e.g. supplementary receipt) | `studentReadyForReview` auto-resets to `false`. **Confirm Receipt still enabled** (gate still met, no impact on `studentReadyForReview`). |
| (k) After (i), school clicks "Add to Student" to send a follow-up doc | `studentReadyForReview` auto-resets. Student page shows new school file. **Confirm Receipt still enabled.** |
| (l) Student clicks `↩️ Mark as not ready` after (i) | `studentReadyForReview = false`. **Confirm Receipt still enabled** (no impact on gate). |
| (m) School clicks `✅ Confirm Receipt` | status → `confirmed`, currentPhase → 4, P4 phase card auto-expands. Toast: "✅ Deposit confirmed. P3 complete." |
| (n) `localStorage['bsp-v4-deposits']` after (m) | Deposit has `studentFiles.length >= 1` (gate was met). Audit log has `confirm-deposit` event. |
| **(o) NEW** | After (m), on school page, "📎 Documents for Student" file input + "📎 Add to Student" button **STILL VISIBLE**. School picks a follow-up PDF, clicks Add → file appended to `schoolFiles`. Audit log has new `add-school-file` entry. Student page sees the new file in "📎 Documents from School" section (read-only). |
| **(p) NEW** | After (m), on student page, "📤 Send Files to School" section **STILL VISIBLE**. Student picks a late supplementary doc, clicks Send → file appended to `studentFiles`. School's "📥 Student Submitted Files" section shows the new file. Audit log has new `add-student-file` entry. |
| **(q) NEW** | After (m), student clicks `✅ I've uploaded everything` again → `studentReadyForReview = true`. School sees `✅` indicator. Click `↩️ Mark as not ready` → indicator disappears. Indicator behavior unchanged, just no longer functional as a gate. |

**Defensive note (rev 2.1):** The `confirmDeposit` store method does NOT re-check `studentFiles.length` (mirroring the rev 1 pattern of not checking `studentReadyForReview`). The school page's `onP3Confirm` is the only caller and the button is the only gate, so the store primitive stays open. A future strict mode could re-enable the check via a config flag.

### 16.1.2 Confirm Receipt button relocated into Student Submitted Files (2026-06-16, rev 2.2)

**Rule (rev 2.2):** The "✅ Confirm Receipt" button + proof display + helper text variants move from the standalone **Section C** (a separate `.p3-section` block under the student files toggle) into the **expanded body of Section B2** ("📥 Student Submitted Files"), positioned directly under the student files list. After this change, the previously-separate Section C `.p3-section` block is **deleted** from the school P3 view.

**Why:** KC observed on the demo that separating the confirm action into its own card below the student files toggle made the action feel disconnected from the documents it approves. Co-locating the confirm button with the files list makes the relationship explicit ("I've reviewed these files → confirm"). It also reduces vertical scroll: the bottom of the P3 section is no longer a disjoint "Confirm" card.

**What stays the same (rev 2.2 is pure layout):**
- All enablement logic (`status === 'proof_uploaded' AND studentFiles.length >= 1`).
- All helper text variants (waiting / student ready / advisory — three cases from rev 2.1).
- The `studentReadyForReview` `✅` indicator on the toggle button.
- The toggle's collapsed-by-default behavior (`showStudentFiles` is local page state, persists across renders within a session).
- The audit/event sequencing: `onP3Confirm` is still the single gate for `proof_uploaded → confirmed`.

**What changes (rev 2.2):**
- DOM structure: the standalone `<div class="p3-section">` that previously held the Confirm Deposit Receipt title + proof + button is **removed**. Its contents (proof display + button + three helper text variants) move into `<div class="p3-toggle-body">` of Section B2, after the files list, gated by `v-if="p3Latest && p3Latest.status !== 'sent_to_student'"`.
- Discoverability: when the toggle is collapsed, the confirm action is hidden (same as the files list it sits under). KC must click the toggle to expand and see the button. The count badge `(N)` and the `✅` indicator on the toggle header remain the primary at-a-glance signals.

**Click-test scenarios (rev 2.2, post-deploy):**

| # | Scenario | Expected |
|---|----------|----------|
| (r) | Open school P3 view, status = `sent_to_student`, no student files yet | Section B2 toggle collapsed, shows `▶️ 📥 Student Submitted Files (0)`. No standalone "Confirm Deposit Receipt" card anywhere on the page. |
| (s) | Status = `proof_uploaded`, studentFiles has 0 entries | Click toggle to expand. Body shows "No files submitted yet — waiting for student." + proof display + "✅ Confirm Receipt" button (DISABLED) + waiting helper text. No separate Confirm card. |
| (t) | Status = `proof_uploaded`, studentFiles has 1+ entries, studentReadyForReview = false | Click toggle to expand. Body shows files list + proof + "✅ Confirm Receipt" button (ENABLED) + advisory helper text. No separate Confirm card. |
| (u) | Status = `confirmed` | Click toggle to expand. Body shows files list + proof + `✅ Confirmed` pill (button replaced). No separate Confirm card. Confirmed banner still renders below Section B2. |
| (v) | After clicking "Confirm Receipt" → status flips to `confirmed` | Page re-renders with `✅ Confirmed` pill replacing the button (still inside Section B2 body). Banner appears. No page-level refetch needed. |
| (w) | `localStorage['bsp-v4-deposits']` after confirm | Deposit has `studentFiles.length >= 1`, status `confirmed`, audit log has `confirm-deposit` entry — unchanged from rev 2.1. |

**State transitions:**

| From | To | Trigger |
|------|----|---------|
| (none) | `sent_to_student` | School clicks "Send to Student" with ≥1 queued file |
| `sent_to_student` | `proof_uploaded` | Student uploads deposit proof |
| `proof_uploaded` | `confirmed` | School clicks "Confirm Receipt" |
| (any) | (any) | School can append more files via "Add to Student" before confirmation |

**Data shape — `p3store.sendDepositForm(appRef, bankInfo, files, by)`:**
- `bankInfo` parameter is now always `{}` (empty). The `P3BankInfo` interface stays for forward compatibility (future: OCR the uploaded PDF) but is unused today.

**What stays visible on terminal state (`status === 'confirmed'`):**
- Section A: file list (read-only — uploaded docs are viewable). File input + buttons hidden.
- Section B2 (collapsed toggle): "📥 Student Submitted Files" toggle + ✅ indicator + count badge. When expanded, body shows files list + proof + `✅ Confirmed` pill (replaces the confirm button).
- Confirmed banner.

**State sync invariant:** When Section A's "Send to Student" creates a deposit, the page MUST also be ready to re-render with `p3Latest` now non-null (Section A's "Add" button replaces "Send"). No page-level `application.value` change is needed (deposit record is in `p3store`, not in the local page ref). The `p3Latest` computed auto-updates from the store.

**Restart must clear p3 data** (per Section 14 "Full Clean Restart"): `restartApplication` must call `p3store.clearForApp(id)` AND reset `p3NewFiles.value = []`. Update the Restart confirm message to mention "Clear P3 deposit data".

**Student view "Deposit Form" alert:**
- Old: shows typed bank lines (`Bank: ...`, `Account: ...`, etc.) with dashes when empty
- New: shows the attached documents list with the message "Please open the attached documents for bank details and payment instructions." Falls back to "No documents attached. Please contact the school." if no files.
- Description text: "View bank details and instructions from the school" → "View documents and instructions from the school".

**Click-test scenarios (post-deploy):**

| Scenario | Expected |
|----------|----------|
| (a) School opens P3, no deposit sent yet | File input visible, "📤 Send to Student" button shown (disabled until file picked). No bank form visible. |
| (b) School picks 1 PDF, clicks "Send to Student" | Deposit record created, status `sent_to_student`, "Add to Student" button replaces "Send". Student can see the document in their P3 view. |
| (c) Student opens P3, clicks "Deposit Form" | Alert shows the document list + message about checking the PDF. No dashes. |
| (d) School sent 1 file (status `sent_to_student` or later) | Sent files list shows the file with download link, **no delete button**. Pending queue (if any) still has delete buttons. |
| (e) | After student uploads proof, school reviews | Same as (d) — sent files still have no delete button. The school can only "Add to Student" (append more files) or "Confirm Receipt". |

### 16.1.3 Confirm Receipt block — mobile responsive (2026-06-16, rev 2.3)

**Rule (rev 2.3):** The `.p3-confirm-receipt-block` (Section B2 expanded body) becomes mobile-responsive. On viewports ≤ 768px, the proof display + "✅ Confirm Receipt" button + helper text reflow from a single horizontal row into a stacked column so that no element overflows the viewport and no horizontal scrollbar appears on the page.

**Why:** KC reported on the demo (iPhone SE 375px) that the Confirm Receipt block was overflowing the viewport — the page acquired a horizontal scroll (~240px extra width), the button was pushed past the right edge, and the helper hint box (waiting / ready / advisory) was clipped. Root cause: `.att-row` and `.p3-proof-display` both use `display: flex` with `flex-wrap: nowrap`, which forces all children into one row no matter how narrow the parent gets. The `.att-info` block already had `min-width: 0` (good), but the button and hint box siblings had no such constraint and pushed past the parent edge.

**What stays the same (rev 2.3 is pure CSS):**
- All DOM structure from rev 2.2 (toggle body, proof row, button, three helper text variants).
- All §16.1.1 button enablement logic (rev 2.1): `status === 'proof_uploaded' AND studentFiles.length >= 1`.
- All audit/event sequencing.
- Desktop layout (≥ 769px) is unchanged — `.att-row` stays horizontal so desktop scans cleanly.

**What changes (rev 2.3):**
- `.att-row` gains `flex-wrap: wrap` so the button can wrap to a new line when there isn't enough horizontal space (graceful degradation — works on tablet too).
- `.p3-proof-display` gains `flex-wrap: wrap` for symmetry (defensive — its children include the att-row, and we want the whole block to be allowed to wrap, not just the att-row).
- New `@media (max-width: 768px)` block: `.att-row` switches to `flex-direction: column; align-items: stretch`. The button becomes `width: 100%` so it's tappable across the full width on a phone.
- The `.p3-gate-hint` / `.p3-gate-ready` boxes (block-level, after the att-row) are unaffected — they already wrap correctly. Only their `min-width: 0` is enforced explicitly so they can't push the parent wider than the viewport on iOS Safari's flexbox quirks (mirrors the ChatRoom fix from 2026-06-16).

**Click-test scenarios (rev 2.3, post-deploy):**

| # | Viewport | Scenario | Expected |
|---|----------|----------|----------|
| (x) | iPhone SE (375×667) | Open school P3 view, status = `proof_uploaded`, studentFiles = 0 | Toggle expand → proof row stacks icon / filename / meta on first line; Confirm Receipt button on its own line below, full-width; helper hint below that. `document.documentElement.scrollWidth === 375` (no horizontal scroll). |
| (y) | iPhone SE (375×667) | Same as (x) but studentFiles = 1+ (button enabled) | Same stacking. Button green / enabled, helper text shows "Student has indicated they're done". `scrollWidth === 375`. |
| (z) | iPhone 12 (390×844) | status = `proof_uploaded`, studentFiles = 0 | Same stacking as (x). `scrollWidth === 390`. |
| (aa) | Desktop (1280×900) | status = `proof_uploaded`, studentFiles = 1+ | Unchanged from rev 2.2 — att-row stays horizontal, button on the right. No regression on desktop. |

**State transitions:** Unchanged (rev 2.3 is CSS-only).

### §16.1.1 Dev affordance — temporary (KC 2026-06-15)

**Status:** TEMPORARY — remove when the student-side P3 page (`pages/student/applications/[id].vue`) is built.

**Why:** Student page isn't built yet, so school admins have no way to receive student input during dev/testing of the P3→P4 confirm flow.

**What it does:** A dev-mode panel at the bottom of the school's P3 section exposes a single button that fakes the missing student actions in one click:

1. Calls `p3store.sendDepositForm(id, {}, [], 'school-admin (dev sim)')` — only if no deposit record exists yet.
2. Calls `p3store.uploadDepositProof(id, {name, dataUrl}, 'school-admin (dev sim)')` — transitions status to `proof_uploaded`.
3. Calls `p3store.addStudentFile(id, {name, dataUrl, uploadedAt, uploadedBy}, 'school-admin (dev sim)')` — adds 1 file to `studentFiles`.
4. Calls `p3store.markStudentReady(id, 'school-admin (dev sim)')` — sets the advisory `studentReadyForReview` flag.

After the click, the school's "✅ Confirm Receipt" button is enabled (per the rev 2.1 gate), and KC can continue testing the rest of the P3→P4 flow.

**Audit signature:** All four actions above stamp `by: 'school-admin (dev sim)'` so the simulated entries are trivial to grep, filter, and remove when the real student flow lands.

**Removal checklist (when student P3 page is built):**
1. Delete `onDevSimulateStudentResponse()` from `pages/school/applications/[id].vue` (search for `🔬 DEV affordance`).
2. Delete the `<div class="p3-dev-panel">` block from the same file.
3. Delete the `.p3-dev-panel` / `.p3-dev-title` / `.p3-dev-note` / `.btn-dev` CSS block.
4. Delete this whole `### §16.1.1 Dev affordance` section from this doc.


