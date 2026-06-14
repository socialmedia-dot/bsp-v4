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
| **P3** | Offer | P2 approved | School issues offer, Student accepts | Accepted → P4, Declined → Closed |
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
