<template>
  <main class="main-content">
    <!-- Header -->
    <div class="page-header">
      <div class="header-row">
        <div>
          <div class="ref-badge">📋 {{ application.refNumber }}</div>
          <h1>{{ application.studentName }}</h1>
          <p class="subtitle">{{ application.studentDob }} · {{ application.studentNationality }} · Applied {{ formatDate(application.appliedAt) }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-restart" @click="restartApplication" title="Reset this application to Phase 1">
            Restart
          </button>
          <div class="status-badge" :class="'status-' + application.status">
            {{ statusLabel }}
          </div>
        </div>
      </div>
    </div>

    <!-- Demo mode banner -->
    <div class="demo-banner">
      DEMO MODE — School's perspective. Click any phase action to advance. Use Restart (top-right) to reset to Phase 1. State persists in localStorage.
    </div>

    <!-- Phase Timeline -->
    <div class="card">
      <PhaseTimeline :current-phase="application.currentPhase" :sub-status="application.subStatus" />
    </div>

    <!-- Two Column Layout -->
    <div class="detail-grid">
      <!-- Left Column -->
      <div class="detail-left">
        <!-- Student Information -->
        <div class="info-card">
          <h3>👤 Student Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Full Name</span>
              <span class="info-value">{{ application.studentName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date of Birth</span>
              <span class="info-value">{{ application.studentDob }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Nationality</span>
              <span class="info-value">{{ application.studentNationality }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Guardian</span>
              <span class="info-value">{{ application.guardianName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ application.studentEmail }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone</span>
              <span class="info-value">{{ application.studentPhone }}</span>
            </div>
          </div>
        </div>

        <!-- Application Info -->
        <div class="info-card">
          <h3>📝 Application Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Reference</span>
              <span class="info-value">{{ application.refNumber }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Year of Entry</span>
              <span class="info-value">{{ application.yearOfEntry }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Entry Grade</span>
              <span class="info-value">{{ application.entryGrade }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Consultant</span>
              <span class="info-value">{{ application.consultantName || 'Not assigned' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Visa Required</span>
              <span class="info-value">{{ application.visaRequired ? 'Yes' : 'No' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Current Phase</span>
              <span class="info-value">{{ currentPhaseLabel }}</span>
            </div>
          </div>
        </div>

        <!-- Phase History -->
        <div class="info-card">
          <h3>📜 Phase History</h3>
          <div class="phase-history-list">
            <div
              v-for="ph in application.phaseHistory"
              :key="ph.phase"
              class="ph-item"
              :class="{ 'ph-expanded': expandedPhase === ph.phase, 'ph-done': ph.status === 'Completed', 'ph-active': application.currentPhase === ph.phase && ph.status !== 'Completed', 'ph-pending': ph.status === 'Pending' }"
              @click="togglePhase(ph.phase)"
            >
              <div class="ph-header">
                <div class="ph-left">
                  <span class="ph-dot" :class="{ 'dot-done': ph.status === 'Completed', 'dot-active': application.currentPhase === ph.phase && ph.status !== 'Completed', 'dot-pending': ph.status === 'Pending' }"></span>
                  <span class="ph-label">Phase {{ ph.phase }}: {{ ph.label }}</span>
                </div>
                <div class="ph-right">
                  <div class="ph-status-col">
                    <span class="ph-status">{{ ph.status }}</span>
                    <span v-if="ph.date" class="ph-date-inline">📅 {{ formatDate(ph.date) }}</span>
                  </div>
                  <span class="ph-chevron">{{ expandedPhase === ph.phase ? '▾' : '▸' }}</span>
                </div>
              </div>
              <div v-if="expandedPhase === ph.phase" class="ph-body">
                <p v-if="ph.notes" class="ph-notes">{{ ph.notes }}</p>
                <p v-if="ph.date" class="ph-date">📅 {{ formatDate(ph.date) }}</p>
                <div v-if="ph.attachments.length" class="ph-atts">
                  <span v-for="att in ph.attachments" :key="att" class="ph-att">📄 {{ att }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- School Actions -->
        <div class="info-card">
          <h3>⚙️ School Actions</h3>
          <div class="action-list">
            <!-- Phase 1: Review Application -->
            <div v-if="application.currentPhase === 1" class="action-section">
              <div class="action-title">Phase 1: Review Application</div>
              <div class="action-desc">Review student documents and make initial decision</div>
              <div class="action-buttons">
                <button class="btn-approve" @click="approveApplication">✅ Approve & Proceed to Interview</button>
                <button class="btn-reject" @click="rejectApplication">❌ Reject</button>
              </div>
            </div>

            <!-- Phase 2: Interview Schedule -->
            <div v-if="application.currentPhase === 2" class="action-section">
              <div class="action-title">Phase 2: Interview & Assessment</div>
              <div class="action-desc">Schedule and manage student interview</div>
              <div class="action-buttons">
                <button class="btn-primary" @click="scheduleInterview">📅 Schedule Interview</button>
                <button class="btn-secondary" @click="uploadAssessment">📝 Upload Assessment</button>
              </div>
            </div>

            <!-- Phase 3: Decision -->
            <div v-if="application.currentPhase === 3" class="action-section">
              <div class="action-title">Phase 3: Decision</div>
              <div class="action-desc">Make final admission decision</div>
              <div class="action-buttons">
                <button class="btn-approve" @click="makeOffer">🎓 Make Offer</button>
                <button class="btn-reject" @click="rejectApplication">❌ Reject</button>
              </div>
            </div>

            <!-- Phase 4: Offer & Acceptance -->
            <div v-if="application.currentPhase === 4" class="action-section">
              <div class="action-title">Phase 4: Offer & Acceptance</div>
              <div class="action-desc">Send offer letter and track acceptance</div>
              <div class="action-buttons">
                <button class="btn-primary" @click="uploadOfferLetter">📄 Upload Offer Letter</button>
                <button class="btn-secondary" @click="markDepositReceived">💰 Mark Deposit Received</button>
              </div>
            </div>

            <!-- Phase 5: Admission Documents -->
            <div v-if="application.currentPhase === 5" class="action-section">
              <div class="action-title">Phase 5: Admission Documents</div>
              <div class="action-desc">Prepare and upload admission documents</div>
              <div class="action-buttons">
                <button class="btn-primary" @click="uploadAdmissionDocs">📁 Upload Documents</button>
                <button class="btn-secondary" @click="markReady">✅ Mark Documents Ready</button>
              </div>
            </div>

            <!-- Phase 6: Visa & Travel -->
            <div v-if="application.currentPhase === 6" class="action-section">
              <div class="action-title">Phase 6: Visa & Travel</div>
              <div class="action-desc">Track visa progress and travel arrangements</div>
              <div class="action-buttons">
                <button class="btn-primary" @click="updateVisaStatus">🛂 Update Visa Status</button>
                <button class="btn-secondary" @click="confirmTravel">✈️ Confirm Travel Arranged</button>
              </div>
            </div>

            <!-- Phase 7: Enrolled -->
            <div v-if="application.currentPhase === 7" class="action-section">
              <div class="action-title">Phase 7: Enrolled</div>
              <div class="action-desc">Student has successfully enrolled</div>
              <div class="action-buttons">
                <button class="btn-secondary" @click="viewStudentRecord">📋 View Student Record</button>
              </div>
            </div>

            <!-- Consultant Assignment -->
            <div class="action-section divider">
              <div class="action-title">Consultant Assignment</div>
              <div class="action-desc">Assign or change consultant for this application</div>
              <div class="action-buttons">
                <button class="btn-secondary" @click="assignConsultant">
                  {{ application.consultantName ? '👤 Change Consultant' : '👤 Assign Consultant' }}
                </button>
              </div>
            </div>

            <!-- Reopen (if rejected) -->
            <div v-if="application.status === 'rejected'" class="action-section divider">
              <div class="action-title">Reopen Application</div>
              <div class="action-desc">Reopen this application if rejection was made in error</div>
              <div class="action-buttons">
                <button class="btn-primary" @click="reopenApplication">🔄 Reopen Application</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Attachments -->
        <AttachmentPanel :attachments="application.attachments" />
      </div>

      <!-- Right Column -->
      <div class="detail-right">
        <ChatRoom :application-ref="application.refNumber" user-role="school" />
      </div>
    </div>
  </main>
</template>

<script setup>
const route = useRoute()
const id = route.params.id

definePageMeta({ layout: 'school' })
useHead({ title: '📋 Application Details — BSP' })

// Mock data — will be replaced by API
const enrolledMock = {
  id,
  refNumber: '2025-ENROLLED1',
  studentName: 'Chen Meilin',
  studentDob: '22 August 2007',
  studentNationality: 'China',
  guardianName: 'Chen Wei',
  studentEmail: 'meilin.chen@email.com',
  studentPhone: '+86 138 0000 1234',
  schoolName: 'Westminster School',
  yearOfEntry: 'September 2025',
  entryGrade: 'Year 13 (Upper Sixth)',
  consultantName: 'Sarah Chen',
  visaRequired: true,
  currentPhase: 7,
  subStatus: 'Enrolled',
  status: 'completed',
  appliedAt: '2024-10-15T10:00:00Z',
  attachments: [
    { id: 'a1', fileName: 'Passport_Copy.pdf', fileSize: '1.2 MB', fileType: 'application/pdf', phase: 1, phaseLabel: 'Application Submitted', uploadedBy: 'student', uploadedByRole: 'Student', createdAt: '2024-10-15T10:05:00Z' },
    { id: 'a2', fileName: 'Academic_Transcript.pdf', fileSize: '2.4 MB', fileType: 'application/pdf', phase: 1, phaseLabel: 'Application Submitted', uploadedBy: 'student', uploadedByRole: 'Student', createdAt: '2024-10-15T10:06:00Z' },
    { id: 'a3', fileName: 'Interview_Assessment.pdf', fileSize: '0.8 MB', fileType: 'application/pdf', phase: 2, phaseLabel: 'Interview & Assessment', uploadedBy: 'school', uploadedByRole: 'School', createdAt: '2024-11-02T09:00:00Z' },
    { id: 'a4', fileName: 'Offer_Letter.pdf', fileSize: '1.1 MB', fileType: 'application/pdf', phase: 4, phaseLabel: 'Offer & Acceptance', uploadedBy: 'school', uploadedByRole: 'School', createdAt: '2024-11-10T14:00:00Z' },
    { id: 'a5', fileName: 'CAS_Letter.pdf', fileSize: '0.5 MB', fileType: 'application/pdf', phase: 6, phaseLabel: 'Visa & Travel', uploadedBy: 'school', uploadedByRole: 'School', createdAt: '2025-01-20T11:00:00Z' },
    { id: 'a6', fileName: 'Enrolment_Confirmation.pdf', fileSize: '0.6 MB', fileType: 'application/pdf', phase: 7, phaseLabel: 'Enrolled', uploadedBy: 'school', uploadedByRole: 'School', createdAt: '2025-09-01T09:00:00Z' },
  ],
  phaseHistory: [
    { phase: 1, label: 'Application Submitted', status: 'Completed', date: '2024-10-15', notes: 'Application received and documents uploaded.', attachments: ['Passport_Copy.pdf', 'Academic_Transcript.pdf'] },
    { phase: 2, label: 'Interview & Assessment', status: 'Completed', date: '2024-11-02', notes: 'Interview conducted. Assessment report uploaded.', attachments: ['Interview_Assessment.pdf'] },
    { phase: 3, label: 'Decision', status: 'Completed', date: '2024-11-05', notes: 'Application approved by admissions committee.', attachments: [] },
    { phase: 4, label: 'Offer & Acceptance', status: 'Completed', date: '2024-11-10', notes: 'Offer letter sent. Deposit received and place secured.', attachments: ['Offer_Letter.pdf'] },
    { phase: 5, label: 'Admission Documents', status: 'Completed', date: '2024-12-01', notes: 'All admission documents prepared and verified.', attachments: [] },
    { phase: 6, label: 'Visa & Travel', status: 'Completed', date: '2025-01-20', notes: 'CAS issued. Student visa granted. Travel arranged.', attachments: ['CAS_Letter.pdf'] },
    { phase: 7, label: 'Enrolled', status: 'Completed', date: '2025-09-01', notes: 'Student successfully enrolled. Welcome pack issued.', attachments: ['Enrolment_Confirmation.pdf'] },
  ]
}

const defaultMock = {
  id,
  refNumber: '2026-X7K9M2P4',
  studentName: 'Zhang Xiaoming',
  studentDob: '15 May 2008',
  studentNationality: 'Hong Kong',
  guardianName: 'Zhang Wei',
  studentEmail: 'xiaoming.zhang@email.com',
  studentPhone: '+852 9123 4567',
  schoolName: 'Westminster School',
  yearOfEntry: 'September 2027',
  entryGrade: 'Year 12 (Sixth Form)',
  consultantName: 'Sarah Chen',
  visaRequired: true,
  currentPhase: 2,
  subStatus: 'Awaiting Confirmation',
  status: 'active',
  appliedAt: '2026-05-15T10:00:00Z',
  attachments: [
    { id: 'a1', fileName: 'Passport_Copy.pdf', fileSize: '1.2 MB', fileType: 'application/pdf', phase: 1, phaseLabel: 'Application Submitted', uploadedBy: 'student', uploadedByRole: 'Student', createdAt: '2026-05-15T10:05:00Z' },
    { id: 'a2', fileName: 'Academic_Transcript.pdf', fileSize: '2.4 MB', fileType: 'application/pdf', phase: 1, phaseLabel: 'Application Submitted', uploadedBy: 'student', uploadedByRole: 'Student', createdAt: '2026-05-15T10:06:00Z' },
    { id: 'a3', fileName: 'Interview_Invitation.pdf', fileSize: '0.8 MB', fileType: 'application/pdf', phase: 2, phaseLabel: 'Interview & Assessment', uploadedBy: 'school', uploadedByRole: 'School', createdAt: '2026-06-02T09:00:00Z' },
  ],
  phaseHistory: [
    { phase: 1, label: 'Application Submitted', status: 'Completed', date: '2026-05-15', notes: 'Application received and documents uploaded.', attachments: ['Passport_Copy.pdf', 'Academic_Transcript.pdf'] },
    { phase: 2, label: 'Interview & Assessment', status: 'In Progress', date: null, notes: 'Interview invitation sent. Awaiting student confirmation.', attachments: ['Interview_Invitation.pdf'] },
    { phase: 3, label: 'Decision', status: 'Pending', date: null, notes: '', attachments: [] },
    { phase: 4, label: 'Offer & Acceptance', status: 'Pending', date: null, notes: '', attachments: [] },
    { phase: 5, label: 'Admission Documents', status: 'Pending', date: null, notes: '', attachments: [] },
    { phase: 6, label: 'Visa & Travel', status: 'Pending', date: null, notes: '', attachments: [] },
    { phase: 7, label: 'Enrolled', status: 'Pending', date: null, notes: '', attachments: [] },
  ]
}

const application = ref(id === '2025-ENROLLED1' ? enrolledMock : defaultMock)

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

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

// State machine — localStorage persistence
const STORAGE_KEY = computed(() => `bsp:school:app:${id}`)

function clone(obj) { return JSON.parse(JSON.stringify(obj)) }

function loadState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY.value)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  return null
}

function saveState() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY.value, JSON.stringify(application.value))
  } catch (e) { /* ignore */ }
}

onMounted(() => {
  const stored = loadState()
  if (stored) {
    application.value = stored
  }
})

function todayDate() { return new Date().toISOString().slice(0, 10) }

function advancePhase(newPhase, actionNote) {
  const cur = application.value.currentPhase
  const curHist = application.value.phaseHistory.find(p => p.phase === cur)
  if (curHist) {
    curHist.status = 'Completed'
    curHist.date = curHist.date || todayDate()
    if (actionNote) curHist.notes = (curHist.notes ? curHist.notes + ' | ' : '') + actionNote
  }
  const nextHist = application.value.phaseHistory.find(p => p.phase === newPhase)
  if (nextHist) {
    nextHist.status = 'In Progress'
    nextHist.date = nextHist.date || todayDate()
  }
  application.value.currentPhase = newPhase
  application.value.subStatus = nextHist ? nextHist.label : ''
  if (newPhase === 7) {
    application.value.status = 'completed'
  } else {
    application.value.status = 'active'
  }
  saveState()
}

// Action handlers — real state transitions
function approveApplication() {
  if (application.value.currentPhase === 1) {
    advancePhase(2, 'School approved application after initial review')
  }
}

function rejectApplication() {
  if (confirm('Reject this application? (You can reopen it later from the Reopen section.)')) {
    application.value.status = 'rejected'
    application.value.subStatus = 'Rejected'
    application.value.phaseHistory.forEach(p => {
      if (p.status === 'Pending' || p.status === 'In Progress') {
        p.status = 'Pending'
      }
    })
    saveState()
  }
}

function scheduleInterview() {
  if (application.value.currentPhase === 2) {
    advancePhase(3, 'Interview scheduled and assessment uploaded')
  }
}

function uploadAssessment() {
  alert('Assessment uploaded (demo: in real life this would attach a file).\n\nTo advance, click Schedule Interview.')
}

function makeOffer() {
  if (application.value.currentPhase === 3) {
    advancePhase(4, 'Offer made by admissions committee')
  }
}

function uploadOfferLetter() {
  if (application.value.currentPhase === 4) {
    advancePhase(5, 'Offer letter sent to family')
  }
}

function markDepositReceived() {
  if (application.value.currentPhase === 4) {
    advancePhase(5, 'Deposit received, place secured')
  }
}

function uploadAdmissionDocs() {
  alert('Upload admission documents (demo: would attach files).\n\nTo advance, click Mark Documents Ready.')
}

function markReady() {
  if (application.value.currentPhase === 5) {
    advancePhase(6, 'Admission documents ready and verified')
  }
}

function updateVisaStatus() {
  if (application.value.currentPhase === 6) {
    advancePhase(7, 'Visa issued, travel arrangements confirmed')
  }
}

function confirmTravel() {
  if (application.value.currentPhase === 6) {
    advancePhase(7, 'Travel arrangements confirmed')
  }
}

function viewStudentRecord() {
  alert('Student record view (demo: would open a full student profile page)')
}

function assignConsultant() {
  const name = prompt('Assign consultant (demo):', application.value.consultantName || '')
  if (name !== null) {
    application.value.consultantName = name || null
    saveState()
  }
}

function reopenApplication() {
  if (!confirm('Reopen this rejected application? It will return to Phase 1.')) return
  application.value.status = 'active'
  application.value.currentPhase = 1
  application.value.subStatus = 'Application Submitted'
  application.value.phaseHistory.forEach((p, idx) => {
    if (idx === 0) {
      p.status = 'In Progress'
      p.date = todayDate()
    } else {
      p.status = 'Pending'
      p.date = null
      p.notes = ''
    }
  })
  saveState()
}

// RESTART: full reset to Phase 1 + clear localStorage
function restartApplication() {
  if (!confirm('Restart this application?\n\nThis will:\n- Reset to Phase 1\n- Clear all decisions and notes\n- Clear localStorage for this application\n\nProceed?')) return
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(STORAGE_KEY.value) } catch (e) {}
  }
  application.value = clone(id === '2025-ENROLLED1' ? enrolledMock : defaultMock)
  saveState()
}

const expandedPhase = ref(null)
function togglePhase(phase) {
  expandedPhase.value = expandedPhase.value === phase ? null : phase
}
</script>

<style scoped>
.main-content { flex: 1; padding: 2rem; }

/* Header actions (top-right) */
.header-actions {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.btn-restart {
  background: #fff;
  border: 2px solid #fca5a5;
  border-radius: 8px;
  color: #991b1b;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 8px 14px;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-restart:hover {
  background: #fef2f2;
  border-color: #dc2626;
  transform: translateY(-1px);
}
.demo-banner {
  background: linear-gradient(90deg, #fef3c7 0%, #fed7aa 100%);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  color: #78350f;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
  padding: 10px 16px;
}

/* Page Header */
.page-header { margin-bottom: 1.5rem; }
.header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
.ref-badge { display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.5rem; }
.page-header h1 { font-size: 1.6rem; color: #1a1a2e; margin: 0; }
.subtitle { color: #64748b; font-size: 0.85rem; margin: 0.25rem 0 0; }
.status-badge { padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
.status-active { background: #dbeafe; color: #1d4ed8; }
.status-rejected { background: #fee2e2; color: #b91c1c; }
.status-completed { background: #dcfce7; color: #15803d; }

/* Card & Grid */
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.5rem 1rem; margin-bottom: 1.5rem; }
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
.action-list { display: flex; flex-direction: column; gap: 1rem; }
.action-section { padding: 1rem; background: #f8fafc; border-radius: 10px; }
.action-section.divider { border-top: 1px solid #e2e8f0; margin-top: 0.5rem; padding-top: 1rem; }
.action-title { font-size: 0.9rem; font-weight: 600; color: #1e293b; margin-bottom: 0.25rem; }
.action-desc { font-size: 0.78rem; color: #64748b; margin-bottom: 0.75rem; }
.action-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.btn-primary { background: #3b82f6; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.btn-primary:hover { background: #2563eb; }
.btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.btn-secondary:hover { background: #e2e8f0; }
.btn-approve { background: #10b981; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.btn-approve:hover { background: #059669; }
.btn-reject { background: #ef4444; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.btn-reject:hover { background: #dc2626; }

/* Phase History */
.phase-history-list { display: flex; flex-direction: column; gap: 0.5rem; }
.ph-item { border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.15s; overflow: hidden; }
.ph-item:hover { border-color: #cbd5e1; }
.ph-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; }
.ph-left { display: flex; align-items: center; gap: 0.6rem; }
.ph-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot-done { background: #10b981; }
.dot-active { background: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
.dot-pending { background: #cbd5e1; }
.ph-label { font-size: 0.85rem; font-weight: 600; color: #1e293b; }
.ph-right { display: flex; align-items: center; gap: 0.5rem; }
.ph-status-col { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.ph-date-inline { font-size: 0.7rem; color: #64748b; }
.ph-status { font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; }
.ph-done .ph-status { background: #dcfce7; color: #15803d; }
.ph-active .ph-status { background: #dbeafe; color: #1d4ed8; }
.ph-pending .ph-status { background: #f1f5f9; color: #94a3b8; }
.ph-chevron { font-size: 0.8rem; color: #94a3b8; }
.ph-body { padding: 0 1rem 0.75rem; border-top: 1px solid #f1f5f9; }
.ph-notes { font-size: 0.8rem; color: #475569; margin: 0.5rem 0 0.25rem; }
.ph-date { font-size: 0.75rem; color: #64748b; margin: 0.25rem 0; }
.ph-atts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 0.5rem; }
.ph-att { background: #e0f2fe; color: #0369a1; font-size: 0.72rem; padding: 3px 10px; border-radius: 12px; }
</style>