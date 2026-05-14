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
            <NuxtLink to="/BSP/users/school" class="nav-item active">
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
            <NuxtLink to="/BSP/new-account-applications" class="nav-item">
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
            <h1 class="page-title">🏫 School Users</h1>
            <p class="page-subtitle">Manage School user accounts</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" @click="exportSchools">
              📥 Export CSV
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar">
          <button class="tab-btn" :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'">
            Active Schools <span class="tab-count">{{ schools.length }}</span>
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'deleted' }" @click="activeTab = 'deleted'">
            Deleted Accounts <span class="tab-count deleted">{{ deletedSchools.length }}</span>
          </button>
        </div>

        <!-- Filters -->
        <div class="filter-bar" v-if="activeTab === 'active'">
          <div class="filter-left">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input 
                v-model="searchQuery" 
                type="text" 
                class="search-input" 
                placeholder="Search by name or email..."
                @input="onSearchInput"
              />
              <button v-if="searchQuery" class="search-clear" @click="clearSearch">×</button>
            </div>
            <select v-model="filterHasStudents" class="filter-select">
              <option value="all">All</option>
              <option value="hasstudents">Has Students</option>
              <option value="nostudents">No Students</option>
            </select>
          </div>
          <div class="filter-right">
            <span class="result-count">{{ filteredSchools.length }} schools</span>
          </div>
        </div>

        <!-- Users Table -->
        <div class="users-table-wrapper" v-if="activeTab === 'active'">
          <table class="users-table">
            <thead>
              <tr>
                <th class="th-user">School</th>
                <th class="th-apps">Students</th>
                <th class="th-expire">Membership Expire</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="school in paginatedSchools" :key="school.id" class="user-row">
                <td class="td-user">
                  <div class="user-info-cell">
                    <div class="user-details">
                      <NuxtLink :to="`/school/${school.slug}`" class="school-name-link">
                        {{ school.name }}
                      </NuxtLink>
                      <span class="school-contact">{{ school.contactPerson }}</span>
                      <span class="user-email">{{ school.email }}</span>
                      <span class="user-code-inline">ID: {{ school.userCode }}</span>
                    </div>
                  </div>
                </td>
                <td class="td-apps">
                  <span v-if="school.studentCount > 0" class="applied-info" @click.stop="viewSchool(school.id)">
                    <span class="applied-badge">{{ school.studentCount }}</span>
                    <span class="applied-phase">student{{ school.studentCount > 1 ? 's' : '' }}</span>
                  </span>
                  <span v-else class="not-applied">—</span>
                </td>
                <td class="td-expire">
                  <span :class="'expire-' + getMembershipStatus(school.membershipExpire)">
                    {{ school.membershipExpire }}
                  </span>
                </td>
                <td class="td-actions">
                  <div class="action-buttons">
                    <button class="btn-action btn-view" @click="viewSchool(school.id)" title="View Details">
                      👁️
                    </button>
                    <button class="btn-action btn-edit" @click="editSchool(school.id)" title="Edit">
                      ✏️
                    </button>
                    <button class="btn-action btn-more" @click="toggleMenu(school.id)" title="More">
                      ⋮
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedSchools.length === 0">
                <td colspan="5" class="empty-state">
                  <div class="empty-content">
                    <span class="empty-icon">🏫</span>
                    <p>No schools found</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <span class="pagination-info">
            Showing {{ paginationStart }}–{{ paginationEnd }} of {{ filteredSchools.length }} schools
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

        <!-- Deleted Accounts Table -->
        <div class="users-table-wrapper" v-if="activeTab === 'deleted'">
          <table class="users-table">
            <thead>
              <tr>
                <th class="th-user">User</th>
                <th class="th-deletedat">Deleted At</th>
                <th class="th-deletedby">Deleted By</th>
                <th class="th-reason">Reason</th>
                <th class="th-evidence">Evidence</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in deletedSchools" :key="record.userCode" class="user-row deleted-row">
                <td class="td-user">
                  <div class="user-info-cell">
                    <div class="user-details">
                      <span class="school-name">{{ record.name }}</span>
                      <span class="school-contact">{{ record.contactPerson }}</span>
                      <span class="user-email">{{ record.email }}</span>
                      <span class="user-code-inline deleted-code">ID: {{ record.userCode }}</span>
                    </div>
                  </div>
                </td>
                <td class="td-deletedat">{{ record.deletedAt }}</td>
                <td class="td-deletedby">{{ record.deletedBy }}</td>
                <td class="td-reason">
                  <span class="reason-text" :title="record.reason">{{ record.reason.length > 30 ? record.reason.slice(0, 30) + '...' : record.reason }}</span>
                </td>
                <td class="td-evidence">
                  <span v-if="record.evidenceFile" class="evidence-file">
                    📎 {{ record.evidenceFile }}
                  </span>
                  <span v-else class="no-evidence">—</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="deletedSchools.length === 0" class="empty-state">
            No deleted accounts
          </div>
        </div>
      </main>
    </div>

    <!-- Right Side User Detail Panel -->
    <div v-if="showPanel" class="detail-panel-overlay" @click.self="closePanel">
      <div class="detail-panel">
        <div class="panel-header">
          <h2 class="panel-title">User Details</h2>
          <button class="panel-close" @click="closePanel">×</button>
        </div>
        <div v-if="selectedSchool" class="panel-body">
          <div class="panel-section">
            <h3 class="section-title">School Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">School ID</span>
                <span class="info-value">{{ selectedSchool.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">School Name</span>
                <span class="info-value">{{ selectedSchool.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Contact Person</span>
                <span class="info-value">{{ selectedSchool.contactPerson }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ selectedSchool.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone</span>
                <span class="info-value">{{ selectedSchool.phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Students</span>
                <span class="info-value">{{ selectedSchool.studentCount }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Membership Expire</span>
                <span class="info-value" :class="'expire-' + getMembershipStatus(selectedSchool.membershipExpire)">
                  {{ selectedSchool.membershipExpire }}
                  <span v-if="getMembershipStatus(selectedSchool.membershipExpire) === 'expired'" class="expire-tag">Expired</span>
                  <span v-else-if="getMembershipStatus(selectedSchool.membershipExpire) === 'critical'" class="expire-tag expire-tag-critical">Urgent</span>
                  <span v-else-if="getMembershipStatus(selectedSchool.membershipExpire) === 'warning'" class="expire-tag expire-tag-warning">Renew</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="panel-footer">
          <button class="btn btn-secondary" @click="closePanel">Close</button>
          <button class="btn btn-primary" @click="editSchool(selectedSchool?.id)">Edit</button>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="editModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">Edit User</h2>
          <button class="modal-close" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">School Name</label>
            <input v-model="editForm.name" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Contact Person</label>
            <input v-model="editForm.contactPerson" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="editForm.email" type="email" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Membership Expire Date</label>
            <input v-model="editForm.membershipExpire" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">New Password <span class="label-hint">(leave blank to keep current)</span></label>
            <input v-model="editForm.password" type="password" class="form-input" placeholder="Enter new password" />
          </div>
          <div class="modal-divider"></div>
          <div class="form-group">
            <label class="form-label">Account Status</label>
            <div class="status-display">
              <span class="status-badge" :class="'status-' + (editForm.status || 'active')">{{ editForm.status || 'active' }}</span>
            </div>
          </div>
          <div class="action-buttons">
            <button class="btn-action-text" @click="suspendUser" v-if="editForm.status !== 'suspended'">
              <span class="btn-icon">⏸</span> Suspend Account
            </button>
            <button class="btn-action-text btn-success" @click="unsuspendUser" v-if="editForm.status === 'suspended'">
              <span class="btn-icon">▶</span> Unsuspend Account
            </button>
            <button class="btn-action-text btn-danger" @click="openDeleteConfirm">
              <span class="btn-icon">🗑</span> Delete Account
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEditModal">Cancel</button>
          <button class="btn btn-primary" @click="saveEdit">Save Changes</button>
        </div>
      </div>
    </div>
    <!-- Delete Account Confirmation Modal -->
    <div v-if="deleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">Delete Account</h2>
          <button class="modal-close" @click="closeDeleteModal">×</button>
        </div>
        <div class="modal-body">
          <div class="delete-warning">
            <span class="warning-icon">⚠️</span>
            <p>You are about to delete the account for <strong>{{ editForm.name }}</strong>. This action cannot be undone.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Reason for Deletion <span class="required">*</span></label>
            <textarea v-model="deleteForm.reason" class="form-textarea" rows="3" placeholder="Enter reason for account deletion..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Upload Evidence <span class="label-hint">(screenshot, email, etc.)</span></label>
            <div class="file-upload-area" @click="triggerFileUpload">
              <input ref="deleteFileInput" type="file" accept=".jpg,.jpeg,.png,.pdf" style="display:none" @change="handleDeleteFileChange" />
              <div v-if="!deleteForm.file" class="upload-placeholder">
                <span class="upload-icon">📎</span>
                <span>Click to upload file</span>
                <span class="upload-hint">JPG, PNG, PDF (max 5MB)</span>
              </div>
              <div v-else class="file-selected">
                <span class="file-icon">📄</span>
                <span class="file-name">{{ deleteForm.file.name }}</span>
                <button class="btn-remove-file" @click.stop="removeDeleteFile">×</button>
              </div>
            </div>
          </div>
          <div v-if="deleteForm.reason && !deleteForm.file" class="form-hint warning-hint">
            ⚠️ Uploading evidence is recommended for compliance.
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
          <button class="btn btn-danger" @click="confirmDeleteSchool">Delete Account</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { setMeta } = useSEO()
setMeta({
  title: 'School Users — BSP Staff',
  description: 'Manage School user accounts',
  path: '/BSP/users/personal',
  type: 'website'
})

// Pagination state
const currentPage = ref(1)
const searchQuery = ref('')
const filterHasStudents = ref('all')
const showPanel = ref(false)
const selectedSchool = ref<any>(null)
const editModal = ref(false)
const editForm = ref({ name: '', contactPerson: '', email: '', password: '', status: 'active', membershipExpire: '' })
const deleteModal = ref(false)
const deleteForm = ref({ reason: '', file: null as File | null })
const deleteFileInput = ref<HTMLInputElement | null>(null)
const activeTab = ref<'active' | 'deleted'>('active')

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedQuery = ref('')

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedQuery.value = searchQuery.value
    currentPage.value = 1 // Reset to page 1 on search
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  debouncedQuery.value = ''
  currentPage.value = 1
}

// Page size based on screen width
const isMobile = ref(false)
const pageSize = computed(() => isMobile.value ? 20 : 30)

// Detect mobile on mount
onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
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

// Helper: generate date-based user code
// Format: YYYYMMDD + 5-digit daily sequence
const dailyCount: Record<string, number> = {}
const generateUserCode = (dateStr: string): string => {
  const datePart = dateStr.replace(/-/g, '')
  dailyCount[datePart] = (dailyCount[datePart] || 0) + 1
  return `${datePart}${String(dailyCount[datePart]).padStart(5, '0')}`
}

// Pre-populate counts so new codes continue sequentially
dailyCount['20250601'] = 1  // Harrow School
dailyCount['20260115'] = 1  // St. Mary's School
dailyCount['20260220'] = 1  // Brighton College
dailyCount['20260310'] = 1  // King's College
dailyCount['20260315'] = 1  // Cheltenham Ladies' College
dailyCount['20260401'] = 1  // Wycombe Abbey
dailyCount['20260418'] = 1  // Eton College
dailyCount['20260419'] = 1  // Benenden School
dailyCount['20260420'] = 1  // Downe House
dailyCount['20260421'] = 1  // St. Paul's School

const schools = ref([
  // Today: 2026-04-20. Status: ok=green (>30d), warning=yellow (≤30d), critical=red (≤7d), expired=dimmed red (<0d)
  { id: 1, userCode: '2026011500001', name: "St. Mary's School", slug: 'st-marys-school', contactPerson: 'Mrs. Elizabeth Brown', email: 'admin@stmarys.edu.uk', registeredAt: '2026-01-15', lastLogin: '2026-04-19 14:32', studentCount: 3, phone: '+44 20 7946 0958', country: 'United Kingdom', status: 'active', membershipExpire: '2026-07-15' },       // OK (86d)
  { id: 2, userCode: '2026022000001', name: 'Brighton College', slug: 'brighton-college', contactPerson: 'Mr. David Wilson', email: 'admissions@brightoncollege.edu.uk', registeredAt: '2026-02-20', lastLogin: '2026-04-18 09:15', studentCount: 1, phone: '+44 1273 704200', country: 'United Kingdom', status: 'active', membershipExpire: '2026-08-20' }, // OK (122d)
  { id: 3, userCode: '2026031000001', name: "King's College School", slug: 'kings-college-school', contactPerson: 'Ms. Catherine Lee', email: 'info@kcs.org.uk', registeredAt: '2026-03-10', lastLogin: '2026-04-15 16:45', studentCount: 0, phone: '+44 20 8946 4491', country: 'United Kingdom', status: 'active', membershipExpire: '2026-05-15' },  // WARNING (25d)
  { id: 4, userCode: '2026031500001', name: "Cheltenham Ladies' College", slug: 'cheltenham-ladies-college', contactPerson: 'Mrs. Patricia Hughes', email: 'registry@cheltenhamcollege.org', registeredAt: '2026-03-15', lastLogin: '2026-04-19 11:20', studentCount: 2, phone: '+44 1242 518600', country: 'United Kingdom', status: 'active', membershipExpire: '2026-06-15' }, // OK (56d)
  { id: 5, userCode: '2025060100001', name: 'Harrow School', slug: 'harrow-school', contactPerson: 'Mr. James Thompson', email: 'harrow@harrowschool.org.uk', registeredAt: '2025-06-01', lastLogin: '2026-04-10 08:00', studentCount: 5, phone: '+44 20 8872 8000', country: 'United Kingdom', status: 'active', membershipExpire: '2025-06-01' },  // EXPIRED (2025)
  { id: 6, userCode: '2026040100001', name: 'Wycombe Abbey School', slug: 'wycombe-abbey-school', contactPerson: 'Mrs. Susan Clark', email: 'admissions@wycombeabbey.com', registeredAt: '2026-04-01', lastLogin: '2026-04-19 17:30', studentCount: 1, phone: '+44 1494 520381', country: 'United Kingdom', status: 'active', membershipExpire: '2026-10-01' }, // OK (164d)
  { id: 7, userCode: '2026041800001', name: 'Eton College', slug: 'eton-college', contactPerson: 'Mr. Robert Miller', email: 'admissions@etoncollege.org.uk', registeredAt: '2026-04-18', lastLogin: '2026-04-18 12:00', studentCount: 0, phone: '+44 1753 370100', country: 'United Kingdom', status: 'suspended', membershipExpire: '2026-04-26' },  // CRITICAL (6d)
  { id: 8, userCode: '2026041900001', name: 'Benenden School', slug: 'benenden-school', contactPerson: 'Mrs. Angela White', email: 'registry@benenden.school.uk', registeredAt: '2026-04-19', lastLogin: '2026-04-19 20:15', studentCount: 1, phone: '+44 1580 240514', country: 'United Kingdom', status: 'active', membershipExpire: '2026-11-19' }, // OK (213d)
  { id: 9, userCode: '2026042000001', name: 'Downe House School', slug: 'downe-house-school', contactPerson: 'Ms. Joanna Harris', email: 'admissions@downehouse.net', registeredAt: '2026-04-20', lastLogin: '2026-04-20 10:00', studentCount: 0, phone: '+44 1635 202790', country: 'United Kingdom', status: 'active', membershipExpire: '2026-05-20' },   // WARNING (30d)
  { id: 10, userCode: '2026042100001', name: "St. Paul's School", slug: 'st-pauls-school', contactPerson: 'Mr. Timothy Adams', email: 'admissions@stpaulsschool.org.uk', registeredAt: '2026-04-21', lastLogin: '2026-04-19 10:45', studentCount: 2, phone: '+44 20 8748 9152', country: 'United Kingdom', status: 'active', membershipExpire: '2026-12-21' }, // OK (245d)
])

// Deleted accounts log
const deletedSchools = ref([
  {
    userCode: '2026041800002',
    name: 'Rugby School',
    contactPerson: 'Mr. Charles Davies',
    email: 'admin@rugbyschool.co.uk',
    phone: '+44 1788 556216',
    country: 'United Kingdom',
    deletedAt: '2026-04-18 15:30',
    deletedBy: 'Admin',
    reason: 'School closed operations in the region',
    evidenceFile: 'closure-notice.pdf'
  }
])

// Watch filter changes to reset page
watch(filterHasStudents, () => {
  currentPage.value = 1
})

// Membership expiry status: 'expired' | 'critical' (≤1 week) | 'warning' (≤1 month) | 'ok'
function getMembershipStatus(dateStr) {
  if (!dateStr) return 'ok'
  const now = new Date()
  const exp = new Date(dateStr)
  const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return 'expired'
  if (daysLeft <= 7) return 'critical'
  if (daysLeft <= 30) return 'warning'
  return 'ok'
}

function isExpired(dateStr) {
  return getMembershipStatus(dateStr) === 'expired'
}

const filteredSchools = computed(() => {
  let result = schools.value
  
  if (debouncedQuery.value) {
    const q = debouncedQuery.value.toLowerCase()
    result = result.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.contactPerson.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    )
  }
  
  if (filterHasStudents.value === 'hasstudents') {
    result = result.filter(s => s.studentCount > 0)
  } else if (filterHasStudents.value === 'nostudents') {
    result = result.filter(s => s.studentCount === 0)
  }
  
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredSchools.value.length / pageSize.value)))

const paginatedSchools = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSchools.value.slice(start, end)
})

const paginationStart = computed(() => {
  if (filteredSchools.value.length === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * pageSize.value, filteredSchools.value.length)
})

// Visible page numbers (show max 5 pages around current)
const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push(-1) // ellipsis
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push(-1) // ellipsis
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push(-1) // ellipsis
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push(-1) // ellipsis
      pages.push(total)
    }
  }
  return pages
})

