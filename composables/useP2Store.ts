// BSP v4 — P2 Interview + Decision Store
// Manages applications, interview rounds, reports, and manager decisions.
// All state persisted to localStorage. Cross-portal sync (school/consultant/student).

export interface P2Interview {
  id: string
  applicationRef: string
  roundNumber: number
  date: string         // YYYY-MM-DD
  time: string         // HH:MM
  location: string     // free text — physical address or 'Online' etc.
  interviewer: string  // person name (e.g. "Mr. Smith" or "Sarah Chen")
  interviewerRole: 'school' | 'consultant'
  agenda?: string
  status: 'scheduled' | 'completed'
  scheduledAt: string  // ISO
  scheduledBy: string
}

export interface P2Report {
  id: string
  applicationRef: string
  interviewId: string
  roundNumber: number
  overallRating: 1 | 2 | 3 | 4 | 5
  recommendation: 'recommend' | 'maybe' | 'not-recommend'
  notes: string        // max 200 chars
  interviewer: string
  interviewerRole: 'school' | 'consultant'
  submittedAt: string  // ISO
}

export interface P2Decision {
  id: string
  applicationRef: string
  outcome: 'approved' | 'rejected'
  reason?: string      // optional, recorded when outcome is 'rejected'
  decidedBy: string
  decidedAt: string    // ISO
  reportIds: string[]
}

export interface P2Application {
  refNumber: string
  studentName: string
  studentNationality: string
  studentDob: string
  studentEmail: string
  studentPhone: string
  guardianName: string
  schoolName: string
  yearOfEntry: string
  entryGrade: string
  consultantName: string | null
  consultantAssignedToP2: boolean
  currentPhase: number  // 1=App, 2=Interview+Decision, 3=Offer, 4=Docs, 5=Visa, 6=Enrolled
  subStatus: string
  status: 'active' | 'rejected' | 'completed' | 'pending-decision'
  appliedAt: string
}

const KEYS = {
  applications: 'bsp-v4-applications',
  interviews: 'bsp-v4-interviews',
  reports: 'bsp-v4-reports',
  decisions: 'bsp-v4-decisions',
}

// ---- Sample / Seeded Data ----
// Default application: a P1-fresh record so the P2 demo URL (`/school/applications/2026-X7K9M2P4/`)
// loads as a fresh P1 application (no preset interviews/reports). The user can then click
// through phases P1 → P7 from a clean slate (see docs/admission-pipeline-v2.md §14).
const SEED_APP: P2Application = {
  refNumber: '2026-X7K9M2P4',
  studentName: 'Zhang Xiaoming',
  studentNationality: 'Hong Kong',
  studentDob: '15 May 2008',
  studentEmail: 'xiaoming.zhang@email.com',
  studentPhone: '+852 9123 4567',
  guardianName: 'Zhang Wei',
  schoolName: 'Westminster School',
  yearOfEntry: 'September 2027',
  entryGrade: 'Year 12 (Sixth Form)',
  consultantName: 'Sarah Chen',
  consultantAssignedToP2: false,
  currentPhase: 1,
  subStatus: 'Application Submitted',
  status: 'active',
  appliedAt: '2026-05-15T10:00:00Z',
}

// No preset interview rounds. Users schedule their own rounds from P2.
// This keeps the click-through demo clean — no pre-populated records.
const SEED_INTERVIEWS: P2Interview[] = []

// No preset interview reports.
const SEED_REPORTS: P2Report[] = []

// No SEED_DECISIONS — manager makes the decision in the UI.

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function loadArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  return []
}

function saveArray<T>(key: string, arr: T[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(arr))
  } catch (e) { /* ignore */ }
}

// Singleton state so all pages share the same in-memory data + localStorage.
const _applications = ref<P2Application[]>([])
const _interviews = ref<P2Interview[]>([])
const _reports = ref<P2Report[]>([])
const _decisions = ref<P2Decision[]>([])
let _initialized = false

