# BSP v4 — Admission Pipeline v2 (rev 3.0)

**Last updated:** 2026-06-17
**Status:** Spec confirmed by KC, ready for development
**Supersedes:** rev 2.x (6 phases: Application / Interview+Decision / Deposit Exchange / Documents / Visa+Travel / Enrolled)

**Rev 3.0 changes (2026-06-17):**
- **§1 Phase rename:** P3 "Deposit Exchange" → **P3 Offering**; P4 "Documents" → **P4 Admission Documents**; P5 "Visa / Travel" → **P5 Pre-Departure** (merged visa + travel); P6 unchanged
- **§17 (NEW) Document Template System** — school settings configures default document templates per phase; auto-populate to application; student can add/remove individual docs
- **§18 (NEW) P5 Visa Step Detail** — conditional sub-step visibility based on `visaRequested`; **student "Confirm Visa Granted" button is mandatory** (cannot be skipped)
- **§19 (NEW) P1 visaRequested Selection** — student selects at application submit; data carries through to P4 (CAS paperwork) + P5 (visa sub-step)
- **Data model:** `application.visaRequested: boolean` (new), `phase3_templates / phase4_templates / phase5_templates: DocumentTemplate[]` (new)

---

## 1. Phase Overview

| # | Phase | Trigger In | Activities | Trigger Out |
|---|-------|-----------|-----------|-------------|
| **P1** | Application | Student submit + `visaRequested` selection | School / Consultant receive; `visaRequested` carries forward to P4 (CAS paperwork) + P5 (visa sub-step visibility) | → P2 |
| **P2** | Interview + Decision | P1 done | Schedule interview, multi-round reports, Manager decision | Approve → P3, Reject → Closed |
| **P3** | **Offering** | P2 approved | School sends conditional offer + payment instructions (per §17 template) → Student accepts + pays deposit + uploads proof → School confirms | Confirmed → P4 |
| **P4** | **Admission Documents** | P3 confirmed | School prepares admission docs per §17 template (incl. **CAS Letter** if `visaRequested`); parents fill supplementary forms; uniform ordering | Verified → P5 |
| **P5** | **Pre-Departure** | P4 verified | **If `visaRequested`:** (Step 1) School issues CAS → (Step 2) Student applies visa → (Step 3) **Student confirms visa granted** (mandatory) → (Step 4) Travel arrangements (flight/taxi/arrival) → (Step 5) School confirms arrival | Arrived → P6 |
| **P6** | Enrolled | P5 arrived | School confirms pupil begin; official enrollment complete | Done |

**Key changes from rev 2.x:**
- **P3 rename** — was "Deposit Exchange" (covered both offer-issuing and deposit-receiving); now "Offering" emphasizes the conditional-offer-and-deposit contract milestone
- **P4 scope expansion** — now includes parents' supplementary forms + uniform ordering + CAS paperwork (if `visaRequested`)
- **P5 merge** — was split into "Visa / Travel"; now merged into "Pre-Departure" with conditional sub-steps (§18)
- **P6 unchanged content** — semantic and final state preserved
- **`visaRequested` field** — captured at P1 (see §19); drives P4 CAS inclusion + P5 visa sub-step visibility

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

### 2.7 Interview time — UK timezone (2026-06-16, rev 2.6)

All P2 interview date / time fields and displays are marked as UK time (Europe/London). All parties follow the same time — no conversion. Markers:
- Form labels: `Date (UK)` / `Time (UK)`
- Section B row label: `Time (UK)`
- Section C past interview: `📅 {date} · {time} (UK)`
- Toast: `Round #{n} scheduled for {date} {time} (UK time).`

---

## 3. Reject & Reopen Rules

**Reopen allowed at:** P1 (Application), P3 (Offering), P5 (Pre-Departure)
**No reopen at:** P2 (Interview+Decision), P4 (Admission Documents), P6 (Enrolled)

**Note (rev 3.0):** P3 was previously "Deposit Exchange" and is now "Offering" — same reject/reopen behavior, just renamed. P5 was previously "Visa / Travel" and is now "Pre-Departure" — same reject/reopen behavior, just renamed.

**Re-open behavior:**
- Re-open resets phase to Active
- All prior reports / data preserved (P2 case keeps report history)
- Can schedule new interview round (P2) or re-issue offer (P3) or re-apply visa (P5)

---

## 4. Cross-Portal Visibility

**Rule:** Each portal sees a **phase-aware** subset of the application detail page. The student's view is **NOT** read-only across all phases — it carries **student-specific actions** that are NOT present on the school side (e.g. confirming attendance, uploading deposit proof, confirming visa granted, joint-editing travel info).

### 4.1 Visibility matrix (per portal × per phase)

| Portal | P1 (Application) | P2 (Interview) | P3 (Offering) | P4 (Admission Docs) | P5 (Pre-Departure) | P6 (Enrolled) |
|--------|------------------|----------------|---------------|---------------------|---------------------|---------------|
| **School** | Full (info + edit student snapshot + reject) | Full (A schedule, B current, C past, D decision) | Full (upload deposit docs, confirm receipt) | Full (upload admission docs, mark ready) | Full (visa status, travel arrangement, confirm arrival) | Read-only + view student record |
| **Consultant (assigned)** | Read-only (P2 + P1 editable per §11 lock rule) | Sections A, B, C only (no Section D) | Read-only | Read-only | Read-only | Read-only |
| **Consultant (not assigned)** | Zero access | Zero access | Zero access | Zero access | Zero access | Zero access |
| **Student** | Read application info (snapshot). Sees school corrections via §17.3 auto-populate. | **Confirm Attendance** / **Suggest Change** (own actions); read interview details | **Send Files to School** (§16.1), **Upload Deposit Proof** (§16); read school's deposit docs list | Read-only: school's `phase4Docs` list (mirror §22, **student-side file upload deferred**) | **Confirm Visa Granted** (§18.2 mandatory if visaRequested), joint-edit **Travel Arrangements** (§24) | Read-only status banner ("Welcome, you're enrolled") |
| **BSP Staff** | Full read, write only when assigned | Full read, write only when assigned | Full read, write only when assigned | Full read, write only when assigned | Full read, write only when assigned | Full read |

### 4.2 Student-specific actions — what the student CAN do (per phase)

This list enumerates the student-facing affordances that do NOT appear on the school side. They are the "input affordances" mentioned in KC's 2026-06-23 directive ("根據返學生需要見到嘅內容同埋需要入資料嘅地方做返佢哋嘅方式").

