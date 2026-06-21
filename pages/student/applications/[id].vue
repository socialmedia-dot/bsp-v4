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
              <div class="info-item">
                <span class="info-label">Visa Requested</span>
                <span class="info-value">{{ application.visaRequested ? 'Yes' : 'No' }}</span>
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

    <!-- 📤 Send Files to School (P3 general file exchange, mirror of schoolFiles — see docs §16.1. Always open, even after `confirmed`, for late submissions. See §16.1.1 rev 2.) -->
    <div v-if="p3Latest" class="info-card p3-section">
      <h3>📤 Send Files to School</h3>
      <div class="action-desc">Send signed forms, additional documents, or attachments to the school. PDF, JPG, or PNG, max 5MB each.</div>

      <!-- Sent files (read-only — no delete per docs §16 spec, mirrors schoolFiles) -->
      <div v-if="p3Latest.studentFiles && p3Latest.studentFiles.length" class="p3-files-list">
        <div v-for="(f, i) in p3Latest.studentFiles" :key="i" class="p3-file-row">
          <span class="p3-file-icon">📄</span>
          <a class="p3-file-name" :href="f.dataUrl" target="_blank" rel="noopener">{{ f.name }}</a>
          <span class="p3-file-meta">{{ formatDateTime(f.uploadedAt) }}</span>
        </div>
      </div>
      <p v-else class="p3-empty">No files sent yet. Add the first one below.</p>

      <!-- Pending files queue (local state, not yet sent) -->
      <div v-if="p3StudentNewFiles.length" class="p3-files-list">
        <div v-for="(f, i) in p3StudentNewFiles" :key="`new-${i}`" class="p3-file-row p3-file-row-pending">
          <span class="p3-file-icon">📎</span>
          <span class="p3-file-name">{{ f.name }}</span>
          <span class="p3-file-meta">pending</span>
          <button class="p3-file-remove" @click="removeP3StudentNewFile(i)" title="Remove">✕</button>
        </div>
      </div>

      <!-- Add to queue + Send -->
      <div class="p3-add-file-row">
        <input ref="p3StudentFileInput" type="file" accept=".pdf,.jpg,.jpeg,.png" @change="onP3StudentFileSelected" style="display: none;" />
        <button class="btn btn-secondary" @click="$refs.p3StudentFileInput.click()">➕ Add File</button>
        <button v-if="p3StudentNewFiles.length" class="btn btn-primary" @click="onP3StudentSendFiles">📤 Send to School</button>
      </div>

      <!-- Student confirmation indicator (advisory — see docs §16.1.1 rev 2). Not a gate, but a courtesy signal. -->
      <div v-if="p3Latest.studentFiles && p3Latest.studentFiles.length" class="p3-ready-section">
        <div v-if="!p3Latest.studentReadyForReview" class="p3-ready-action">
          <button class="btn btn-primary btn-mark-ready" @click="onStudentMarkReady">
            ✅ I've uploaded everything
          </button>
          <div class="p3-ready-hint">
            Click to let the school know you've finished uploading all documents. This is a courtesy signal only — the school can still confirm receipt anytime if they have what they need.
          </div>
        </div>
        <div v-else class="p3-ready-banner">
          <span>✅ Marked as ready for school review.</span>
          <span class="p3-ready-banner-spacer"></span>
          <button class="p3-ready-banner-secondary" @click="onStudentMarkNotReady">
            ↩️ Mark as not ready
          </button>
        </div>
      </div>
    </div>

    <!-- 📄 Document Checklist — P3 / Offering (read-only for student, shows school-prepared templates) -->
    <div v-if="application.currentPhase >= 3" class="info-card doc-checklist-section">
      <h3>📄 Document Checklist — Phase 3 (Offering)</h3>
      <div v-if="application.phase3Templates && application.phase3Templates.length" class="doc-checklist">
        <div v-for="(t, i) in application.phase3Templates" :key="i" class="doc-checklist-item">
          <span class="doc-check-icon">📋</span>
          <span class="doc-check-name">{{ t.name }}</span>
          <span class="doc-check-badge" :class="t.signed ? 'badge-signed' : 'badge-pending'">
            {{ t.signed ? '✅ Signed' : '⏳ Awaiting signature' }}
          </span>
        </div>
      </div>
      <p v-else class="p3-empty">No documents prepared by the school yet.</p>
    </div>

    <!-- 📄 Document Checklist — P4 / Admission Documents (read-only for student) -->
    <div v-if="application.currentPhase >= 4" class="info-card doc-checklist-section">
      <h3>📄 Document Checklist — Phase 4 (Admission Documents)</h3>
      <div v-if="application.phase4Templates && application.phase4Templates.length" class="doc-checklist">
        <div v-for="(t, i) in application.phase4Templates" :key="i" class="doc-checklist-item">
          <span class="doc-check-icon">📋</span>
          <span class="doc-check-name">{{ t.name }}</span>
          <span class="doc-check-badge" :class="t.signed ? 'badge-signed' : 'badge-pending'">
            {{ t.signed ? '✅ Signed' : '⏳ Awaiting signature' }}
          </span>
        </div>
      </div>
      <p v-else class="p3-empty">No admission documents prepared yet.</p>
    </div>

    <!-- Hidden file input for P3 deposit proof upload -->
    <input
      id="student-p3-file-input"
      type="file"
      accept="application/pdf,image/jpeg,image/png"
      style="display:none"
      @change="onP3StudentFile"
    />
    <div v-if="p3StudentFile" class="p3-upload-preview">
      <span>📎 {{ p3StudentFile.name }} ready</span>
      <button class="btn btn-primary" @click="onP3UploadProof">Upload Proof</button>
      <button class="btn btn-secondary" @click="p3StudentFile = null">Cancel</button>
    </div>

    <!-- 📄 Document Checklist — P5 / Pre-Departure (read-only for student) -->
    <div v-if="application.currentPhase >= 5" class="info-card doc-checklist-section">
      <h3>📄 Document Checklist — Phase 5 (Pre-Departure)</h3>
      <div v-if="application.phase5Templates && application.phase5Templates.length" class="doc-checklist">
        <div v-for="(t, i) in application.phase5Templates" :key="i" class="doc-checklist-item">
          <span class="doc-check-icon">📋</span>
          <span class="doc-check-name">{{ t.name }}</span>
          <span class="doc-check-badge" :class="t.signed ? 'badge-signed' : 'badge-pending'">
            {{ t.signed ? '✅ Signed' : '⏳ Awaiting signature' }}
          </span>
        </div>
      </div>
      <p v-else class="p3-empty">No pre-departure documents prepared yet.</p>
    </div>

    <!-- ✈️ P5 Pre-Departure — VisaConfirmStep (student uploads visa PDF + confirms) -->
    <div v-if="application.currentPhase === 5" class="info-card p5-visa-section">
      <h3>✈️ Pre-Departure</h3>
      <VisaConfirmStep
        :application-ref="application.refNumber"
        :phase5-visa-granted-document="application.phase5VisaGrantedDocument"
        :phase5-visa-granted-at="application.phase5VisaGrantedAt"
        :visa-requested="application.visaRequested"
        @upload="onVisaGrantedUpload"
        @confirm-granted="onVisaGrantedConfirm"
      />
    </div>

    <!-- ✈️ §24 P5 Step 3 — Travel Arrangements (student side) -->
    <div v-if="application.currentPhase === 5" class="info-card p5-travel-section">
      <h3>✈️ Travel Arrangements</h3>
      <p class="info-note">Two sections: <strong>✈️ Flight</strong> (only if you need a student visa) and <strong>🚗 Transportation</strong> (how you'll get from the UK airport to the school). You and the school can both fill in either section.</p>
      <TravelStep
        :plan="travelPlan"
        mode="student"
        :application-ref="id"
        :visa-requested="!!application.visaRequested"
        @save-flight="onStudentFlightSave"
        @save-transportation="onStudentTransportationSave"
      />
    </div>

  </div>
</template>

<script setup>
const route = useRoute()
const id = route.params.id

// Interview state (P2 cross-portal sync with school)
const editingChange = ref(false)
const changeMessage = ref('')
const INTERVIEW_KEY = computed(() => `bsp:interview:${id}`)

// P3 deposit exchange (cross-portal sync with school)
const p3store = useP3Store()
const p3Latest = computed(() => p3store.getLatest(id).value)
const p3StudentFile = ref(null)

function onP3StudentFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert('File too large (max 5MB)')
    e.target.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    p3StudentFile.value = { name: file.name, dataUrl: reader.result }
  }
  reader.readAsDataURL(file)
}