const viewSchool = (id: number) => {
  selectedSchool.value = schools.value.find(s => s.id === id)
  showPanel.value = true
}

const editSchool = (id: number) => {
  const school = schools.value.find(s => s.id === id)
  if (school) {
    editForm.value = {
      id: school.id,
      name: school.name,
      contactPerson: school.contactPerson,
      email: school.email,
      password: '',
      status: school.status || 'active',
      membershipExpire: school.membershipExpire || ''
    }
    editModal.value = true
  }
}

const saveEdit = () => {
  alert(`School ${selectedSchool.value?.id} updated (password: ${editForm.value.password || 'unchanged'})`)
  editModal.value = false
}

const closeEditModal = () => {
  editModal.value = false
}

const suspendUser = () => {
  if (confirm(`Suspend account for ${editForm.value.name}? The user will not be able to log in until reactivated.`)) {
    editForm.value.status = 'suspended'
    alert(`Account suspended for ${editForm.value.name}`)
  }
}

const unsuspendUser = () => {
  if (confirm(`Reactivate account for ${editForm.value.name}? The user will be able to log in again.`)) {
    editForm.value.status = 'active'
    alert(`Account reactivated for ${editForm.value.name}`)
  }
}

const deleteUser = () => {
  if (confirm(`⚠️ Delete account for ${editForm.value.name}? This action cannot be undone (GDPR compliance).`)) {
    alert(`Account deleted for ${editForm.value.name}`)
    editModal.value = false
    closePanel()
  }
}