| Phase | Student action | Spec section | Status driver? |
|-------|----------------|--------------|----------------|
| P2 | ✅ **Confirm Attendance** (interview) | §15 P2 student view | No — informational only |
| P2 | 🔄 **Suggest Change** (interview) | §15 P2 student view | Sets interview `status = 'change-requested'` |
| P3 | 📤 **Send Files to School** (general multi-file, status-agnostic) | §16.1, §16.1.1 rev 2.1 | No — side channel |
| P3 | ✅ **I've uploaded everything** (advisory) | §16.1.1 | Sets `studentReadyForReview` (advisory, not a gate) |
| P3 | 💳 **Upload Deposit Proof** (single status-changing file) | §16 | **YES** — drives `sent_to_student → proof_uploaded` |
| P5 | 🛂 **Upload Visa Granted PDF** | §18.2 | No — must be paired with Confirm |
| P5 | ✅ **Confirm Visa Granted** (mandatory if visaRequested) | §18.2 | **YES** — sets `subStatus = visa_granted` |
| P5 | ✈️ **Edit Flight** info (optional, joint-edit) | §24.1 | No |
| P5 | 🚗 **Edit Transportation** info (joint-edit) | §24.2 | No — but required for school's "Mark Travel Arranged" |

### 4.3 Student view — Phase-Stack layout (mirrors §20)

**Rule (rev 3.0.1, 2026-06-23):** The student application detail page (`/student/applications/[id]/`) uses the **same Phase-Stack layout** as the school page (§20):

1. **Current phase** is **always expanded + pinned at top**.
2. **Past phases** are **collapsed by default**, with `▸` chevron on the header row.
3. Click anywhere on a past-phase header row to expand → `▾` chevron + body visible.
4. `expandedPhases` ref resets on each page load.
5. Newest at top (current → previous → … → P1).

**What changes for the student (vs. the school) inside each phase card:**

- **P1** card body: read-only Application Details + Student Info (no school-side edit button; students cannot edit after submit per §19.4).
- **P2** card body: Interview card (date/time/location/agenda) + the 2 student actions above (§15) — **replaces** the school's Schedule form (Section A).
- **P3** card body: 4 sections in order:
  1. Documents from School (read-only list of `schoolFiles`)
  2. Send Files to School (§16.1) — multi-file input + pending queue + Send button
  3. Upload Deposit Proof (§16) — single-file input + Upload button
  4. ✅ I've uploaded everything + ↩️ Mark as not ready (advisory)
- **P4** card body: read-only list of school's `phase4Docs` (download links + timestamps). No upload affordance on the student side per §22 ("Student-side mirror deferred").
- **P5** card body: conditional sub-steps (§18):
  - If `visaRequested === true`: Visa Granted Upload + Confirm (mandatory) + Travel sections (§24.1 + §24.2)
  - If `visaRequested === false`: Travel sections only (§24.2)
- **P6** card body: Enrolled status banner (read-only).

### 4.4 What stays visible on the student page (NOT in phase cards)

The following remain as **always-visible page elements** outside the phase stack (NOT moved into a card):

- Page header (ref, school name, status badge) — same as school page
- PhaseTimeline (compressed horizontal overview) — keeps at-a-glance progress visible
- RejectedBanner — when `status === 'rejected'` (per §9)
- ChatRoom (right side column) — cross-phase conversation thread
- AttachmentPanel (collapsed per-phase file aggregation) — single global view, mirrors §20.1 fallback

### 4.5 Out of scope (deferred)

- **P4 student-side file exchange** (mirror §16.1) — per §22, deferred until trial scope expands
- **Per-template-doc upload slot on student side** (§17 future enhancement)
- **Multi-language phase labels** (current English-only)

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

### 14.1 Mobile reliability — replace `window.confirm()` with in-page modal (2026-06-16, rev 2.5)

**Rule (rev 2.5):** The Restart button no longer uses `window.confirm()` for the "Are you sure?" step. It opens an in-page Vue modal (`<Teleport to="body">`) with explicit Cancel / Confirm buttons. The actual restart logic stays identical to §14 above — only the confirmation UX changes.

**Why:** KC reported (post-rev-2.4) that on a completed application, clicking the Restart button appeared to do nothing — the application stayed in its `completed` state. Investigation showed the restart *handler* itself was correct (verified via Playwright on iPhone SE + desktop — both reset to P1 cleanly). The most likely root cause is `window.confirm()` unreliability on iOS Safari and embedded WebViews:

- `window.confirm()` is a synchronous browser dialog. On iOS Safari it can be silently dismissed (returning `false`) if the page is in a state where dialog rendering is suppressed (e.g. an in-flight scroll animation, a pending `nextTick` scrollTo from a previous action, or when the page has registered multiple `beforeunload` handlers).
- On Android Chrome with "Request Desktop Site" mode, the dialog can be auto-dismissed by the OS-level "unsupported dialog" warning.
- Inside the Telegram / WhatsApp in-app browser, `window.confirm()` is often blocked entirely and returns `false` without any visible prompt.
- The dialog text is also long (5-bullet list) which can be clipped on small mobile screens, making the OK button hard to tap.

In all these cases the click handler exits at `if (!confirm(...)) return` without resetting, and the user concludes "the button is broken."

**What stays the same:**
- All destructive behavior in §14 (clear P2 store, clear P3 store, remove localStorage, reset `application.value = clone(defaultMock)`, collapse expanded phases, saveState, scroll to top).
- The button location (top-right of application detail page, `v-if="!isRejected"`).
- The button text "Restart".

**What changes (rev 2.5):**
- `window.confirm(...)` → a Vue modal component (`<Teleport to="body">`) with:
  - A backdrop overlay (clicking it dismisses — equivalent to Cancel).
  - The same 5-bullet explanation of what Restart will clear.
  - Two buttons: **Cancel** (secondary style) and **Yes, restart** (destructive style, matches the existing `.btn-restart` colour).
  - While the action runs (synchronous in current code, but the pattern allows async later), the Confirm button shows `Restarting…` and is disabled. The Cancel button is also disabled during this window.
- `restartApplication` is split into:
  - `requestRestart()` — sets `showRestartModal = true` (the click handler the button calls).
  - `confirmRestart()` — runs the existing §14 logic, then `showRestartModal = false`, then scroll-to-top.
  - `cancelRestart()` — sets `showRestartModal = false`.
- Keyboard support: Escape closes the modal (= Cancel). Focus is trapped inside the modal while open (Tab cycles between Cancel / Confirm only).

**Click-test scenarios (rev 2.5, post-deploy):**