function onP3UploadProof() {
  if (!p3StudentFile.value) {
    alert('Please select a file first')
    return
  }
  try {
    p3store.uploadDepositProof(id, p3StudentFile.value)
    p3StudentFile.value = null
    alert('✅ Deposit proof uploaded. School will review and confirm.')
  } catch (err) {
    alert(err.message || 'Upload failed')
  }
}

// P3 student general file exchange (docs §16.1) — mirror of school's schoolFiles.
// Uses p3StudentNewFiles (plural) to avoid collision with the existing
// p3StudentFile (singular) proof flow above. Status-agnostic side channel.
const p3StudentNewFiles = ref([])

function onP3StudentFileSelected(e) {
  const input = e.target
  const file = input.files && input.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert('File too large (max 5MB).')
    input.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    p3StudentNewFiles.value.push({ name: file.name, dataUrl: reader.result })
    input.value = ''  // reset so the same file can be re-selected
  }
  reader.readAsDataURL(file)
}

function removeP3StudentNewFile(i) {
  p3StudentNewFiles.value.splice(i, 1)
}

function onP3StudentSendFiles() {
  if (!p3StudentNewFiles.value.length) return
  if (p3Latest.value && p3Latest.value.status === 'confirmed') {
    alert('Already confirmed. Contact the school to revise.')
    return
  }
  for (const f of p3StudentNewFiles.value) {
    p3store.addStudentFile(id, {
      name: f.name,
      dataUrl: f.dataUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'student'
    })
  }
  p3StudentNewFiles.value = []
  alert('✅ Files sent to school.')
}

