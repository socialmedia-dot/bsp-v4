<template>
  <div class="bsp-dashboard">
    <div class="dashboard-body">
      <!-- Left Sidebar Navigation -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">User Categories</div>
            <NuxtLink to="/BSP/users/personal" class="nav-item">
              <span class="nav-icon">👤</span>
              <span>Personal</span>
              <span class="nav-count">12</span>
            </NuxtLink>
            <NuxtLink to="/BSP/users/school" class="nav-item">
              <span class="nav-icon">🏫</span>
              <span>School</span>
              <span class="nav-count">24</span>
            </NuxtLink>
            <NuxtLink to="/BSP/users/consultant" class="nav-item">
              <span class="nav-icon">💼</span>
              <span>Consultant</span>
              <span class="nav-count">8</span>
            </NuxtLink>
            <NuxtLink to="/BSP/users/bspstaff" class="nav-item">
              <span class="nav-icon">👔</span>
              <span>BSP Staff</span>
              <span class="nav-count">3</span>
            </NuxtLink>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Management</div>
            <NuxtLink to="/BSP/dashboard" class="nav-item">
              <span class="nav-icon">📊</span>
              <span>Overview</span>
            </NuxtLink>
            <NuxtLink to="/BSP/new-account-applications" class="nav-item active">
              <span class="nav-icon">📋</span>
              <span>New Account Applications</span>
            </NuxtLink>
            <NuxtLink to="/BSP/payments" class="nav-item">
              <span class="nav-icon">💳</span>
              <span>Payments</span>
            </NuxtLink>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Settings</div>
            <NuxtLink to="/BSP/settings/fees" class="nav-item">
              <span class="nav-icon">💰</span>
              <span>Annual Fee</span>
            </NuxtLink>
            <NuxtLink to="/BSP/settings/website" class="nav-item">
              <span class="nav-icon">🌐</span>
              <span>Website Settings</span>
            </NuxtLink>
            <NuxtLink to="/BSP/settings/staff" class="nav-item">
              <span class="nav-icon">👔</span>
              <span>Staff</span>
            </NuxtLink>
          </div>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Page Header -->
        <div class="page-header">
          <div class="page-title-area">
            <h1 class="page-title">📋 New Account Applications</h1>
            <p class="page-subtitle">Review and approve new account requests</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" @click="exportApplications">
              📥 Export CSV
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar">
          <button class="tab-btn" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">
            Pending <span class="tab-count">{{ pendingApplications.length }}</span>
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'approved' }" @click="activeTab = 'approved'">
            Approved <span class="tab-count approved">{{ approvedApplications.length }}</span>
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'rejected' }" @click="activeTab = 'rejected'">
            Rejected <span class="tab-count rejected">{{ rejectedApplications.length }}</span>
          </button>
        </div>

        <!-- Filters -->
        <div class="filter-bar" v-if="activeTab !== 'deleted'">
          <div class="filter-left">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input 
                v-model="searchQuery" 
                type="text" 
                class="search-input" 
                placeholder="Search by name, email, or company..."
                @input="onSearchInput"
              />
              <button v-if="searchQuery" class="search-clear" @click="clearSearch">×</button>
            </div>
            <select v-model="filterType" class="filter-select">
              <option value="all">All Types</option>
              <option value="School">School</option>
              <option value="Consultant">Consultant</option>
              <option value="Business">Business</option>
            </select>
          </div>
          <div class="filter-right">
            <span class="result-count">{{ filteredApplications.length }} applications</span>
          </div>
        </div>

        <!-- Applications Table -->
        <div class="users-table-wrapper" v-if="activeTab === 'pending'">
          <table class="users-table">
            <thead>
              <tr>
                <th class="th-user">Applicant</th>
                <th class="th-company">Type</th>
                <th class="th-live">Company / Organisation</th>
                <th class="th-partnered">Submitted Date</th>
                <th class="th-completed">Status</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in paginatedApplications" :key="app.id" class="user-row">
                <td class="td-user">
                  <div class="user-info-cell">
                    <div class="user-details">
                      <span class="consultant-name">{{ app.name }}</span>
                      <span class="user-email">{{ app.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="td-type">
                  <span class="type-badge" :class="'type-' + app.type.toLowerCase()">
                    {{ app.type }}
                  </span>
                </td>
                <td class="td-company">
                  <NuxtLink :to="getUserDetailLink(app)" class="company-link">
                    {{ app.company }}
                  </NuxtLink>
                </td>
                <td class="td-deletedat">
                  {{ app.submittedDate }}
                </td>
                <td class="td-status">
                  <span class="status-badge status-pending">Pending</span>
                </td>
                <td class="td-actions">
                  <div class="action-buttons">
                    <button class="btn-action btn-view" @click="viewApplication(app.id)" title="View Details">
                      👁️
                    </button>
                    <button class="btn-action btn-approve" @click="approveApplication(app.id)" title="Approve">
                      ✅
                    </button>
                    <button class="btn-action btn-reject" @click="rejectApplication(app.id)" title="Reject">
                      ❌
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedApplications.length === 0">
                <td colspan="6" class="empty-state">
                  <div class="empty-content">
                    <span class="empty-icon">📋</span>
                    <p>No pending applications</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Approved Table -->
        <div class="users-table-wrapper" v-if="activeTab === 'approved'">
          <table class="users-table">
            <thead>
              <tr>
                <th class="th-user">Applicant</th>
                <th class="th-company">Type</th>
                <th class="th-live">Company / Organisation</th>
                <th class="th-partnered">Submitted Date</th>
                <th class="th-completed">Approved Date</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in paginatedApplications" :key="app.id" class="user-row">
                <td class="td-user">
                  <div class="user-info-cell">
                    <div class="user-details">
                      <span class="consultant-name">{{ app.name }}</span>
                      <span class="user-email">{{ app.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="td-type">
                  <span class="type-badge" :class="'type-' + app.type.toLowerCase()">
                    {{ app.type }}
                  </span>
                </td>
                <td class="td-company">
                  <NuxtLink :to="getUserDetailLink(app)" class="company-link">
                    {{ app.company }}
                  </NuxtLink>
                </td>
                <td class="td-deletedat">{{ app.submittedDate }}</td>
                <td class="td-deletedat">{{ app.approvedDate }}</td>
                <td class="td-actions">
                  <div class="action-buttons">
                    <span class="status-badge status-approved">Approved</span>
                    <button class="btn-action btn-view" @click="viewApplication(app.id)" title="View Details">
                      👁️
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedApplications.length === 0">
                <td colspan="7" class="empty-state">
                  <div class="empty-content">
                    <span class="empty-icon">✅</span>
                    <p>No approved applications</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Rejected Table -->
        <div class="users-table-wrapper" v-if="activeTab === 'rejected'">
          <table class="users-table">
            <thead>
              <tr>
                <th class="th-user">Applicant</th>
                <th class="th-company">Type</th>
                <th class="th-live">Company / Organisation</th>
                <th class="th-partnered">Submitted Date</th>
                <th class="th-completed">Rejected Date</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in paginatedApplications" :key="app.id" class="user-row deleted-row">
                <td class="td-user">
                  <div class="user-info-cell">
                    <div class="user-details">
                      <span class="consultant-name">{{ app.name }}</span>
                      <span class="user-email">{{ app.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="td-type">
                  <span class="type-badge" :class="'type-' + app.type.toLowerCase()">
                    {{ app.type }}
                  </span>
                </td>
                <td class="td-company">
                  <NuxtLink :to="getUserDetailLink(app)" class="company-link">
                    {{ app.company }}
                  </NuxtLink>
                </td>
                <td class="td-deletedat">{{ app.submittedDate }}</td>
                <td class="td-deletedat">{{ app.rejectedDate }}</td>
                <td class="td-status">
                  <span class="status-badge status-rejected">Rejected</span>
                </td>
                <td class="td-actions">
                  <div class="action-buttons">
                    <button class="btn-action btn-view" @click="viewApplication(app.id)" title="View Details">
                      👁️
                    </button>
                    <button class="btn-action btn-approve" @click="acceptApplication(app.id)" title="Accept">
                      ✅
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedApplications.length === 0">
                <td colspan="6" class="empty-state">
                  <div class="empty-content">
                    <span class="empty-icon">❌</span>
                    <p>No rejected applications</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <span class="pagination-info">
            Showing {{ paginationStart }}–{{ paginationEnd }} of {{ filteredApplications.length }} applications
          </span>
          <div class="pagination-controls">
            <button 
              class="btn-page" 
              :disabled="currentPage === 1" 
              @click="currentPage--"
            >← Previous</button>
            
            <button 
              v-for="page in visiblePages" 
              :key="page" 
              class="btn-page" 
              :class="{ active: page === currentPage }"
              @click="currentPage = page"
            >{{ page }}</button>
            
            <button 
              class="btn-page" 
              :disabled="currentPage === totalPages" 
              @click="currentPage++"
            >Next →</button>
          </div>
        </div>
      </main>
    </div>

    <!-- Right Side Detail Panel -->
    <div v-if="showPanel" class="detail-panel-overlay" @click.self="closePanel">
      <div class="detail-panel">
        <div class="panel-header">
          <h2 class="panel-title">Application Details</h2>
          <button class="panel-close" @click="closePanel">×</button>
        </div>
        <div v-if="selectedApplication" class="panel-body">
          <div class="panel-section">
            <h3 class="section-title">Applicant Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Applicant ID</span>
                <span class="info-value">APP-{{ String(selectedApplication.id).padStart(5, '0') }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Account Type</span>
                <span class="info-value">
                  <span class="type-badge" :class="'type-' + selectedApplication.type.toLowerCase()">
                    {{ selectedApplication.type }}
                  </span>
                </span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">Full Name</span>
                <span class="info-value">{{ selectedApplication.name }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">Email Address</span>
                <span class="info-value">{{ selectedApplication.email }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">Company / Organisation</span>
                <span class="info-value">{{ selectedApplication.company }}</span>
              </div>
              <div class="info-item" v-if="selectedApplication.phone">
                <span class="info-label">Phone</span>
                <span class="info-value">{{ selectedApplication.phone }}</span>
              </div>
              <div class="info-item" v-if="selectedApplication.location">
                <span class="info-label">Location</span>
                <span class="info-value">{{ selectedApplication.location }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">Submitted Date</span>
                <span class="info-value">{{ selectedApplication.submittedDate }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">Current Status</span>
                <span class="info-value">
                  <span class="status-badge" :class="'status-' + selectedApplication.status">
                    {{ selectedApplication.status }}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div v-if="selectedApplication.type === 'School'" class="panel-section">
            <h3 class="section-title">School Information</h3>
            <div class="info-grid">
              <div class="info-item full-width">
                <span class="info-label">School Name</span>
                <span class="info-value">{{ selectedApplication.schoolName || 'N/A' }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">Your Role</span>
                <span class="info-value">{{ selectedApplication.schoolRole || 'N/A' }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">Document</span>
                <span class="info-value">
                  <span class="status-badge status-approved">📎 Uploaded</span>
                </span>
              </div>
            </div>
          </div>
          <div v-if="selectedApplication.type !== 'School'" class="panel-section">
            <h3 class="section-title">Role Information</h3>
            <div class="info-grid">
              <div class="info-item full-width">
                <span class="info-label">Company / Organisation</span>
                <span class="info-value">{{ selectedApplication.company || 'N/A' }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">Your Role</span>
                <span class="info-value">{{ selectedApplication.role || 'N/A' }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">Document</span>
                <span class="info-value">
                  <span class="status-badge status-approved">📎 Uploaded</span>
                </span>
              </div>
            </div>
          </div>
          <div v-if="selectedApplication.notes" class="panel-section">
            <h3 class="section-title">Additional Notes</h3>
            <p class="notes-text">{{ selectedApplication.notes }}</p>
          </div>
        </div>
        <div class="panel-footer">
          <button class="btn btn-secondary" @click="closePanel">Close</button>
          <button v-if="selectedApplication && selectedApplication.status === 'pending'" class="btn btn-danger" @click="rejectFromPanel">
            ❌ Reject
          </button>
          <button v-if="selectedApplication && selectedApplication.status === 'pending'" class="btn btn-primary" @click="approveFromPanel">
            ✅ Approve
          </button>
          <button v-if="selectedApplication && selectedApplication.status === 'rejected'" class="btn btn-primary" @click="acceptFromPanel">
            ✅ Accept
          </button>
        </div>
      </div>
    </div>

    <!-- Accept Confirmation Modal (for rejected applications) -->
    <div v-if="acceptModal" class="modal-overlay" @click.self="closeAcceptModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">Accept Application</h2>
          <button class="modal-close" @click="closeAcceptModal">×</button>
        </div>
        <div class="modal-body">
          <div class="delete-warning accept-warning">
            <span class="warning-icon">✅</span>
            <p>You are about to accept the application from <strong>{{ acceptTarget?.name }}</strong>.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Reason for Acceptance <span class="required">*</span></label>
            <textarea v-model="acceptForm.reason" class="form-textarea" rows="3" placeholder="Enter reason for acceptance..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeAcceptModal">Cancel</button>
          <button class="btn btn-primary" @click="confirmAccept" :disabled="!acceptForm.reason.trim()">
            ✅ Confirm Accept
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Confirmation Modal -->
    <div v-if="rejectModal" class="modal-overlay" @click.self="closeRejectModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">Reject Application</h2>
          <button class="modal-close" @click="closeRejectModal">×</button>
        </div>
        <div class="modal-body">
          <div class="delete-warning reject-warning">
            <span class="warning-icon">⚠️</span>
            <p>You are about to reject the application from <strong>{{ rejectTarget?.name }}</strong>.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Reason for Rejection <span class="required">*</span></label>
            <textarea v-model="rejectForm.reason" class="form-textarea" rows="3" placeholder="Enter reason for rejection..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRejectModal">Cancel</button>
          <button class="btn btn-danger" @click="confirmReject">Reject Application</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { setMeta } = useSEO()
setMeta({
  title: 'New Account Applications — BSP Staff',
  description: 'Review and approve new account requests',
  path: '/BSP/applications',
  type: 'website'
})

// Tab state
const activeTab = ref<'pending' | 'approved' | 'rejected'>('pending')

// Pagination state
const currentPage = ref(1)
const searchQuery = ref('')
const filterType = ref('all')
const showPanel = ref(false)
const selectedApplication = ref<any>(null)
const rejectModal = ref(false)
const rejectTarget = ref<any>(null)
const rejectForm = ref({ reason: '' })
const acceptModal = ref(false)
const acceptTarget = ref<any>(null)
const acceptForm = ref({ reason: '' })

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedQuery = ref('')

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedQuery.value = searchQuery.value
    currentPage.value = 1
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  debouncedQuery.value = ''
  currentPage.value = 1
}

// Page size
const pageSize = ref(10)

// Mock data — School / Consultant / Business only (no Personal)
const allApplications = ref([
  // === PENDING ===
  {
    id: 1,
    name: 'Mr. Thomas Wright',
    email: 'thomas@brightoncollege.edu.hk',
    type: 'School',
    company: 'Brighton College Hong Kong',
    phone: '+852 2345 6789',
    location: 'Hong Kong',
    submittedDate: '2026-04-25',
    approvedDate: null,
    rejectedDate: null,
    status: 'pending',
    schoolName: 'Westminster School',
    schoolRole: 'Admissions Officer',
    documentStatus: 'Uploaded',
    notes: 'International school seeking BSP partnership for UK boarding school placement services.'
  },
  {
    id: 2,
    name: 'Ms. Catherine Ng',
    email: 'catherine@eliteconsultants.hk',
    type: 'Consultant',
    company: 'Elite Education Consultants Ltd',
    phone: '+852 3456 7890',
    location: 'Hong Kong',
    submittedDate: '2026-04-24',
    approvedDate: null,
    rejectedDate: null,
    status: 'pending',
    role: 'Education Consultant',
    documentStatus: 'Uploaded',
    notes: 'Established consultancy with 5 years experience in UK placements. Annual target: 30 students.'
  },
  {
    id: 3,
    name: 'Mr. Jason Lam',
    email: 'jason@globalstudygroup.com',
    type: 'Business',
    company: 'Global Study Group Ltd',
    phone: '+852 4567 8901',
    location: 'Singapore',
    submittedDate: '2026-04-23',
    approvedDate: null,
    rejectedDate: null,
    status: 'pending',
    role: 'Regional Director',
    documentStatus: 'Uploaded',
    notes: 'Regional education agency expanding into UK market. Requesting multi-agent licensing.'
  },
  {
    id: 4,
    name: 'Ms. Fiona Wong',
    email: 'fiona@oxfordstudy.co.uk',
    type: 'Consultant',
    company: 'Oxford Study Consultancy',
    phone: '+44 7700 900456',
    location: 'United Kingdom',
    submittedDate: '2026-04-22',
    approvedDate: null,
    rejectedDate: null,
    status: 'pending',
    role: 'Senior Consultant',
    documentStatus: 'Uploaded',
    notes: 'UK-based consultancy specialising in Hong Kong students. Strong track record with boarding schools.'
  },
  {
    id: 5,
    name: 'Mr. Derek Cheung',
    email: 'derek@boardingedu.com.hk',
    type: 'Consultant',
    company: 'Boarding Education Centre',
    phone: '+852 5678 9012',
    location: 'Hong Kong',
    submittedDate: '2026-04-21',
    approvedDate: null,
    rejectedDate: null,
    status: 'pending',
    role: 'Education Consultant',
    documentStatus: 'Uploaded',
    notes: 'Specialist in UK boarding school applications. Previously worked with 20+ partner schools.'
  },
  {
    id: 6,
    name: 'Ms. Patricia Lee',
    email: 'patricia@royalacademy.edu.hk',
    type: 'School',
    company: 'Royal Academy International School',
    phone: '+852 6789 0123',
    location: 'Hong Kong',
    submittedDate: '2026-04-20',
    approvedDate: null,
    rejectedDate: null,
    status: 'pending',
    schoolName: 'Westminster School',
    schoolRole: 'Admissions Officer',
    documentStatus: 'Uploaded',
    notes: 'Local international school looking to offer UK boarding placement as part of careers service.'
  },
  // === APPROVED ===
  {
    id: 7,
    name: 'Mr. Kevin Chan',
    email: 'kevin@ukpathways.hk',
    type: 'Consultant',
    company: 'UK Pathways Ltd',
    phone: '+852 7890 1234',
    location: 'Hong Kong',
    submittedDate: '2026-04-18',
    approvedDate: '2026-04-19',
    rejectedDate: null,
    status: 'approved',
    role: 'Education Consultant',
    documentStatus: 'Uploaded',
    notes: 'Approved after document verification. Commission rate: 10%.'
  },
  {
    id: 8,
    name: 'Ms. Michelle Tang',
    email: 'michelle@educate2u.com',
    type: 'Consultant',
    company: 'Educate2U Consultancy',
    phone: '+852 8901 2345',
    location: 'Hong Kong',
    submittedDate: '2026-04-15',
    approvedDate: '2026-04-17',
    rejectedDate: null,
    status: 'approved',
    role: 'Senior Education Consultant',
    documentStatus: 'Uploaded',
    notes: 'Approved with standard commission rate of 8%.'
  },
  {
    id: 9,
    name: 'Mr. Andrew Hui',
    email: 'andrew@edustart.com.hk',
    type: 'Business',
    company: 'EduStart Education Services',
    phone: '+852 9012 3456',
    location: 'Hong Kong',
    submittedDate: '2026-04-10',
    approvedDate: '2026-04-12',
    rejectedDate: null,
    status: 'approved',
    role: 'Managing Director',
    documentStatus: 'Uploaded',
    notes: 'Business account approved. Multi-agent licence granted.'
  },
  // === REJECTED ===
  {
    id: 10,
    name: 'Mr. Brian Luk',
    email: 'brian@quickplacements.com',
    type: 'Consultant',
    company: 'Quick Placements Ltd',
    phone: '+852 3456 7890',
    location: 'Hong Kong',
    submittedDate: '2026-04-08',
    approvedDate: null,
    rejectedDate: '2026-04-10',
    status: 'rejected',
    role: 'Education Consultant',
    documentStatus: 'Uploaded',
    notes: 'Rejected: Unable to verify professional indemnity insurance documentation.'
  }
])

// Separate lists by status
const pendingApplications = computed(() => allApplications.value.filter(a => a.status === 'pending'))
const approvedApplications = computed(() => allApplications.value.filter(a => a.status === 'approved'))
const rejectedApplications = computed(() => allApplications.value.filter(a => a.status === 'rejected'))
const filteredRejected = computed(() => rejectedApplications.value)

// Filtered applications based on active tab and search
const filteredApplications = computed(() => {
  let list: any[] = []
  if (activeTab.value === 'pending') list = [...pendingApplications.value]
  else if (activeTab.value === 'approved') list = [...approvedApplications.value]
  else if (activeTab.value === 'rejected') list = [...rejectedApplications.value]
  
  if (debouncedQuery.value) {
    const q = debouncedQuery.value.toLowerCase()
    list = list.filter(a => 
      a.name.toLowerCase().includes(q) || 
      a.company.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q)
    )
  }
  
  if (filterType.value !== 'all') {
    list = list.filter(a => a.type === filterType.value)
  }
  
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredApplications.value.length / pageSize.value)))

const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredApplications.value.slice(start, end)
})

const paginationStart = computed(() => {
  if (filteredApplications.value.length === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * pageSize.value, filteredApplications.value.length)
})

// Visible page numbers
const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push(-1)
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push(-1)
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push(-1)
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push(-1)
      pages.push(total)
    }
  }
  return pages
})

// Watch tab change — reset page
watch(activeTab, () => {
  currentPage.value = 1
  debouncedQuery.value = ''
  searchQuery.value = ''
})

// Slugify helper
const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Get user detail link based on application type — public profile URL
const getUserDetailLink = (app: any) => {
  const location = app.location || app.country || 'unknown'
  const slug = app.company || app.schoolName || app.name || 'unknown'
  if (app.type === 'School') {
    return `/school/${slugify(app.schoolName || app.company || app.name)}`
  }
  if (app.type === 'Consultant') {
    return `/consultant/${slugify(location)}/${slugify(app.company)}`
  }
  if (app.type === 'Business') {
    return `/business/${slugify(location)}/${slugify(app.company)}`
  }
  return `/BSP/users/personal/${app.id}`
}

// Actions
const viewApplication = (id: number) => {
  selectedApplication.value = allApplications.value.find(a => a.id === id)
  showPanel.value = true
}

const approveApplication = (id: number) => {
  const app = allApplications.value.find(a => a.id === id)
  if (app && confirm(`Approve application from ${app.name}?`)) {
    app.status = 'approved'
    app.approvedDate = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Hong_Kong' })
    alert(`Application from ${app.name} has been approved.`)
  }
}

const rejectApplication = (id: number) => {
  const app = allApplications.value.find(a => a.id === id)
  if (app) {
    rejectTarget.value = app
    rejectModal.value = true
  }
}

const closeRejectModal = () => {
  rejectModal.value = false
  rejectForm.value = { reason: '' }
}

const confirmReject = () => {
  if (!rejectForm.value.reason.trim()) {
    alert('Please enter a reason for rejection')
    return
  }
  if (rejectTarget.value) {
    const app = allApplications.value.find(a => a.id === rejectTarget.value.id)
    if (app) {
      app.status = 'rejected'
      app.rejectedDate = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Hong_Kong' })
      app.notes = (app.notes || '') + ` [Rejected: ${rejectForm.value.reason}]`
    }
    alert(`Application from ${rejectTarget.value.name} has been rejected.`)
    closeRejectModal()
  }
}

const approveFromPanel = () => {
  if (selectedApplication.value) {
    approveApplication(selectedApplication.value.id)
    closePanel()
  }
}

const rejectFromPanel = () => {
  if (selectedApplication.value) {
    rejectApplication(selectedApplication.value.id)
    closePanel()
  }
}

const acceptApplication = (id: number) => {
  acceptTarget.value = filteredRejected.value.find((a: any) => a.id === id)
  acceptModal.value = true
  acceptForm.value.reason = ''
}

const closeAcceptModal = () => {
  acceptModal.value = false
  acceptTarget.value = null
  acceptForm.value.reason = ''
}

const confirmAccept = () => {
  if (!acceptForm.value.reason.trim()) return
  const app = allApplications.value.find((a: any) => a.id === acceptTarget.value?.id)
  if (app) {
    app.status = 'approved'
    app.notes = acceptForm.value.reason
    app.rejectedDate = null
    // Update selectedApplication to reflect the new notes
    selectedApplication.value = { ...app }
  }
  closeAcceptModal()
  activeTab.value = 'approved'
}

const acceptFromPanel = () => {
  if (selectedApplication.value && selectedApplication.value.status === 'rejected') {
    acceptApplication(selectedApplication.value.id)
  }
}

const closePanel = () => {
  showPanel.value = false
  selectedApplication.value = null
}

const exportApplications = () => {
  alert('Export CSV — coming soon')
}
</script>

<style scoped>
:root {
  --bsp-primary: #212E54;
  --bsp-secondary: #3b82f6;
  --bsp-accent: #C1AA78;
  --bsp-dark: #1e293b;
  --bsp-light: #f8fafc;
  --bsp-success: #10b981;
  --bsp-warning: #f59e0b;
  --bsp-danger: #ef4444;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

.bsp-dashboard {
  min-height: 100vh;
  background: var(--bsp-light);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--bsp-dark);
}

.dashboard-body {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #e2e8f0;
  padding: 1.5rem 0;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.nav-section { margin-bottom: 1.5rem; }

.nav-section-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  padding: 0 1.5rem;
  margin-bottom: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #f1f5f9;
  color: var(--bsp-primary);
}

.nav-item.active {
  background: #eff6ff;
  color: var(--bsp-primary);
  border-left-color: var(--bsp-secondary);
  font-weight: 600;
}

.nav-icon { font-size: 1.1rem; }

.nav-count {
  margin-left: auto;
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 1.5rem 2rem;
  overflow-x: auto;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--bsp-primary);
  margin-bottom: 0.25rem;
}

.page-subtitle {
  font-size: 0.9rem;
  color: #64748b;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--bsp-primary);
  color: white;
}

.btn-primary:hover { background: #1a2644; }

.btn-secondary {
  background: white;
  color: var(--bsp-primary);
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover { background: #f8fafc; }

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.filter-left {
  display: flex;
  gap: 0.75rem;
  flex: 1;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 0.75rem;
  flex: 1;
  max-width: 300px;
  overflow: hidden;
}

.search-clear {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0 0.25rem;
  margin-left: 0.25rem;
  line-height: 1;
}

.search-clear:hover { color: #64748b; }

.search-icon { font-size: 1rem; margin-right: 0.5rem; }

.search-input {
  border: none;
  outline: none;
  padding: 0.6rem 0;
  font-size: 0.9rem;
  width: 100%;
  background: transparent;
}

.filter-select {
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: var(--bsp-dark);
  cursor: pointer;
}

.result-count {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

/* Users Table */
.users-table-wrapper {
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
  overflow-y: auto;
  margin-bottom: 1rem;
  max-width: 100%;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: #f8fafc;
}

.users-table th {
  text-align: left;
  padding: 0.875rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.th-company, .th-live, .th-partnered, .th-completed, .th-actions {
  text-align: center !important;
  padding: 0.875rem 1rem;
}

.td-company {
  text-align: center !important;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.td-type {
  text-align: center !important;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.td-live, .td-partnered, .td-completed {
  text-align: center !important;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.td-deletedat {
  text-align: center !important;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 0.875rem;
  color: #475569;
}

.td-status {
  text-align: center !important;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.td-actions {
  text-align: center !important;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.user-row:hover { background: #fafbfc; }

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.consultant-name {
  display: block;
  font-weight: 600;
  color: var(--bsp-dark);
  font-size: 0.9rem;
}

.consultant-contact {
  display: block;
  font-size: 0.8rem;
  color: #475569;
}

.user-email {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
}

.company-text {
  font-size: 0.85rem;
  color: var(--bsp-dark);
  font-weight: 500;
}

.company-link {
  font-size: 0.85rem;
  color: var(--bsp-primary);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.company-link:hover {
  text-decoration: underline;
}

/* Type Badge */
.type-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.type-school {
  background: #ede9fe;
  color: #5b21b6;
}

.type-consultant {
  background: #eff6ff;
  color: #1e40af;
}

.type-business {
  background: #ecfdf5;
  color: #065f46;
}

.not-applied {
  color: #cbd5e1;
  font-size: 1.1rem;
}

/* Status Badge */
.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-approved {
  background: #d1fae5;
  color: #047857;
}

.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-active {
  background: #d1fae5;
  color: #047857;
}

.action-buttons {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
  align-items: center;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-action.btn-approve:hover {
  background: #d1fae5;
  border-color: #10b981;
}

.btn-action.btn-reject:hover {
  background: #fee2e2;
  border-color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-icon { font-size: 3rem; }

.empty-content p {
  color: #64748b;
  font-size: 0.95rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-info {
  font-size: 0.85rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  gap: 0.25rem;
}

.btn-page {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: #f1f5f9;
  color: var(--bsp-dark);
}

.btn-page.active {
  background: var(--bsp-primary);
  color: white;
  border-color: var(--bsp-primary);
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Right Side Panel */
.detail-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.detail-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 100%;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.25s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: var(--bsp-primary);
  color: white;
}

.panel-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
}

.panel-close {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: rgba(255,255,255,0.2);
  font-size: 1.25rem;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.panel-close:hover { background: rgba(255,255,255,0.3); }

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.panel-section {
  margin-bottom: 1.5rem;
}

.panel-section .section-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  margin-bottom: 1rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.info-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--bsp-dark);
}

.notes-text {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
  background: #f8fafc;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  border-left: 3px solid var(--bsp-secondary);
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.panel-footer .btn { min-width: 80px; }

/* Reject Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--bsp-dark);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.modal-close:hover { color: var(--bsp-dark); }

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--bsp-dark);
}

.label-hint {
  font-weight: 400;
  color: #94a3b8;
}

.form-input {
  padding: 0.6rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--bsp-dark);
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--bsp-secondary);
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--bsp-secondary, #3b82f6);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.modal-footer .btn {
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.modal-footer .btn-secondary {
  background: #f1f5f9;
  color: var(--bsp-dark);
}

.modal-footer .btn-secondary:hover { background: #e2e8f0; }

.modal-footer .btn-primary {
  background: var(--bsp-secondary);
  color: white;
}

.modal-footer .btn-primary:hover { background: #2563eb; }

.modal-footer .btn-danger {
  background: var(--bsp-danger);
  color: white;
}

.modal-footer .btn-danger:hover { background: #dc2626; }

/* Delete / Reject Warning */
.delete-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef3c7;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.reject-warning {
  background: #fee2e2;
}

.reject-warning p {
  color: #991b1b;
}

.accept-warning { background: #f0fdf4; border: 1px solid #86efac; }
.accept-warning .warning-icon { color: #22c55e; }
.accept-warning p { color: #166534; }

.warning-icon {
  font-size: 1.25rem;
}

.delete-warning p {
  margin: 0;
  color: #92400e;
  font-size: 0.9rem;
  line-height: 1.5;
}

.required {
  color: var(--bsp-danger);
}

/* Tabs */
.tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--bsp-secondary);
}

.tab-btn.active {
  color: var(--bsp-secondary);
  border-bottom-color: var(--bsp-secondary);
}

.tab-count {
  background: #e2e8f0;
  padding: 0.1rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
}

.tab-btn.active .tab-count {
  background: var(--bsp-secondary);
  color: white;
}

.tab-count.approved {
  background: #d1fae5;
  color: #047857;
}

.tab-btn.active .tab-count.approved {
  background: #047857;
  color: white;
}

.tab-count.rejected {
  background: #fecaca;
  color: #991b1b;
}

.tab-btn.active .tab-count.rejected {
  background: #991b1b;
  color: white;
}

/* Deleted / Rejected row */
.deleted-row {
  background: #fef9f9;
}

/* Responsive */
@media (max-width: 1024px) {
  .users-table { font-size: 0.85rem; }
}

@media (max-width: 768px) {
  .sidebar { display: none; }
  .dashboard-body { flex-direction: column; }
  .filter-left { flex-direction: column; }
  .search-box { max-width: 100%; }
  .page-header { flex-direction: column; gap: 1rem; }
  .main-content { padding: 1rem; }
  .users-table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .users-table { min-width: 500px; }
  .pagination { flex-direction: column; gap: 0.75rem; align-items: flex-start; }
  .pagination-controls { gap: 0.35rem; flex-wrap: wrap; }
  .btn-page { padding: 0.35rem 0.6rem; font-size: 0.8rem; }
  .pagination-info { font-size: 0.8rem; }
}
</style>