| # | Scenario | Expected |
|---|----------|----------|
| (gg) | Desktop, click Restart on a P6-completed app | Modal opens with the 5-bullet message. Cancel button visible. Yes, restart button visible (destructive style). Page behind is dimmed by overlay. |
| (hh) | Click Cancel | Modal closes. Application stays at P6 completed. No state change. |
| (ii) | Click the backdrop overlay | Same as Cancel — modal closes, no state change. |
| (jj) | Click Yes, restart | Modal closes, page resets to P1 (status=`active`, subStatus=`Application Submitted`). Scroll to top. |
| (kk) | iOS Safari (real device or simulated via WebView) | Modal opens reliably (no silent dismiss). Same as (gg) + (jj). The previous `confirm()` unreliability is gone. |
| (ll) | Press Escape while modal is open | Modal closes (= Cancel). |
| (mm) | Click Restart, then click Restart again before confirming | Second click is a no-op while modal is already open (`showRestartModal` already true). |
| (nn) | P3-confirmed state (currentPhase=3, status=`active`, not yet P6) | Restart works the same as P6 case. The bug was not phase-specific; only the entry point was. |

**State transitions:** Unchanged (the underlying reset logic is identical to §14).

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

### 16.1.4 Toggle default state — expanded when action is required (2026-06-16, rev 2.4)

**Rule (rev 2.4):** The "📥 Student Submitted Files" toggle (Section B2) defaults to **expanded** when the school's `Confirm Receipt` action is pending — specifically when `p3Latest.status === 'proof_uploaded' AND p3Latest.studentFiles.length >= 1` (the rev 2.1 enablement condition). Otherwise the toggle defaults to its prior collapsed state (`status === 'sent_to_student'` with no files yet, or `status === 'confirmed'` after receipt is acknowledged).

**Why:** KC reported (post-rev-2.3 deploy, mobile + desktop-on-mobile) that the toggle being collapsed by default made the "✅ Confirm Receipt" button invisible until they happened to click the toggle. Before rev 2.2, this was harmless because the confirm button lived in a separate standalone Section C card and was always visible. After rev 2.2 relocated the button into the toggle body, collapsed-by-default became a UX regression: the primary action for a `proof_uploaded` state was hidden until the user remembered to expand the toggle. This was the same default-state pattern KC had flagged before (commit `6b256d6` "collapse by default to avoid overlap with Confirm Receipt" was about the *dev affordance* panel, but the principle applies here too — when a primary action is gated behind a collapsible, the collapsible should be open by default for the state where that action is relevant).

**What stays the same:**
- Toggle still clickable to collapse / expand at any time (school can still hide the body if they want to reduce visual noise).
- All rev 2.1 enablement logic on the button itself (still disabled if `studentFiles.length === 0`).
- All rev 2.3 mobile responsive behavior.
- The `✅` indicator and `(N)` count badge on the toggle header remain as at-a-glance signals.

**What changes (rev 2.4):**
- `showStudentFiles` initial value: `ref(false)` → `ref(true)` when the rev 2.1 enablement condition holds. Implementation pattern: a `computed` returns the initial value at component mount, and the user-driven toggle still flips `showStudentFiles` afterwards (so it behaves like normal user state once interacted with).
- Mobile: this also fixes the desktop-on-mobile case where the user couldn't see the confirm button unless they happened to expand the toggle. With rev 2.4, on a mobile browser (whether native or in "Request Desktop" mode), the toggle opens by default and the button is visible.

**Click-test scenarios (rev 2.4, post-deploy):**

| # | Scenario | Expected |
|---|----------|----------|
| (bb) | Open school P3, status = `proof_uploaded`, studentFiles = 0 | Toggle shows ▶️ collapsed (no action possible — button would be disabled anyway, no point expanding). |
| (cc) | Open school P3, status = `proof_uploaded`, studentFiles = 1+ (button enabled — the actionable state) | Toggle shows 🔽 expanded by default. Confirm Receipt button visible immediately. School can collapse it manually if desired. |
| (dd) | Open school P3, status = `sent_to_student` (no files yet) | Toggle shows ▶️ collapsed (no action possible). |
| (ee) | Open school P3, status = `confirmed` | Toggle shows ▶️ collapsed (action already complete — confirmed banner carries the message). |
| (ff) | After manually collapsing then refreshing | Local state resets; the rule applies again based on `p3Latest`. If state still says actionable, toggle reopens. |

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

---

## 17. Document Template System (NEW in rev 3.0)

**Rule:** School settings configures a **default document template** per phase (P3, P4, P5). When an application enters a phase, the per-phase template **auto-populates** to both the school's application page and the student's application page. The student can **add or remove** individual documents (each application can deviate from the school default).

**Configuration location:** `/school/settings/document-templates` (school admin) — global, applies to all applications in the school.

**Per-phase display location:** `/school/applications/[ref]/` and `/student/applications/[ref]/` — auto-populated, per-application override allowed.

### 17.1 DocumentTemplate shape

```ts
interface DocumentTemplate {
  id: string                       // stable id (uuid)
  phase: 3 | 4 | 5                 // which phase this template belongs to
  category: 'admission' | 'identity' | 'financial' | 'travel' | 'medical' | 'other'
  name: string                     // e.g. "Offer Letter", "CAS Letter", "Medical Form"
  description: string              // e.g. "School's conditional offer letter to the student"
  required: boolean                // advisory flag (⚠️ indicator on missing required docs)
  sampleUrl?: string               // optional link to a sample/template PDF
  displayOrder: number             // sort order in UI
  active: boolean                  // soft-delete: false = hidden but kept for audit
}
```

### 17.2 Default required documents (rev 3.0 baseline)

| Phase | Required Doc | Category | Notes |
|-------|--------------|----------|-------|
| P3 (Offering) | **Offer Letter** | `admission` | School's conditional offer. Always required. |
| P4 (Admission Documents) | **CAS Letter** | `admission` | Required only if `application.visaRequested === true`. School generates once student accepts. |
| P4 (Admission Documents) | (extension point) | — | Future: Medical Form, Refund Agreement, Uniform Order Form, Parents Info Form |
| P5 (Pre-Departure) | **Visa Granted PDF** | `identity` | Required only if `application.visaRequested === true`. Student uploads after visa issued. |
| P5 (Pre-Departure) | (extension point) | — | Future: Flight Details Form, Arrival Info Form, Taxi Arrangement Form |

**Amendments:** New required documents can be added in future revisions (rev 3.1, rev 3.2, etc.). The `DocumentTemplate` interface supports `active: false` for soft-deletion — old templates remain in the database for audit, hidden from new applications.

### 17.3 Behavior

- **Auto-populate:** When an application enters a phase, the school's default template for that phase is **copied** into the application record (`phase3_templates / phase4_templates / phase5_templates`). The copy is a snapshot — future school-wide template edits do NOT retroactively change existing applications.
- **Per-app override:** School staff or student can:
  - **Add** a custom doc (e.g. "School-specific medical form for athletics")
  - **Remove** an auto-populated doc (e.g. "Refund Agreement not needed for this applicant")
  - **Mark as required / not required** (advisory only — does not block submit)
