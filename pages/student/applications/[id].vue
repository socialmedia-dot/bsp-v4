<template>
  <div class="application-detail-page">
    <!-- Header -->
    <header class="navbar">
      <div class="container navbar-content">
        <NuxtLink to="/" class="logo">
          <img src="/img/logo-bsp.jpg" alt="British School Portal Logo" class="logo-img">
        </NuxtLink>
        <nav>
          <ul class="nav-links">
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li><NuxtLink to="/schools">Schools</NuxtLink></li>
            <li><NuxtLink to="/student/profile">Profile</NuxtLink></li>
            <li><NuxtLink to="/student/applications">My Applications</NuxtLink></li>
            <li><NuxtLink to="/student/login" class="btn btn-primary">Logout</NuxtLink></li>
          </ul>
        </nav>
      </div>
    </header>

    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <div class="header-row">
          <div>
            <div class="ref-badge">📋 {{ application.refNumber }}</div>
            <h1>{{ application.schoolName }}</h1>
            <p>{{ application.schoolLocation }} · Applied {{ formatDate(application.appliedAt) }}</p>
          </div>
          <div class="status-badge" :class="'status-' + application.status">
            {{ statusLabel }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container main-content">
      <!-- Phase Timeline -->
      <div class="card">
        <PhaseTimeline :current-phase="application.currentPhase" :sub-status="application.subStatus" />
      </div>

      <!-- Two Column Layout -->
      <div class="detail-grid">
        <!-- Left Column -->
        <div class="detail-left">
          <!-- Application Info -->
          <div class="info-card">
            <h3>📋 Application Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Reference</span>
                <span class="info-value">{{ application.refNumber }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Student</span>
                <span class="info-value">{{ application.studentName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">School</span>
                <span class="info-value">{{ application.schoolName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Year of Entry</span>
                <span class="info-value">{{ application.yearOfEntry }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Consultant</span>
                <span class="info-value">{{ application.consultantName || 'Not assigned' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Current Phase</span>
                <span class="info-value">{{ currentPhaseLabel }}</span>
              </div>
            </div>
          </div>

          <!-- Phase Actions (hidden for P2 — interview card takes over) -->
          <div v-if="application.currentPhase !== 2" class="info-card">
            <h3>⚙️ Actions</h3>
            <div class="action-list">
              <div v-for="action in phaseActions" :key="action.id" class="action-item">
                <div class="action-icon">{{ action.icon }}</div>
                <div class="action-body">
                  <div class="action-title">{{ action.title }}</div>
                  <div class="action-desc">{{ action.description }}</div>
                </div>
                <button v-if="action.available" class="btn-action" @click="doAction(action)">
                  {{ action.buttonText }}
                </button>
                <span v-else class="action-locked">🔒</span>
              </div>
            </div>
          </div>

          <!-- P2 Interview Section -->
          <div v-else class="info-card">
            <h3>📅 Interview</h3>
            <div v-if="!application.interview" class="interview-waiting">
              <div class="waiting-icon">🏫</div>
              <p>The school will schedule an interview with you soon. You'll see all the details here once they're ready.</p>
            </div>
            <div v-else class="interview-card">
              <div class="interview-header">
                <span v-if="application.interview.status === 'pending'" class="status-pill status-pill-pending">⏳ Awaiting your confirmation</span>
                <span v-else-if="application.interview.status === 'confirmed'" class="status-pill status-pill-confirmed">✅ Confirmed</span>
                <span v-else-if="application.interview.status === 'change-requested'" class="status-pill status-pill-change">📤 Change request sent</span>
              </div>

              <div class="interview-details">
                <div class="detail-row"><span class="detail-label">📅 Date</span><span class="detail-value">{{ formatInterviewDate(application.interview.date) }}</span></div>
                <div class="detail-row"><span class="detail-label">🕐 Time</span><span class="detail-value">{{ application.interview.startTime }} ({{ application.interview.durationMinutes }} min)</span></div>
                <div v-if="application.interview.type !== 'online' && application.interview.location" class="detail-row"><span class="detail-label">📍 Location</span><span class="detail-value">{{ application.interview.location }}</span></div>
                <div v-if="application.interview.type !== 'in-person' && application.interview.onlineLink" class="detail-row"><span class="detail-label">🔗 Online link</span><span class="detail-value"><a :href="application.interview.onlineLink" target="_blank" rel="noopener">Join interview</a></span></div>
                <div class="detail-row detail-row-block"><span class="detail-label">📋 Agenda</span><span class="detail-value">{{ application.interview.agenda }}</span></div>
                <div v-if="application.interview.notes" class="detail-row detail-row-block"><span class="detail-label">📝 Notes from school</span><span class="detail-value">{{ application.interview.notes }}</span></div>
              </div>

              <div v-if="application.interview.status === 'pending' && !editingChange" class="interview-actions">
                <button class="btn-confirm" @click="confirmInterview">✅ Confirm Attendance</button>
                <button class="btn-suggest" @click="startSuggestChange">🔄 Suggest Change</button>
              </div>

              <div v-if="editingChange" class="change-form">
                <label class="form-label">💬 Tell the school what doesn't work for you</label>
                <textarea v-model="changeMessage" placeholder="e.g. I have a school exam that day. Could we reschedule to the following week?" rows="4" class="form-input"></textarea>
                <div class="form-actions">
                  <button class="btn-confirm" @click="submitChangeRequest">📤 Send Change Request</button>
                  <button class="btn-cancel" @click="cancelChange">Cancel</button>
                </div>
              </div>

              <div v-if="application.interview.status === 'confirmed'" class="confirmed-banner">
                🎉 You've confirmed. See you on <strong>{{ formatInterviewDate(application.interview.date) }}</strong> at <strong>{{ application.interview.startTime }}</strong>.
              </div>

              <div v-if="application.interview.status === 'change-requested'" class="change-banner">
                📤 Your change request has been sent. The school will review it and get back to you.
              </div>
            </div>
          </div>

          <!-- Attachments -->
          <AttachmentPanel :attachments="application.attachments" />
        </div>

        <!-- Right Column -->
        <div class="detail-right">
          <ChatRoom :application-ref="application.refNumber" user-role="student" />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer-content">
        <p>© 2026 British School Portal. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
const route = useRoute()
const id = route.params.id

// Interview state (P2 cross-portal sync with school)
const editingChange = ref(false)
const changeMessage = ref('')
const INTERVIEW_KEY = computed(() => `bsp:interview:${id}`)

// Mock data — will be replaced by API
const application = ref({
  id,
  refNumber: '2026-X7K9M2P4',
  studentName: 'Zhang Xiaoming',
  schoolName: 'Westminster School',
  schoolLocation: 'London, UK',
  schoolPhoto: '/img/schools/westminster.jpg',
  yearOfEntry: 'September 2027',
  consultantName: 'Sarah Chen',
  currentPhase: 2,
  subStatus: 'Awaiting Confirmation',
  status: 'active',
  appliedAt: '2026-05-15T10:00:00Z',
  interview: null,
  attachments: [
    { id: 'a1', fileName: 'Passport_Copy.pdf', fileSize: '1.2 MB', fileType: 'application/pdf', phase: 1, phaseLabel: 'Application Submitted', uploadedBy: 'student', uploadedByRole: 'Student', createdAt: '2026-05-15T10:05:00Z' },
    { id: 'a2', fileName: 'Academic_Transcript.pdf', fileSize: '2.4 MB', fileType: 'application/pdf', phase: 1, phaseLabel: 'Application Submitted', uploadedBy: 'student', uploadedByRole: 'Student', createdAt: '2026-05-15T10:06:00Z' },
    { id: 'a3', fileName: 'Interview_Invitation.pdf', fileSize: '0.8 MB', fileType: 'application/pdf', phase: 2, phaseLabel: 'Interview & Assessment', uploadedBy: 'school', uploadedByRole: 'School', createdAt: '2026-06-02T09:00:00Z' },
  ]
})

const phaseLabels = [
  'Application Submitted',
  'Interview & Assessment',
  'Decision',
  'Offer & Acceptance',
  'Admission Documents',
  'Visa & Travel',
  'Enrolled'
]

const currentPhaseLabel = computed(() => phaseLabels[application.value.currentPhase - 1] || '')

const statusLabel = computed(() => {
  const s = application.value.status
  if (s === 'active') return 'In Progress'
  if (s === 'rejected') return 'Rejected'
  if (s === 'completed') return 'Completed'
  return s
})

const phaseActions = computed(() => {
  const phase = application.value.currentPhase
  const actions = []

  if (phase === 1) {
    actions.push({ id: 'view', icon: '👁', title: 'View Application', description: 'Review your submitted application details', buttonText: 'View', available: true })
    actions.push({ id: 'edit', icon: '✏️', title: 'Edit Application', description: 'Modify application before review starts', buttonText: 'Edit', available: false })
  } else if (phase === 2) {
    actions.push({ id: 'interview', icon: '📅', title: 'Interview Schedule', description: 'Confirm or reschedule your interview slot', buttonText: 'Manage', available: true })
    actions.push({ id: 'prep', icon: '📚', title: 'Interview Preparation', description: 'Guidance and tips for your interview', buttonText: 'View', available: true })
  } else if (phase === 3) {
    actions.push({ id: 'await', icon: '⏳', title: 'Awaiting Decision', description: 'School is reviewing your application', buttonText: 'View', available: true })
  } else if (phase === 4) {
    actions.push({ id: 'offer', icon: '📋', title: 'Offer Letter', description: 'Download and sign your offer letter', buttonText: 'View', available: true })
    actions.push({ id: 'deposit', icon: '💳', title: 'Pay Deposit', description: 'Complete deposit payment to secure place', buttonText: 'Pay', available: true })
  } else if (phase === 5) {
    actions.push({ id: 'docs', icon: '📁', title: 'Admission Documents', description: 'Download your admission documents', buttonText: 'Download', available: true })
  } else if (phase === 6) {
    actions.push({ id: 'visa', icon: '🏛️', title: 'Visa Application', description: 'Track your visa application progress', buttonText: 'Track', available: application.value.visaRequired })
    actions.push({ id: 'travel', icon: '✈️', title: 'Travel Arrangements', description: 'Plan your journey to the UK', buttonText: 'Plan', available: true })
  } else if (phase === 7) {
    actions.push({ id: 'enrolled', icon: '🎉', title: 'Enrolled', description: 'Welcome! Your enrolment is complete.', buttonText: 'View', available: true })
  }

  return actions
})

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function doAction(action) {
  alert(`${action.title} — This feature will connect to API later.`)
}

// --- Interview functions (P2 student-side) ---
function loadSharedInterview() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(INTERVIEW_KEY.value)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  return null
}

function saveSharedInterview() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(INTERVIEW_KEY.value, JSON.stringify(application.value.interview))
  } catch (e) { /* ignore */ }
}

function confirmInterview() {
  if (!application.value.interview) return
  if (!confirm('Confirm you will attend this interview?')) return
  application.value.interview.status = 'confirmed'
  application.value.interview.studentResponse = {
    action: 'confirm',
    message: '',
    respondedAt: new Date().toISOString()
  }
  application.value.interview.history = [
    ...(application.value.interview.history || []),
    { event: 'student-confirmed', by: 'student', message: 'Student confirmed attendance', timestamp: new Date().toISOString() }
  ]
  saveSharedInterview()
}

function startSuggestChange() {
  editingChange.value = true
  changeMessage.value = ''
}

function cancelChange() {
  editingChange.value = false
  changeMessage.value = ''
}

function submitChangeRequest() {
  if (!application.value.interview) return
  if (!changeMessage.value.trim()) {
    alert("Please write a message explaining what doesn't work for you.")
    return
  }
  if (!confirm('Send this change request to the school?')) return
  application.value.interview.status = 'change-requested'
  application.value.interview.studentResponse = {
    action: 'change',
    message: changeMessage.value.trim(),
    respondedAt: new Date().toISOString()
  }
  application.value.interview.history = [
    ...(application.value.interview.history || []),
    { event: 'student-change-requested', by: 'student', message: changeMessage.value.trim(), timestamp: new Date().toISOString() }
  ]
  saveSharedInterview()
  editingChange.value = false
  changeMessage.value = ''
}

function formatInterviewDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(() => {
  // Cross-portal sync: load interview set by school
  const shared = loadSharedInterview()
  if (shared !== null) {
    application.value.interview = shared
  }
})
</script>

<style scoped>
.application-detail-page { min-height: 100vh; display: flex; flex-direction: column; }

/* Navbar — matches existing student pages */
.navbar { background: #fff; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100; }
.navbar-content { display: flex; align-items: center; justify-content: space-between; height: 64px; }
.logo-img { height: 40px; }
.nav-links { display: flex; list-style: none; gap: 1.5rem; align-items: center; margin: 0; padding: 0; }
.nav-links a { text-decoration: none; color: #334155; font-size: 0.9rem; font-weight: 500; }
.nav-links a:hover { color: #3b82f6; }
.btn-primary { background: #3b82f6; color: #fff !important; padding: 0.4rem 1rem; border-radius: 6px; }

/* Page Header */
.page-header { background: linear-gradient(135deg, #1e293b, #334155); color: #fff; padding: 2rem 0; }
.header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.ref-badge { display: inline-block; background: rgba(255,255,255,0.15); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.5rem; }
.page-header h1 { margin: 0; font-size: 1.8rem; }
.page-header p { margin: 0.25rem 0 0; opacity: 0.8; font-size: 0.9rem; }
.status-badge { padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
.status-active { background: #dbeafe; color: #1d4ed8; }
.status-rejected { background: #fee2e2; color: #b91c1c; }
.status-completed { background: #dcfce7; color: #15803d; }

/* Main Content */
.main-content { flex: 1; padding: 1.5rem 0; display: flex; flex-direction: column; gap: 1.5rem; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.5rem 1rem; }

/* Two Column Grid */
.detail-grid { display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; }
@media (max-width: 1024px) { .detail-grid { grid-template-columns: 1fr; } }

/* Info Cards */
.info-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; }
.info-card h3 { margin: 0 0 1rem; font-size: 1rem; color: #1e293b; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem 1.5rem; }
@media (max-width: 640px) { .info-grid { grid-template-columns: 1fr; } }
.info-item { display: flex; flex-direction: column; gap: 2px; }
.info-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.03em; }
.info-value { font-size: 0.9rem; font-weight: 600; color: #1e293b; }

/* Actions */
.action-list { display: flex; flex-direction: column; gap: 0.75rem; }
.action-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 10px; }
.action-icon { font-size: 1.3rem; width: 36px; text-align: center; }
.action-body { flex: 1; min-width: 0; }
.action-title { font-size: 0.85rem; font-weight: 600; color: #1e293b; }
.action-desc { font-size: 0.75rem; color: #64748b; }
.btn-action { background: #3b82f6; color: #fff; border: none; padding: 0.4rem 0.9rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.btn-action:hover { background: #2563eb; }
.action-locked { font-size: 1rem; opacity: 0.4; padding: 0 0.5rem; }

/* Interview card (P2 student-side) */
.interview-waiting { text-align: center; padding: 2rem 1rem; color: #64748b; }
.interview-waiting .waiting-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.interview-waiting p { margin: 0; font-size: 0.9rem; line-height: 1.5; }
.interview-card { display: flex; flex-direction: column; gap: 0.85rem; }
.interview-header { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.status-pill { display: inline-block; padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.status-pill-pending { background: #fef3c7; color: #92400e; }
.status-pill-confirmed { background: #dcfce7; color: #15803d; }
.status-pill-change { background: #fee2e2; color: #b91c1c; }
.interview-details { background: #f8fafc; border-radius: 8px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
.detail-row { display: flex; gap: 0.75rem; align-items: baseline; font-size: 0.85rem; }
.detail-row-block { flex-direction: column; align-items: stretch; gap: 0.25rem; }
.detail-label { color: #64748b; font-weight: 500; min-width: 110px; }
.detail-value { color: #1e293b; font-weight: 600; }
.detail-value a { color: #3b82f6; text-decoration: none; }
.detail-value a:hover { text-decoration: underline; }
.interview-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; padding-top: 0.5rem; }
.btn-confirm { background: #10b981; color: #fff; border: none; padding: 0.55rem 1.1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-confirm:hover { background: #059669; }
.btn-suggest { background: #fff; color: #475569; border: 1px solid #cbd5e1; padding: 0.55rem 1.1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-suggest:hover { background: #f1f5f9; }
.btn-cancel { background: #fff; color: #64748b; border: 1px solid #e2e8f0; padding: 0.55rem 1.1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-cancel:hover { background: #f8fafc; }
.change-form { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.6rem; }
.form-label { font-size: 0.8rem; font-weight: 600; color: #475569; }
.form-input { padding: 0.55rem 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; font-family: inherit; background: #fff; color: #1e293b; resize: vertical; }
.form-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
.form-actions { display: flex; gap: 0.5rem; padding-top: 0.25rem; }
.confirmed-banner { background: #dcfce7; color: #15803d; padding: 0.75rem; border-radius: 8px; font-size: 0.9rem; text-align: center; }
.change-banner { background: #fff7ed; color: #7c2d12; padding: 0.75rem; border-radius: 8px; font-size: 0.9rem; text-align: center; }

/* Footer */
.footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 1.5rem 0; margin-top: auto; }
.footer-content { text-align: center; color: #64748b; font-size: 0.85rem; }
</style>