const openDeleteConfirm = () => {
  deleteForm.value = { reason: '', file: null }
  deleteModal.value = true
}

const closeDeleteModal = () => {
  deleteModal.value = false
}

const triggerFileUpload = () => {
  deleteFileInput.value?.click()
}

const handleDeleteFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }
    deleteForm.value.file = file
  }
}

const removeDeleteFile = () => {
  deleteForm.value.file = null
  if (deleteFileInput.value) deleteFileInput.value.value = ''
}

const confirmDeleteSchool = () => {
  if (!deleteForm.value.reason.trim()) {
    alert('Please enter a reason for deletion')
    return
  }
  if (confirm(`⚠️ Confirm deletion of ${editForm.value.name}? This action cannot be undone.`)) {
    // Move school to deletedSchools log
    const schoolToDelete = schools.value.find(s => s.id === editForm.value.id)
    if (schoolToDelete) {
      deletedSchools.value.unshift({
        userCode: schoolToDelete.userCode,
        name: schoolToDelete.name,
        contactPerson: schoolToDelete.contactPerson,
        email: schoolToDelete.email,
        phone: schoolToDelete.phone,
        country: schoolToDelete.country,
        deletedAt: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Hong_Kong' }),
        deletedBy: 'Admin',
        reason: deleteForm.value.reason,
        evidenceFile: deleteForm.value.file?.name || null
      })
      // Remove from active schools
      schools.value = schools.value.filter(s => s.id !== editForm.value.id)
    }
    alert(`Account deleted for ${editForm.value.name}`)
    deleteModal.value = false
    editModal.value = false
    closePanel()
  }
}