- **Required flag enforcement:** Display ⚠️ "Required doc missing" hint for any required doc that has no uploaded file. **Advisory only** — does NOT block phase advance. School makes the final human judgment.

### 17.4 Click-test scenarios

| # | Scenario | Expected |
|---|----------|----------|
| (a) School admin opens `/school/settings/document-templates` | Page lists default templates for P3, P4, P5 grouped by phase. School can add/edit/remove. |
| (b) New application enters P3 | Application's P3 section auto-populates with school's default P3 templates (e.g. "Offer Letter" required). |
| (c) Student opens P3 | Student's P3 section shows auto-populated docs with checkboxes / upload slots. Can add custom doc, can mark auto-populated doc as not-applicable. |
| (d) School admin edits school-default template (e.g. adds "Medical Form" to P4) | New applications going forward inherit the new template. Existing applications unaffected (snapshot). |
| (e) Student does not upload a required doc | UI shows ⚠️ hint next to the missing doc. Submit still allowed. School receives the application with the missing-doc warning. |

---

## 18. P5 Visa Step Detail (NEW in rev 3.0)

**Rule:** P5 (Pre-Departure) has **conditional sub-steps** driven by `application.visaRequested`. The student's **"Confirm Visa Granted"** action is **mandatory** when `visaRequested === true` — it cannot be skipped, hidden, or omitted from the UI.

### 18.1 Sub-step flow

**If `visaRequested === true`:**
1. **🛂 Step 1: Apply for Visa** — School issues CAS Letter (per §17 template); student receives + applies for student visa externally
2. **✅ Step 2: Confirm Visa Granted** — Student uploads the visa-granted PDF + clicks **"✅ Confirm Visa Granted"** button (mandatory action — see §18.2)
3. **✈️ Step 3: Travel Arrangements** — Student submits flight details, arrival time, taxi arrangement; school acknowledges
4. **🏫 Step 4: School Confirms Arrival** — School confirms the pupil has arrived and boarded; triggers P5 → P6

**If `visaRequested === false`:**
1. ✈️ **Step 1: Travel Arrangements** (skip Step 1-2 from the `visaRequested === true` flow)
2. 🏫 **Step 2: School Confirms Arrival** (triggers P5 → P6)

**Step ordering — Step 3 / Step 4 are independent (rev 3.5, 2026-06-22):**
- The school can complete Step 3 (Mark Travel Arranged) and Step 4 (Confirm Arrival & Enroll) **in any order**.
- Rationale: the pupil may have already arrived on campus (Step 4) before the travel arrangement details are finalized in the form (Step 3), or the school may want to confirm arrival without the formal travel arrangement workflow.
- This means Step 4's button is **never locked** behind Step 3. Once the application is in P5, both buttons are simultaneously available.

### 18.2 "Confirm Visa Granted" — mandatory action

**Visibility rule:** The "✅ Confirm Visa Granted" button is **always visible** on the student P5 view when `application.visaRequested === true`. It is **never hidden** behind a gate, accordion, or conditional UI. The button is the canonical confirmation that the student visa has been issued.

**UI placement:**
- Student P5 view: Top of the P5 stepper, prominent placement
- School P5 view: Read-only display showing whether the student has confirmed + uploaded PDF

**Pre-condition for enabling:**
- Student must upload at least 1 file in the "Visa Granted Document" upload slot
- Once uploaded, the "✅ Confirm Visa Granted" button is enabled
- Clicking it sets `phase5.visaGrantedAt: Date` and `phase5.visaGrantedDocument: FileRef`; status transitions to `visa_confirmed` (sub-status, not a new main phase)

### 18.3 Click-test scenarios

| # | Scenario | Expected |
|---|----------|----------|
| (a) Student opens P5 with `visaRequested = true` | "✅ Confirm Visa Granted" button **prominently visible**. Hint: "Upload your visa granted page, then click Confirm Visa Granted to proceed." |
| (b) Student clicks button before uploading | Button **disabled**. Title attribute: "Please upload your visa granted page first." |
| (c) Student uploads PDF, then clicks button | Status transitions to `visa_confirmed`. Sub-status badge "✅ Visa Granted" appears. P5 advances to Step 3 (Travel Arrangements). |
| (d) School P5 view | Shows "✅ Visa Granted" status + uploaded PDF link + date confirmed. |
| (e) Student with `visaRequested = false` | "✅ Confirm Visa Granted" button **NOT rendered** (only Travel Arrangements flow). |

### 18.4 Disabled sub-step button UX (NEW in rev 3.2, 2026-06-19; rev 3.5 — Step 4 removed from scope, 2026-06-22)

**Rule:** When a P5 sub-step button is disabled (waiting for a prior sub-step to complete), the button MUST communicate *why* it's disabled — not just *that* it's disabled. Users should never have to guess which step to click first.

**Visual requirements (all disabled buttons):**
- `opacity: 0.4` — clearly faded
- `cursor: not-allowed` — browser-native disabled cursor
- A non-empty `title` attribute explaining the next required step, e.g. `"Mark Travel Arranged first (Step 3)"`
- The parent `.p5-substep` container MUST render a hint line: `🔒 Complete Step X first.`

**Buttons in scope:** P5 sub-step buttons that ARE gated by a prior sub-step (Step 4 is **excluded** — see §18.1 rev 3.5 note):
- Line 695–701: `✅ Confirm Visa Granted` (disabled when `!phase5VisaGrantedDocument`)
- Line 710–714: `✈️ Mark Travel Arranged` (disabled when `!phase5VisaGrantedAt`)
- Line 738–739 (no-visa branch): `✈️ Mark Travel Arranged`

**Excluded from this rule (rev 3.5):**
- `🏫 Confirm Arrival & Enroll` (Step 4 in visa-true branch, Step 2 in visa-false branch) — always enabled once the application is in P5, no gate, no hint. See §18.1 rev 3.5.

**Click-test scenarios:**

| # | Scenario | Expected |
|---|----------|----------|
| (a) Open P5 with subStatus=`'Visa Granted'` (Step 2 done, Step 3 pending) | `✈️ Mark Travel Arranged` button enabled (Step 3 ready to be done). `🏫 Confirm Arrival & Enroll` button **also enabled** simultaneously (rev 3.5). No "🔒 Complete Step 3 first." hint above Step 4. |
| (b) Hover the disabled button (any gated button) | Browser tooltip shows the title attribute text. |
| (c) Open P5 with subStatus=`'Travel Arranged'` (Step 3 done) | `✈️ Mark Travel Arranged` button shows done state. `🏫 Confirm Arrival & Enroll` button still enabled. No "🔒 Complete Step 3 first." hint. |
| (d) Open P5 with subStatus=`'Enrolled'` (Step 4 done, currentPhase=6) | Both Step 3 and Step 4 buttons show done state. |