// Student confirmation gate — see docs §16.1.1
function onStudentMarkReady() {
  try {
    p3store.markStudentReady(id)
    alert('✅ Marked as ready. The school will review and confirm receipt shortly.')
  } catch (err) {
    alert(err.message || 'Failed to mark ready')
  }
}

function onStudentMarkNotReady() {
  try {
    p3store.markStudentNotReady(id)
    alert('↩️ Marked as not ready. You can add more files before confirming again.')
  } catch (err) {
    alert(err.message || 'Failed to update')
  }
}

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
  visaRequested: true,
  phase5VisaGrantedDocument: null,
  phase5VisaGrantedAt: null,
  phase3Templates: [
    { name: 'Deposit Agreement Form', signed: false },
    { name: 'School Terms & Conditions', signed: true },
  ],
  phase4Templates: [
    { name: 'Admission Offer Letter', signed: true },
    { name: 'Medical Form', signed: false },
  ],
  phase5Templates: [
    { name: 'CAS Letter', signed: true },
    { name: 'Pre-Departure Checklist', signed: false },
  ],
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
  'Offering',
  'Admission Documents',
  'Pre-Departure',
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
    actions.push({ id: 'deposit_form', icon: '📋', title: 'Deposit Form', description: 'View documents and instructions from the school', buttonText: 'View', available: !!p3Latest.value && (p3Latest.value.schoolFiles || []).length > 0 })
    actions.push({ id: 'deposit_proof', icon: '💳', title: 'Upload Deposit Proof', description: p3Latest.value?.status === 'proof_uploaded' ? 'Proof submitted, awaiting school confirmation' : 'Upload your deposit payment receipt', buttonText: p3Latest.value?.status === 'proof_uploaded' ? 'Re-upload' : 'Upload', available: !!p3Latest.value && p3Latest.value.status !== 'confirmed' })
  } else if (phase === 4) {
    actions.push({ id: 'docs', icon: '📁', title: 'Admission Documents', description: 'Download your admission documents', buttonText: 'Download', available: true })
  } else if (phase === 5) {
    actions.push({ id: 'visa', icon: '🏛️', title: 'Visa Application', description: 'Track your visa application progress', buttonText: 'Track', available: application.value.visaRequested })
    actions.push({ id: 'travel', icon: '✈️', title: 'Travel Arrangements', description: 'Plan your journey to the UK', buttonText: 'Plan', available: true })
  } else if (phase === 6) {
    actions.push({ id: 'enrolled', icon: '🎉', title: 'Enrolled', description: 'Welcome! Your enrolment is complete.', buttonText: 'View', available: true })
  }

  return actions
})

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function doAction(action) {
  if (action.id === 'deposit_form') {
    if (!p3Latest.value) {
      alert('School has not sent a deposit form yet.')
      return
    }
    const docs = p3Latest.value.schoolFiles || []
    const docSection = docs.length
      ? '\n\n📎 Documents from school:\n' + docs.map(d => `• ${d.name}`).join('\n')
      : ''
    const intro = docs.length
      ? 'Please open the attached documents for bank details and payment instructions.'
      : 'No documents attached yet. Please contact the school for payment instructions.'
    alert(`Deposit Form\n\n${intro}${docSection}\n\nUse the next action to upload your deposit receipt.`)
  } else if (action.id === 'deposit_proof') {
    const input = document.getElementById('student-p3-file-input')
    if (input) input.click()
  } else {
    alert(`${action.title} — This feature will connect to API later.`)
  }
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

const P5_SUB_STATUS = {
  P5_VISA_GRANTED: 'visa_granted',
}

const VISA_STATE_KEY = computed(() => `bsp:visa:${id}`)

function saveVisaState() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(VISA_STATE_KEY.value, JSON.stringify({
      phase5VisaGrantedDocument: application.value.phase5VisaGrantedDocument,
      phase5VisaGrantedAt: application.value.phase5VisaGrantedAt,
      subStatus: application.value.subStatus,
    }))
  } catch (e) { /* ignore */ }
}

