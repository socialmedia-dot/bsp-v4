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
          <button v-if="!isRejected" class="btn-restart" @click="restartApplication" title="Reset this application to Phase 1">
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
                      <span class="info-label">Visa Required</span>
                      <span class="info-value">{{ application.visaRequired ? 'Yes' : 'No' }}</span>
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

              <!-- Attachments for this phase -->
              <div v-if="getPhaseAttachments(ph.phase).length" class="phase-subsection">
                <h4>📎 Attachments</h4>
                <div class="phase-attachments">
                  <div v-for="att in getPhaseAttachments(ph.phase)" :key="att.id" class="att-row">
                    <span class="att-icon">📄</span>
                    <div class="att-info">
                      <div class="att-name">{{ att.fileName }}</div>
                      <div class="att-meta">{{ att.fileSize }} · {{ att.uploadedByRole }} · {{ formatDate(att.createdAt) }}</div>
                    </div>
                  </div>
                </div>
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
                          <label class="form-label">Date</label>
                          <input type="date" v-model="scheduleForm.date" class="form-input">
                        </div>
                        <div>
                          <label class="form-label">Time</label>
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
                          <div class="detail-row"><span class="detail-label">🕐 Time</span><span class="detail-value">{{ latestInterview.time }}</span></div>
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
                            <span class="detail-label-inline">📅 {{ iv.date }} · {{ iv.time }}</span>
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

                <div v-if="ph.phase === 3" class="action-section">
                  <div v-if="!isRejected">
                    <div class="action-title">Decision</div>
                    <div class="action-desc">Make final admission decision</div>
                    <div class="action-buttons">
                      <button class="btn-approve" @click="makeOffer">🎓 Make Offer</button>
                      <button class="btn-reject" @click="rejectApplication">❌ Reject</button>
                    </div>
                  </div>
                </div>

                <div v-if="ph.phase === 4" class="action-section">
                  <div v-if="!isRejected">
                    <div class="action-title">Offer & Acceptance</div>
                    <div class="action-desc">Send offer letter and track acceptance</div>
                    <div class="action-buttons">
                      <button class="btn-primary" @click="uploadOfferLetter">📄 Upload Offer Letter</button>
                      <button class="btn-secondary" @click="markDepositReceived">💰 Mark Deposit Received</button>
                    </div>
                  </div>
                </div>

                <div v-if="ph.phase === 5" class="action-section">
                  <div v-if="!isRejected">
                    <div class="action-title">Admission Documents</div>
                    <div class="action-desc">Prepare and upload admission documents</div>
                    <div class="action-buttons">
                      <button class="btn-primary" @click="uploadAdmissionDocs">📁 Upload Documents</button>
                      <button class="btn-secondary" @click="markReady">✅ Mark Documents Ready</button>
                    </div>
                  </div>
                </div>

                <div v-if="ph.phase === 6" class="action-section">
                  <div v-if="!isRejected">
                    <div class="action-title">Visa & Travel</div>
                    <div class="action-desc">Track visa progress and travel arrangements</div>
                    <div class="action-buttons">
                      <button class="btn-primary" @click="updateVisaStatus">🛂 Update Visa Status</button>
                      <button class="btn-secondary" @click="confirmTravel">✈️ Confirm Travel Arranged</button>
                    </div>
                  </div>
                </div>

                <div v-if="ph.phase === 7" class="action-section">
                  <div v-if="!isRejected">
                    <div class="action-title">Enrolled</div>
                    <div class="action-desc">Student has successfully enrolled</div>
                    <div class="action-buttons">
                      <button class="btn-secondary" @click="viewStudentRecord">📋 View Student Record</button>
                    </div>
                  </div>
                </div>

                <div v-if="!isRejected" class="action-section divider">
                  <div class="action-title">Consultant Assignment</div>
                  <div class="action-desc">Assign or change consultant for this application</div>
                  <div class="action-buttons">
                    <button class="btn-secondary" @click="assignConsultant">
                      {{ application.consultantName ? '👤 Change Consultant' : '👤 Assign Consultant' }}
                    </button>
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
  visaRequired: true,
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
    { phase: 3, label: 'Decision', status: 'Pending', date: null, notes: '', attachments: [] },
    { phase: 4, label: 'Offer & Acceptance', status: 'Pending', date: null, notes: '', attachments: [] },
    { phase: 5, label: 'Admission Documents', status: 'Pending', date: null, notes: '', attachments: [] },
    { phase: 6, label: 'Visa & Travel', status: 'Pending', date: null, notes: '', attachments: [] },
    { phase: 7, label: 'Enrolled', status: 'Pending', date: null, notes: '', attachments: [] },
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
  if (newPhase === 7) {
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
  if (!confirm('Mark this interview as complete?\n\nThis will advance the application to Phase 3 (Decision).')) return
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

function uploadAssessment() {
  alert('After the student confirms the interview, you can mark it as complete (which uploads the assessment and advances to Phase 3).')
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
    showP2Toast(`Round #${iv.roundNumber} scheduled for ${iv.date} ${iv.time}.`)
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
      subtitle: 'Review the decision summary below and click "Mark P2 Complete" to proceed to Phase 3 (Offer).',
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
      advancePhase(3, 'P2 interview + decision approved — proceeding to P3 (Decision)')
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
  advancePhase(3, 'P2 Interview + Decision completed — proceeding to P3 (Offer)')
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
function restartApplication() {
  if (!confirm('Restart this application?\n\nThis will:\n- Reset to Phase 1 (fresh application)\n- Clear all P2 interviews, reports, and decisions\n- Clear localStorage for the page and P2 store\n- Collapse all expanded past phases\n\nProceed?')) return
  // 1. Clear the P2 store (interviews, reports, decisions) and persist empty arrays
  if (typeof window !== 'undefined') {
    try { p2.clearAllData() } catch (e) {}
  }
  // 2. Clear the page's own localStorage for this application
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(STORAGE_KEY.value) } catch (e) {}
  }
  // 3. Always reset to defaultMock (Phase 1, fresh) — regardless of which mock was loaded.
  //    This lets the user click through all phases from the start.
  application.value = clone(defaultMock)
  expandedPhases.value = []  // Collapse any expanded past phases
  saveState()  // Persist fresh state so reload stays at Phase 1
  nextTick(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

// (expandedPhase/togglePhase removed — Phase History is gone)
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
.att-row {
  align-items: center;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
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
</style>