const toggleMenu = (id: number) => {
  alert(`More options for school ${id} — coming soon`)
}

const closePanel = () => {
  showPanel.value = false
  selectedSchool.value = null
}

const exportSchools = () => {
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

.nav-badge {
  margin-left: auto;
  background: var(--bsp-danger);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}

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
  overflow: hidden;
  margin-bottom: 1rem;
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

.th-expire, .th-apps, .th-actions {
  text-align: center !important;
  padding: 0.875rem 1rem;
}

.td-expire {
  text-align: center !important;
  font-size: 0.85rem;
  color: #64748b;
  font-family: monospace;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.td-apps {
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

.user-avatar {
  font-size: 1.75rem;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50%;
}

.user-name {
  display: block;
  font-weight: 600;
  color: var(--bsp-dark);
  font-size: 0.9rem;
}

.user-email {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
}

.school-name {
  display: block;
  font-weight: 600;
  color: var(--bsp-dark);
  font-size: 0.9rem;
}

.school-name-link {
  color: var(--bsp-primary);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
}

.school-name-link:hover {
  text-decoration: underline;
}

.school-contact {
  display: block;
  font-size: 0.8rem;
  color: #475569;
}

.country-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #eff6ff;
  color: var(--bsp-secondary);
}

.td-expire {
  text-align: center !important;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.expire-ok {
  color: #047857;
  font-weight: 600;
  font-size: 0.85rem;
}

.expire-warning {
  color: #d97706;
  font-weight: 600;
  font-size: 0.85rem;
}

.expire-critical {
  color: #dc2626;
  font-weight: 600;
  font-size: 0.85rem;
}

.expire-expired {
  color: #991b1b;
  font-weight: 600;
  font-size: 0.85rem;
  opacity: 0.7;
}

.expire-tag {
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  margin-left: 0.4rem;
  font-weight: 600;
  display: inline-block;
  vertical-align: middle;
}

.expire-tag-warning {
  background: #fef3c7;
  color: #92400e;
}

.expire-tag-critical {
  background: #fee2e2;
  color: #991b1b;
}

.expire-tag-expired {
  background: #fecaca;
  color: #7f1d1d;
}

.th-expire {
  text-align: center !important;
  padding: 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-bottom: 2px solid #e2e8f0;
  background: #f8fafc;
}

.school-code-inline {
  display: inline-block;
  font-size: 0.7rem;
  color: #94a3b8;
  font-family: monospace;
  background: #f1f5f9;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  margin-top: 0.25rem;
}

.deleted-code {
  background: #fee2e2;
  color: #991b1b;
}

.role-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-personal {
  background: #f0fdf4;
  color: #16a34a;
}

.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-active {
  background: #d1fae5;
  color: #047857;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-expired {
  background: #fee2e2;
  color: #991b1b;
}

.td-date {
  font-size: 0.85rem;
  color: #64748b;
}

.applications-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  max-width: 200px;
}

.applied-badge {
  color: #10b981;
  font-size: 1rem;
  margin-right: 0.25rem;
}

.applied-info {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.applied-phase {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.applied-more {
  font-size: 0.75rem;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

/* Application Popover */
.applied-info {
  position: relative;
  cursor: pointer;
}

.app-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.18);
  min-width: 260px;
  max-width: 320px;
  z-index: 100;
  overflow: hidden;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bsp-primary);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
}

.popover-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.8;
}

.popover-close:hover { opacity: 1; }

.popover-list {
  padding: 0.5rem;
  max-height: 240px;
  overflow-y: auto;
}

.popover-item {
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.35rem;
  background: #f8fafc;
}

.popover-item:last-child { margin-bottom: 0; }

.popover-school {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--bsp-dark);
  margin-bottom: 0.25rem;
}