---

## 19. P1 visaRequested Selection (NEW in rev 3.0)

**Rule:** At P1 (Application), the student must select whether they require a student visa. This is captured as `application.visaRequested: boolean` and **carries forward** to all downstream phases.

### 19.1 UI location

- **Student apply form:** `/student/apply/[schoolId]` — radio group with two options:
  - ☐ **Yes, I need a student visa**
  - ☐ **No, I have the right to study in the UK** (e.g. UK/EU passport, ILR, etc.)
- The field is **required** — application submit is blocked if neither is selected.

### 19.2 Data model

```ts
interface P2Application {
  // ... existing fields ...
  visaRequested: boolean  // NEW in rev 3.0 — captures student visa need
}
```

### 19.3 Downstream impact

| Phase | Impact of `visaRequested` |
|-------|---------------------------|
| P4 (Admission Documents) | If `true`: **CAS Letter** template is included in the §17 default template list for P4. |
| P5 (Pre-Departure) | If `true`: §18 visa sub-steps (Step 1 Apply + Step 2 Confirm Granted) are shown. If `false`: skipped. |
| School info card (any phase) | `Visa Requested: Yes / No` displayed in the application's info grid. |

### 19.4 Click-test scenarios

| # | Scenario | Expected |
|---|----------|----------|
| (a) Student opens apply form | Radio group visible with "Yes" / "No" options. Required validation on submit. |
| (b) Student selects "Yes" + submits | `application.visaRequested = true` saved. School info card shows "Visa Requested: Yes". P4 template includes CAS Letter. P5 shows §18 visa sub-steps. |
| (c) Student selects "No" + submits | `application.visaRequested = false`. P4 template excludes CAS Letter. P5 skips §18 visa sub-steps. |
| (d) Student changes mind after submit | Not allowed at P1 (already submitted). If application is reopened (§3), student can amend during re-submission — see reopen flow. |

---

## 20. Phase Stack Default Visibility (NEW in rev 3.0, 2026-06-18)

**Rule:** In the application detail page (`/school/applications/[id]/` and `/student/applications/[id]/`), the phase history stack renders with these visibility rules:

1. **Current phase (in-progress):** Body **always expanded**, pinned at the **top** of the stack (above all past phases). No expand/collapse chevron — the current phase is not collapsible. The user always sees the actionable surface without scrolling.
2. **Past phases (completed):** Body **collapsed by default**. Header row shows `P#` badge + title + status pill + completion date + `▸` chevron. User clicks **anywhere on the header row** to expand → `▾` chevron + body visible. Click again to collapse.
3. **Order:** Newest at top (current → previous → previous → … → P1). Implemented by reversing `phaseHistory.filter(p => p.phase <= currentPhase)` in the `visiblePhases` computed.

**Why:**
- Completed phase history is reference / audit material — most of the time the school admin only needs the current phase's actions visible. Collapsing past phases reduces scroll fatigue and lets the in-progress work breathe at the top.
- The current phase being always-expanded + at-top eliminates the "where do I act?" hunt that a fully-collapsed stack would create. KC confirmed 2026-06-18: "做緊嗰個長期打開放喺最高 / 已經完成嘅全部收埋，撳先開".
- This is the **phase-stack-level** default state rule. It complements the **component-level** rule in §16.1.4 (P3 internal "Student Submitted Files" toggle — expand when action is required, otherwise collapsed). The two rules live at different layers and must not be confused: §20 is about the outer phase cards, §16.1.4 is about an inner collapsible inside the P3 card body.

**What stays the same:**
- Click anywhere on the past phase header row (not just the chevron) expands it. Keyboard: Tab to focus + Enter/Space to toggle (per ARIA `role="button"`).
- Smooth-scroll into view after expansion (`onPhaseRowClick` already implements `scrollIntoView({ behavior: 'smooth', block: 'start' })` after a non-collapse click).
- `expandedPhases` is per-page-load (resets on refresh). No persistence — re-opens on each refresh based on the rule above.
- `Restart` button (§14) clears `expandedPhases = []` on reset, which is correct (collapsed stack on a fresh P1 application).

**Implementation:**

```vue
<!-- pages/school/applications/[id].vue — line 71 (current code, already conforms) -->
<div
  v-if="ph.phase === application.currentPhase || expandedPhases.includes(ph.phase)"
  :id="'phase-body-' + ph.phase"
  class="phase-body"
>
  …
</div>
```

```js
// pages/school/applications/[id].vue — line 1706 (current code, already conforms)
const visiblePhases = computed(() => {
  const cur = application.value.currentPhase
  return [...application.value.phaseHistory]
    .filter(p => p.phase <= cur)
    .reverse()  // latest at top — current phase always first
})

const expandedPhases = ref([])  // past phases only — current phase is always shown
```

**Click-test scenarios (post-deploy):**

| # | Scenario | Expected |
|---|----------|----------|
| (a) Open school application detail, `currentPhase = 3` | P3 card at top, body expanded, **no chevron**. P2 + P1 below, collapsed with `▸`. |
| (b) Click P1 header row | P1 expands, body visible, chevron flips to `▾`. P3 stays at top and expanded. |
| (c) Click P1 again | P1 collapses, chevron flips back to `▸`. |
| (d) Refresh page | `expandedPhases` resets. P1 collapses again. Current phase still at top + expanded. |
| (e) Advance P3 → P4 | P4 card moves to top + auto-expanded (current phase). P3 demotes to "completed" + auto-collapsed. |
| (f) Reject from any phase | `RejectedBanner` (§9) renders at top. Phase stack below: current phase (`previousPhase` per §12) expanded + at top; rest collapsed. |
| (g) Restart (back to P1) | All phases collapse. P1 is now current → expands + at top. |
| (h) Mobile (414px viewport) | Same rule applies. No chevron on current phase row; past phase rows show `▸` / `▾`. No horizontal overflow. |

**Out of scope (deferred):**
- Per-user persistence of `expandedPhases` across reloads — currently resets each refresh. If KC later wants "remember which phases I had open", this rule will gain a `localStorage` addendum in a future revision.

### 20.1 Fallback display for empty phase data (NEW in rev 3.1, 2026-06-19)

**Rule:** When an expanded past-phase body has zero items in a category, the category section **still renders** with its header + an inline empty-state placeholder. The user must be able to see every category the phase contains — even if the category is empty — so they know the section was checked, not missing.

**Applies to:** Both `/school/applications/[id]/` and `/student/applications/[id]/`.

**Specifically — Attachments section (the category at risk):**

- When `getPhaseAttachments(ph.phase).length === 0`, render:
  ```
  📎 Attachments
  ─────────────────
  No files for this phase.
  ```
  instead of hiding the entire `<div class="phase-subsection">`.
