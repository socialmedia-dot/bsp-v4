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
          <button v-if="!isRejected" class="btn-restart" @click="requestRestart" title="Reset this application to Phase 1">
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

    <!-- Rejected banner (P2 + future phases: P3, P4, P5, P6 reject) -->
    <RejectedBanner :decision="latestDecision" />

    <!-- Phase Timeline -->
    <div class="card">
      <PhaseTimeline :current-phase="application.currentPhase" :sub-status="application.subStatus" />
    </div>

    <!-- Two Column Layout -->
    <div class="detail-grid">
      <!-- Left Column -->
      <div class="detail-left">
        <!-- Phase Stack: latest at top expanded, past phases collapsed at bottom -->
        <div class="phase-stack">
          <div
            v-for="ph in visiblePhases"
            :key="ph.phase"
            class="phase-item"
            :class="{
              'phase-current': ph.phase === application.currentPhase,
              'phase-past': ph.phase < application.currentPhase
            }"
          >
            <!-- Header row (always visible; click anywhere on row to expand past phases) -->
            <div
              class="phase-row"
              :class="{ 'phase-row-clickable': ph.phase !== application.currentPhase, 'phase-row-expanded': expandedPhases.includes(ph.phase) }"
              :role="ph.phase !== application.currentPhase ? 'button' : undefined"
              :tabindex="ph.phase !== application.currentPhase ? 0 : undefined"
              @click="onPhaseRowClick(ph)"
              @keydown.enter.prevent="onPhaseRowClick(ph)"
              @keydown.space.prevent="onPhaseRowClick(ph)"
            >
              <span class="phase-num-badge">P{{ ph.phase }}</span>
              <span class="phase-title">{{ ph.label }}</span>
              <span class="phase-status-badge" :class="'status-' + ph.status.toLowerCase().replace(/ /g, '-')">{{ ph.status }}</span>
              <span v-if="ph.date" class="phase-date-inline">📅 {{ formatDate(ph.date) }}</span>
              <span v-if="ph.phase !== application.currentPhase" class="phase-chevron">
                {{ expandedPhases.includes(ph.phase) ? '▾' : '▸' }}
              </span>
            </div>

            <!-- Content: always show for current, or when expanded for past -->
            <div
              v-if="ph.phase === application.currentPhase || expandedPhases.includes(ph.phase)"
              :id="'phase-body-' + ph.phase"
              class="phase-body"
            >
              <!-- Phase 1: Student Info + Application Details -->
              <template v-if="ph.phase === 1">
                <div class="phase-subsection">
                  <div class="subsection-header">
                    <h4>👤 Student Information</h4>
                    <button v-if="!isRejected && !editingStudentInfo" class="btn-edit-info" @click="openEditStudentInfo" title="Correct the student information captured at application time">
                      ✏️ Update Info
                    </button>
                  </div>

                  <!-- Display mode (read-only snapshot) -->
                  <div v-if="!editingStudentInfo" class="info-grid">
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
                      <span class="info-value"><a :href="'mailto:' + application.studentEmail">{{ application.studentEmail }}</a></span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Phone</span>
                      <span class="info-value"><a :href="'tel:' + application.studentPhone">{{ application.studentPhone }}</a></span>
                    </div>
                  </div>

                  <!-- Edit mode (school correction) -->
                  <div v-else class="edit-form">
                    <p class="edit-form-intro">
                      ℹ️ This is the snapshot captured when the student submitted the application. Updates here only affect <strong>this application</strong> — the student's profile remains unchanged.
                    </p>
                    <div class="form-grid">
                      <div class="form-item">
                        <label>Full Name</label>
                        <input v-model="studentInfoDraft.studentName" type="text">
                      </div>
                      <div class="form-item">
                        <label>Date of Birth</label>
                        <input v-model="studentInfoDraft.studentDob" type="text" placeholder="e.g. 15 May 2008">
                      </div>
                      <div class="form-item">
                        <label>Nationality</label>
                        <input v-model="studentInfoDraft.studentNationality" type="text">
                      </div>
                      <div class="form-item">
                        <label>Guardian</label>
                        <input v-model="studentInfoDraft.guardianName" type="text">
                      </div>
                      <div class="form-item">
                        <label>Email</label>
                        <input v-model="studentInfoDraft.studentEmail" type="email">
                      </div>
                      <div class="form-item">
                        <label>Phone</label>
                        <input v-model="studentInfoDraft.studentPhone" type="tel">
                      </div>
                    </div>
                    <p class="form-warning">⚠️ Saving will permanently overwrite the existing values. The previous values cannot be recovered.</p>
                    <div class="form-actions">
                      <button class="btn-secondary" @click="cancelEditStudentInfo">Cancel</button>
                      <button class="btn-primary" @click="saveEditStudentInfo">💾 Save Changes</button>
                    </div>
                  </div>
                </div>

                <div class="phase-subsection">
                  <h4>📝 Application Details</h4>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">Year of Entry</span>
                      <span class="info-value">{{ application.yearOfEntry }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Entry Grade</span>
                      <span class="info-value">{{ application.entryGrade }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Visa Requested</span>
                      <span class="info-value">{{ application.visaRequested ? 'Yes' : 'No' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Consultant</span>
                      <span class="info-value">{{ application.consultantName || 'Unassigned' }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Phase notes (any phase with notes) -->
              <div v-if="ph.notes" class="phase-subsection">
                <h4>📝 Notes</h4>
                <p class="phase-notes-text">{{ ph.notes }}</p>
              </div>

              <!-- Attachments for this phase (rev 3.1: always render header + empty-state per §20.1) -->
              <div class="phase-subsection">
                <h4>📎 Attachments</h4>
                <div v-if="getPhaseAttachments(ph.phase).length" class="phase-attachments">
                  <div v-for="att in getPhaseAttachments(ph.phase)" :key="att.id" class="att-row">
                    <span class="att-icon">📄</span>
                    <div class="att-info">
                      <div class="att-name">{{ att.fileName }}</div>
                      <div class="att-meta">{{ att.fileSize }} · {{ att.uploadedByRole }} · {{ formatDate(att.createdAt) }}</div>
                    </div>
                  </div>
                </div>
                <p v-else class="phase-empty-state">No files for this phase.</p>
              </div>

              <!-- School Actions: only for current phase -->
              <div v-if="ph.phase === application.currentPhase" class="phase-subsection">
                <h4>⚙️ School Actions</h4>

                <div v-if="ph.phase === 1" class="action-section">
                  <div v-if="!isRejected">
                    <div class="action-title">Arrange Interview</div>
                    <div class="action-desc">New application received. Choose how the interview will be conducted.</div>
                    <div class="action-buttons">
                      <button class="btn-approve" @click="scheduleInHouse">📅 Schedule Interview (In-House)</button>
                      <button class="btn-primary" @click="delegateToConsultant">🤝 Delegate to Consultant</button>
                      <button class="btn-reject" @click="rejectApplication">❌ Reject</button>
                    </div>
                  </div>
                </div>

                <div v-if="ph.phase === 2" class="action-section p2-container">
                  <!-- P2 Status header -->
                  <div class="p2-status-header">
                    <div>
                      <div class="action-title">🎤 Phase 2 — Interview + Decision</div>
                      <div class="action-desc">Schedule interviews, collect reports, make the final decision.</div>
                    </div>
                    <div>
                      <span class="status-pill" :class="'status-pill-' + p2StatusKey">{{ p2StatusLabel }}</span>
                    </div>
                  </div>

                  <!-- Toast (auto-dismisses) -->
                  <div v-if="p2Toast" class="p2-toast">✅ {{ p2Toast }}</div>

                  <!-- Next Action callout (always at top, shows most relevant next step) -->
                  <div v-if="p2NextAction" class="p2-next-action">
                    <div class="p2-next-action-label">NEXT ACTION</div>
                    <div class="p2-next-action-title">{{ p2NextAction.title }}</div>
                    <div class="p2-next-action-subtitle">{{ p2NextAction.subtitle }}</div>
                  </div>

                  <!-- ===== P2 Sections in Action-Priority Order (see docs §15) =====
                       The 4 sections (A/B/C/D) are rendered in an order determined
                       by the current state, so the most relevant action is always
                       at the top. -->

                  <template v-for="sectionKey in p2SectionOrder" :key="sectionKey">
                    <!-- ===== Section A: Schedule New Interview (collapsed if past records exist) ===== -->
                    <div v-if="sectionKey === 'A' && !latestDecision" class="p2-section">
                    <div class="p2-section-title">📅 Schedule New Interview</div>

                    <!-- Collapsed: any interview record exists, user clicks to expand -->
                    <div v-if="hasAnyInterview && !scheduleExpanded" class="p2-section-collapsed">
                      <div class="action-desc">
                        {{ interviewCount }} round{{ interviewCount === 1 ? '' : 's' }} already scheduled.
                        Click below to schedule another round.
                      </div>
                      <button class="btn-secondary" @click="scheduleExpanded = true">➕ Schedule New Round</button>
                    </div>

                    <!-- Open: form (no records yet OR user expanded) -->
                    <div v-else class="interview-form">
                      <div class="action-desc">
                        {{ hasAnyInterview ? 'Schedule another interview round.' : 'Schedule the first interview round.' }}
                      </div>
                      <div class="form-row form-row-2col">
                        <div>
                          <label class="form-label">Date (UK)</label>
                          <input type="date" v-model="scheduleForm.date" class="form-input">
                        </div>
                        <div>
                          <label class="form-label">Time (UK)</label>
                          <input type="time" v-model="scheduleForm.time" class="form-input">
                        </div>
                      </div>
                      <div class="form-row">
                        <label class="form-label">Location</label>
                        <input type="text" v-model="scheduleForm.location" placeholder="e.g. School address, 'Online (Zoom)'" class="form-input">
                      </div>
                      <div class="form-row">
                        <label class="form-label">Interviewer name</label>
                        <input type="text" v-model="scheduleForm.interviewer" placeholder="e.g. Mr. Smith (Head of Admissions)" class="form-input">
                      </div>
                      <div class="form-row">
                        <label class="form-label">Agenda (optional)</label>
                        <textarea v-model="scheduleForm.agenda" rows="2" class="form-input" placeholder="Brief agenda for the interview..."></textarea>
                      </div>
                      <div class="form-actions">
                        <button class="btn-primary" @click="onScheduleInterview">📅 Schedule Interview</button>
                        <button v-if="hasAnyInterview" class="btn-secondary" @click="scheduleExpanded = false">Cancel</button>
                      </div>
                    </div>
                  </div>

                    <!-- ===== Section B: Current Interview (latest round) ===== -->
                    <div v-if="sectionKey === 'B'" class="p2-section">
                    <div class="p2-section-title">
                      🎤 Current Interview
                      <span v-if="latestInterview" class="p2-round-badge">Round #{{ latestInterview.roundNumber }}</span>
                    </div>

                    <div v-if="!latestInterview" class="p2-empty">
                      No interview scheduled yet. Schedule one to begin Phase 2.
                    </div>

                    <template v-else>
                      <div class="interview-display">
                        <div class="interview-status-row">
                          <span class="status-pill" :class="latestInterview.status === 'completed' ? 'status-pill-confirmed' : 'status-pill-pending'">
                            {{ latestInterview.status === 'completed' ? '✅ Completed' : '⏳ Scheduled' }}
                          </span>
                        </div>
                        <div class="interview-details">
                          <div class="detail-row"><span class="detail-label">📅 Date</span><span class="detail-value">{{ latestInterview.date }}</span></div>
                          <div class="detail-row"><span class="detail-label">🕐 Time (UK)</span><span class="detail-value">{{ latestInterview.time }}</span></div>
                          <div class="detail-row"><span class="detail-label">📍 Location</span><span class="detail-value">{{ latestInterview.location }}</span></div>
                          <div class="detail-row"><span class="detail-label">👤 Interviewer</span><span class="detail-value">{{ latestInterview.interviewer }} <span class="p2-role-tag" :class="'p2-role-' + latestInterview.interviewerRole">{{ latestInterview.interviewerRole === 'school' ? 'School' : 'Consultant' }}</span></span></div>
                          <div v-if="latestInterview.agenda" class="detail-row detail-row-block"><span class="detail-label">📋 Agenda</span><span class="detail-value">{{ latestInterview.agenda }}</span></div>
                        </div>
                      </div>

                      <!-- Submit Report form: only if no report yet AND current user is the interviewer AND not rejected -->
                      <div v-if="!currentInterviewReport && isCurrentUserInterviewer && !isRejected" class="p2-report-form">
                        <div class="p2-section-subtitle">📝 Submit Report — Round #{{ latestInterview.roundNumber }}</div>
                        <div class="form-row">
                          <label class="form-label">Overall Rating</label>
                          <div class="star-rating">
                            <button v-for="n in 5" :key="n" type="button" class="star" :class="{ 'star-active': n <= reportForm.rating }" @click="reportForm.rating = n" :aria-label="`Rate ${n} of 5`">★</button>
                            <span class="star-rating-label">{{ reportForm.rating }} / 5</span>
                          </div>
                        </div>
                        <div class="form-row">
                          <label class="form-label">Recommendation</label>
                          <div class="radio-group">
                            <label class="radio-option"><input type="radio" v-model="reportForm.recommendation" value="recommend"> ✅ Recommend</label>
                            <label class="radio-option"><input type="radio" v-model="reportForm.recommendation" value="maybe"> 🤔 Maybe</label>
                            <label class="radio-option"><input type="radio" v-model="reportForm.recommendation" value="not-recommend"> ❌ Not Recommend</label>
                          </div>
                        </div>
                        <div class="form-row">
                          <label class="form-label">Notes (max 200 chars)</label>
                          <textarea v-model="reportForm.notes" maxlength="200" rows="3" class="form-input" placeholder="Short summary of interview, observations, follow-ups..."></textarea>
                          <div class="char-counter">{{ reportForm.notes.length }} / 200</div>
                        </div>
                        <div class="form-actions">
                          <button class="btn-approve" @click="onSubmitReport">📤 Submit Report</button>
                        </div>
                      </div>

                      <!-- Report submitted (immutable) -->
                      <div v-else-if="currentInterviewReport" class="p2-report-summary">
                        <div class="p2-section-subtitle">✅ Report Submitted (Immutable)</div>
                        <div class="p2-report-meta">
                          <div class="detail-row"><span class="detail-label">⭐ Rating</span><span class="detail-value">{{ currentInterviewReport.overallRating }} / 5</span></div>
                          <div class="detail-row"><span class="detail-label">🎯 Recommendation</span><span class="detail-value"><span class="rec-badge" :class="'rec-' + currentInterviewReport.recommendation">{{ recLabel(currentInterviewReport.recommendation) }}</span></span></div>
                          <div v-if="currentInterviewReport.notes" class="detail-row detail-row-block"><span class="detail-label">📝 Notes</span><span class="detail-value">{{ currentInterviewReport.notes }}</span></div>
                          <div class="detail-row"><span class="detail-label">👤 Interviewer</span><span class="detail-value">{{ currentInterviewReport.interviewer }}</span></div>
                          <div class="detail-row"><span class="detail-label">🕒 Submitted</span><span class="detail-value">{{ formatDateTime(currentInterviewReport.submittedAt) }}</span></div>
                        </div>
                      </div>

                      <!-- Awaiting report from interviewer -->
                      <div v-else class="p2-awaiting">
                        <div class="action-desc">⏳ Awaiting <strong>{{ latestInterview.interviewer }}</strong> to submit their report.</div>
                      </div>
                    </template>
                  </div>

                    <!-- ===== Section C: Past Interviews (collapsed by default) ===== -->
                    <div v-if="sectionKey === 'C'" class="p2-section">
                    <div class="p2-section-title">
                      📋 Past Interviews
                      <span v-if="pastInterviews.length" class="p2-round-badge">({{ pastInterviews.length }})</span>
                    </div>
                    <div v-if="pastInterviews.length === 0" class="p2-empty">No past interviews yet.</div>
                    <template v-else>
                      <div class="action-buttons">
                        <button v-if="!pastExpanded" class="btn-secondary" @click="pastExpanded = true">
                          Show {{ pastInterviews.length }} past interview{{ pastInterviews.length === 1 ? '' : 's' }}
                        </button>
                        <button v-else class="btn-secondary" @click="pastExpanded = false">
                          Hide past interviews
                        </button>
                      </div>
                      <div v-if="pastExpanded" class="p2-past-list">
                        <div v-for="iv in pastInterviewsReversed" :key="iv.id" class="p2-past-item">
                          <div class="p2-past-header">
                            <span class="p2-round-badge">Round #{{ iv.roundNumber }}</span>
                            <span class="detail-label-inline">📅 {{ iv.date }} · {{ iv.time }} (UK)</span>
                          </div>
                          <div class="detail-row"><span class="detail-label">👤 Interviewer</span><span class="detail-value">{{ iv.interviewer }} <span class="p2-role-tag" :class="'p2-role-' + iv.interviewerRole">{{ iv.interviewerRole === 'school' ? 'School' : 'Consultant' }}</span></span></div>
                          <div v-if="iv.location" class="detail-row"><span class="detail-label">📍 Location</span><span class="detail-value">{{ iv.location }}</span></div>
                          <div v-if="iv.agenda" class="detail-row detail-row-block"><span class="detail-label">📋 Agenda</span><span class="detail-value">{{ iv.agenda }}</span></div>
                          <div v-if="p2ReportFor(iv.id)" class="p2-past-report">
                            <div class="detail-row"><span class="detail-label">⭐ Rating</span><span class="detail-value">{{ p2ReportFor(iv.id).overallRating }} / 5</span></div>
                            <div class="detail-row"><span class="detail-label">🎯 Recommendation</span><span class="detail-value"><span class="rec-badge" :class="'rec-' + p2ReportFor(iv.id).recommendation">{{ recLabel(p2ReportFor(iv.id).recommendation) }}</span></span></div>
                            <div v-if="p2ReportFor(iv.id).notes" class="detail-row detail-row-block"><span class="detail-label">📝 Notes</span><span class="detail-value">{{ p2ReportFor(iv.id).notes }}</span></div>
                          </div>
                          <div v-else class="p2-empty">No report submitted for this round.</div>
                        </div>
                      </div>
                    </template>
                  </div>

                    <!-- ===== Section D: Manager Decision Panel (school manager only) ===== -->
                    <div v-if="sectionKey === 'D'" class="p2-section p2-section-manager">
                    <div class="p2-section-title">👔 Manager Decision <span class="p2-role-tag p2-role-school">School Manager Only</span></div>

                    <div v-if="allReports.length === 0" class="p2-empty">
                      No interview reports yet. Manager decision is available after at least 1 report is submitted.
                    </div>

                    <template v-else>
                      <div class="p2-section-subtitle">📊 All Submitted Reports ({{ allReports.length }})</div>
                      <div class="p2-reports-list">
                        <div v-for="r in allReportsReversed" :key="r.id" class="p2-report-row">
                          <div class="p2-report-row-head">
                            <span class="p2-round-badge">Round #{{ r.roundNumber }}</span>
                            <span class="rec-badge" :class="'rec-' + r.recommendation">{{ recLabel(r.recommendation) }}</span>
                            <span class="detail-label-inline">⭐ {{ r.overallRating }}/5</span>
                            <span class="detail-label-inline">· {{ r.interviewer }}</span>
                            <span class="detail-label-inline">· {{ formatDateTime(r.submittedAt) }}</span>
                          </div>
                          <div v-if="r.notes" class="p2-report-row-notes">"{{ r.notes }}"</div>
                        </div>
                      </div>

                      <div v-if="!latestDecision" class="p2-decision-form">
                        <div class="p2-section-subtitle">🧭 Make a Decision</div>
                        <div class="action-desc">At least 1 report submitted. Decide now or schedule more rounds first.</div>
                        <div class="action-buttons">
                          <button class="btn-approve" @click="onMakeDecision('approved')">✅ Approve</button>
                          <button class="btn-reject" @click="onRejectClick">❌ Reject</button>
                        </div>
                        <div v-if="decisionForm.showReject" class="p2-reject-form">
                          <div class="form-row">
                            <label class="form-label">Rejection reason (optional)</label>
                            <textarea v-model="decisionForm.reason" rows="3" class="form-input" placeholder="Explain why this application is being rejected (optional)..."></textarea>
                          </div>
                          <div class="form-actions">
                            <button class="btn-secondary" @click="onRejectCancel">Cancel</button>
                            <button class="btn-reject" @click="onMakeDecision('rejected')">Confirm Reject</button>
                          </div>
                        </div>
                      </div>

                      <div v-else class="p2-decision-summary">
                        <div v-if="latestDecision.outcome === 'approved'" class="p2-decision-card p2-decision-approved">✅ Approved</div>
                        <div v-else class="p2-decision-card p2-decision-rejected">❌ Rejected</div>
                        <div class="detail-row"><span class="detail-label">👤 Decided by</span><span class="detail-value">{{ latestDecision.decidedBy }}</span></div>
                        <div class="detail-row"><span class="detail-label">🕒 Decided at</span><span class="detail-value">{{ formatDateTime(latestDecision.decidedAt) }}</span></div>
                        <div v-if="latestDecision.reason" class="detail-row detail-row-block"><span class="detail-label">📝 Reason</span><span class="detail-value">{{ latestDecision.reason }}</span></div>
                      </div>

                      <!-- Mark P2 Complete: enabled only after decision is recorded. Hidden on rejection (no phase transition). -->
                      <div v-if="!isRejected" class="p2-mark-complete">
                        <button class="btn-primary" :disabled="!latestDecision" @click="onMarkP2Complete">✅ Mark P2 Complete</button>
                        <div v-if="!latestDecision" class="action-desc">Record a decision (Approve or Reject) to enable.</div>
                        <div v-else class="action-desc">Move the application to Phase 3 (Offer).</div>
                      </div>
                    </template>
                  </div>
                  </template>
                </div>

                <!-- P3 Offering (full UI, replaces old P3 Decision + P4 Offer & Acceptance) — rev 3.0 -->
                <div v-if="ph.phase === 3" class="action-section p3-container">
                  <div class="p3-status-header">
                    <div>
                      <div class="action-title">💰 Phase 3 — Offering</div>
                      <div class="action-desc">Upload deposit documents for the student, receive proof, confirm receipt.</div>
                    </div>
                    <div>
                      <span v-if="p3Latest" class="status-pill" :class="`status-pill-p3-${p3Latest.status}`">
                        {{ p3Latest.status === 'sent_to_student' ? 'Sent to Student' : p3Latest.status === 'proof_uploaded' ? 'Proof Uploaded' : 'Confirmed' }}
                      </span>
                      <span v-else class="status-pill status-pill-pending">Not yet sent</span>
                    </div>
                  </div>

                  <div v-if="p3Toast" class="p2-toast">✅ {{ p3Toast }}</div>

                  <!-- §17 Document Checklist (P3 Offering) -->
                  <div v-if="application.phase3Templates && application.phase3Templates.length" class="doc-templates-section">
                    <h4 class="subsection-header">📄 Document Checklist — P3 Offering</h4>
                    <ul class="doc-templates-list">
                      <li v-for="tpl in application.phase3Templates" :key="tpl.id" class="doc-template-item">
                        <span class="doc-template-icon">{{ tpl.required ? '⚠️' : '📄' }}</span>
                        <span class="doc-template-name">{{ tpl.name }}</span>
                        <span class="doc-template-category">{{ tpl.category }}</span>
                      </li>
                    </ul>
                  </div>

                  <!-- Section A: Documents to send to student (primary action, multi-file) -->
                  <div class="p3-section">
                    <div class="p3-section-title">📎 Documents for Student</div>
                    <div class="action-desc">Upload deposit form, payment instructions, or any document the student needs. PDF, JPG, or PNG, max 5MB each.</div>

                    <!-- Sent files list (read-only — no delete button per docs §16) -->
                    <div v-if="p3Latest && p3Latest.schoolFiles && p3Latest.schoolFiles.length" class="p3-files-list">
                      <div v-for="(f, i) in p3Latest.schoolFiles" :key="i" class="p3-file-row">
                        <span class="p3-file-icon">📄</span>
                        <a class="p3-file-name" :href="f.dataUrl" target="_blank" rel="noopener">{{ f.name }}</a>
                        <span class="p3-file-meta">{{ formatDateTime(f.uploadedAt) }}</span>
                      </div>
                    </div>
                    <p v-else class="p3-empty">No documents sent yet. Add the first one below.</p>

                    <!-- Pending files queue -->
                    <div v-if="p3NewFiles.length" class="p3-files-list">
                      <div v-for="(f, i) in p3NewFiles" :key="`new-${i}`" class="p3-file-row p3-file-row-pending">
                        <span class="p3-file-icon">📎</span>
                        <span class="p3-file-name">{{ f.name }}</span>
                        <span class="p3-file-meta">pending</span>
                        <button class="p3-file-remove" @click="removeP3NewFile(i)" title="Remove">✕</button>
                      </div>
                    </div>

                    <!-- File input + Send/Add button (always available — even after `confirmed`, for late submissions / follow-ups. See docs §16.1.1 rev 2.) -->
                    <div class="p3-add-file-row">
                      <input id="p3-school-file-input" type="file" multiple accept="application/pdf,image/jpeg,image/png" @change="onP3NewFiles" />
                      <button v-if="!p3Latest" class="btn-primary" :disabled="!p3NewFiles.length" @click="onP3Send" title="Send the queued documents to the student and create the deposit record">📤 Send to Student</button>
                      <button v-else class="btn-secondary" :disabled="!p3NewFiles.length" @click="onP3AddFiles" :title="p3Latest.status === 'confirmed' ? 'Append a follow-up document to the existing deposit record (late submission support)' : 'Append the queued documents to the existing deposit record'">📎 Add to Student</button>
                    </div>
                  </div>

                  <!-- 📥 Files from Student (collapsible — see docs §16.1) -->
                  <!-- As of rev 2.2 (2026-06-16): this toggle body also hosts the Confirm Deposit Receipt block, -->
                  <!-- so the school can review student files + confirm receipt in one place. -->
                  <div v-if="p3Latest" class="p3-section">
                    <button
                      type="button"
                      class="p3-toggle-btn"
                      :class="{ 'p3-toggle-btn-active': showStudentFiles, 'p3-toggle-btn-has-files': p3Latest.studentFiles && p3Latest.studentFiles.length }"
                      @click="showStudentFiles = !showStudentFiles"
                    >
                      <span class="p3-toggle-icon">{{ showStudentFiles ? '🔽' : '▶️' }}</span>
                      <span class="p3-toggle-label">📥 Student Submitted Files</span>
                      <span v-if="p3Latest.studentReadyForReview" class="p3-toggle-ready-mark" title="Student has confirmed all uploads">✅</span>
                      <span class="p3-toggle-count">({{ p3Latest.studentFiles?.length || 0 }})</span>
                    </button>
                    <div v-if="showStudentFiles" class="p3-toggle-body">
                      <div class="action-desc">Documents the student has sent back. Download only — these are part of the P3 audit trail.</div>
                      <div v-if="p3Latest.studentFiles && p3Latest.studentFiles.length" class="p3-files-list">
                        <div v-for="(f, i) in p3Latest.studentFiles" :key="i" class="p3-file-row">
                          <span class="p3-file-icon">📄</span>
                          <a class="p3-file-name" :href="f.dataUrl" target="_blank" rel="noopener">{{ f.name }}</a>
                          <span class="p3-file-meta">{{ formatDateTime(f.uploadedAt) }}</span>
                        </div>
                      </div>
                      <p v-else class="p3-empty">No files submitted yet — waiting for student.</p>

                      <!-- 📥 Confirm Deposit Receipt — moved into this toggle body in rev 2.2 (was standalone Section C). -->
                      <!-- Enablement + helper text variants per docs §16.1.1 rev 2.1. -->
                      <div v-if="p3Latest.status !== 'sent_to_student'" class="p3-confirm-receipt-block">
                        <div class="p3-section-title">📥 Confirm Deposit Receipt</div>
                        <div v-if="p3Latest.proofFileName" class="p3-proof-display">
                          <div class="att-row">
                            <span class="att-icon">📄</span>
                            <div class="att-info">
                              <div class="att-name">{{ p3Latest.proofFileName }}</div>
                              <div class="att-meta">Uploaded {{ formatDateTime(p3Latest.proofUploadedAt) }} by {{ p3Latest.proofUploadedBy || 'student' }}</div>
                            </div>
                            <button
                              v-if="p3Latest.status === 'proof_uploaded'"
                              class="btn-approve"
                              :disabled="!p3Latest.studentFiles || p3Latest.studentFiles.length === 0"
                              :title="(!p3Latest.studentFiles || p3Latest.studentFiles.length === 0) ? 'Student has not sent any files through the file exchange yet' : 'Click to confirm deposit receipt and advance to P4 (school is the final authority)'"
                              @click="onP3Confirm"
                            >✅ Confirm Receipt</button>
                            <span v-else class="status-pill status-pill-confirmed">✅ Confirmed</span>
                          </div>
                          <div v-if="p3Latest.status === 'proof_uploaded' && (!p3Latest.studentFiles || p3Latest.studentFiles.length === 0)" class="p3-gate-hint">
                            ⏳ Waiting for student to send at least 1 file through "📤 Send Files to School". Proof alone is not enough — the school needs at least one supplementary document (signed form, refund agreement, etc.).
                          </div>
                          <div v-else-if="p3Latest.status === 'proof_uploaded' && p3Latest.studentReadyForReview" class="p3-gate-ready">
                            ✅ Student has indicated they're done — you can confirm anytime.
                          </div>
                          <div v-else-if="p3Latest.status === 'proof_uploaded'" class="p3-gate-hint">
                            ℹ️ Student hasn't clicked "✅ I've uploaded everything" — but you can confirm anytime if you have what you need.
                          </div>
                        </div>
                        <p v-else class="p3-empty">Waiting for student to upload deposit proof…</p>
                      </div>
                    </div>
                  </div>

                  <div v-if="p3Latest && p3Latest.status === 'confirmed'" class="p3-confirmed-banner">
                    ✅ Deposit confirmed. P3 complete. You can now proceed to P4 (Admission Documents).
                  </div>

                  <!-- 🔬 DEV affordance (collapsed by default) — see docs §16.1.1 (dev note) -->
                  <!-- Remove this panel + the onDevSimulateStudentResponse handler once -->
                  <!-- pages/student/applications/[id].vue wires up the real student flow. -->
                  <div class="p3-dev-section">
                    <button
                      type="button"
                      class="p3-dev-toggle"
                      :class="{ 'p3-dev-toggle-open': showDevPanel }"
                      @click="showDevPanel = !showDevPanel"
                    >
                      <span class="p3-dev-toggle-icon">{{ showDevPanel ? '🔽' : '▶️' }}</span>
                      <span>🔬 Dev tools (temporary — remove when student P3 page exists)</span>
                    </button>
                    <div v-if="showDevPanel" class="p3-dev-panel">
                      <div class="p3-dev-title">🧪 Simulate Student Response</div>
                      <p class="p3-dev-note">
                        The student-side P3 page is not built yet, so school admins
                        cannot receive student input. This button fakes the missing
                        student actions (upload proof + send 1 file + click "I've
                        uploaded everything") in one click so you can exercise the
                        school's P3→P4 confirm flow.
                      </p>
                      <p class="p3-dev-note">
                        All audit entries are tagged <code>school-admin (dev sim)</code>
                        for easy cleanup.
                      </p>
                      <button
                        v-if="!p3Latest || p3Latest.status !== 'confirmed'"
                        class="btn-dev"
                        @click="onDevSimulateStudentResponse"
                      >
                        🧪 Run simulation
                      </button>
                      <p v-else class="p3-dev-note">
                        Already confirmed. Use "Restart" in the top bar to re-test from P1.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- P4 Admission Documents (was P5, gate-guarded by P3) -->
                <div v-if="ph.phase === 4">
                  <div v-if="p3gate.isP3Confirmed.value" class="action-section">
                    <div v-if="!isRejected">
                      <div class="action-title">Admission Documents</div>
                      <div class="action-desc">Prepare and upload admission documents</div>

                      <!-- §17 Document Checklist (P4 Admission Documents) -->
                      <div v-if="application.phase4Templates && application.phase4Templates.length" class="doc-templates-section">
                        <h4 class="subsection-header">📄 Document Checklist — P4 Admission Documents</h4>
                        <ul class="doc-templates-list">
                          <li v-for="tpl in application.phase4Templates" :key="tpl.id" class="doc-template-item">
                            <span class="doc-template-icon">{{ tpl.required ? '⚠️' : '📄' }}</span>
                            <span class="doc-template-name">{{ tpl.name }}</span>
                            <span class="doc-template-category">{{ tpl.category }}</span>
                          </li>
                        </ul>
                      </div>

                      <!-- §22 P4 File Upload (school side) — multi-file pending queue + Upload/Add buttons -->
                      <div class="p4-section">
                        <div class="p4-section-title">📎 Admission Documents</div>
                        <div class="action-desc">Upload admission documents (CAS Letter, Medical Form, Refund Agreement, etc.). PDF/JPG/PNG, max 5MB each.</div>

                        <!-- Sent (uploaded) docs list — read-only per §22 audit-trail rule (mirror of §16) -->
                        <div v-if="application.phase4Docs && application.phase4Docs.length" class="p4-docs-list">
                          <div v-for="(f, i) in application.phase4Docs" :key="i" class="p4-doc-row">
                            <span class="p4-doc-icon">📄</span>
                            <a class="p4-doc-name" :href="f.dataUrl" target="_blank" rel="noopener">{{ f.name }}</a>
                            <span class="p4-doc-meta">{{ formatDateTime(f.uploadedAt) }}</span>
                          </div>
                        </div>
                        <p v-else class="p4-empty">No documents uploaded yet. Add the first one below.</p>

                        <!-- Pending files queue (not yet uploaded) — per §22 trial scope -->
                        <div v-if="p4NewFiles.length" class="p4-docs-list">
                          <div v-for="(f, i) in p4NewFiles" :key="`new-${i}`" class="p4-doc-row p4-doc-row-pending">
                            <span class="p4-doc-icon">📎</span>
                            <span class="p4-doc-name">{{ f.name }}</span>
                            <span class="p4-doc-meta">pending</span>
                            <button class="p4-doc-remove" @click="removeP4NewFile(i)" title="Remove">✕</button>
                          </div>
                        </div>

                        <!-- File input + Upload/Add button (always available during P4) -->
                        <div class="p4-add-file-row">
                          <input id="p4-school-file-input" type="file" multiple accept="application/pdf,image/jpeg,image/png" @change="onP4NewFiles" />
                          <button v-if="!application.phase4Docs?.length" class="btn-primary" :disabled="!p4NewFiles.length" @click="onP4Upload" title="Upload the queued documents to the system">📤 Upload Documents</button>
                          <button v-else class="btn-secondary" :disabled="!p4NewFiles.length" @click="onP4AddFiles" title="Append the queued documents to the existing admission documents list">📎 Add Documents</button>
                        </div>

                        <!-- Mark Documents Ready — only after first upload (per §22) -->
                        <div v-if="application.phase4Docs && application.phase4Docs.length" class="p4-mark-ready-row">
                          <button class="btn-primary" @click="markReady">✅ Mark Documents Ready (Advance to P5)</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="p-locked-placeholder">
                    🔒 Phase 4 is locked until Phase 3 (Offering) is confirmed.
                  </div>
                </div>

                <!-- P5 Pre-Departure (gate-guarded by P3) — per §18 conditional sub-steps -->
                <div v-if="ph.phase === 5">
                  <div v-if="p3gate.isP3Confirmed.value" class="action-section">
                    <div v-if="!isRejected">
                      <div class="action-title">Pre-Departure</div>
                      <div class="action-desc">
                        <span v-if="application.visaRequested">Visa application + travel arrangements</span>
                        <span v-else>Travel arrangements</span>
                      </div>

                      <!-- §17 Document Checklist (P5 Pre-Departure) -->
                      <div v-if="application.phase5Templates && application.phase5Templates.length" class="doc-templates-section">
                        <h4 class="subsection-header">📄 Document Checklist — P5 Pre-Departure</h4>
                        <ul class="doc-templates-list">
                          <li v-for="tpl in application.phase5Templates" :key="tpl.id" class="doc-template-item">
                            <span class="doc-template-icon">{{ tpl.required ? '⚠️' : '📄' }}</span>
                            <span class="doc-template-name">{{ tpl.name }}</span>
                            <span class="doc-template-category">{{ tpl.category }}</span>
                          </li>
                        </ul>
                      </div>

                      <!-- 🔬 §23 DEV stub (collapsed by default) — see docs §23 (dev note) -->
                      <!-- Remove this panel + onP5DevSimulateStudentStep2 handler once -->
                      <!-- pages/student/applications/[id].vue wires up the real student P5 upload + confirm. -->
                      <div v-if="application.visaRequested" class="p5-dev-section">
                        <button
                          type="button"
                          class="p5-dev-toggle"
                          :class="{ 'p5-dev-toggle-open': showP5DevPanel }"
                          @click="showP5DevPanel = !showP5DevPanel"
                        >
                          <span class="p5-dev-toggle-icon">{{ showP5DevPanel ? '🔽' : '▶️' }}</span>
                          <span>🔬 Dev tools (temporary — remove when student P5 page exists)</span>
                        </button>
                        <div v-if="showP5DevPanel" class="p5-dev-panel">
                          <div class="p5-dev-title">🧪 Simulate Student Step 2</div>
                          <p class="p5-dev-note">
                            The student-side P5 page is not built yet, so school admins
                            cannot receive the student's visa granted PDF upload. This
                            button fakes both missing student actions (upload visa PDF +
                            click "I've been granted") in one click so you can exercise
                            the school's Step 3 (Travel) → Step 4 (Arrival) flow.
                          </p>
                          <p class="p5-dev-note">
                            All audit entries are tagged <code>school-admin (dev sim)</code>
                            for easy cleanup. You can still use the real
                            <code>✅ Confirm Visa Granted</code> button after the sim.
                          </p>
                          <button
                            v-if="!application.phase5VisaGrantedAt"
                            class="btn-dev"
                            @click="onP5DevSimulateStudentStep2"
                          >
                            🧪 Run simulation (student uploaded + confirmed)
                          </button>
                          <p v-else class="p5-dev-note">
                            ✅ Step 2 already done. Use "Restart" in the top bar to re-test from P1.
                          </p>
                        </div>
                      </div>

                      <!-- If visaRequested=true: 4 sub-steps (per §18.1) -->
                      <div v-if="application.visaRequested" class="p5-substeps">
                        <div class="p5-substep" :class="{ 'p5-substep-done': application.phase5VisaGrantedAt }">
                          <span class="p5-substep-icon">🛂</span>
                          <div class="p5-substep-content">
                            <h4>Step 1: Apply for Visa</h4>
                            <p>School issues CAS Letter → student applies for student visa externally</p>
                          </div>
                        </div>

                        <div class="p5-substep" :class="{ 'p5-substep-done': application.phase5VisaGrantedAt, 'p5-substep-active': !application.phase5VisaGrantedAt, 'p5-substep-locked': !application.phase5VisaGrantedDocument && !application.phase5VisaGrantedAt }">
                          <span class="p5-substep-icon">✅</span>
                          <div class="p5-substep-content">
                            <h4>Step 2: Confirm Visa Granted (Student)</h4>
                            <p>Student uploads visa granted PDF, then school confirms here. Mandatory action per §18.2.</p>
                            <p v-if="application.phase5VisaGrantedAt" class="p5-visa-confirmed">
                              ✅ Visa Granted on {{ formatDateTime(application.phase5VisaGrantedAt) }}
                            </p>
                            <template v-else>
                              <p v-if="!application.phase5VisaGrantedDocument" class="p5-lock-hint">🔒 Complete Step 1 first (student must upload visa granted PDF).</p>
                              <button
                                class="btn-primary"
                                :class="{ 'btn-disabled-locked': !application.phase5VisaGrantedDocument }"
                                :disabled="!application.phase5VisaGrantedDocument"
                                :title="!application.phase5VisaGrantedDocument ? 'Please upload your visa granted page first.' : 'Mark visa as granted'"
                                @click="updateVisaStatus"
                              >✅ Confirm Visa Granted</button>
                            </template>
                          </div>
                        </div>

                        <!-- §24 P5 Step 3 — Travel Arrangements (school side) -->
                        <div class="p5-substep" :class="{ 'p5-substep-done': application.subStatus === P5_SUB_STATUS.P5_TRAVEL_ARRANGED, 'p5-substep-active': application.phase5VisaGrantedAt && application.subStatus !== P5_SUB_STATUS.P5_TRAVEL_ARRANGED, 'p5-substep-locked': !application.phase5VisaGrantedAt }">
                          <span class="p5-substep-icon">✈️</span>
                          <div class="p5-substep-content">
                            <h4>Step 3: Travel Arrangements</h4>
                            <p>Two-part form: student submits flight + transfer info; school adds airport-to-school transport (if arranged). Both sides can view both parts.</p>
                            <p v-if="!application.phase5VisaGrantedAt" class="p5-lock-hint">🔒 Complete Step 2 first.</p>

                            <TravelStep
                              v-if="travelPlan"
                              :plan="travelPlan"
                              mode="school"
                              :application-ref="id"
                              @save-school="onP5SaveSchoolTravelPart"
                            />

                            <!-- 🔬 §24.5 DEV affordance (collapsed by default) — see docs §24.5 (dev note) -->
                            <div class="p5-dev-section">
                              <button
                                type="button"
                                class="p5-dev-toggle"
                                :class="{ 'p5-dev-toggle-open': showP5TravelDevPanel }"
                                @click="showP5TravelDevPanel = !showP5TravelDevPanel"
                              >
                                <span class="p5-dev-toggle-icon">{{ showP5TravelDevPanel ? '🔽' : '▶️' }}</span>
                                <span>🔬 Dev tools (temporary — remove when student P5 Travel form exists)</span>
                              </button>
                              <div v-if="showP5TravelDevPanel" class="p5-dev-panel">
                                <div class="p5-dev-title">🧪 Simulate Student Travel Info</div>
                                <p class="p5-dev-note">
                                  The student-side P5 Travel Arrangements form is not yet built, so this button
                                  auto-fills the student part with sensible test data (flight + self-arranged taxi)
                                  so you can test the school's Mark Travel Arranged flow.
                                </p>
                                <p class="p5-dev-note">
                                  All entries are tagged <code>school-admin (dev sim)</code> for easy cleanup.
                                </p>
                                <button
                                  v-if="!travelPlan || !travelPlan.studentPart.submittedAt"
                                  class="btn-dev"
                                  @click="onP5DevSimulateStudentTravel"
                                >
                                  🧪 Simulate student travel info (flight + taxi)
                                </button>
                                <p v-else class="p5-dev-note">
                                  ✅ Student part already filled. Use "Restart" in the top bar to re-test from P1.
                                </p>
                              </div>
                            </div>

                            <p v-if="application.phase5VisaGrantedAt && !canMarkTravelArranged" class="p5-lock-hint">💡 Fill at least one part (student flight details or school pickup details) to enable "Mark Travel Arranged".</p>
                            <button
                              class="btn-secondary"
                              :class="{ 'btn-disabled-locked': !canMarkTravelArranged }"
                              :disabled="!canMarkTravelArranged"
                              :title="!canMarkTravelArranged ? (!application.phase5VisaGrantedAt ? 'Confirm Visa Granted first (Step 2).' : 'Fill at least one part (student or school) first.') : 'Mark travel as arranged'"
                              @click="confirmTravel"
                            >✈️ Mark Travel Arranged</button>
                          </div>
                        </div>

                        <div class="p5-substep" :class="{ 'p5-substep-active': application.subStatus === P5_SUB_STATUS.P5_TRAVEL_ARRANGED, 'p5-substep-locked': application.subStatus !== P5_SUB_STATUS.P5_TRAVEL_ARRANGED }">
                          <span class="p5-substep-icon">🏫</span>
                          <div class="p5-substep-content">
                            <h4>Step 4: School Confirms Arrival</h4>
                            <p>School confirms the pupil has arrived and boarded</p>
                            <p v-if="application.subStatus !== P5_SUB_STATUS.P5_TRAVEL_ARRANGED" class="p5-lock-hint">🔒 Complete Step 3 first.</p>
                            <button
                              class="btn-primary"
                              :class="{ 'btn-disabled-locked': application.subStatus !== P5_SUB_STATUS.P5_TRAVEL_ARRANGED }"
                              :disabled="application.subStatus !== P5_SUB_STATUS.P5_TRAVEL_ARRANGED"
                              :title="application.subStatus !== P5_SUB_STATUS.P5_TRAVEL_ARRANGED ? 'Mark Travel Arranged first (Step 3).' : 'Confirm pupil arrival and complete enrollment'"
                              @click="confirmArrival"
                            >🏫 Confirm Arrival & Enroll</button>
                          </div>
                        </div>
                      </div>

                      <!-- If visaRequested=false: 2 sub-steps (skip visa) — Step 1 is travel arrangements -->
                      <div v-else class="p5-substeps">
                        <div class="p5-substep" :class="{ 'p5-substep-done': application.subStatus === P5_SUB_STATUS.P5_TRAVEL_ARRANGED, 'p5-substep-active': application.subStatus !== P5_SUB_STATUS.P5_TRAVEL_ARRANGED }">
                          <span class="p5-substep-icon">✈️</span>
                          <div class="p5-substep-content">
                            <h4>Step 1: Travel Arrangements</h4>
                            <p>Two-part form: student submits flight + transfer info; school adds airport-to-school transport (if arranged).</p>
                            <TravelStep
                              v-if="travelPlan"
                              :plan="travelPlan"
                              mode="school"
                              :application-ref="id"
                              @save-school="onP5SaveSchoolTravelPart"
                            />
                            <p v-if="!canMarkTravelArranged" class="p5-lock-hint">💡 Fill at least one part (student flight details or school pickup details) to enable "Mark Travel Arranged".</p>
                            <button class="btn-secondary" :class="{ 'btn-disabled-locked': !canMarkTravelArranged }" :disabled="!canMarkTravelArranged" :title="!canMarkTravelArranged ? 'Fill at least one part first.' : 'Mark travel as arranged'" @click="confirmTravel">✈️ Mark Travel Arranged</button>
                          </div>
                        </div>

                        <div class="p5-substep" :class="{ 'p5-substep-active': application.subStatus === P5_SUB_STATUS.P5_TRAVEL_ARRANGED, 'p5-substep-locked': application.subStatus !== P5_SUB_STATUS.P5_TRAVEL_ARRANGED }">
                          <span class="p5-substep-icon">🏫</span>
                          <div class="p5-substep-content">
                            <h4>Step 2: School Confirms Arrival</h4>
                            <p>School confirms the pupil has arrived and boarded</p>
                            <p v-if="application.subStatus !== P5_SUB_STATUS.P5_TRAVEL_ARRANGED" class="p5-lock-hint">🔒 Complete Step 1 first.</p>
                            <button
                              class="btn-primary"
                              :class="{ 'btn-disabled-locked': application.subStatus !== P5_SUB_STATUS.P5_TRAVEL_ARRANGED }"
                              :disabled="application.subStatus !== P5_SUB_STATUS.P5_TRAVEL_ARRANGED"
                              :title="application.subStatus !== P5_SUB_STATUS.P5_TRAVEL_ARRANGED ? 'Mark Travel Arranged first (Step 1).' : 'Confirm pupil arrival and complete enrollment'"
                              @click="confirmArrival"
                            >🏫 Confirm Arrival & Enroll</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="p-locked-placeholder">
                    🔒 Phase 5 is locked until Phase 3 (Offering) is confirmed.
                  </div>
                </div>

                <!-- P6 Enrolled (was P7, gate-guarded by P3) -->
                <div v-if="ph.phase === 6">
                  <div v-if="p3gate.isP3Confirmed.value" class="action-section">
                    <div v-if="!isRejected">
                      <div class="action-title">Enrolled</div>
                      <div class="action-desc">Student has successfully enrolled</div>
                      <div class="action-buttons">
                        <button class="btn-secondary" @click="viewStudentRecord">📋 View Student Record</button>
                      </div>
                    </div>
                  </div>
                  <div v-else class="p-locked-placeholder">
                    🔒 Phase 6 is locked until Phase 3 (Offering) is confirmed.
                  </div>
                </div>

                <!-- P1-P2: editable. P3+: locked (consultant is part of financial audit trail, see docs §P1 Consultant Assignment — Phase Lock) -->
                <div v-if="!isRejected && application.currentPhase <= 2" class="action-section divider">
                  <div class="action-title">Consultant Assignment</div>
                  <div class="action-desc">Assign or change consultant for this application</div>
                  <div class="action-buttons">
                    <button class="btn-secondary" @click="assignConsultant">
                      {{ application.consultantName ? '👤 Change Consultant' : '👤 Assign Consultant' }}
                    </button>
                  </div>
                </div>
                <div v-else-if="!isRejected && application.currentPhase >= 3" class="action-section divider">
                  <div class="action-title">🔒 Consultant (Locked)</div>
                  <div class="action-desc">
                    Consultant: <strong>{{ application.consultantName || 'Unassigned' }}</strong><br>
                    <small>Locked once the application enters P3 (Offering). The consultant is part of the financial audit trail.</small>
                  </div>
                </div>

                <div v-if="application.status === 'rejected'" class="action-section divider">
                  <div class="action-title">Reopen Application</div>
                  <div class="action-desc">Reopen this application if rejection was made in error</div>
                  <div class="action-buttons">
                    <button class="btn-primary" @click="reopenApplication">🔄 Reopen Application</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

            <!-- Right Column -->
      <div class="detail-right">
        <ChatRoom :application-ref="application.refNumber" user-role="school" />
      </div>
    </div>
  </main>

  <!-- rev 2.5: Restart confirmation modal — see docs §14.1. -->
  <!-- Replaces window.confirm() (unreliable on iOS Safari / WebView). -->
  <Teleport to="body">
    <div v-if="showRestartModal" class="restart-modal-overlay" @click.self="cancelRestart" role="dialog" aria-modal="true" aria-labelledby="restart-modal-title">
      <div class="restart-modal" role="document">
        <h3 id="restart-modal-title">Restart this application?</h3>
        <p class="restart-modal-warning">
          This is a destructive action and cannot be undone.
        </p>
        <p class="restart-modal-intro">This will:</p>
        <ul class="restart-modal-list">
          <li>Reset to Phase 1 (fresh application)</li>
          <li>Clear all P2 interviews, reports, and decisions</li>
          <li>Clear all P3 deposit data</li>
          <li>Clear localStorage for the page, P2 store, and P3 store</li>
          <li>Collapse all expanded past phases</li>
        </ul>
        <div class="restart-modal-actions">
          <button type="button" class="btn-restart-cancel" @click="cancelRestart" :disabled="restarting">
            Cancel
          </button>
          <button type="button" class="btn-restart-confirm" @click="confirmRestart" :disabled="restarting" autofocus>
            {{ restarting ? 'Restarting…' : 'Yes, restart' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Dev-only testing shortcuts. Hidden in production (no ?dev=1 query, no localStorage flag). See docs §21. -->
  <div v-if="isDevMode" class="dev-tools-panel">
    <div class="dev-tools-header">🧪 Dev Tools (rev 3.2)</div>
    <div class="dev-tools-actions">
      <button v-if="application.currentPhase === 1" @click="devAdvanceToP2">⏩ Advance to P2</button>
      <button v-if="application.currentPhase === 2" @click="devAdvanceToP3">⏩ Approve + Advance to P3</button>
      <button v-if="application.currentPhase === 3" @click="devAdvanceToP4">⏩ Confirm Deposit + Advance to P4</button>
      <button v-if="application.currentPhase === 4" @click="devAdvanceToP5">⏩ Mark Complete + Advance to P5</button>
      <button v-if="application.currentPhase === 5" @click="devJumpToP6" class="dev-tools-primary">⏩ Complete All P5 + Advance to P6</button>
      <button v-if="application.currentPhase === 6" @click="devRestart">🔄 Restart to P1</button>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const id = route.params.id

definePageMeta({ layout: 'school' })
useHead({ title: '📋 Application Details — BSP' })

// Components
import RejectedBanner from '~/components/RejectedBanner.vue'

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
  visaRequested: true,
  phase3Templates: [],
  phase4Templates: [],
  phase4Docs: [],                  // §22 P4 file upload — back-filled in loadState() for old records
  phase5Templates: [],
  phase5VisaGrantedDocument: null,
  phase5VisaGrantedAt: null,
  // §24 P5 Travel Arrangements — primary data lives in `bsp:travel:${id}`
  // localStorage (see useTravelStore). This is just the in-app mirror.
  phase5TravelPlan: { studentPart: { submittedAt: null, submittedBy: 'student' }, schoolPart: { submittedAt: null, submittedBy: 'school' }, status: 'pending' },
  currentPhase: 7,
  subStatus: 'Enrolled',
  status: 'completed',
  appliedAt: '2024-10-15T10:00:00Z',
  interview: {
    type: 'in-person',
    date: '2024-11-02',
    startTime: '10:00',
    durationMinutes: 60,
    location: 'Westminster School, 17 Regency Street, London SW1P 2DG',
    onlineLink: '',
    agenda: 'Maths test (30 min) + English interview (20 min) + Q&A (10 min)',
    notes: '',
    status: 'confirmed',
    studentResponse: { action: 'confirm', message: '', respondedAt: '2024-10-25T14:00:00Z' },
    scheduledAt: '2024-10-20T09:00:00Z',
    scheduledBy: 'school-admin',
    history: [
      { event: 'scheduled', by: 'school', message: 'Initial interview scheduled', timestamp: '2024-10-20T09:00:00Z' },
      { event: 'student-confirmed', by: 'student', message: '', timestamp: '2024-10-25T14:00:00Z' },
      { event: 'school-completed', by: 'school', message: 'Interview completed, assessment uploaded', timestamp: '2024-11-02T11:30:00Z' }
    ]
  },
  attachments: [
    { id: 'a1', fileName: 'Passport_Copy.pdf', fileSize: '1.2 MB', fileType: 'application/pdf', phase: 1, phaseLabel: 'Application Submitted', uploadedBy: 'student', uploadedByRole: 'Student', createdAt: '2024-10-15T10:05:00Z' },
    { id: 'a2', fileName: 'Academic_Transcript.pdf', fileSize: '2.4 MB', fileType: 'application/pdf', phase: 1, phaseLabel: 'Application Submitted', uploadedBy: 'student', uploadedByRole: 'Student', createdAt: '2024-10-15T10:06:00Z' },
    { id: 'a3', fileName: 'Interview_Assessment.pdf', fileSize: '0.8 MB', fileType: 'application/pdf', phase: 2, phaseLabel: 'Interview & Assessment', uploadedBy: 'school', uploadedByRole: 'School', createdAt: '2024-11-02T09:00:00Z' },
    { id: 'a4', fileName: 'Offer_Letter.pdf', fileSize: '1.1 MB', fileType: 'application/pdf', phase: 3, phaseLabel: 'Offering', uploadedBy: 'school', uploadedByRole: 'School', createdAt: '2024-11-10T14:00:00Z' },
    { id: 'a4b', fileName: 'Admission_Agreement.pdf', fileSize: '0.4 MB', fileType: 'application/pdf', phase: 4, phaseLabel: 'Admission Documents', uploadedBy: 'school', uploadedByRole: 'School', createdAt: '2024-12-01T11:00:00Z' },
    { id: 'a5', fileName: 'CAS_Letter.pdf', fileSize: '0.5 MB', fileType: 'application/pdf', phase: 5, phaseLabel: 'Pre-Departure', uploadedBy: 'school', uploadedByRole: 'School', createdAt: '2025-01-20T11:00:00Z' },
    { id: 'a6', fileName: 'Enrolment_Confirmation.pdf', fileSize: '0.6 MB', fileType: 'application/pdf', phase: 6, phaseLabel: 'Enrolled', uploadedBy: 'school', uploadedByRole: 'School', createdAt: '2025-09-01T09:00:00Z' },
  ],
  phaseHistory: [
    { phase: 1, label: 'Application Submitted', status: 'Completed', date: '2024-10-15', notes: 'Application received and documents uploaded.', attachments: ['Passport_Copy.pdf', 'Academic_Transcript.pdf'] },
    { phase: 2, label: 'Interview & Assessment', status: 'Completed', date: '2024-11-02', notes: 'Interview conducted. Assessment report uploaded.', attachments: ['Interview_Assessment.pdf'] },
    { phase: 3, label: 'Offering', status: 'Completed', date: '2024-11-10', notes: 'Offer sent. Deposit received and confirmed.', attachments: ['Offer_Letter.pdf'] },
    { phase: 4, label: 'Admission Documents', status: 'Completed', date: '2024-12-01', notes: 'All admission documents prepared and verified.', attachments: [] },
    { phase: 5, label: 'Pre-Departure', status: 'Completed', date: '2025-01-20', notes: 'CAS issued. Student visa granted. Travel arranged.', attachments: ['CAS_Letter.pdf'] },
    { phase: 6, label: 'Enrolled', status: 'Completed', date: '2025-09-01', notes: 'Student successfully enrolled. Welcome pack issued.', attachments: ['Enrolment_Confirmation.pdf'] },
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
  visaRequested: true,
  phase3Templates: [],
  phase4Templates: [],
  phase4Docs: [],                  // §22 P4 file upload — back-filled in loadState() for old records
  phase5Templates: [],
  phase5VisaGrantedDocument: null,
  phase5VisaGrantedAt: null,
  // §24 P5 Travel Arrangements — primary data lives in `bsp:travel:${id}`
  // localStorage (see useTravelStore). This is just the in-app mirror.
  phase5TravelPlan: { studentPart: { submittedAt: null, submittedBy: 'student' }, schoolPart: { submittedAt: null, submittedBy: 'school' }, status: 'pending' },
  currentPhase: 1,
  subStatus: 'Application Submitted',
  status: 'active',
  appliedAt: new Date().toISOString(),
  interview: null,
  attachments: [
    { id: 'a1', fileName: 'Passport_Copy.pdf', fileSize: '1.2 MB', fileType: 'application/pdf', phase: 1, phaseLabel: 'Application Submitted', uploadedBy: 'student', uploadedByRole: 'Student', createdAt: new Date().toISOString() },
    { id: 'a2', fileName: 'Academic_Transcript.pdf', fileSize: '2.4 MB', fileType: 'application/pdf', phase: 1, phaseLabel: 'Application Submitted', uploadedBy: 'student', uploadedByRole: 'Student', createdAt: new Date().toISOString() },
    { id: 'a3', fileName: 'Reference_Letter_MrWang.pdf', fileSize: '0.5 MB', fileType: 'application/pdf', phase: 1, phaseLabel: 'Application Submitted', uploadedBy: 'student', uploadedByRole: 'Student', createdAt: new Date().toISOString() },
  ],
  phaseHistory: [
    { phase: 1, label: 'Application Submitted', status: 'In Progress', date: new Date().toISOString().slice(0,10), notes: 'New application received. Awaiting school review.', attachments: ['Passport_Copy.pdf', 'Academic_Transcript.pdf', 'Reference_Letter_MrWang.pdf'] },
    { phase: 2, label: 'Interview & Assessment', status: 'Pending', date: null, notes: '', attachments: [] },
    { phase: 3, label: 'Offering', status: 'Pending', date: null, notes: '', attachments: [] },
    { phase: 4, label: 'Admission Documents', status: 'Pending', date: null, notes: '', attachments: [] },
    { phase: 5, label: 'Pre-Departure', status: 'Pending', date: null, notes: '', attachments: [] },
    { phase: 6, label: 'Enrolled', status: 'Pending', date: null, notes: '', attachments: [] },
  ]
}

const application = ref(id === '2025-ENROLLED1' ? enrolledMock : defaultMock)

// Interview form state
const editingInterview = ref(false)
const interviewDraft = ref({ type: 'in-person', date: '', startTime: '', durationMinutes: 60, location: '', onlineLink: '', agenda: '', notes: '' })

// Shared interview storage key (cross-portal: school + student share this)
const INTERVIEW_KEY = computed(() => `bsp:interview:${id}`)

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

// §21 rev 3.2 — Dev affordance panel visibility.
// Visible ONLY when URL has ?dev=1 OR localStorage 'bsp-dev-mode' is 'true'.
// Production (no flag, no storage) NEVER renders the panel.
const isDevMode = computed(() => {
  if (typeof window === 'undefined') return false
  try {
    if (window.location.search.includes('dev=1')) return true
    if (localStorage.getItem('bsp-dev-mode') === 'true') return true
  } catch (e) { /* ignore */ }
  return false
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

function loadInterviewState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(INTERVIEW_KEY.value)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  return null
}

function saveInterviewState() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(INTERVIEW_KEY.value, JSON.stringify(application.value.interview))
  } catch (e) { /* ignore */ }
}

onMounted(() => {
  const stored = loadState()
  if (stored) {
    application.value = stored
  }
  // §22: back-fill phase4Docs for old localStorage records missing the field
  if (!application.value.phase4Docs) {
    application.value.phase4Docs = []
  }
  // Load shared interview state (school ↔ student cross-portal sync)
  const sharedInterview = loadInterviewState()
  if (sharedInterview !== null) {
    application.value.interview = sharedInterview
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
  if (newPhase === 6) {
    application.value.status = 'completed'
  } else {
    application.value.status = 'active'
  }
  saveState()
}

// Interview functions
function openEditInterview() {
  if (application.value.interview) {
    interviewDraft.value = clone(application.value.interview)
  } else {
    interviewDraft.value = { type: 'in-person', date: '', startTime: '', durationMinutes: 60, location: '', onlineLink: '', agenda: '', notes: '' }
  }
  editingInterview.value = true
}

function cancelEditInterview() {
  editingInterview.value = false
}

function saveInterview() {
  const d = interviewDraft.value
  if (!d.date || !d.startTime || !d.agenda) {
    alert('Please fill in Date, Start time, and Agenda.')
    return
  }
  if (d.type !== 'online' && !d.location) {
    alert('Please provide a Location for in-person / hybrid interviews.')
    return
  }
  if (d.type !== 'in-person' && !d.onlineLink) {
    alert('Please provide an Online link for online / hybrid interviews.')
    return
  }

  const wasReschedule = !!application.value.interview
  const prevHistory = application.value.interview?.history || []

  application.value.interview = {
    type: d.type,
    date: d.date,
    startTime: d.startTime,
    durationMinutes: Number(d.durationMinutes) || 60,
    location: d.type === 'online' ? '' : (d.location || ''),
    onlineLink: d.type === 'in-person' ? '' : (d.onlineLink || ''),
    agenda: d.agenda,
    notes: d.notes || '',
    status: 'pending',
    studentResponse: { action: null, message: '', respondedAt: null },
    scheduledAt: new Date().toISOString(),
    scheduledBy: 'school-admin',
    history: [
      ...prevHistory,
      {
        event: wasReschedule ? 'rescheduled' : 'scheduled',
        by: 'school',
        message: wasReschedule ? 'Interview rescheduled' : 'Initial interview scheduled',
        timestamp: new Date().toISOString()
      }
    ]
  }

  editingInterview.value = false
  saveState()
  saveInterviewState()
}

function cancelInterview() {
  if (!confirm('Cancel this interview? The student will no longer see it.')) return
  application.value.interview = null
  saveState()
  saveInterviewState()
}

function completeInterview() {
  if (!confirm('Mark this interview as complete?\n\nThis will advance the application to Phase 3 (Offering).')) return
  if (application.value.interview) {
    application.value.interview.history = [
      ...(application.value.interview.history || []),
      { event: 'school-completed', by: 'school', message: 'Interview completed', timestamp: new Date().toISOString() }
    ]
  }
  advancePhase(3, 'Interview completed — proceeding to Decision')
  saveInterviewState()
}

function formatInterviewDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function interviewTypeLabel(type) {
  if (type === 'in-person') return 'In-person'
  if (type === 'online') return 'Online (video call)'
  if (type === 'hybrid') return 'Hybrid (in-person + online)'
  return type
}

// Action handlers — real state transitions
function scheduleInHouse() {
  if (application.value.currentPhase === 1) {
    advancePhase(2, 'Interview scheduled — school will conduct it in-house')
  }
}

function delegateToConsultant() {
  if (application.value.currentPhase === 1) {
    advancePhase(2, 'Interview delegated to consultant')
  }
}

function rejectApplication() {
  if (confirm('Reject this application? (You can reopen it later from the Reopen section.)')) {
    // Record current phase so Reopen can restore to it (see docs §11).
    application.value.previousPhase = application.value.currentPhase
    application.value.status = 'rejected'
    application.value.subStatus = 'Rejected'
    application.value.phaseHistory.forEach(p => {
      (p.status === 'Pending' || p.status === 'In Progress') && (p.status = 'Pending')
    })
    saveState()
  }
}

function scheduleInterview() {
  // Deprecated: open the schedule form. Real logic now in saveInterview().
  if (application.value.currentPhase === 2) {
    openEditInterview()
  }
}

// §22 P4 File Upload helpers (school side) — mirror of §16 P3 pattern
const p4NewFiles = ref([])   // queued, not yet uploaded

function onP4NewFiles(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is too large (max 5MB)`)
      continue
    }
    const reader = new FileReader()
    reader.onload = ((f) => () => {
      p4NewFiles.value.push({ name: f.name, dataUrl: reader.result })
    })(file)
    reader.readAsDataURL(file)
  }
  e.target.value = ''
}

function removeP4NewFile(index) {
  p4NewFiles.value.splice(index, 1)
}

function onP4Upload() {
  if (!p4NewFiles.value.length) return
  if (!application.value.phase4Docs) application.value.phase4Docs = []
  const files = p4NewFiles.value.map(f => ({ name: f.name, dataUrl: f.dataUrl, uploadedAt: new Date().toISOString(), uploadedBy: 'school-admin' }))
  application.value.phase4Docs.push(...files)
  p4NewFiles.value = []
  saveState()
}

function onP4AddFiles() {
  // Same as onP4Upload — appends to existing list
  onP4Upload()
}

function markReady() {
  if (application.value.currentPhase === 4) {
    if (!application.value.phase4Docs?.length) {
      alert('Please upload at least one admission document before marking ready.')
      return
    }
    advancePhase(5, 'Admission documents ready and verified')
  }
}

// §18.1: visa granted is a sub-step within P5, NOT a phase advance
function updateVisaStatus() {
  if (application.value.currentPhase === 5 && application.value.visaRequested) {
    // Mark visa as granted. P5 → P6 happens only via confirmArrival().
    application.value.phase5VisaGrantedAt = new Date().toISOString()
    application.value.subStatus = P5_SUB_STATUS.P5_VISA_GRANTED
    saveState()
  }
}

// §18.1 + §24.4: confirm travel arrangements (sub-step within P5, NOT phase advance)
function confirmTravel() {
  if (application.value.currentPhase === 5) {
    application.value.subStatus = P5_SUB_STATUS.P5_TRAVEL_ARRANGED
    travelstore.markTravelArranged(id)
    travelPlan.value = travelstore.getPlan(id)
    application.value.phase5TravelPlan = { ...travelPlan.value }
    saveState()
  }
}

// §18.1: school confirms arrival → triggers P5 → P6
function confirmArrival() {
  if (application.value.currentPhase === 5) {
    advancePhase(6, 'Pupil arrived and enrolled')
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
  // Reopen restores the application to the phase it was in when it was rejected
  // (not always Phase 1). For example, if rejection happened in P2, Reopen returns
  // to P2 with P1's "Completed" state preserved. Falls back to Phase 1 for legacy
  // records that pre-date the previousPhase field. See docs/admission-pipeline-v2.md §12.
  const targetPhase = application.value.previousPhase || 1
  const targetPhaseObj = application.value.phaseHistory.find(p => p.phase === targetPhase)
  const phaseLabel = targetPhaseObj ? targetPhaseObj.label : 'Application Submitted'
  if (!confirm(`Reopen this rejected application? It will return to Phase ${targetPhase} (${phaseLabel}).`)) return
  // 0. Clear the manager decision(s) for this app in the p2 store so the
  //    Manager Decision form (gated by `!latestDecision`) reappears. Without
  //    this, the user sees a stale ❌ Rejected summary and no way to re-decide.
  //    See docs §12 "Reopen also clears the manager decision".
  try { p2.reopenApp(id) } catch (e) {}
  application.value.status = 'active'
  application.value.currentPhase = targetPhase
  application.value.subStatus = phaseLabel
  application.value.phaseHistory.forEach(p => {
    if (p.phase < targetPhase) {
      // Earlier phases are already "Completed" — leave their data intact (audit trail)
      return
    } else if (p.phase === targetPhase) {
      // The phase we're returning to: mark "In Progress" and stamp today's date
      p.status = 'In Progress'
      p.date = w()
    } else {
      // Future phases: reset to "Pending"
      p.status = 'Pending'
      p.date = null
      p.notes = ''
    }
  })
  application.value.previousPhase = null  // Clear so the next reject records fresh
  // Reset Schedule section UI state so the collapsed "➕ Schedule New Round"
  // button shows (not a stale expanded form from before the rejection). See
  // docs/admission-pipeline-v2.md §12 "Reopen restores Schedule section UI state".
  scheduleExpanded.value = false
  scheduleForm.value = { date: '', time: '', location: '', interviewer: '', agenda: '' }
  saveState()
}

// =====================================================================
// P2 (Interview + Decision) — useP2Store integration
// Sections A (Schedule) / B (Current + Report) / C (Past) / D (Manager Decision)
// =====================================================================
const { P5_SUB_STATUS } = useP2Store()
const p2 = useP2Store()

// Current logged-in user (school portal). Demo: school-admin / school manager.
// Real implementation would source this from auth/session.
const currentUser = ref({ name: 'Mr. Smith (Head of Admissions)', role: 'school' })

// --- P2 app status (for header pill) ---
const p2App = computed(() => p2.getApplication(id))
const p2StatusKey = computed(() => {
  const s = p2App.value?.status || 'active'
  if (s === 'pending-decision') return 'pending'
  if (s === 'rejected') return 'change'
  if (s === 'completed') return 'confirmed'
  return 'pending'
})
const p2StatusLabel = computed(() => {
  const s = p2App.value?.status || 'active'
  if (s === 'pending-decision') return '⏳ Decision Pending'
  if (s === 'rejected') return '❌ Rejected'
  if (s === 'completed') return '✅ Completed'
  return '🟢 Active'
})

// --- Toast (auto-dismissing success/info message) ---
const p2Toast = ref('')
let _p2ToastTimer = null
function showP2Toast(msg) {
  p2Toast.value = msg
  if (_p2ToastTimer) clearTimeout(_p2ToastTimer)
  _p2ToastTimer = setTimeout(() => { p2Toast.value = '' }, 3500)
}

// ===== Section A: Schedule form state =====
const scheduleForm = ref({ date: '', time: '', location: '', interviewer: '', agenda: '' })
function onScheduleInterview() {
  const f = scheduleForm.value
  if (!f.date || !f.time) {
    alert('Please fill in Date and Time.')
    return
  }
  if (!f.location.trim()) {
    alert('Please provide a Location.')
    return
  }
  if (!f.interviewer.trim()) {
    alert('Please provide an Interviewer name.')
    return
  }
  try {
    const iv = p2.scheduleInterview({
      applicationRef: id,
      date: f.date,
      time: f.time,
      location: f.location.trim(),
      interviewer: f.interviewer.trim(),
      interviewerRole: currentUser.value.role === 'consultant' ? 'consultant' : 'school',
      agenda: f.agenda || '',
      scheduledBy: currentUser.value.name,
    })
    showP2Toast(`Round #${iv.roundNumber} scheduled for ${iv.date} ${iv.time} (UK time).`)
    scheduleForm.value = { date: '', time: '', location: '', interviewer: '', agenda: '' }
    scheduleExpanded.value = false  // collapse so user sees the new "current" round in Section B
    pastExpanded.value = false  // collapse history so user sees the new "current" round
  } catch (e) {
    alert('Error scheduling interview: ' + e.message)
  }
}

// ===== Section B: Current interview / report =====
const latestInterview = computed(() => p2.getLatestInterview(id))
const allReports = computed(() => p2.getReports(id))
const currentInterviewReport = computed(() => {
  const iv = latestInterview.value
  return iv ? p2.getReportForInterview(iv.id) : undefined
})
const isCurrentUserInterviewer = computed(() => {
  const iv = latestInterview.value
  if (!iv) return false
  if (currentInterviewReport.value) return false
  return iv.interviewerRole === currentUser.value.role
})

const reportForm = ref({ rating: 4, recommendation: 'recommend', notes: '' })
function onSubmitReport() {
  const iv = latestInterview.value
  if (!iv) return
  if (!reportForm.value.notes.trim()) {
    alert('Please add a short note (max 200 chars).')
    return
  }
  try {
    p2.submitReport({
      applicationRef: id,
      interviewId: iv.id,
      overallRating: reportForm.value.rating,
      recommendation: reportForm.value.recommendation,
      notes: reportForm.value.notes,
      interviewer: iv.interviewer,
      interviewerRole: iv.interviewerRole,
    })
    showP2Toast(`Report submitted for Round #${iv.roundNumber} (immutable).`)
    reportForm.value = { rating: 4, recommendation: 'recommend', notes: '' }
  } catch (e) {
    alert('Error submitting report: ' + e.message)
  }
}

// ===== Section A: Schedule section collapse state =====
const scheduleExpanded = ref(false)
const allInterviews = computed(() => p2.getInterviews(id))
const hasAnyInterview = computed(() => allInterviews.value.length > 0)
const interviewCount = computed(() => allInterviews.value.length)

// ===== Section C: Past interviews =====
const pastInterviews = computed(() => p2.getPastInterviews(id))
const pastInterviewsReversed = computed(() => [...pastInterviews.value].reverse())
const pastExpanded = ref(false)
function p2ReportFor(interviewId) {
  return p2.getReportForInterview(interviewId)
}

// ===== Section D: Manager decision =====
const latestDecision = computed(() => p2.getLatestDecision(id))

// Rejected-state read-only guard (see docs/admission-pipeline-v2.md §11):
// when application.status === 'rejected', ALL action buttons are hidden
// except the Reopen Application button. Data stays viewable.
const isRejected = computed(() => application.value.status === 'rejected')
const allReportsReversed = computed(() => [...allReports.value].reverse())

// ===== P2 Section Ordering (see docs §15) =====
// P2 sections are ordered by ACTION PRIORITY — the most relevant action the
// user needs to take is at the top, so the school immediately knows what to do
// without scrolling. See `p2SectionOrder` and `p2NextAction` below.
const p2SectionOrder = computed(() => {
  const hasIv = hasAnyInterview.value
  const latestIv = latestInterview.value
  const latestHasReport = !!currentInterviewReport.value
  const hasDec = !!latestDecision.value

  if (isRejected.value) {
    // Rejected: decision summary is the most relevant context (why was I rejected?).
    // Show D first, then current interview (B), then past (C). Schedule (A) is
    // hidden by its own v-if when a decision exists.
    return ['D', 'B', 'C']
  }
  if (hasDec) {
    // Decision made: Decision summary + Mark P2 Complete are most relevant.
    return ['D', 'B', 'A', 'C']
  }
  if (!hasIv) {
    // No interview yet: Schedule section is the primary action.
    return ['A', 'B', 'C', 'D']
  }
  if (latestIv && !latestHasReport) {
    // Latest round has no report yet: Current Interview (with report form
    // or awaiting message) is the primary action.
    return ['B', 'A', 'C', 'D']
  }
  // All reports in, no decision yet: Manager Decision is the primary action.
  return ['D', 'B', 'A', 'C']
})

// Next Action callout — always shown at the top of the P2 container
// (unless rejected). Tells the school what to do right now.
const p2NextAction = computed(() => {
  if (isRejected.value) return null
  if (latestDecision.value) {
    return {
      title: '✅ Decision Made',
      subtitle: 'Review the decision summary below and click "Mark P2 Complete" to proceed to Phase 3 (Offering).',
    }
  }
  if (!hasAnyInterview.value) {
    return {
      title: '📅 Schedule the First Interview',
      subtitle: 'No interview has been scheduled yet. Start by scheduling Round 1 in the section below.',
    }
  }
  if (latestInterview.value && !currentInterviewReport.value) {
    if (isCurrentUserInterviewer.value) {
      return {
        title: '📝 Submit Your Report',
        subtitle: `Round #${latestInterview.value.roundNumber} is complete. Fill in your rating and notes, then submit.`,
      }
    }
    return {
      title: '⏳ Awaiting Report',
      subtitle: `Waiting for ${latestInterview.value.interviewer} to submit their report for Round #${latestInterview.value.roundNumber}.`,
    }
  }
  return {
    title: '👔 Make a Decision',
    subtitle: 'All interview reports are in. Review them below and click Approve or Reject.',
  }
})
const decisionForm = ref({ showReject: false, reason: '' })
function onRejectClick() {
  decisionForm.value.showReject = true
  decisionForm.value.reason = ''
}
function onRejectCancel() {
  decisionForm.value.showReject = false
  decisionForm.value.reason = ''
}
function onMakeDecision(outcome) {
  if (allReports.value.length === 0) {
    alert('At least 1 interview report must be submitted before deciding.')
    return
  }
  try {
    p2.makeDecision({
      applicationRef: id,
      outcome,
      // Rejection reason is optional — allow empty string. Use undefined for approve
      // so the p2 store does not record a spurious empty reason.
      reason: outcome === 'rejected' ? (decisionForm.value.reason || '').trim() : undefined,
      decidedBy: currentUser.value.name,
    })
    showP2Toast(outcome === 'approved' ? '✅ Application approved.' : '❌ Application rejected.')
    decisionForm.value.showReject = false
    decisionForm.value.reason = ''
    // Sync local app state so isRejected (§11) and page header reflect the new state.
    // P2 store also updates its own app record, but the local `application` ref is the
    // source of truth for the page header badge + isRejected guard.
    if (outcome === 'rejected') {
      // Record current phase so Reopen can restore to it (see docs §11).
      application.value.previousPhase = application.value.currentPhase
      application.value.status = 'rejected'
    }
    application.value.subStatus = outcome === 'approved' ? 'Offer Pending' : 'Rejected'
    saveState()
    // On approval, auto-advance to P3 (Decision) and smooth-scroll to the P3 body.
    // KC: clicking Approve in P2 should land admin on the P3 Decision section
    // in one click, not two (no more separate 'Mark P2 Complete' step).
    // Reject path stays on P2 with no phase transition (status = 'rejected' above).
    if (outcome === 'approved') {
      advancePhase(3, 'P2 interview + decision approved — proceeding to P3 (Offering)')  // rev 3.0
      nextTick(() => {
        if (typeof document === 'undefined') return
        const el = document.getElementById('phase-body-3')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  } catch (e) {
    alert('Error recording decision: ' + e.message)
  }
}

function onMarkP2Complete() {
  if (!latestDecision.value) {
    alert('Record a decision (Approve or Reject) first.')
    return
  }
  if (!confirm('Mark P2 complete and move to Phase 3 (Offer)?')) return
  advancePhase(3, 'P2 Interview + Decision completed — proceeding to P3 (Offering)')  // rev 3.0
}

// ===== P2 helpers =====
function recLabel(rec) {
  if (rec === 'recommend') return '✅ Recommend'
  if (rec === 'maybe') return '🤔 Maybe'
  if (rec === 'not-recommend') return '❌ Not Recommend'
  return rec
}
function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ===== P3 (Offering) helpers =====
const p3store = useP3Store()
const p3gate = useP3Gate(() => id)
const p3Latest = computed(() => p3store.getLatest(id).value)
const p3NewFiles = ref([])   // queued, not yet sent
const p3Toast = ref('')
const showStudentFiles = ref(false)   // legacy initial; rev 2.4 rule overrides below — see docs §16.1.4
// rev 2.4: open the toggle by default when the Confirm Receipt action is actually enabled
// (status === 'proof_uploaded' AND studentFiles.length >= 1). Otherwise keep collapsed.
// Setting this once at mount-time mimics the rev 2.2 collapsed-by-default for non-actionable
// states, but exposes the confirm button for the state where the school needs to act.
const _initialStudentFilesOpen = (() => {
  const dep = p3Latest.value
  return !!(dep && dep.status === 'proof_uploaded' && (dep.studentFiles?.length || 0) >= 1)
})()
if (_initialStudentFilesOpen) showStudentFiles.value = true
// 🔬 DEV affordance (remove when student P3 page is built) — collapsed by default
// so the dev panel doesn't crowd the production "Confirm Receipt" button.
const showDevPanel = ref(false)
const showP5DevPanel = ref(false)   // §23 P5 dev stub (separate toggle from P3)
const showP5TravelDevPanel = ref(false)   // §24.5 P5 travel dev stub

// §24 P5 Travel Arrangements — reactive handle to the cross-portal travel plan
const travelstore = useTravelStore()
const travelPlan = ref(travelstore.getPlan(id))

// §24.4 — "Mark Travel Arranged" enabled when:
//   (a) Step 2 done (phase5VisaGrantedAt set, when visaRequested=true) — for non-visa path, no gate
//   (b) At least one part (student or school) has the required fields filled
const canMarkTravelArranged = computed(() => {
  if (application.value.visaRequested && !application.value.phase5VisaGrantedAt) return false
  return travelstore.hasMinimumViableData(travelPlan.value)
})

function onP5SaveSchoolTravelPart(partial) {
  travelstore.saveSchoolPart(id, partial)
  // refresh ref so UI re-renders with new submittedAt
  travelPlan.value = travelstore.getPlan(id)
  // also mirror to application.value so the in-app data is consistent
  application.value.phase5TravelPlan = { ...travelPlan.value }
  saveState()
  p3Toast.value = '✅ School pickup details saved.'
  setTimeout(() => { p3Toast.value = '' }, 3000)
}

// §24.5 — dev affordance: simulate student filled their travel info
function onP5DevSimulateStudentTravel() {
  const devBy = 'school-admin (dev sim)'
  travelstore.saveStudentPart(id, {
    flightNumber: 'CX251',
    arrivalAirport: 'LHR (London Heathrow)',
    arrivalDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    arrivalTime: '14:30',
    transferMode: 'self-taxi',
    taxiCompany: 'Addison Lee',
    taxiDriverName: 'Auto-Assigned Driver',
    taxiDriverPhone: '+44 7700 900000',
    taxiBookingRef: 'ADD-DEV-SIM',
    emergencyContactName: 'Parent / Guardian',
    emergencyContactPhone: '+852 9123 4567',
    notes: '🧪 Simulated by school admin (dev affordance per §24.5).',
  })
  // Stamp dev audit tag
  const plan = travelstore.getPlan(id)
  plan.studentPart.submittedBy = devBy
  travelstore.refresh(id)
  travelPlan.value = travelstore.getPlan(id)
  application.value.phase5TravelPlan = { ...travelPlan.value }
  saveState()
  p3Toast.value = '🧪 Simulated: student travel info filled (flight + taxi)'
  setTimeout(() => { p3Toast.value = '' }, 4000)
}

// §24 — refresh travel plan when application ref changes
watch(() => id, () => {
  travelstore.refresh(id)
  travelPlan.value = travelstore.getPlan(id)
}, { immediate: false })

function p3StatusLabel(status) {
  if (status === 'sent_to_student') return 'Sent to Student'
  if (status === 'proof_uploaded') return 'Proof Uploaded'
  if (status === 'confirmed') return 'Confirmed'
  return status
}

function onP3NewFiles(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return
  const valid = []
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is too large (max 5MB)`)
      continue
    }
    const reader = new FileReader()
    reader.onload = ((f) => () => {
      p3NewFiles.value.push({ name: f.name, dataUrl: reader.result })
    })(file)
    reader.readAsDataURL(file)
  }
  e.target.value = ''
}

function removeP3NewFile(index) {
  p3NewFiles.value.splice(index, 1)
}

function onP3AddFiles() {
  if (!p3Latest.value) {
    alert('Please send the deposit form first (use the Send button below)')
    return
  }
  if (!p3NewFiles.value.length) return
  const files = p3NewFiles.value.map(f => ({ name: f.name, dataUrl: f.dataUrl, uploadedAt: new Date().toISOString(), uploadedBy: 'school-admin' }))
  try {
    p3store.addSchoolFile(id, files[0]) // store adds one at a time; loop manually below
    for (let i = 1; i < files.length; i++) p3store.addSchoolFile(id, files[i])
    p3NewFiles.value = []
    p3Toast.value = `✅ ${files.length} document${files.length > 1 ? 's' : ''} added for student`
    setTimeout(() => { p3Toast.value = '' }, 3000)
  } catch (err) {
    alert(err.message)
  }
}

// onP3RemoveSentFile removed — sent files are read-only per docs §16.
// School cannot delete a file once it has been sent to the student.
// To "correct" a wrong file, send the corrected one via "Add to Student"
// (the original remains visible for audit).
// Store primitive p3store.removeSchoolFile() is kept dormant for future
// admin / correction flows; the UI does not expose it.

function onP3Send() {
  if (!p3NewFiles.value.length) {
    alert('Please upload at least one document first')
    return
  }
  const files = p3NewFiles.value.map(f => ({ name: f.name, dataUrl: f.dataUrl, uploadedAt: new Date().toISOString(), uploadedBy: 'school-admin' }))
  p3store.sendDepositForm(id, {}, files)  // bankInfo: {} — bank details live on the uploaded PDF
  p3NewFiles.value = []
  p3Toast.value = '✅ Deposit form sent to student'
  setTimeout(() => { p3Toast.value = '' }, 3000)
}

function onP3Confirm() {
  try {
    // No gate — school is the unilateral final authority. See docs §16.1.1 rev 2.
    // (The button is only rendered when status === 'proof_uploaded', so the call is always valid.)
    p3store.confirmDeposit(id)
    advancePhase(4, 'P3 deposit confirmed by school — proceeding to P4 (Admission Documents)')
    p3Toast.value = '✅ Deposit confirmed. P3 complete.'
    setTimeout(() => { p3Toast.value = '' }, 3000)
  } catch (e) {
    alert(e.message)
  }
}

// 🔬 DEV affordance — see docs §16.1.1 rev 2.1 (dev note)
// Fakes the student-side actions (deposit proof + 1 file + "ready" flag) in one click,
// so KC can exercise the school's P3→P4 confirm flow before the student page is built.
// All audit entries are stamped with `by: 'school-admin (dev sim)'` so they're trivial
// to filter / remove later. REMOVE THIS WHOLE HANDLER + UI PANEL when the student P3
// page (pages/student/applications/[id].vue) is wired up.
function onDevSimulateStudentResponse() {
  const devBy = 'school-admin (dev sim)'

  // 1. Make sure a deposit record exists. sendDepositForm needs `bankInfo: {}` is fine
  //    — bank details live on the uploaded PDF (per docs §16.1 design).
  if (!p3Latest.value) {
    p3store.sendDepositForm(id, {}, [], devBy)
  }

  // 2. Simulate student uploading the deposit proof (transitions status → 'proof_uploaded').
  //    1×1 transparent PNG base64 is enough — UI just renders the filename.
  const proofDataUrl =
    'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMABCBV1DPUM9c0NTPRMjAyMDQyMzAyOFEKuQrA0MjAyOFEKuQrAzMjAyOFEKuQrA0MjAyOFEKuQrA1MjAyOFEKuQrA2MjAyOFEKuQrA3MjAyOFEKuQrA4MjAyOFEKuQrA5MjAyOFEKuQrCGAZU1qgaXBsYWNlaG9sZGVyCnN0YXJ0eHJlZgozIDAgUgo1MCA1IFIKZW5kc3RyZWFtCmVuZG9iagoyIDAgb2JqCjw8L1R5cGUvUGFnZS9NZWRpYUJveFswIDAgMjEwIDU5NF0vUGFyZW50IDEgMCBSL1Jlc291cmNlczw8Pj4vQ29udGVudHMgNCAwIFI+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggNDcvRmlsdGVyL0ZsYXRlRGVjb2RlPj5zdHJlYW0KeJxjYGRgYGBiZDBiYDBgYAJCA0NTAwMTAGIANFBiAuQwYH0C8pmBhAaIBYPz/wXQHBuYGZgZmBgZWNlYGZhY2ZjZWNmZWNlY2VjZWNlY2VjZWNlY2VjZWNlY2VjZWNlY2VjZWNlY2VjZWNlY2VjZWNlAwB3UQz5CnVuZG9iagoxIDAgb2JqCjw8L1R5cGUvUGFnZS9Db3VudCAxL0tpZHNbMiAwIFJdPj4KZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDEgMCBSPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKMDAwMDAwMDIyMSAwMDAwMCBuIAowMDAwMDAwMzE4IDAwMDAwIG4gCjAwMDAwMDA0MDAgMDAwMDAgbiAKdHJhaWxlciA8PC9TaXplIDYvUm9vdCA1IDAgUj4+CnN0YXJ0eHJlZgoxMTMKJSVFT0YK'
  p3store.uploadDepositProof(
    id,
    { name: 'dev_simulated_proof_receipt.pdf', dataUrl: proofDataUrl },
    devBy
  )

  // 3. Simulate student sending 1 file back through "📤 Send Files to School".
  p3store.addStudentFile(
    id,
    {
      name: 'dev_simulated_signed_refund_agreement.pdf',
      dataUrl: proofDataUrl,    // same placeholder — UI just shows filename
      uploadedAt: new Date().toISOString(),
      uploadedBy: devBy
    },
    devBy
  )

  // 4. Simulate student clicking "✅ I've uploaded everything" — sets the advisory flag.
  p3store.markStudentReady(id, devBy)

  p3Toast.value = '🧪 Simulated: 1 proof + 1 student file + ready flag'
  setTimeout(() => { p3Toast.value = '' }, 4000)
}

// 🔬 §23 DEV affordance — see docs §23 (dev note)
// Fakes the student-side P5 Step 2 actions (upload visa granted PDF +
// click "I've been granted") in one click, so KC can exercise the school's
// Step 3 (Travel) → Step 4 (Arrival) flow before the student P5 page is built.
// All audit entries stamped with `by: 'school-admin (dev sim)'`. REMOVE THIS
// WHOLE HANDLER + UI PANEL when pages/student/applications/[id].vue P5 wires
// up the real student upload + confirm flow.
function onP5DevSimulateStudentStep2() {
  const devBy = 'school-admin (dev sim)'

  // 1. Simulate student uploading the visa granted PDF.
  //    Same placeholder PDF as the P3 dev sim — UI just shows the filename.
  const proofDataUrl =
    'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMABCBV1DPUM9c0NTPRMjAyMDQyMzAyOFEKuQrA0MjAyOFEKuQrAzMjAyOFEKuQrA0MjAyOFEKuQrA1MjAyOFEKuQrA2MjAyOFEKuQrA3MjAyOFEKuQrA4MjAyOFEKuQrA5MjAyOFEKuQrCGAZU1qgaXBsYWNlaG9sZGVyCnN0YXJ0eHJlZgozIDAgUgo1MCA1IFIKZW5kc3RyZWFtCmVuZG9iagoyIDAgb2JqCjw8L1R5cGUvUGFnZS9NZWRpYUJveFswIDAgMjEwIDU5NF0vUGFyZW50IDEgMCBSL1Jlc291cmNlczw8Pj4vQ29udGVudHMgNCAwIFI+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggNDcvRmlsdGVyL0ZsYXRlRGVjb2RlPj5zdHJlYW0KeJxjYGRgYGBiZDBiYDBgYAJCA0NTAwMTAGIANFBiAuQwYH0C8pmBhAaIBYPz/wXQHBuYGZgZmBgZWNlYGZhY2ZjZWNmZWNlY2VjZWNlY2VjZWNlY2VjZWNlY2VjZWNlY2VjZWNlY2VjZWNlY2VjZWNlAwB3UQz5CnVuZG9iagoxIDAgb2JqCjw8L1R5cGUvUGFnZS9Db3VudCAxL0tpZHNbMiAwIFJdPj4KZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDEgMCBSPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKMDAwMDAwMDAyMjEgMDAwMDAgbiAKMDAwMDAwMDAzMTggMDAwMDAgbiAKMDAwMDAwMDA0MDAgMDAwMDAgbiAKdHJhaWxlciA8PC9TaXplIDYvUm9vdCA1IDAgUj4+CnN0YXJ0eHJlZgoxMTMKJSVFT0YK'

  application.value.phase5VisaGrantedDocument = {
    name: 'dev_simulated_visa_grant.pdf',
    dataUrl: proofDataUrl,
    uploadedAt: new Date().toISOString(),
    uploadedBy: devBy
  }

  // 2. Simulate school confirming visa granted (this is what the school's
  //    "✅ Confirm Visa Granted" button does, per §18.2).
  application.value.phase5VisaGrantedAt = new Date().toISOString()
  application.value.subStatus = P5_SUB_STATUS.P5_VISA_GRANTED

  // 3. Mark phase 5 history "in progress" → first sub-step done (audit).
  const p5Hist = application.value.phaseHistory.find(p => p.phase === 5)
  if (p5Hist && p5Hist.status === 'Pending') {
    p5Hist.status = 'In Progress'
  }

  p3Toast.value = '🧪 Simulated: student uploaded visa PDF + school confirmed granted'
  setTimeout(() => { p3Toast.value = '' }, 4000)
  saveState()  // §23 — application.value mutated directly, persist to localStorage
}

function p3StatusClass(status) {
  if (status === 'confirmed') return 'status-pill-confirmed'
  if (status === 'proof_uploaded') return 'status-pill-pending'
  if (status === 'sent_to_student') return 'status-pill-change'
  return ''
}

// Phase Stack: reverse order, hide future phases
const visiblePhases = computed(() => {
  const cur = application.value.currentPhase
  return [...application.value.phaseHistory]
    .filter(p => p.phase <= cur)
    .reverse()  // latest at top
})

// Past phases the user has expanded
const expandedPhases = ref([])
function togglePhaseExpand(phase) {
  if (expandedPhases.value.includes(phase)) {
    expandedPhases.value = expandedPhases.value.filter(p => p !== phase)
  } else {
    expandedPhases.value = [...expandedPhases.value, phase]
  }
}
function onPhaseRowClick(ph) {
  // Current phase: no-op (no expand toggle; it's always shown)
  if (ph.phase === application.value.currentPhase) return
  const wasExpanded = expandedPhases.value.includes(ph.phase)
  togglePhaseExpand(ph.phase)
  // After expanding (not collapsing), scroll the phase body into view
  if (!wasExpanded) {
    nextTick(() => {
      if (typeof document === 'undefined') return
      const el = document.getElementById('phase-body-' + ph.phase)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}

// P1 Student Information — school correction flow
// P1 student info is a frozen snapshot captured at application submission.
// If the student later updates their profile, this snapshot does NOT change.
// School can correct it here for data-entry mistakes; old values are not retained.
const editingStudentInfo = ref(false)
const studentInfoDraft = ref({})
const STUDENT_INFO_FIELDS = ['studentName', 'studentDob', 'studentNationality', 'guardianName', 'studentEmail', 'studentPhone']

function openEditStudentInfo() {
  const draft = {}
  for (const k of STUDENT_INFO_FIELDS) draft[k] = application.value[k]
  studentInfoDraft.value = draft
  editingStudentInfo.value = true
}

function cancelEditStudentInfo() {
  editingStudentInfo.value = false
  studentInfoDraft.value = {}
}

function saveEditStudentInfo() {
  if (!confirm('Overwrite P1 Student Information?\n\nThe existing values will be permanently replaced. The previous values cannot be recovered.\n\nProceed?')) return
  for (const k of STUDENT_INFO_FIELDS) {
    application.value[k] = studentInfoDraft.value[k]
  }
  saveState()
  editingStudentInfo.value = false
  studentInfoDraft.value = {}
}

// Filter attachments by phase number
function getPhaseAttachments(phaseNum) {
  if (!application.value.attachments) return []
  return application.value.attachments.filter(a => a.phase === phaseNum)
}

// RESTART: full reset to Phase 1 (fresh application) + clear all P2 store data + clear localStorage
// This makes the click-through demo work cleanly: after Restart, the user can advance P1 → P7
// without any pre-populated interviews/reports/decisions. See docs/admission-pipeline-v2.md §14.
// rev 2.5: Restart now uses an in-page Vue modal (no window.confirm) — see docs §14.1.
// Why: window.confirm() is unreliable on iOS Safari and embedded WebViews (silently dismissed,
// returns false). The actual reset logic below is unchanged from §14 — only the confirmation UX.
const showRestartModal = ref(false)
const restarting = ref(false)

function requestRestart() {
  // Re-entry guard: if the modal is already open, ignore the second click. See docs §14.1 (mm).
  if (showRestartModal.value) return
  showRestartModal.value = true
}

function cancelRestart() {
  // Disallow cancel while the action is actually running (synchronous in practice, but defensive).
  if (restarting.value) return
  showRestartModal.value = false
}

function confirmRestart() {
  restarting.value = true
  try {
    // 1. Clear the P2 store (interviews, reports, decisions) and persist empty arrays
    if (typeof window !== 'undefined') {
      try { p2.clearAllData() } catch (e) {}
    }
    // 1b. Clear the P3 store (deposits) and persist empty array — see docs §16
    if (typeof window !== 'undefined') {
      try { p3store.clearForApp(id) } catch (e) {}
    }
    // 2. Clear the page's own localStorage for this application
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem(STORAGE_KEY.value) } catch (e) {}
    }
    // 3. Always reset to defaultMock (Phase 1, fresh) — regardless of which mock was loaded.
    //    This lets the user click through all phases from the start.
    application.value = clone(defaultMock)
    expandedPhases.value = []  // Collapse any expanded past phases
    p3NewFiles.value = []      // Reset P3 transient UI ref (queued files) — see docs §16
    saveState()  // Persist fresh state so reload stays at Phase 1
  } finally {
    showRestartModal.value = false
    restarting.value = false
  }
  nextTick(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

// Escape closes the modal (= Cancel). See docs §14.1 (ll).
function onRestartKeydown(e) {
  if (e.key === 'Escape' && showRestartModal.value && !restarting.value) {
    e.preventDefault()
    cancelRestart()
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onRestartKeydown)
}
// Note: this handler is registered once per page mount. Nuxt's [id].vue is mounted per route, so
// in practice the same page re-mounts (with a fresh handler) when the user navigates to a different
// application. The old handler becomes unreachable and gets GC'd with the page. No manual cleanup
// is needed for the click-through demo (single-page flow per visit).

// (expandedPhase/togglePhase removed — Phase History is gone)

// ===== Dev-only testing shortcuts (spec §21, rev 3.2) =====
// These helpers are only triggered via the .dev-tools-panel, which is hidden in production.

function markPhaseComplete(phaseNum, notes) {
  const ph = application.value.phaseHistory.find(p => p.phase === phaseNum)
  if (ph) {
    ph.status = 'Completed'
    ph.date = ph.date || todayDate()
    ph.notes = ph.notes || notes
  }
}

function devAdvanceToP2() {
  application.value.currentPhase = 2
  application.value.subStatus = 'Interview & Assessment'
  saveState()
}

function devAdvanceToP3() {
  markPhaseComplete(2, 'Dev: auto-approved')
  application.value.currentPhase = 3
  application.value.subStatus = 'Offering'
  saveState()
}

function devAdvanceToP4() {
  // Mock P3 deposit record so P3 store / p3gate unlocks downstream
  try {
    const depositsKey = 'bsp-v4-deposits'
    const deposits = JSON.parse(localStorage.getItem(depositsKey) || '[]')
    deposits.push({
      id: 'dep-dev-' + Date.now(),
      applicationRef: id,
      status: 'confirmed',
      amount: 5000,
      currency: 'GBP',
      bankInfo: { accountName: 'Dev', sortCode: '00-00-00', accountNumber: '00000000', reference: 'DEV' },
      schoolFiles: [],
      studentFiles: [],
      proofFile: { id: 'pf-dev', fileName: 'dev_proof.pdf', fileSize: '0.1 MB' },
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
    })
    localStorage.setItem(depositsKey, JSON.stringify(deposits))
  } catch (e) {
    console.warn('[dev tools] could not seed deposit:', e)
  }
  markPhaseComplete(3, 'Dev: deposit auto-confirmed')
  application.value.currentPhase = 4
  application.value.subStatus = 'Admission Documents'
  saveState()
}

function devAdvanceToP5() {
  markPhaseComplete(4, 'Dev: documents auto-ready')
  application.value.currentPhase = 5
  application.value.subStatus = 'Pre-Departure'
  saveState()
}

function devJumpToP6() {
  // Sets every P5 sub-step flag to "complete" then triggers the existing confirmArrival handler
  if (application.value.visaRequested) {
    application.value.phase5VisaGrantedAt = application.value.phase5VisaGrantedAt || new Date().toISOString()
    application.value.phase5VisaGrantedDocument = application.value.phase5VisaGrantedDocument || {
      id: 'vg-dev-' + Date.now(),
      fileName: 'dev_visa_granted.pdf',
      fileSize: '0.1 MB',
      fileType: 'application/pdf',
    }
  }
  application.value.subStatus = 'Travel Arranged' // P5_SUB_STATUS.P5_TRAVEL_ARRANGED
  saveState()
  // confirmArrival advances currentPhase 5 -> 6 (uses advancePhase internally)
  confirmArrival()
}

function devRestart() {
  if (typeof window !== 'undefined' && window.confirm('Reset this application to P1? (clears localStorage)')) {
    try {
      const deposits = JSON.parse(localStorage.getItem('bsp-v4-deposits') || '[]')
      const filtered = deposits.filter(d => d.applicationRef !== id)
      localStorage.setItem('bsp-v4-deposits', JSON.stringify(filtered))
      localStorage.removeItem('bsp:school:app:' + id)
    } catch (e) {
      console.warn('[dev tools] restart cleanup failed:', e)
    }
    window.location.reload()
  }
}
</script>

<style scoped>
.main-content { flex: 1; padding: 2rem; }

/* Compact Application Summary (replaces full info cards) */
.summary-card { padding: 0.85rem 1.25rem !important; }

/* Clickable links (email/phone) inside student info card */
.info-value a {
  color: #2563eb;
  text-decoration: none;
  border-bottom: 1px dotted #93c5fd;
  transition: all 0.15s;
}
.info-value a:hover {
  color: #1d4ed8;
  border-bottom-color: #1d4ed8;
}

/* Phase Stack: latest at top, past phases collapsed at bottom */
.phase-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.phase-item {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.15s;
}
.phase-current {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.15);
}
.phase-past {
  opacity: 0.92;
}
.phase-row {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 18px;
  transition: background 0.15s;
}
.phase-row-clickable {
  cursor: pointer;
}
.phase-row-clickable:hover {
  background: #f1f5f9;
}
.phase-row-clickable:hover .phase-chevron {
  color: #3b82f6;
}
.phase-row-clickable:focus-visible {
  background: #e0e7ff;
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}
.phase-row-expanded {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.phase-num-badge {
  align-items: center;
  background: #1e293b;
  border-radius: 6px;
  color: #fff;
  display: inline-flex;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 3px 8px;
}
.phase-current .phase-num-badge {
  background: #3b82f6;
}
.phase-title {
  color: #1e293b;
  flex: 1;
  font-size: 0.95rem;
  font-weight: 700;
  min-width: 180px;
}
.phase-status-badge {
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 3px 10px;
  text-transform: uppercase;
}
.phase-status-badge.status-completed,
.phase-status-badge.status-completed {
  background: #dcfce7;
  color: #15803d;
}
.phase-status-badge.status-in-progress,
.phase-status-badge.status-active {
  background: #dbeafe;
  color: #1d4ed8;
}
.phase-status-badge.status-pending {
  background: #f1f5f9;
  color: #94a3b8;
}
.phase-date-inline {
  color: #64748b;
  font-size: 0.78rem;
}
.phase-chevron {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-left: auto;
}
.phase-body {
  padding: 16px 18px 20px;
}
.phase-subsection {
  border-top: 1px solid #f1f5f9;
  margin-top: 14px;
  padding-top: 14px;
}
.phase-subsection:first-child {
  border-top: none;
  margin-top: 0;
  padding-top: 0;
}
.phase-subsection h4 {
  color: #1e293b;
  font-size: 0.9rem;
  margin: 0 0 12px;
}
.phase-notes-text {
  background: #f8fafc;
  border-left: 3px solid #cbd5e1;
  border-radius: 0 6px 6px 0;
  color: #475569;
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
  padding: 10px 14px;
}
.phase-attachments {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.phase-empty-state {
  color: #888;
  font-size: 14px;
  font-style: italic;
  padding: 8px 0;
  margin: 0;
}
.att-row {
  align-items: center;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;        /* rev 2.3: allow button to wrap on narrow viewports */
  gap: 10px;
  padding: 8px 12px;
}
.att-icon {
  font-size: 1.1rem;
}
.att-info {
  flex: 1;
  min-width: 0;
}
.att-name {
  color: #1e293b;
  font-size: 0.85rem;
  font-weight: 600;
}
.att-meta {
  color: #94a3b8;
  font-size: 0.72rem;
}
@media (max-width: 768px) {
  .phase-row { gap: 8px; padding: 12px 14px; }
  .phase-title { font-size: 0.88rem; min-width: 120px; }
  .phase-body { padding: 12px 14px 16px; }
  .phase-date-inline { display: none; }
  /* rev 2.3: stack Confirm Receipt block on mobile so button doesn't overflow viewport */
  .p3-confirm-receipt-block .att-row { flex-direction: column; align-items: stretch; gap: 8px; }
  .p3-confirm-receipt-block .att-row .att-info { width: 100%; }
  .p3-confirm-receipt-block .att-row .btn-approve { width: 100%; }
  .p3-confirm-receipt-block .p3-gate-hint,
  .p3-confirm-receipt-block .p3-gate-ready { min-width: 0; }
}
.summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem 2rem;
  align-items: center;
}
.summary-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 90px;
}
.summary-label {
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.summary-value {
  color: #1e293b;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}
@media (max-width: 768px) {
  .summary-row { gap: 0.75rem 1.25rem; }
  .summary-item { min-width: 70px; }
  .summary-value { font-size: 0.8rem; }
}

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

/* rev 2.5: Restart confirmation modal — see docs §14.1. */
.restart-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  animation: restart-fade-in 0.15s ease-out;
}
.restart-modal {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  max-width: 440px;
  width: 100%;
  padding: 24px;
  animation: restart-pop-in 0.18s ease-out;
}
.restart-modal h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #0f172a;
}
.restart-modal-warning {
  background: #fef3c7;
  border-left: 3px solid #f59e0b;
  border-radius: 6px;
  color: #92400e;
  font-size: 0.85rem;
  margin: 0 0 14px;
  padding: 8px 12px;
}
.restart-modal-intro {
  color: #475569;
  font-size: 0.9rem;
  margin: 0 0 6px;
}
.restart-modal-list {
  background: #f8fafc;
  border-radius: 8px;
  color: #1e293b;
  font-size: 0.88rem;
  list-style: disc inside;
  margin: 0 0 18px;
  padding: 10px 14px;
}
.restart-modal-list li {
  margin: 4px 0;
}
.restart-modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.btn-restart-cancel,
.btn-restart-confirm {
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
  min-height: 40px;
  min-width: 100px;
  padding: 8px 18px;
  transition: all 0.15s;
}
.btn-restart-cancel {
  background: #fff;
  border: 2px solid #cbd5e1;
  color: #475569;
}
.btn-restart-cancel:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
}
.btn-restart-confirm {
  background: #dc2626;
  border: 2px solid #dc2626;
  color: #fff;
}
.btn-restart-confirm:hover:not(:disabled) {
  background: #b91c1c;
  border-color: #b91c1c;
  transform: translateY(-1px);
}
.btn-restart-cancel:disabled,
.btn-restart-confirm:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
@media (max-width: 480px) {
  .restart-modal {
    padding: 18px;
  }
  .restart-modal h3 {
    font-size: 1.05rem;
  }
  .restart-modal-actions {
    flex-direction: column-reverse;  /* Confirm on top on mobile (primary action) */
  }
  .btn-restart-cancel,
  .btn-restart-confirm {
    width: 100%;
  }
}
@keyframes restart-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes restart-pop-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
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

/* Interview display (P2) */
.interview-display { margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem; }
.interview-status-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.status-pill { display: inline-block; padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.status-pill-pending { background: #fef3c7; color: #92400e; }
.status-pill-confirmed { background: #dcfce7; color: #15803d; }
.status-pill-change { background: #fee2e2; color: #b91c1c; }
.student-change-box { background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; padding: 0.75rem; font-size: 0.85rem; color: #7c2d12; }
.student-change-box p { margin: 0.35rem 0 0; }
.interview-details { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
.detail-row { display: flex; gap: 0.75rem; align-items: baseline; font-size: 0.85rem; }
.detail-row-block { flex-direction: column; align-items: stretch; gap: 0.25rem; }
.detail-label { color: #64748b; font-weight: 500; min-width: 110px; }
.detail-value { color: #1e293b; font-weight: 600; }
.detail-value a { color: #3b82f6; text-decoration: none; word-break: break-all; }
.detail-value a:hover { text-decoration: underline; }

/* Interview form (P2) */
.interview-form { margin-top: 0.75rem; background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.85rem; }
.form-title { font-size: 0.95rem; font-weight: 700; color: #1e293b; }
.form-row { display: flex; flex-direction: column; gap: 0.3rem; }
.form-row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.form-label { font-size: 0.75rem; font-weight: 600; color: #475569; }
.form-input { padding: 0.5rem 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; font-family: inherit; background: #fff; color: #1e293b; }
.form-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
.radio-group { display: flex; gap: 1rem; flex-wrap: wrap; padding-top: 0.2rem; }
.radio-option { display: flex; align-items: center; gap: 0.35rem; font-size: 0.85rem; color: #1e293b; cursor: pointer; }
.form-actions { display: flex; gap: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #e2e8f0; }

/* Student Info editor (P1 school correction) */
.subsection-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  gap: 12px;
}
.subsection-header h4 { margin: 0; }
.btn-edit-info {
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #475569;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-edit-info:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #1e293b;
}
.edit-form {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}
.edit-form-intro {
  color: #475569;
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0 0 14px;
  padding: 8px 12px;
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
}
.edit-form-intro strong { color: #1e40af; }
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
.form-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.form-item label {
  color: #475569;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.form-item input {
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #1e293b;
  font-family: inherit;
  font-size: 0.9rem;
  padding: 8px 10px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.form-item input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  outline: none;
}
.form-warning {
  color: #b45309;
  font-size: 0.75rem;
  line-height: 1.5;
  margin: 14px 0 0;
  padding: 8px 12px;
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  border-radius: 4px;
}
.edit-form .form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 14px;
}

/* ===================== P2 (Interview + Decision) ===================== */
.p2-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.p2-status-header {
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  padding-bottom: 4px;
}
.p2-toast {
  background: #ecfdf5;
  border: 1px solid #10b981;
  border-radius: 8px;
  color: #047857;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 12px;
}

/* ===== P3 Offering styles ===== — rev 3.0 */
.status-pill-p3-sent_to_student { background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.status-pill-p3-proof_uploaded { background: #fef3c7; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.status-pill-p3-confirmed { background: #d1fae5; color: #065f46; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.p3-container { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
.p3-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 1rem; margin-top: 0.75rem; }
.p3-section-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.75rem; color: #1e293b; }
.p3-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; }
.p3-proof-display { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; flex-wrap: wrap; }
.p3-file-attached { display: inline-block; padding: 0.25rem 0.5rem; background: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 0.8rem; margin-left: 0.5rem; }
.p3-confirmed-banner { margin-top: 0.75rem; padding: 0.75rem 1rem; background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 6px; color: #065f46; font-weight: 600; }
.p3-locked-banner { margin-top: 0.75rem; padding: 0.75rem 1rem; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; color: #92400e; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
.p3-files-list { display: flex; flex-direction: column; gap: 0.5rem; margin: 0.75rem 0; }
.p3-toggle-btn { display: flex; align-items: center; gap: 0.5rem; width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.65rem 0.85rem; cursor: pointer; font: inherit; text-align: left; transition: background 120ms ease, border-color 120ms ease; }
.p3-toggle-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
.p3-toggle-btn-active { background: #eff6ff; border-color: #93c5fd; }
.p3-toggle-btn-has-files { border-left: 4px solid #10b981; }
.p3-toggle-icon { font-size: 0.85rem; color: #64748b; width: 1rem; text-align: center; }
.p3-toggle-label { font-weight: 600; color: #1e293b; font-size: 0.95rem; }
.p3-toggle-count { margin-left: auto; background: #e2e8f0; color: #475569; border-radius: 999px; padding: 0.15rem 0.55rem; font-size: 0.8rem; font-weight: 600; }
.p3-toggle-btn-has-files .p3-toggle-count { background: #d1fae5; color: #065f46; }
.p3-toggle-btn-active .p3-toggle-count { background: #dbeafe; color: #1e40af; }
.p3-toggle-body { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed #e2e8f0; }
.p3-toggle-ready-mark { background: #d1fae5; color: #065f46; border-radius: 999px; padding: 0.15rem 0.55rem; font-size: 0.9rem; font-weight: 700; margin-left: 0.25rem; }
.p3-gate-hint { margin-top: 0.65rem; padding: 0.5rem 0.75rem; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; color: #92400e; font-size: 0.85rem; line-height: 1.4; }
.p3-gate-ready { margin-top: 0.65rem; padding: 0.5rem 0.75rem; background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 6px; color: #065f46; font-size: 0.85rem; font-weight: 600; line-height: 1.4; }
.btn-approve:disabled { background: #cbd5e1; border-color: #94a3b8; color: #475569; cursor: not-allowed; opacity: 0.7; }
.btn-approve:disabled:hover { background: #cbd5e1; }
.p3-ready-banner { margin-top: 0.75rem; padding: 0.75rem 1rem; background: #eff6ff; border: 1px solid #93c5fd; border-radius: 6px; color: #1e40af; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.p3-ready-banner-secondary { background: transparent; color: #1e40af; border: 1px solid #93c5fd; padding: 0.25rem 0.65rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer; font-weight: 500; }
.p3-ready-banner-secondary:hover { background: #dbeafe; }
.p3-file-row { display: grid; grid-template-columns: auto 1fr auto auto; gap: 0.75rem; align-items: center; padding: 0.5rem 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
.p3-file-row-pending { background: #fffbeb; border-color: #fcd34d; }
.p3-file-icon { font-size: 1rem; }
.p3-file-name { color: #1e40af; text-decoration: none; font-weight: 500; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.p3-file-name:hover { text-decoration: underline; }
.p3-file-meta { color: #64748b; font-size: 0.75rem; }
.p3-file-remove { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 1rem; padding: 0 0.25rem; line-height: 1; }
.p3-file-remove:hover { color: #b91c1c; }
.p3-add-file-row { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem; flex-wrap: wrap; }
.p3-add-file-row input[type="file"] { flex: 1; min-width: 200px; font-size: 0.85rem; }
.p3-empty { color: #64748b; font-size: 0.85rem; font-style: italic; margin: 0.5rem 0; }

/* §22 P4 File Upload (school side) — mirrors P3 styling */
.p4-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 1rem; margin-top: 0.75rem; }
.p4-section-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.75rem; color: #1e293b; }
.p4-docs-list { display: flex; flex-direction: column; gap: 0.5rem; margin: 0.75rem 0; }
.p4-doc-row { display: grid; grid-template-columns: auto 1fr auto auto; gap: 0.75rem; align-items: center; padding: 0.5rem 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
.p4-doc-row-pending { background: #fffbeb; border-color: #fcd34d; }
.p4-doc-icon { font-size: 1rem; }
.p4-doc-name { color: #2563eb; text-decoration: none; word-break: break-all; }
.p4-doc-row-pending .p4-doc-name { color: #92400e; }
.p4-doc-meta { font-size: 0.75rem; color: #64748b; }
.p4-doc-remove { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 1rem; padding: 0 0.25rem; line-height: 1; }
.p4-doc-remove:hover { color: #b91c1c; }
.p4-add-file-row { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem; flex-wrap: wrap; }
.p4-add-file-row input[type="file"] { flex: 1; min-width: 200px; font-size: 0.85rem; }
.p4-empty { color: #64748b; font-size: 0.85rem; font-style: italic; margin: 0.5rem 0; }
.p4-mark-ready-row { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed #cbd5e1; }

.p2-next-action {
  align-items: flex-start;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #93c5fd;
  border-left: 4px solid #2563eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
}
.p2-next-action-label {
  color: #1d4ed8;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.p2-next-action-title {
  color: #1e3a8a;
  font-size: 1.05rem;
  font-weight: 700;
}
.p2-next-action-subtitle {
  color: #1e40af;
  font-size: 0.85rem;
  line-height: 1.4;
}
.p2-section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
}
.p2-section-manager {
  border-color: #fbbf24;
  box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.2);
}
.p2-section-title {
  align-items: center;
  color: #1e293b;
  display: flex;
  flex-wrap: wrap;
  font-size: 0.95rem;
  font-weight: 700;
  gap: 8px;
  margin: 0;
}
.p2-section-subtitle {
  color: #1e293b;
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0;
}
.p2-round-badge {
  background: #1e293b;
  border-radius: 999px;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 10px;
}
.p2-role-tag {
  background: #e0e7ff;
  border-radius: 6px;
  color: #3730a3;
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-left: 6px;
  padding: 2px 6px;
  text-transform: uppercase;
  vertical-align: middle;
}
.p2-role-consultant {
  background: #fce7f3;
  color: #9d174d;
}
.p2-role-school {
  background: #dbeafe;
  color: #1d4ed8;
}
.p2-empty {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.85rem;
  font-style: italic;
  margin: 0;
  padding: 10px 12px;
  text-align: center;
}
.p2-section-collapsed {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.p2-section-collapsed .action-desc {
  margin-bottom: 0;
}
.star-rating {
  align-items: center;
  display: flex;
  gap: 4px;
}
.star {
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  font-size: 1.6rem;
  line-height: 1;
  padding: 0;
  transition: color 0.15s, transform 0.1s;
}
.star:hover {
  transform: scale(1.1);
}
.star-active {
  color: #f59e0b;
}
.star-rating-label {
  color: #475569;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 8px;
}
.char-counter {
  color: #94a3b8;
  font-size: 0.7rem;
  margin-top: 2px;
  text-align: right;
}
.char-counter-warn {
  color: #b91c1c;
  font-weight: 600;
}
.rec-badge {
  border-radius: 6px;
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
}
.rec-recommend {
  background: #dcfce7;
  color: #15803d;
}
.rec-maybe {
  background: #fef3c7;
  color: #92400e;
}
.rec-not-recommend {
  background: #fee2e2;
  color: #b91c1c;
}
.p2-report-form {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  padding: 14px;
}
.p2-report-summary {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
  padding: 14px;
}
.p2-report-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.p2-awaiting {
  background: #fff7ed;
  border: 1px solid #fdba74;
  border-radius: 8px;
  margin-top: 8px;
  padding: 12px;
}
.p2-awaiting .action-desc {
  margin: 0;
}
.p2-past-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}
.p2-past-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
}
.p2-past-header {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}
.p2-past-report {
  border-top: 1px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
  padding-top: 8px;
}
.p2-reports-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.p2-report-row {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
}
.p2-report-row-head {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.detail-label-inline {
  color: #64748b;
  font-size: 0.75rem;
}
.p2-report-row-notes {
  background: #f8fafc;
  border-left: 3px solid #cbd5e1;
  border-radius: 0 6px 6px 0;
  color: #475569;
  font-size: 0.8rem;
  font-style: italic;
  margin-top: 4px;
  padding: 6px 10px;
}
.p2-decision-form,
.p2-decision-summary {
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
  padding-top: 12px;
}
.p2-reject-form {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}
.p2-decision-card {
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  padding: 10px 14px;
  text-align: center;
}
.p2-decision-approved {
  background: #dcfce7;
  border: 1px solid #86efac;
  color: #15803d;
}
.p2-decision-rejected {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
}
.p2-mark-complete {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  padding: 12px;
}
.p2-mark-complete .btn-primary:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.7;
}
@media (max-width: 640px) {
  .p2-section { padding: 12px; }
  .p2-status-header { flex-direction: column; }
  .p2-section .action-buttons,
  .p2-section .form-actions {
    flex-direction: column;
  }
  .p2-section .action-buttons button,
  .p2-section .form-actions button,
  .p2-section .btn-primary,
  .p2-section .btn-secondary,
  .p2-section .btn-approve,
  .p2-section .btn-reject,
  .p2-mark-complete .btn-primary {
    width: 100%;
  }
  .star { font-size: 2rem; }
}

/* 🔬 DEV affordance — see docs §16.1.1 (dev note). Remove with handler when student P3 page is built. */
.p3-dev-section {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px dashed #cbd5e1;
}
.p3-dev-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.p3-dev-toggle:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}
.p3-dev-toggle-open {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #78350f;
}
.p3-dev-toggle-icon {
  font-size: 0.7rem;
  display: inline-block;
  width: 1rem;
  text-align: center;
}
.p3-dev-panel {
  margin-top: 0.75rem;
  padding: 0.9rem 1rem;
  background: #fef3c7;
  border: 2px dashed #f59e0b;
  border-radius: 8px;
}
.p3-dev-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #78350f;
  margin-bottom: 0.4rem;
  letter-spacing: 0.02em;
}
.p3-dev-note {
  font-size: 0.82rem;
  color: #78350f;
  line-height: 1.45;
  margin: 0 0 0.6rem 0;
}
.p3-dev-note:last-child {
  margin-bottom: 0;
}
.p3-dev-note code {
  background: rgba(120, 53, 15, 0.1);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 0.78rem;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
}
.btn-dev {
  background: #f59e0b;
  color: #fff;
  border: none;
  padding: 0.55rem 1.1rem;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-dev:hover { background: #d97706; }
.btn-dev:active { background: #b45309; }

/* §23 P5 Dev Stub (school side) — mirrors P3 dev panel styling */
.p5-dev-section {
  margin: 0.75rem 0;
}
.p5-dev-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px dashed #f59e0b;
  border-radius: 6px;
  padding: 0.4rem 0.7rem;
  font-size: 0.82rem;
  color: #92400e;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
  text-align: left;
}
.p5-dev-toggle:hover { background: #fef3c7; }
.p5-dev-toggle-open { background: #fef3c7; }
.p5-dev-toggle-icon { font-size: 0.7rem; }
.p5-dev-panel {
  margin-top: 0.75rem;
  padding: 0.9rem 1rem;
  background: #fef3c7;
  border: 2px dashed #f59e0b;
  border-radius: 8px;
}
.p5-dev-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #78350f;
  margin-bottom: 0.4rem;
  letter-spacing: 0.02em;
}
.p5-dev-note {
  font-size: 0.82rem;
  color: #78350f;
  line-height: 1.45;
  margin: 0 0 0.6rem 0;
}
.p5-dev-note:last-child {
  margin-bottom: 0;
}
.p5-dev-note code {
  background: rgba(120, 53, 15, 0.1);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 0.78rem;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
}

/* §17 Document Templates Checklist (P3/P4/P5) */
.doc-templates-section {
  margin: 1rem 0;
  padding: 0.75rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
}
.doc-templates-section .subsection-header {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #0369a1;
}
.doc-templates-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.doc-template-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #475569;
}
.doc-template-icon {
  font-size: 1rem;
}
.doc-template-name {
  font-weight: 500;
  color: #1e293b;
}
.doc-template-category {
  margin-left: auto;
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: capitalize;
}

/* §18 P5 Conditional Sub-Steps */
.p5-substeps {
  margin: 1.25rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.p5-substep {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fafafa;
  transition: all 0.2s ease;
}
.p5-substep-active {
  border-color: #3b82f6;
  background: #eff6ff;
}
.p5-substep-done {
  border-color: #22c55e;
  background: #f0fdf4;
}
.p5-substep-icon {
  font-size: 1.4rem;
  line-height: 1;
  padding-top: 0.1rem;
}
.p5-substep-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  color: #1e293b;
}
.p5-substep-content p {
  margin: 0 0 0.5rem 0;
  font-size: 0.82rem;
  color: #64748b;
}
.p5-visa-confirmed {
  color: #15803d !important;
  font-weight: 600;
}

/* §18.4 rev 3.2 — Disabled sub-step UX */
.p5-substep-locked {
  opacity: 0.7;
}
.p5-substep-locked .btn-primary:disabled,
.p5-substep-locked .btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-disabled-locked {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-disabled-locked:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.p5-lock-hint {
  color: #888;
  font-size: 13px;
  font-style: italic;
  margin: 4px 0 8px 0;
}

/* §21 rev 3.2 — Dev Affordance panel */
.dev-tools-panel {
  position: fixed;
  bottom: 16px;
  right: 16px;
  background: rgba(20, 20, 20, 0.92);
  color: #fff;
  padding: 12px 14px;
  border-radius: 8px;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
  z-index: 9999;
  max-width: 280px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}
.dev-tools-header {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 11px;
  opacity: 0.7;
}
.dev-tools-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dev-tools-actions button {
  background: #333;
  color: #fff;
  border: 1px solid #555;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  text-align: left;
}
.dev-tools-actions button:hover {
  background: #444;
}
.dev-tools-primary {
  background: #2563eb !important;
  border-color: #2563eb !important;
}
</style>