.popover-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.popover-status {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--bsp-secondary);
  background: #eff6ff;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.popover-date {
  font-size: 0.7rem;
  color: #94a3b8;
}

.not-applied {
  color: #cbd5e1;
  font-size: 1.1rem;
}

.applied-cell {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.applied-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.reg-date {
  font-size: 0.75rem;
  color: #64748b;
}

.applied-info {
  font-size: 0.75rem;
  color: #10b981;
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

.td-actions {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.th-actions {
  text-align: center;
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

/* Panel Applications List */
.panel-app-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.panel-app-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.875rem 1rem;
  border-left: 3px solid var(--bsp-secondary);
}

.panel-app-school {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--bsp-dark);
  margin-bottom: 0.4rem;
}

.panel-app-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.panel-app-status {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--bsp-secondary);
  background: #eff6ff;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.panel-app-date {
  font-size: 0.7rem;
  color: #94a3b8;
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


/* Responsive */
/* Responsive */
@media (max-width: 1024px) {
  .users-table { font-size: 0.85rem; }
  .th-expire, .td-expire { display: none; }
}

@media (max-width: 768px) {
  .sidebar { display: none; }
  .dashboard-body { flex-direction: column; }
  .filter-left { flex-direction: column; }
  .search-box { max-width: 100%; }
  .page-header { flex-direction: column; gap: 1rem; }
  .main-content { padding: 1rem; }

  /* Mobile: horizontal scroll for table */
  .users-table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .users-table { min-width: 500px; }
  .th-expire, .td-expire { display: none; }

  /* Mobile pagination: compact */
  .pagination { flex-direction: column; gap: 0.75rem; align-items: flex-start; }
  .pagination-controls { gap: 0.35rem; flex-wrap: wrap; }
  .btn-page { padding: 0.35rem 0.6rem; font-size: 0.8rem; }
  .pagination-info { font-size: 0.8rem; }
}

/* Edit Modal */
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

.modal-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.5rem 0;
}

.status-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-suspended {
  background: #fef3c7;
  color: #92400e;
}

.status-deleted {
  background: #fee2e2;
  color: #991b1b;
}

.action-menu-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-action-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  padding: 0.6rem 0.875rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--bsp-secondary);
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.btn-action-text:hover {
  background: #f1f5f9;
}

