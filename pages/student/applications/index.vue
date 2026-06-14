<template>
  <div class="applications-page">
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
            <li><NuxtLink to="/student/applications" class="active">My Applications</NuxtLink></li>
            <li><NuxtLink to="/student/login" class="btn btn-primary">Logout</NuxtLink></li>
          </ul>
        </nav>
      </div>
    </header>

    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <h1>📭 My Applications</h1>
        <p>Track and manage your school applications</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container main-content">

      <!-- Tabs -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="tab-count" :class="'count-' + tab.key">{{ tabCount(tab.key) }}</span>
        </button>
      </div>

      <!-- Applications List -->
      <div v-if="filteredApplications.length > 0" class="applications-list">
        <div
          v-for="app in filteredApplications"
          :key="app.id"
          class="application-card"
          @click="openApplication(app)"
        >
          <div class="card-school-image">
            <img :src="app.schoolPhoto" :alt="app.schoolName" />
          </div>
          <div class="card-content">
            <div class="card-header">
              <h3 class="school-name">{{ app.schoolName }}</h3>
              <span class="status-badge" :class="'status-' + app.statusKey">
                {{ app.status }}
              </span>
            </div>
            <p class="school-location">📍 {{ app.schoolLocation }}</p>
            <div class="card-details">
              <div class="detail-item">
                <span class="detail-label">Submitted</span>
                <span class="detail-value">{{ app.submittedDate }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Intake</span>
                <span class="detail-value">{{ app.intake }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Programme</span>
                <span class="detail-value">{{ app.programme }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Consultant</span>
                <span class="detail-value">{{ app.consultant || '—' }}</span>
              </div>
            </div>

            <!-- Activity Summary -->
            <div class="activity-summary">
              <span v-if="app.unreadMessages" class="unread-badge">
                💬 {{ app.unreadMessages }} new message(s)
              </span>
              <span v-if="app.pendingDocuments" class="pending-badge">
                📋 {{ app.pendingDocuments }} document(s) requested
              </span>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn btn-primary" @click.stop="openApplication(app)">
              Open
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No applications found</h3>
        <p v-if="activeTab === 'all'">You haven't submitted any applications yet.</p>
        <p v-else>No applications with status "{{ tabs.find(t => t.key === activeTab)?.label }}".</p>
        <NuxtLink to="/schools" class="btn btn-primary">Browse Schools</NuxtLink>
      </div>

    </div>

    <!-- Application Detail Modal -->
    <div v-if="selectedApp" class="modal-overlay" @click.self="closeApplication">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-school-info">
            <img :src="selectedApp.schoolPhoto" :alt="selectedApp.schoolName" class="modal-school-img" />
            <div>
              <h2>{{ selectedApp.schoolName }}</h2>
              <p>{{ selectedApp.schoolLocation }}</p>
              <span class="status-badge" :class="'status-' + selectedApp.statusKey">
                {{ selectedApp.status }}
              </span>
            </div>
          </div>
          <button class="modal-close" @click="closeApplication">×</button>
        </div>

        <!-- Application Info -->
        <div class="modal-section">
          <h3>Application Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Application ID</span>
              <span class="info-value">{{ selectedApp.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Submitted</span>
              <span class="info-value">{{ selectedApp.submittedDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Intake</span>
              <span class="info-value">{{ selectedApp.intake }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Programme</span>
              <span class="info-value">{{ selectedApp.programme }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Consultant</span>
              <span class="info-value">{{ selectedApp.consultant || 'No consultant linked' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Last Updated</span>
              <span class="info-value">{{ selectedApp.lastUpdate }}</span>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="modal-section">
          <h3>Application Timeline</h3>
          <div class="timeline">
            <div
              v-for="(event, index) in selectedApp.timeline"
              :key="index"
              class="timeline-item"
              :class="{ active: index === 0 }"
            >
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-date">{{ event.date }}</span>
                <span class="timeline-title">{{ event.title }}</span>
                <span class="timeline-desc">{{ event.desc }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- School Requirements -->
        <div class="modal-section">
          <h3>School Requirements</h3>
          <div class="requirements-list">
            <div
              v-for="req in selectedApp.requirements"
              :key="req.id"
              class="requirement-item"
              :class="{ completed: req.completed, pending: !req.completed }"
            >
              <div class="req-status">
                <span v-if="req.completed">✅</span>
                <span v-else>⏳</span>
              </div>
              <div class="req-content">
                <span class="req-title">{{ req.title }}</span>
                <span class="req-desc">{{ req.desc }}</span>
                <span v-if="req.deadline" class="req-deadline">Due: {{ req.deadline }}</span>
              </div>
              <div class="req-action">
                <button
                  v-if="!req.completed"
                  class="btn btn-sm btn-primary"
                  @click="completeRequirement(req)"
                >
                  Mark Complete
                </button>
                <span v-else class="completed-text">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Messages / Communication -->
        <div class="modal-section">
          <h3>💬 Communication</h3>

          <!-- Tabs for different types -->
          <div class="comm-tabs">
            <button
              v-for="ct in commTabs"
              :key="ct.key"
              class="comm-tab-btn"
              :class="{ active: commTab === ct.key }"
              @click="commTab = ct.key"
            >
              {{ ct.label }}
            </button>
          </div>

          <!-- Message Thread -->
          <div class="message-list">
            <div
              v-for="msg in filteredMessages"
              :key="msg.id"
              class="message-item"
              :class="'from-' + msg.from"
            >
              <div class="message-header">
                <span class="message-from">
                  {{ msg.from === 'student' ? 'You' : msg.from === 'school' ? selectedApp.schoolName : 'Consultant' }}
                </span>
                <span class="message-time">{{ msg.time }}</span>
              </div>
              <div class="message-body">{{ msg.text }}</div>
              <div v-if="msg.attachment" class="message-attachment">
                📎 {{ msg.attachment }}
              </div>
            </div>
          </div>

          <!-- Reply Box -->
          <div class="message-compose">
            <textarea
              v-model="newMessage"
              placeholder="Type your message..."
              rows="2"
            ></textarea>
            <div class="compose-actions">
              <input type="file" ref="msgAttachment" @change="handleAttachment" style="display:none" />
              <button class="btn btn-sm btn-outline" @click="$refs.msgAttachment.click()">
                📎 Attach
              </button>
              <button
                class="btn btn-primary"
                :disabled="!newMessage.trim()"
                @click="sendMessage"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <!-- Document Requests -->
        <div class="modal-section">
          <h3>📋 Document Requests</h3>
          <div v-if="selectedApp.documentRequests && selectedApp.documentRequests.length > 0" class="doc-requests">
            <div
              v-for="doc in selectedApp.documentRequests"
              :key="doc.id"
              class="doc-request-item"
              :class="{ submitted: doc.submitted }"
            >
              <div class="doc-req-info">
                <span class="doc-req-name">{{ doc.name }}</span>
                <span class="doc-req-status">
                  {{ doc.submitted ? '✅ Submitted' : '⏳ Requested by school' }}
                </span>
                <span v-if="doc.deadline" class="doc-req-deadline">
                  Deadline: {{ doc.deadline }}
                </span>
              </div>
              <div class="doc-req-action">
                <input
                  type="file"
                  :ref="'doc-' + doc.id"
                  @change="uploadDoc(doc, $event)"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style="display:none"
                />
                <button
                  v-if="!doc.submitted"
                  class="btn btn-sm btn-primary"
                  @click="$refs['doc-' + doc.id][0].click()"
                >
                  Upload
                </button>
                <span v-else class="submitted-text">Uploaded</span>
              </div>
            </div>
          </div>
          <p v-else class="no-items">No document requests at this time.</p>
        </div>

        <!-- School Response Section -->
        <div class="modal-section">
          <h3>🏫 School Response</h3>
          <div v-if="selectedApp.schoolNotes && selectedApp.schoolNotes.length > 0" class="school-notes">
            <div
              v-for="note in selectedApp.schoolNotes"
              :key="note.id"
              class="school-note-item"
            >
              <span class="note-date">{{ note.date }}</span>
              <span class="note-text">{{ note.text }}</span>
            </div>
          </div>
          <p v-else class="no-items">No notes from school yet.</p>
        </div>

      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer-content">
        <div>
          <h4>British School Portal</h4>
          <p>Helping families find the right UK school since 2024.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><NuxtLink to="/schools">Find Schools</NuxtLink></li>
            <li><NuxtLink to="/student/login">Student Login</NuxtLink></li>
            <li><NuxtLink to="/student/register">Register</NuxtLink></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>Email: info@britishschoolportal.co.uk</li>
          </ul>
        </div>
      </div>
      <div class="container footer-bottom">
        <p>&copy; 2024 British School Portal. All rights reserved.</p>
      </div>
    </footer>

  </div>
</template>

<script setup>

definePageMeta({ layout: false })

const activeTab = ref('all')
const selectedApp = ref(null)
const commTab = ref('all')
const newMessage = ref('')

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'review', label: 'Under Review' },
  { key: 'offer', label: 'Offer' },
  { key: 'rejected', label: 'Rejected' }
]

const commTabs = [
  { key: 'all', label: 'All' },
  { key: 'school', label: 'School' },
  { key: 'consultant', label: 'Consultant' }
]

const mockApplications = ref([
  {
    id: 'APP-2024-001',
    schoolName: "St. Mary's College",
    schoolLocation: 'London, United Kingdom',
    status: 'Under Review',
    statusKey: 'review',
    submittedDate: '15 Mar 2024',
    lastUpdate: '2 hours ago',
    intake: 'Sep 2024',
    programme: 'Year 10',
    consultant: 'Education First Ltd',
    schoolPhoto: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80',
    unreadMessages: 1,
    pendingDocuments: 1,
    timeline: [
      { date: '15 Mar 2024', title: 'Application Submitted', desc: 'Your application has been received' },
      { date: '18 Mar 2024', title: 'Documents Verified', desc: 'School verified your submitted documents' },
      { date: '22 Mar 2024', title: 'Under Review', desc: 'Admissions team is reviewing your application' }
    ],
    requirements: [
      { id: 1, title: 'Complete Online Assessment', desc: 'Mathematics and English assessment', deadline: '25 Mar 2024', completed: true },
      { id: 2, title: 'Submit Reference Letter', desc: 'From your current school principal', deadline: '20 Mar 2024', completed: false },
      { id: 3, title: 'Interview Scheduled', desc: 'Virtual interview with admissions', deadline: '28 Mar 2024', completed: false }
    ],
    messages: [
      { id: 1, from: 'school', time: '2 hours ago', text: 'We have received your application and would like to request additional documents.', attachment: null },
      { id: 2, from: 'student', time: '1 hour ago', text: 'Thank you for the update. I will upload the documents shortly.', attachment: null }
    ],
    documentRequests: [
      { id: 1, name: 'Birth Certificate', deadline: '28 Mar 2024', submitted: false },
      { id: 2, name: 'Passport Copy', deadline: '28 Mar 2024', submitted: true }
    ],
    schoolNotes: [
      { id: 1, date: '22 Mar 2024', text: 'Application looks promising. Student has strong academic background.' }
    ]
  },
  {
    id: 'APP-2024-002',
    schoolName: 'Greenwich Academy',
    schoolLocation: 'London, United Kingdom',
    status: 'Offer',
    statusKey: 'offer',
    submittedDate: '28 Feb 2024',
    lastUpdate: '1 day ago',
    intake: 'Sep 2024',
    programme: 'Year 12',
    consultant: null,
    schoolPhoto: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
    unreadMessages: 0,
    pendingDocuments: 0,
    timeline: [
      { date: '28 Feb 2024', title: 'Application Submitted', desc: 'Your application has been received' },
      { date: '05 Mar 2024', title: 'Interview Completed', desc: 'Virtual interview completed successfully' },
      { date: '10 Mar 2024', title: 'Offer Extended', desc: 'Congratulations! Offer letter sent to your email' }
    ],
    requirements: [
      { id: 1, title: 'Accept Offer', desc: 'Accept offer before deadline', deadline: '30 Apr 2024', completed: false },
      { id: 2, title: 'Pay Deposit', desc: 'Pay enrollment deposit £5,000', deadline: '15 Apr 2024', completed: false }
    ],
    messages: [
      { id: 1, from: 'school', time: '10 Mar 2024', text: 'Congratulations! We are pleased to offer you a place at Greenwich Academy.', attachment: 'Offer_Letter_2024.pdf' }
    ],
    documentRequests: [],
    schoolNotes: [
      { id: 1, date: '10 Mar 2024', text: 'Excellent interview performance. Strong candidate for our Year 12 programme.' }
    ]
  },
  {
    id: 'APP-2024-003',
    schoolName: 'Kingsfield School',
    schoolLocation: 'Birmingham, United Kingdom',
    status: 'Pending',
    statusKey: 'pending',
    submittedDate: '20 Apr 2024',
    lastUpdate: '20 Apr 2024',
    intake: 'Jan 2025',
    programme: 'Year 9',
    consultant: 'Global Study Consultancy',
    schoolPhoto: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&q=80',
    unreadMessages: 0,
    pendingDocuments: 0,
    timeline: [
      { date: '20 Apr 2024', title: 'Application Submitted', desc: 'Your application has been received' },
      { date: '21 Apr 2024', title: 'Awaiting Review', desc: 'Application is in queue for review' }
    ],
    requirements: [
      { id: 1, title: 'Submit UKVI IELTS', desc: 'UKVI approved IELTS for visa purposes', deadline: '15 May 2024', completed: false }
    ],
    messages: [],
    documentRequests: [
      { id: 1, name: 'UKVI IELTS Certificate', deadline: '15 May 2024', submitted: false }
    ],
    schoolNotes: []
  }
])

const statusMap = {
  'all': ['Pending', 'Under Review', 'Offer', 'Rejected'],
  'pending': ['Pending'],
  'review': ['Under Review'],
  'offer': ['Offer'],
  'rejected': ['Rejected']
}

const filteredApplications = computed(() => {
  if (activeTab.value === 'all') return mockApplications.value
  const statuses = statusMap[activeTab.value] || []
  return mockApplications.value.filter(app => statuses.includes(app.status))
})

const filteredMessages = computed(() => {
  if (!selectedApp.value) return []
  const messages = selectedApp.value.messages || []
  if (commTab.value === 'all') return messages
  return messages.filter(m => m.from === commTab.value)
})

function tabCount(key) {
  if (key === 'all') return mockApplications.value.length
  const statuses = statusMap[key] || []
  return mockApplications.value.filter(app => statuses.includes(app.status)).length
}

function openApplication(app) {
  navigateTo(`/student/applications/${app.id}`)
}

function closeApplication() {
  selectedApp.value = null
  document.body.style.overflow = ''
}

function completeRequirement(req) {
  req.completed = true
}

function sendMessage() {
  if (!newMessage.value.trim() || !selectedApp.value) return

  selectedApp.value.messages.push({
    id: selectedApp.value.messages.length + 1,
    from: 'student',
    time: 'Just now',
    text: newMessage.value.trim(),
    attachment: null
  })

  newMessage.value = ''
}

function handleAttachment(event) {
  // Handle attachment upload
  console.log('Attachment selected:', event.target.files[0])
}

function uploadDoc(doc, event) {
  if (event.target.files.length > 0) {
    doc.submitted = true
  }
}
</script>

<style scoped>
.applications-page { min-height: 100vh; display: flex; flex-direction: column; }

/* Page Header */
.page-header {
  background: linear-gradient(to right, #f8fafc, #fff);
  padding: 2rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.page-header h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
.page-header p { margin: 0.25rem 0 0 0; color: #64748b; }

/* Main Content */
.main-content { flex: 1; padding: 2rem 0; }

/* Tabs */
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
  overflow-x: auto;
}

.tab-btn {
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
  border-radius: 0.5rem 0.5rem 0 0;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover { background: #f1f5f9; color: #3b82f6; }
.tab-btn.active {
  color: #3b82f6;
  border-bottom: 3px solid #3b82f6;
  margin-bottom: -2px;
}

.tab-count {
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
}

.count-pending .tab-count { background: #fef3c7; color: #d97706; }
.count-review .tab-count { background: #dbeafe; color: #2563eb; }
.count-offer .tab-count { background: #d1fae5; color: #059669; }
.count-rejected .tab-count { background: #fee2e2; color: #dc2626; }

/* Application Cards */
.applications-list { display: flex; flex-direction: column; gap: 1.25rem; }

.application-card {
  display: flex;
  gap: 1.25rem;
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.application-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #3b82f6;
}

.card-school-image {
  width: 100px;
  height: 100px;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
}

.card-school-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content { flex: 1; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.school-name { margin: 0; font-size: 1.1rem; color: #1e293b; }

.school-location {
  margin: 0 0 0.75rem 0;
  color: #64748b;
  font-size: 0.9rem;
}

.card-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.detail-item { display: flex; flex-direction: column; gap: 0.15rem; }
.detail-label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
.detail-value { font-size: 0.9rem; color: #1e293b; font-weight: 500; }

.activity-summary {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.unread-badge, .pending-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.unread-badge { background: #dbeafe; color: #2563eb; }
.pending-badge { background: #fef3c7; color: #d97706; }

.card-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* Status Badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pending { background: #fef3c7; color: #d97706; }
.status-review { background: #dbeafe; color: #2563eb; }
.status-offer { background: #d1fae5; color: #059669; }
.status-rejected { background: #fee2e2; color: #dc2626; }

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #f8fafc;
  border-radius: 0.75rem;
}

.empty-icon { font-size: 4rem; margin-bottom: 1rem; }
.empty-state h3 { margin: 0 0 0.5rem 0; color: #1e293b; }
.empty-state p { margin: 0 0 1.5rem 0; color: #64748b; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: #fff;
  border-radius: 1rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
}

.modal-school-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.modal-school-img {
  width: 60px;
  height: 60px;
  border-radius: 0.5rem;
  object-fit: cover;
}

.modal-school-info h2 { margin: 0 0 0.25rem 0; font-size: 1.25rem; }
.modal-school-info p { margin: 0 0 0.5rem 0; color: #64748b; font-size: 0.9rem; }

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  line-height: 1;
}

.modal-close:hover { background: #e2e8f0; }

/* Modal Sections */
.modal-section {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #1e293b;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.info-item { display: flex; flex-direction: column; gap: 0.25rem; }
.info-label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
.info-value { font-size: 0.95rem; color: #1e293b; }

/* Timeline */
.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item {
  position: relative;
  padding-bottom: 1.25rem;
}

.timeline-item:last-child { padding-bottom: 0; }

.timeline-dot {
  position: absolute;
  left: -1.5rem;
  top: 0.25rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e2e8f0;
  border: 2px solid #fff;
}

.timeline-item.active .timeline-dot { background: #3b82f6; }

.timeline-content { display: flex; flex-direction: column; gap: 0.15rem; }
.timeline-date { font-size: 0.75rem; color: #94a3b8; }
.timeline-title { font-weight: 600; color: #1e293b; font-size: 0.95rem; }
.timeline-desc { font-size: 0.85rem; color: #64748b; }

/* Requirements */
.requirements-list { display: flex; flex-direction: column; gap: 0.75rem; }

.requirement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.requirement-item.completed { background: #f0fdf4; border-color: #bbf7d0; }
.requirement-item.pending { background: #fffbeb; border-color: #fef3c7; }

.req-status { font-size: 1.25rem; }
.req-content { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
.req-title { font-weight: 600; color: #1e293b; }
.req-desc { font-size: 0.85rem; color: #64748b; }
.req-deadline { font-size: 0.8rem; color: #d97706; }

/* Communication */
.comm-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.comm-tab-btn {
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
}

.comm-tab-btn.active { background: #3b82f6; color: white; }

.message-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.message-item {
  max-width: 80%;
  padding: 0.875rem;
  border-radius: 0.75rem;
}

.message-item.from-student {
  background: #3b82f6;
  color: white;
  margin-left: auto;
  border-bottom-right-radius: 0;
}

.message-item.from-school, .message-item.from-consultant {
  background: #f1f5f9;
  color: #1e293b;
  border-bottom-left-radius: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
  font-size: 0.8rem;
}

.message-from { font-weight: 600; }
.message-time { opacity: 0.7; }
.message-body { font-size: 0.95rem; line-height: 1.4; }
.message-attachment {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(255,255,255,0.2);
  border-radius: 0.35rem;
  font-size: 0.85rem;
}

.message-compose {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message-compose textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  resize: none;
  font-size: 0.95rem;
}

.compose-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Document Requests */
.doc-requests { display: flex; flex-direction: column; gap: 0.75rem; }

.doc-request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.doc-request-item.submitted { background: #f0fdf4; border-color: #bbf7d0; }

.doc-req-info { display: flex; flex-direction: column; gap: 0.25rem; }
.doc-req-name { font-weight: 600; color: #1e293b; }
.doc-req-status { font-size: 0.85rem; color: #64748b; }
.doc-req-deadline { font-size: 0.8rem; color: #d97706; }

/* School Notes */
.school-notes { display: flex; flex-direction: column; gap: 0.75rem; }

.school-note-item {
  padding: 1rem;
  background: #f0fdf4;
  border-radius: 0.5rem;
  border-left: 3px solid #10b981;
}

.note-date { font-size: 0.75rem; color: #10b981; font-weight: 600; }
.note-text { font-size: 0.95rem; color: #1e293b; margin-top: 0.25rem; display: block; }

.no-items { color: #94a3b8; font-size: 0.9rem; font-style: italic; }

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.9rem;
}

.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }
.btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
.btn-outline { background: transparent; border: 1px solid #3b82f6; color: #3b82f6; }
.btn-outline:hover { background: #eff6ff; }

/* Navbar */
.navbar {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}

.logo-img { height: 50px; width: auto; border-radius: 4px; }

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-links a.active { color: #3b82f6; font-weight: 600; }
.nav-links .btn-primary {
  background: #3B82F6;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

/* Footer */
.footer {
  background: #1e293b;
  color: white;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  padding: 3rem 1rem;
}

.footer h4 { margin: 0 0 0.75rem 0; }
.footer p { color: rgba(255,255,255,0.7); margin: 0; }
.footer ul { list-style: none; padding: 0; margin: 0; }
.footer li { margin: 0.4rem 0; }
.footer a { color: rgba(255,255,255,0.7); text-decoration: none; }
.footer a:hover { color: white; }

.footer-bottom {
  text-align: center;
  padding: 1.5rem 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .application-card { flex-direction: column; }
  .card-school-image { width: 100%; height: 150px; }
  .card-actions { width: 100%; }
  .card-actions .btn { width: 100%; }
  .modal-content { max-height: 95vh; }
  .info-grid { grid-template-columns: repeat(2, 1fr); }
  .nav-links { gap: 1rem; }
  .message-item { max-width: 95%; }
}
</style>