function loadVisaState() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(VISA_STATE_KEY.value)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (saved.phase5VisaGrantedDocument !== undefined)
      application.value.phase5VisaGrantedDocument = saved.phase5VisaGrantedDocument
    if (saved.phase5VisaGrantedAt)
      application.value.phase5VisaGrantedAt = saved.phase5VisaGrantedAt
    if (saved.subStatus)
      application.value.subStatus = saved.subStatus
  } catch (e) { /* ignore */ }
}

function onVisaGrantedUpload(doc) {
  application.value.phase5VisaGrantedDocument = doc
  saveVisaState()
}

function onVisaGrantedConfirm() {
  application.value.phase5VisaGrantedAt = new Date().toISOString()
  application.value.subStatus = P5_SUB_STATUS.P5_VISA_GRANTED
  saveVisaState()
}

// §24 P5 Travel Arrangements (rev 3.4) — student-side handlers.
// Both sections are jointly editable by student and school.
const travelstore = useTravelStore()
const travelPlan = ref(travelstore.getPlan(id))

function onStudentFlightSave(partial, by) {
  travelstore.saveFlight(id, partial, by || 'student')
  travelPlan.value = travelstore.getPlan(id)
  if (!application.value.phase5TravelPlan) application.value.phase5TravelPlan = {}
  application.value.phase5TravelPlan = { ...travelPlan.value }
  saveVisaState()
  alert('✅ Flight info saved. The school can see it now.')
}

function onStudentTransportationSave(partial, by) {
  travelstore.saveTransportation(id, partial, by || 'student')
  travelPlan.value = travelstore.getPlan(id)
  if (!application.value.phase5TravelPlan) application.value.phase5TravelPlan = {}
  application.value.phase5TravelPlan = { ...travelPlan.value }
  saveVisaState()
  alert('✅ Transportation saved. The school can see it now.')
}