.btn-action-text:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

.btn-action-text.btn-danger {
  color: var(--bsp-danger);
}

.btn-action-text.btn-danger:hover {
  background: #fef2f2;
}

.btn-action-text.btn-success {
  color: var(--bsp-success, #059669);
}

.btn-action-text.btn-success:hover {
  background: #ecfdf5;
}

.btn-icon {
  font-size: 1rem;
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

/* Delete Confirmation Modal */
.delete-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef3c7;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.warning-icon {
  font-size: 1.25rem;
}

.delete-warning p {
  margin: 0;
  color: #92400e;
  font-size: 0.9rem;
  line-height: 1.5;
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

.file-upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.file-upload-area:hover {
  border-color: var(--bsp-secondary, #3b82f6);
  background: #f8fafc;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: #64748b;
}

.upload-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.upload-hint {
  font-size: 0.8rem;
  color: #94a3b8;
}

.file-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--bsp-dark);
}

.file-icon {
  font-size: 1.25rem;
}

.file-name {
  font-weight: 500;
}

.btn-remove-file {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0 0.25rem;
}

.btn-remove-file:hover {
  color: var(--bsp-danger);
}

.form-hint {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.warning-hint {
  color: #d97706;
}

.modal-footer .btn-danger {
  background: var(--bsp-danger);
  color: white;
}

.modal-footer .btn-danger:hover {
  background: #dc2626;
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

.tab-count.deleted {
  background: #fecaca;
  color: #991b1b;
}

.user-code, .user-code-inline {
  font-family: monospace;
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  display: inline-block;
  margin-top: 0.2rem;
}

.user-code.deleted-code {
  background: #fee2e2;
  color: #991b1b;
}

/* Deleted Accounts Table */
.deleted-row {
  background: #fef9f9;
}

.td-deletedat, .td-deletedby, .td-reason, .td-evidence {
  font-size: 0.875rem;
  color: #475569;
}

.th-deletedat, .th-deletedby, .th-reason, .th-evidence {
  font-size: 0.8rem;
}

.reason-text {
  cursor: default;
}

.evidence-file {
  background: #f0fdf4;
  color: #166534;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.no-evidence {
  color: #94a3b8;
}

</style>