- When `getPhaseAttachments(ph.phase).length > 0`, render the file list as before (rev 3.0 behavior unchanged).

**Notes section is exempt from this rule:**

- Notes keeps the current `v-if="ph.notes"` gate. An empty Notes section adds no value (every phase starts with empty notes by default) and a placeholder would be visual noise.
- Notes only renders when `ph.notes` is non-empty.

**Phase Details / Student Info / School Actions — keep current gates:**

- These are not category-style sections; their `v-if` gates (e.g. `v-if="ph.phase === 1"`, `v-if="ph.phase === application.currentPhase"`) gate on structural conditions, not data emptiness. Out of scope for this rule.

**Why:** KC reported (post-rev-3.0 deploy, on `2026-X7K9M2P4` sparse mock) that opening past phases P2/P3/P4 showed only the Notes section, with the entire Attachments section silently dropped — leaving the body looking half-rendered and the user unsure whether attachments existed and were empty, or whether the section was broken. This was the same root cause as the prior `enrolledMock` P4 fix (commit `884c724`): the data was empty for that phase. Rev 3.0's data-only patch (`884c724`) fixed `enrolledMock` but did not generalize — any future sparse mock OR real user data with empty attachments hits the same bug. Rev 3.1 fixes the underlying UX: the section header always shows; empty data shows the placeholder.

**Implementation hint (for group AI):**

```vue
<!-- pages/school/applications/[id].vue — line 182 (replace the current v-if gate) -->
<div class="phase-subsection">
  <h4>📎 Attachments</h4>
  <div v-if="getPhaseAttachments(ph.phase).length" class="phase-attachments">
    <div v-for="att in getPhaseAttachments(ph.phase)" :key="att.id" class="att-row">
      <!-- existing item rendering unchanged -->
    </div>
  </div>
  <p v-else class="phase-empty-state">No files for this phase.</p>
</div>
```

Note: `pages/student/applications/[id].vue` uses a single `<AttachmentPanel>` (line 148) for all attachments, not per-phase sections — no per-phase Attachments fallback needed there.

**Click-test scenarios (post-deploy, rev 3.1):**

| # | Scenario | Expected |
|---|----------|----------|
| (a) Open `2026-X7K9M2P4` (sparse mock) at `currentPhase = 4`, expand P2 | Body shows `📝 Notes` (existing) AND `📎 Attachments` header with `No files for this phase.` placeholder |
| (b) Same app, expand P3 | Same as (a) — Notes + Attachments header + placeholder |
| (c) Same app, expand P4 | Same as (a) + the existing Admission Documents section |
| (d) Same app, expand P1 (3 files attached) | `📎 Attachments` header + 3 file rows (no placeholder, unchanged from rev 3.0) |
| (e) Open `2025-ENROLLED1` (dense mock) at `currentPhase = 6`, expand P4 | `📎 Attachments` header + `Admission_Agreement.pdf` row (P4 attachment added in `884c724` shows correctly) |
| (f) Mobile 414px viewport | Placeholder text wraps cleanly; no horizontal overflow |

---

## 21. Dev Affordance — Testing Shortcuts (NEW in rev 3.2, 2026-06-19)

**Rule:** A dev-only "🧪 Dev Tools" panel is available in development environments to provide shortcuts for testing multi-phase flows. The panel is **never rendered in production builds**.

**Visibility gate:** The panel renders only when ONE of the following conditions holds:
1. URL query string contains `?dev=1` (e.g. `https://bsp-v4.pages.dev/school/applications/2026-X7K9M2P4?dev=1`)
2. `process.env.NODE_ENV !== 'production'` at build time
3. `localStorage.getItem('bsp-dev-mode') === 'true'` (manual toggle for ad-hoc testing)

Production builds (Cloudflare Pages production deploy with no `?dev=1` query) NEVER render the panel — the panel's parent div is wrapped in `v-if="isDevMode"`.

**Available shortcuts (Phase-aware, render based on `application.currentPhase`):**

| Current phase | Buttons available |
|---------------|-------------------|
| 1 (Application) | `⏩ Advance to P2` (skip interview scheduling) |
| 2 (Interview) | `⏩ Approve + Advance to P3` |
| 3 (Offering) | `⏩ Confirm Deposit + Advance to P4` |
| 4 (Admission Documents) | `⏩ Mark Complete + Advance to P5` |
| **5 (Pre-Departure)** | `⏩ Complete All P5 Sub-steps + Advance to P6` (sets `subStatus='Travel Arranged'`, `phase5VisaGrantedAt=now`, then `advancePhase(6)`) |
| 6 (Enrolled) | `🔄 Restart to P1` |

**Visual placement:** Fixed bottom-right corner of the application detail page, semi-transparent dark background, monospace font, collapsible. Does not interfere with normal page scrolling or rendering.

**Why:** KC (manager/founder-as-first-tester) needs to rapidly verify downstream phase states (especially P5 sub-step rendering and P6 completion) without manually clicking through 5+ phases + 4 P5 sub-steps every test session. Without this shortcut, every P5/P6 verification cycle takes 10+ minutes of clicking. The shortcut reduces it to one click. Production users never see this panel.

**Out of scope (deferred):**
- Per-user preference for which shortcuts appear (always show all phase-aware buttons)
- Keyboard shortcuts for the panel actions
- Logging of dev-mode button clicks

**Click-test scenarios:**

| # | Scenario | Expected |
|---|----------|----------|
| (a) Open app detail at P5 with `?dev=1` query | Bottom-right panel visible, shows "⏩ Complete All P5 Sub-steps + Advance to P6" button |
| (b) Click the P5→P6 shortcut button | `subStatus` set to `'Travel Arranged'`, `phase5VisaGrantedAt` set to current timestamp, `currentPhase` advanced to 6, `status` set to `'completed'` |
| (c) Open app detail without `?dev=1` (production view) | Panel NOT visible. Page renders identically to current behavior. |

---

## 22. P4 File Upload (NEW in rev 3.3, 2026-06-22)

**Rule:** P4 (Admission Documents) follows the same multi-file pattern as P3 (§16). The school stages files in a **pending queue** (`p4NewFiles`), then either **📤 Upload Documents** (first batch) or **📎 Add Documents** (subsequent batches) to persist them to `application.phase4Docs`. Once `phase4Docs.length > 0`, the existing **✅ Mark Documents Ready** button appears and advances to P5.

**Why this exists:** Rev 3.2 left P4 as a `window.alert` placeholder — the school could not actually upload any documents during the trial. KC needs a real file input + queue (mirror of P3) so the trial users can stage and stage-verify admission documents before P5 advance. The full student-side "submit to school" mirror (per §16.1) is out of scope for rev 3.3 — this is school-side only.