watch(() => id, () => {
  travelstore.refresh(id)
  travelPlan.value = travelstore.getPlan(id)
}, { immediate: false })

onMounted(() => {
  // Cross-portal sync: load interview set by school
  const shared = loadSharedInterview()
  if (shared !== null) {
    application.value.interview = shared
  }
  // Load persisted visa state
  loadVisaState()
  // P3 deposit exchange sync: load any deposit form set by school
  if (p3store?.deposits) p3store.deposits.value = p3store.deposits.value
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

/* P3 deposit upload preview (student) */
.p3-upload-preview { position: fixed; bottom: 1.5rem; right: 1.5rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; gap: 0.5rem; align-items: center; z-index: 200; }
.btn { padding: 0.5rem 0.9rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; }
.btn-primary { background: #3b82f6; color: #fff; }
.btn-primary:hover { background: #2563eb; }
.btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.btn-secondary:hover { background: #e2e8f0; }

/* P3 file exchange (student) — mirrors school page styles for consistency (docs §16.1) */
.p3-section { margin-top: 0.5rem; }
.p3-section h3 { font-size: 1rem; }
.p3-files-list { display: flex; flex-direction: column; gap: 0.5rem; margin: 0.75rem 0; }
.p3-file-row { display: grid; grid-template-columns: auto 1fr auto auto; gap: 0.75rem; align-items: center; padding: 0.5rem 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
.p3-file-row-pending { background: #fffbeb; border-color: #fcd34d; }
.p3-file-icon { font-size: 1rem; }
.p3-file-name { color: #1e40af; text-decoration: none; font-weight: 500; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.p3-file-name:hover { text-decoration: underline; }
.p3-file-meta { color: #64748b; font-size: 0.75rem; }
.p3-file-remove { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 1rem; padding: 0 0.25rem; line-height: 1; }
.p3-file-remove:hover { color: #b91c1c; }
.p3-add-file-row { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem; flex-wrap: wrap; }
.p3-empty { color: #64748b; font-size: 0.85rem; font-style: italic; margin: 0.5rem 0; }
.p3-ready-section { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed #e2e8f0; }
.p3-ready-action { display: flex; flex-direction: column; gap: 0.5rem; }
.btn-mark-ready { background: #2563eb; color: #fff; padding: 0.65rem 1rem; font-weight: 600; }
.btn-mark-ready:hover { background: #1d4ed8; }
.p3-ready-hint { color: #64748b; font-size: 0.85rem; line-height: 1.4; }
.p3-ready-banner { margin-top: 0.5rem; padding: 0.65rem 0.85rem; background: #eff6ff; border: 1px solid #93c5fd; border-radius: 6px; color: #1e40af; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.p3-ready-banner-spacer { flex: 1; }
.p3-ready-banner-secondary { background: transparent; color: #1e40af; border: 1px solid #93c5fd; padding: 0.25rem 0.65rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer; font-weight: 500; }
.p3-ready-banner-secondary:hover { background: #dbeafe; }

/* Document Checklist — shared across P3/P4/P5 (read-only for student) */
.doc-checklist-section { margin-top: 0.5rem; }
.doc-checklist-section h3 { font-size: 1rem; }
.doc-checklist { display: flex; flex-direction: column; gap: 0.5rem; margin: 0.75rem 0; }
.doc-checklist-item { display: flex; align-items: center; gap: 0.625rem; padding: 0.5rem 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
.doc-check-icon { font-size: 1rem; flex-shrink: 0; }
.doc-check-name { flex: 1; font-size: 0.875rem; color: #1e293b; font-weight: 500; }
.doc-check-badge { font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 999px; }
.badge-signed { background: #dcfce7; color: #15803d; }
.badge-pending { background: #fef3c7; color: #92400e; }

/* P5 Pre-Departure section */
.p5-visa-section { margin-top: 0.5rem; }
.p5-visa-section h3 { font-size: 1rem; }

/* Footer */
.footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 1.5rem 0; margin-top: auto; }
.footer-content { text-align: center; color: #64748b; font-size: 0.85rem; }
</style>