function init() {
  if (_initialized) return
  if (typeof window === 'undefined') return
  _initialized = true

  const apps = loadArray<P2Application>(KEYS.applications)
  if (apps.length === 0) {
    // First visit: seed the sample
    _applications.value = [SEED_APP]
    _interviews.value = [...SEED_INTERVIEWS]
    _reports.value = [...SEED_REPORTS]
    _decisions.value = []
    saveArray(KEYS.applications, _applications.value)
    saveArray(KEYS.interviews, _interviews.value)
    saveArray(KEYS.reports, _reports.value)
    saveArray(KEYS.decisions, _decisions.value)
  } else {
    _applications.value = apps
    _interviews.value = loadArray<P2Interview>(KEYS.interviews)
    _reports.value = loadArray<P2Report>(KEYS.reports)
    _decisions.value = loadArray<P2Decision>(KEYS.decisions)
  }
}

export function useP2Store() {
  if (typeof window !== 'undefined' && !_initialized) {
    init()
  }

  function getApplication(ref: string): P2Application | undefined {
    return _applications.value.find(a => a.refNumber === ref)
  }

  function getInterviews(ref: string): P2Interview[] {
    return _interviews.value
      .filter(i => i.applicationRef === ref)
      .sort((a, b) => a.roundNumber - b.roundNumber)
  }

  function getReports(ref: string): P2Report[] {
    return _reports.value
      .filter(r => r.applicationRef === ref)
      .sort((a, b) => a.roundNumber - b.roundNumber)
  }

  function getDecisions(ref: string): P2Decision[] {
    return _decisions.value
      .filter(d => d.applicationRef === ref)
      .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime())
  }

  function getReportForInterview(interviewId: string): P2Report | undefined {
    return _reports.value.find(r => r.interviewId === interviewId)
  }

  function getLatestInterview(ref: string): P2Interview | undefined {
    const list = getInterviews(ref)
    return list.length ? list[list.length - 1] : undefined
  }

  function getPastInterviews(ref: string): P2Interview[] {
    const list = getInterviews(ref)
    return list.length > 1 ? list.slice(0, -1) : []
  }

  // Schedule a new interview round.
  function scheduleInterview(opts: {
    applicationRef: string
    date: string
    time: string
    location: string
    interviewer: string
    interviewerRole: 'school' | 'consultant'
    agenda?: string
    scheduledBy: string
  }): P2Interview {
    const existing = getInterviews(opts.applicationRef)
    const roundNumber = existing.length + 1
    const interview: P2Interview = {
      id: uid('iv'),
      applicationRef: opts.applicationRef,
      roundNumber,
      date: opts.date,
      time: opts.time,
      location: opts.location,
      interviewer: opts.interviewer,
      interviewerRole: opts.interviewerRole,
      agenda: opts.agenda || '',
      status: 'scheduled',
      scheduledAt: new Date().toISOString(),
      scheduledBy: opts.scheduledBy,
    }
    _interviews.value = [..._interviews.value, interview]
    saveArray(KEYS.interviews, _interviews.value)

    // Move application back to P2 active state if it was rejected/etc.
    const app = getApplication(opts.applicationRef)
    if (app && (app.status === 'pending-decision' || app.status === 'rejected')) {
      // New round = keep P2 active but reset sub-status
      app.subStatus = 'Interview Scheduled'
      app.status = 'active'
      _applications.value = [..._applications.value]
      saveArray(KEYS.applications, _applications.value)
    }
    return interview
  }

  // Submit a report for a specific interview round.
  function submitReport(opts: {
    applicationRef: string
    interviewId: string
    overallRating: 1 | 2 | 3 | 4 | 5
    recommendation: 'recommend' | 'maybe' | 'not-recommend'
    notes: string
    interviewer: string
    interviewerRole: 'school' | 'consultant'
  }): P2Report {
    const interview = _interviews.value.find(i => i.id === opts.interviewId)
    if (!interview) throw new Error('Interview not found')

    // One report per round (immutable once submitted)
    const existing = getReportForInterview(opts.interviewId)
    if (existing) throw new Error('Report already submitted for this round (immutable)')

    const report: P2Report = {
      id: uid('rp'),
      applicationRef: opts.applicationRef,
      interviewId: opts.interviewId,
      roundNumber: interview.roundNumber,
      overallRating: opts.overallRating,
      recommendation: opts.recommendation,
      notes: opts.notes.slice(0, 200),
      interviewer: opts.interviewer,
      interviewerRole: opts.interviewerRole,
      submittedAt: new Date().toISOString(),
    }
    _reports.value = [..._reports.value, report]
    saveArray(KEYS.reports, _reports.value)

    // Mark interview as completed
    interview.status = 'completed'
    _interviews.value = [..._interviews.value]
    saveArray(KEYS.interviews, _interviews.value)

    // If all rounds done, application moves to "pending decision"
    const allInterviews = getInterviews(opts.applicationRef)
    const allReports = getReports(opts.applicationRef)
    if (allInterviews.length > 0 && allInterviews.every(i => getReportForInterview(i.id))) {
      const app = getApplication(opts.applicationRef)
      if (app) {
        app.subStatus = 'Decision Pending'
        app.status = 'pending-decision'
        _applications.value = [..._applications.value]
        saveArray(KEYS.applications, _applications.value)
      }
    }
    return report
  }

  // Manager decision: approve or reject.
  function makeDecision(opts: {
    applicationRef: string
    outcome: 'approved' | 'rejected'
    reason?: string
    decidedBy: string
  }): P2Decision {
    // Rejection reason is optional — accept empty string or undefined for rejected outcome.
    const reports = getReports(opts.applicationRef)
    if (reports.length === 0) {
      throw new Error('At least 1 interview report must be submitted before deciding.')
    }
    const decision: P2Decision = {
      id: uid('dc'),
      applicationRef: opts.applicationRef,
      outcome: opts.outcome,
      reason: opts.outcome === 'rejected' ? (opts.reason || '').trim() : undefined,
      decidedBy: opts.decidedBy,
      decidedAt: new Date().toISOString(),
      reportIds: reports.map(r => r.id),
    }
    _decisions.value = [..._decisions.value, decision]
    saveArray(KEYS.decisions, _decisions.value)

    // Update application phase
    const app = getApplication(opts.applicationRef)
    if (app) {
      if (opts.outcome === 'approved') {
        app.currentPhase = 3  // P3 = Offer (new 6-phase structure)
        app.subStatus = 'Offer Pending'
        app.status = 'active'
      } else {
        app.currentPhase = 2
        app.subStatus = 'Rejected'
        app.status = 'rejected'
      }
      _applications.value = [..._applications.value]
      saveArray(KEYS.applications, _applications.value)
    }
    return decision
  }

  function getLatestDecision(ref: string): P2Decision | undefined {
    const list = getDecisions(ref)
    return list[0]
  }

  // For Reopen (called by page Restart button — see docs §12).
  // When a rejected application is reopened, the manager decision is voided
  // (the rejection no longer stands). Wipe all decisions for this app so the
  // P2 Manager Decision form (gated by `!latestDecision`) becomes available again.
  // Also revert the app's status from 'rejected' back to a sensible default so
  // the page header badge and p2 store queries reflect the reopened state.
  function reopenApp(appRef: string): void {
    // 1. Remove all decisions for this app (they were voided by reopen)
    _decisions.value = _decisions.value.filter(d => d.applicationRef !== appRef)
    saveArray(KEYS.decisions, _decisions.value)
    // 2. Reset the app's status from 'rejected' back to a sensible default.
    //    If reports exist, set to 'pending-decision' (manager can re-decide now).
    //    Otherwise set to 'active' (clean P1/P2 state with no decision needed yet).
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

  // For testing / reset
  function resetToSeed() {
    _applications.value = [SEED_APP]
    _interviews.value = [...SEED_INTERVIEWS]
    _reports.value = [...SEED_REPORTS]
    _decisions.value = []
    saveArray(KEYS.applications, _applications.value)
    saveArray(KEYS.interviews, _interviews.value)
    saveArray(KEYS.reports, _reports.value)
    saveArray(KEYS.decisions, _decisions.value)
  }

  // For clean restart (called by page Restart button — see docs §14).
  // Wipes ALL P2 data (interviews, reports, decisions) and persists empty arrays.
  // Applications is kept (so getApplication(id) still resolves the page's app).
  function clearAllData() {
    _interviews.value = []
    _reports.value = []
    _decisions.value = []
    saveArray(KEYS.interviews, _interviews.value)
    saveArray(KEYS.reports, _reports.value)
    saveArray(KEYS.decisions, _decisions.value)
  }

  return {
    // state
    applications: _applications,
    interviews: _interviews,
    reports: _reports,
    decisions: _decisions,
    // queries
    getApplication,
    getInterviews,
    getReports,
    getDecisions,
    getReportForInterview,
    getLatestInterview,
    getPastInterviews,
    getLatestDecision,
    // actions
    scheduleInterview,
    submitReport,
    makeDecision,
    resetToSeed,
    clearAllData,
    reopenApp,
  }
}