**Layout (school page):**

```
┌─────────────────────────────────────────────────┐
│  💼 Phase 4 — Admission Documents               │
│  Upload CAS Letter, Medical Form, etc.          │
├─────────────────────────────────────────────────┤
│  📄 Document Checklist — P4 Admission Documents │  (existing §17 list)
│  ─────────────────────────────────────────────  │
│  [📄 Sent (uploaded) docs list]                 │  ← read-only
│  ─────────────────────────────────────────────  │
│  [📎 Pending files queue — not yet uploaded]    │
│  ─────────────────────────────────────────────  │
│  [Choose file]  [📤 Upload Documents] or        │
│                  [📎 Add Documents]              │
│  ─────────────────────────────────────────────  │
│  [✅ Mark Documents Ready (Advance to P5)]       │  ← only after first upload
└─────────────────────────────────────────────────┘
```

**Sections:**
- **Document Checklist (§17):** Existing per-doc ✕ Remove button, locked once `currentPhase > 4`. Unchanged.
- **Sent (uploaded) docs list:** `application.phase4Docs[]` — read-only `<a>` download links + upload timestamps. Once any doc is in `phase4Docs`, no per-doc delete (per the §16 audit-trail rule, mirrored here).
- **Pending files queue:** `p4NewFiles` — school can pick multiple files, see them in a queue with per-row ✕ Remove (rev 3.3 trial scope). This is local page state, becomes a persisted doc only when the school clicks "Upload" / "Add".
- **File input + Upload/Add button:**
  - File input is **always available** during P4 (consistent with §16 P3 always-open rule).
  - `!phase4Docs?.length` → button: **"📤 Upload Documents"** (`btn-primary`, disabled when `p4NewFiles.length === 0`).
  - `phase4Docs?.length > 0` → button: **"📎 Add Documents"** (`btn-secondary`, disabled when `p4NewFiles.length === 0`).
- **Mark Documents Ready button:** Visible only when `phase4Docs?.length > 0`. Calls `markReady()` → `advancePhase(5, 'Admission documents ready and verified')`. Unchanged from rev 3.2.

**Storage shape (new field on `application`):**

```ts
interface P4Attachment {
  name: string             // original file name
  dataUrl: string          // base64 data URL (mock storage; replace with API in prod)
  uploadedAt: string       // ISO timestamp
  uploadedBy: string       // 'school-admin'
}
application.phase4Docs: P4Attachment[]  // NEW in rev 3.3
```

**localStorage migration:** Existing applications persisted before rev 3.3 are missing `phase4Docs`. The `loadState()` path MUST back-fill `phase4Docs: []` on every read (same defensive pattern as `studentFiles` in §16.1). If `phase4Docs` is missing on the mock object, initialize to `[]` on `application` value initialization.

**Out of scope (deferred):**
- Student-side mirror of P4 file exchange (school sends docs → student receives). Per §16.1, would be a separate section; not needed for the P4 trial.
- Per-template-doc upload slot (one file per §17 template item, e.g. "Upload CAS Letter here"). The current rev 3.3 design is generic — school uploads any number of files into a flat list, then optionally `Mark Documents Ready`. Template-name binding is a future enhancement.
- Delete uploaded P4 docs (per §16 audit-trail rule, mirror: once in `phase4Docs`, no per-doc remove). To "correct", append a revised file via "Add Documents".

**Click-test scenarios:**

| # | Scenario | Expected |
|---|----------|----------|
| (a) Open P4 (currentPhase=4) with empty `phase4Docs` | Pending queue empty, "📤 Upload Documents" button disabled, "Mark Documents Ready" not visible |
| (b) School picks 1 PDF, file appears in pending queue | "📤 Upload Documents" button enabled, file row shows name + ✕ Remove |
| (c) School clicks ✕ on the pending file | File removed from queue, button disabled again |
| (d) School picks 2 PDFs, clicks "📤 Upload Documents" | Pending queue clears, 2 files appear in sent list (read-only), "📎 Add Documents" replaces "📤 Upload Documents", "✅ Mark Documents Ready" now visible |
| (e) School picks 1 more PDF + clicks "📎 Add Documents" | Pending queue clears, sent list grows to 3 files |
| (f) School clicks "✅ Mark Documents Ready" | `advancePhase(5, ...)` runs, page jumps to P5 view |
| (g) Open P4 with `currentPhase=5` (already past P4) | File input still visible (per §16 always-open rule), upload + add buttons still work for late additions. "Mark Documents Ready" NOT shown (already advanced). |
| (h) Mobile 414px viewport | File input + buttons stack vertically, queue rows remain readable, no horizontal overflow |

---

## 23. P5 Dev Stub (NEW in rev 3.3, 2026-06-22)

**Rule:** P5 (Pre-Departure) Step 2 (Confirm Visa Granted) requires the **student** to upload the visa granted PDF on the student-side P5 page. Until that page is wired up (`pages/student/applications/[id].vue` P5 step), the school's P5 view provides a **temporary "🔬 Dev tools" affordance** (collapsed by default) that simulates the student's Step 2 actions in one click:

1. **Student uploaded visa granted PDF** — sets `application.phase5VisaGrantedDocument` to a placeholder file ref (`dev_simulated_visa_grant.pdf`).
2. **School confirmed visa granted** — sets `application.phase5VisaGrantedAt = now` and `application.subStatus = P5_SUB_STATUS.P5_VISA_GRANTED`.

After the dev sim, the school can immediately use the real `✅ Confirm Visa Granted` button (which becomes "already granted" state) or proceed to **Step 3 (Mark Travel Arranged)** and **Step 4 (Confirm Arrival)** via the real school-side buttons.

**Audit tagging:** All dev sim entries are stamped with `by: 'school-admin (dev sim)'` for trivial filter / cleanup.

**Visibility:** Only when `application.visaRequested === true` (no dev sim needed for non-visa path).

**Removal:** REMOVE THIS WHOLE PANEL + HANDLER when `pages/student/applications/[id].vue` P5 student-side is built and wires up the real student upload + confirm flow.

---

## 24. P5 Travel Arrangements (rev 3.4, 2026-06-22 — section restructure)

**Rule (rev 3.4):** P5 Step 3 (Travel Arrangements) is a **two-section form by topic**, NOT by role:

- **§24.1 ✈️ Flight** — **only shown when `application.visaRequested === true`**. Fields are **optional** (not required even when section is shown). Either side (school or student) can fill.
- **§24.2 🚗 To-school Transportation** — **always shown** for every P5 student. Either side can fill. **ETA is required** to enable "Mark Travel Arranged".

Each section is a **single shared editing surface**: both school and student can edit any field. The bottom of each section carries a **💬 free-text notes box** that either side can write into (last-write-wins, no merge conflict expected since the notes box is free-form prose).

**Why the restructure (rev 3.4):** The rev 3.3 "two-part by role" model (student part / school part) forced a single writer per part, which made the airport-transfer vs. taxi distinction ambiguous when the school arranged the taxi. The rev 3.4 model groups fields by **topic** (what is being recorded) rather than **who filled it**, so both parties can correct or supplement any field naturally.

### 24.1 Flight section (conditional, optional)

**Visibility:** Rendered only if `application.visaRequested === true`. If `visaRequested === false`, this whole section is hidden (no placeholder, no message — Flight only matters for visa applicants).

**Editable by:** Either side (school or student). Last-write-wins per field.

**Fields (each on its own row):**

| Field | Type | Notes |
|---|---|---|
| ✈️ Flight number | text | e.g. `CX251` |
| 🛬 Arrival airport (UK) | select | `LHR`, `LGW`, `STN`, `MAN`, `BHX`, `EDI`, `Other` |
| 📅 Arrival date | date | — |
| ⏰ Arrival time (local UK) | time | — |
| 💬 Notes | textarea | **Free-text box at bottom** — both sides can write any important points (e.g. "Flight delayed 2h", "BA rebooked to CX257 same day") |

**Required:** None. All fields optional.

### 24.2 To-school Transportation section (always shown)

**Visibility:** Always rendered on P5.

**Editable by:** Either side. Last-write-wins per field.

**Top-level fields (each on its own row):**

| Field | Type | Required? |
|---|---|---|
| 🚕 Transfer mode | radio | (drives sub-fields below) |
| ⏰ ETA (estimated arrival at school) | datetime-local | **Yes** — required for "Mark Travel Arranged" |

**Transfer mode options:**

| Mode | Sub-fields (each on own row) |
|---|---|
| 🚕 **Airport taxi** | Taxi company · Driver name · Driver phone · Vehicle (model + plate) · Booking reference (optional) |
| 🚆 **Train** | Planned route (line + station + changeovers) |
| 👨‍👩‍👧 **Drop off by parents** | Parent / guardian name · Contact phone |

**Bottom of section:** 💬 Notes (textarea, free-text — both sides can write any important points, e.g. "Parents bringing younger sibling too", "Train strikes possible — fallback taxi booked").

### 24.3 Cross-portal sync

- Storage key: `bsp:travel:${applicationId}` (unchanged from rev 3.3).
- Plan shape:
  ```ts
  interface TravelPlan {
    flight: {
      flightNumber: string
      arrivalAirport: string
      arrivalDate: string  // ISO date
      arrivalTime: string  // HH:mm
      notes: string        // free-text, jointly editable
      lastEditedBy: 'student' | 'school' | ''
      lastEditedAt: string | null  // ISO timestamp
    }
    transportation: {
      mode: '' | 'taxi' | 'train' | 'parents'
      eta: string  // datetime-local string
      // taxi-specific
      taxiCompany: string
      driverName: string
      driverPhone: string
      vehicle: string
      bookingRef: string
      // train-specific
      trainRoute: string
      // parents-specific
      parentName: string
      parentPhone: string
      // shared
      notes: string        // free-text, jointly editable
      lastEditedBy: 'student' | 'school' | ''
      lastEditedAt: string | null
    }
    status: 'pending' | 'in_progress' | 'travel_arranged'
  }
  ```
- **Legacy migration (rev 3.3 → rev 3.4):** On load, if the plan has the old `studentPart` / `schoolPart` shape (no `flight` / `transportation` keys), copy values across: `studentPart.{flightNumber, arrivalAirport, arrivalDate, arrivalTime, notes}` → `flight.*`; `studentPart.transferMode === 'self-taxi' | 'school-pickup'` → `transportation.mode = 'taxi'`; `'family'` → `'parents'`; `'public'` → `'train'`; taxi sub-fields from `studentPart` → `transportation.*`; school part fields → `transportation.{driverName, driverPhone, vehicle, eta}`. After migration, the legacy keys are dropped.
- Each field last-write-wins. There is no merge conflict because the model is intentionally flat (no separate "mine vs yours" partition).
- A `useTravelStore` composable centralises the load/save logic, mirroring `useP3Store` (§16) and `useInterviewStore` (§18).

### 24.4 Mark Travel Arranged button (school side Step 3)

- **Enabled when:**
  1. If `visaRequested === true`: `application.phase5VisaGrantedAt` is set (Step 2 done per §18.1).
  2. **AND** `transportation.mode` is filled (one of `'taxi' | 'train' | 'parents'`).
  3. **AND** `transportation.eta` is filled.
- Flight fields are **NOT** required for the gate, even when the Flight section is rendered.
- **Action:** Sets `application.subStatus = P5_SUB_STATUS.P5_TRAVEL_ARRANGED` and stamps the travel plan `status = 'travel_arranged'`.

### 24.5 Dev affordance (temporary, mirror §23)

Until the real student-side Travel Arrangements form on `pages/student/applications/[id].vue` is wired up for end-to-end, the school side provides a **🔬 Dev tools** panel (collapsed by default) with a "🧪 Simulate student travel info" button that auto-fills the **transportation** section with sensible test data (mode = taxi, ETA = 14 days from now, driver details). Same `school-admin (dev sim)` audit tag.

### 24.6 Removal

When the real student-side P5 Travel Arrangements form is built and wired to `useTravelStore`:
- Delete the dev affordance panel + `onP5DevSimulateStudentTravel` handler
- Delete spec §24.5

### 24.7 Click-test scenarios (rev 3.4)

| # | Scenario | Expected |
|---|----------|----------|
| (a) Open P5 with `visaRequested = true`, no data | ✈️ Flight section visible (4 fields + notes). 🚗 Transportation section visible (mode + ETA + notes). Both editable. "Mark Travel Arranged" disabled. Hint: "Fill transfer mode + ETA to enable." |
| (b) Open P5 with `visaRequested = false`, no data | ✈️ Flight section **NOT rendered** (no placeholder). 🚗 Transportation section visible. |
| (c) Fill transportation mode = taxi + ETA only | "Mark Travel Arranged" **enabled**. Flight fields stay optional. |
| (d) Save transportation from school side | Student-side P5 page shows the same transportation values within 1-2s (reactive cache). Edit button appears on student side. |
| (e) Save flight from student side | School-side P5 page shows flight values (read-only here is fine — both can edit). |
| (f) Write to transportation notes box from school | Student sees the school note text. Student adds their own note → student note appended below (or replaced, last-write-wins). |
| (g) Legacy rev 3.3 plan exists in localStorage | Load migrates to rev 3.4 shape; no data loss; UI renders correctly. |

