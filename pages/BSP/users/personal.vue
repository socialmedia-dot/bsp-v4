<template>
  <div class="bsp-dashboard">
    <div class="dashboard-body">
      <!-- Left Sidebar Navigation -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">User Categories</div>
            <NuxtLink to="/BSP/users/personal" class="nav-item active">
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
            <h1 class="page-title">👤 Personal Users</h1>
            <p class="page-subtitle">Manage Personal user accounts</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" @click="exportUsers">
              📥 Export CSV
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar">
          <button class="tab-btn" :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'">
            Active Users <span class="tab-count">{{ users.length }}</span>
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'deleted' }" @click="activeTab = 'deleted'">
            Deleted Accounts <span class="tab-count deleted">{{ deletedUsers.length }}</span>
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
            <select v-model="filterHasApp" class="filter-select">
              <option value="all">All</option>
              <option value="applied">Applied</option>
              <option value="notapplied">Not Applied</option>
            </select>
          </div>
          <div class="filter-right">
            <span class="result-count">{{ filteredUsers.length }} users</span>
          </div>
        </div>

        <!-- Users Table -->
        <div class="users-table-wrapper" v-if="activeTab === 'active'">
          <table class="users-table">
            <thead>
              <tr>
                <th class="th-user">User</th>
                <th class="th-regdate">Reg. Date</th>
                <th class="th-lastlogin">Last Login</th>
                <th class="th-apps">Application Status</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedUsers" :key="user.id" class="user-row">
                <td class="td-user">
                  <div class="user-info-cell">
                    <div class="user-details">
                      <span class="user-name">{{ user.name }}</span>
                      <span class="user-email">{{ user.email }}</span>
                      <span class="user-code-inline">ID: {{ user.userCode }}</span>
                    </div>
                  </div>
                </td>
                <td class="td-regdate">{{ user.registeredAt }}</td>
                <td class="td-lastlogin">{{ user.lastLogin }}</td>
                <td class="td-apps">
                  <span v-if="user.applications.length > 0" class="applied-info" @click.stop="viewUser(user.id)">
                    <span class="applied-badge">✓</span>
                    <span class="applied-phase">{{ user.applications[0].status }}</span>
                    <span v-if="user.applications.length > 1" class="applied-more">+{{ user.applications.length - 1 }}</span>
                  </span>
                  <span v-else class="not-applied">—</span>
                </td>
                <td class="td-actions">
                  <div class="action-buttons">
                    <button class="btn-action btn-view" @click="viewUser(user.id)" title="View Details">
                      👁️
                    </button>
                    <button class="btn-action btn-edit" @click="editUser(user.id)" title="Edit">
                      ✏️
                    </button>
                    <button class="btn-action btn-more" @click="toggleMenu(user.id)" title="More">
                      ⋮
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedUsers.length === 0">
                <td colspan="5" class="empty-state">
                  <div class="empty-content">
                    <span class="empty-icon">👤</span>
                    <p>No users found</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <span class="pagination-info">
            Showing {{ paginationStart }}–{{ paginationEnd }} of {{ filteredUsers.length }} users
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
              <tr v-for="record in deletedUsers" :key="record.userCode" class="user-row deleted-row">
                <td class="td-user">
                  <div class="user-info-cell">
                    <div class="user-details">
                      <span class="user-name">{{ record.name }}</span>
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
          <div v-if="deletedUsers.length === 0" class="empty-state">
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
        <div v-if="selectedUser" class="panel-body">
          <div class="panel-section">
            <h3 class="section-title">Basic Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">User ID</span>
                <span class="info-value">{{ selectedUser.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Name</span>
                <span class="info-value">{{ selectedUser.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ selectedUser.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Registered</span>
                <span class="info-value">{{ selectedUser.registeredAt }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Login</span>
                <span class="info-value">{{ selectedUser.lastLogin }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Applications</span>
                <span class="info-value">{{ selectedUser.applications.length }}</span>
              </div>
            </div>
          </div>
          <!-- Applications List in Panel -->
          <div v-if="selectedUser.applications.length > 0" class="panel-section">
            <h3 class="section-title">Applications</h3>
            <div class="panel-app-list">
              <div v-for="(app, idx) in selectedUser.applications" :key="idx" class="panel-app-item">
                <div class="panel-app-school">{{ app.school }}</div>
                <div class="panel-app-meta">
                  <span class="panel-app-status">{{ app.status }}</span>
                  <span class="panel-app-date">{{ app.appliedAt }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="panel-footer">
          <button class="btn btn-secondary" @click="closePanel">Close</button>
          <button class="btn btn-primary" @click="editUser(selectedUser?.id)">Edit</button>
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
            <label class="form-label">Name</label>
            <input v-model="editForm.name" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="editForm.email" type="email" class="form-input" />
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
          <button class="btn btn-danger" @click="confirmDeleteUser">Delete Account</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { setMeta } = useSEO()
setMeta({
  title: 'Personal Users — BSP Staff',
  description: 'Manage Personal user accounts',
  path: '/BSP/users/personal',
  type: 'website'
})

// Pagination state
const currentPage = ref(1)
const searchQuery = ref('')
const filterHasApp = ref('all')
const showPanel = ref(false)
const selectedUser = ref<any>(null)
const editModal = ref(false)
const editForm = ref({ name: '', email: '', password: '', status: 'active' })
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

// Helper: generate date-based user code
// Format: YYYYMMDD + 5-digit daily sequence
const dailyCount: Record<string, number> = {}
const generateUserCode = (dateStr: string): string => {
  const datePart = dateStr.replace(/-/g, '')
  dailyCount[datePart] = (dailyCount[datePart] || 0) + 1
  return `${datePart}${String(dailyCount[datePart]).padStart(5, '0')}`
}

// Pre-populate counts so new codes continue sequentially
dailyCount['20250601'] = 1  // David Lee
dailyCount['20260115'] = 1  // John Smith
dailyCount['20260220'] = 1  // Emma Wilson
dailyCount['20260310'] = 1  // Michael Brown
dailyCount['20260315'] = 1  // Sarah Johnson
dailyCount['20260401'] = 1  // Lisa Wang
dailyCount['20260418'] = 1  // James Taylor
dailyCount['20260419'] = 1  // Alice Chen
dailyCount['20260420'] = 1  // Robert Kim (2026-04-20)
dailyCount['20260421'] = 1  // Sophie Turner (2026-04-21)

const users = ref([
  { id: 1, userCode: '2026011500001', name: 'John Smith', email: 'john.smith@email.com', registeredAt: '2026-01-15', lastLogin: '2026-04-19 14:32', applications: [{ school: "St. Mary's School", status: 'Interview', appliedAt: '2026-01-20' }, { school: "King's College", status: 'Accept offer', appliedAt: '2026-01-22' }], phone: '+44 7700 900123', country: 'United Kingdom', status: 'active' },
  { id: 2, userCode: '2026022000001', name: 'Emma Wilson', email: 'emma.w@email.com', registeredAt: '2026-02-20', lastLogin: '2026-04-18 09:15', applications: [{ school: 'Brighton College', status: 'Applied', appliedAt: '2026-02-25' }], phone: '+44 7700 900456', country: 'United Kingdom', status: 'active' },
  { id: 3, userCode: '2026031000001', name: 'Michael Brown', email: 'm.brown@email.com', registeredAt: '2026-03-10', lastLogin: '2026-04-15 16:45', applications: [], phone: '+44 7700 900789', country: 'United Kingdom', status: 'active' },
  { id: 4, userCode: '2026031500001', name: 'Sarah Johnson', email: 'sarah.j@email.com', registeredAt: '2026-03-15', lastLogin: '2026-04-19 11:20', applications: [{ school: 'Harrow School', status: 'Offering', appliedAt: '2026-03-18' }, { school: 'Cheltenham College', status: 'Interview', appliedAt: '2026-03-20' }, { school: 'Rugby School', status: 'Accept offer', appliedAt: '2026-03-22' }], phone: '+44 7700 900321', country: 'Hong Kong', status: 'active' },
  { id: 5, userCode: '2025060100001', name: 'David Lee', email: 'david.lee@email.com', registeredAt: '2025-06-01', lastLogin: '2026-04-10 08:00', applications: [{ school: "St. Paul's School", status: 'Process complete', appliedAt: '2025-06-05' }], phone: '+852 9123 4567', country: 'Hong Kong', status: 'active' },
  { id: 6, userCode: '2026040100001', name: 'Lisa Wang', email: 'lisa.wang@email.com', registeredAt: '2026-04-01', lastLogin: '2026-04-19 17:30', applications: [{ school: 'Downe House', status: 'Interview', appliedAt: '2026-04-05' }, { school: "Cheltenham Ladies' College", status: 'Offering', appliedAt: '2026-04-08' }], phone: '+852 9876 5432', country: 'Hong Kong', status: 'active' },
  { id: 7, userCode: '2026041800001', name: 'James Taylor', email: 'j.taylor@email.com', registeredAt: '2026-04-18', lastLogin: '2026-04-18 12:00', applications: [], phone: '+44 7700 900111', country: 'United Kingdom', status: 'suspended' },
  { id: 8, userCode: '2026041900001', name: 'Alice Chen', email: 'alice.chen@email.com', registeredAt: '2026-04-19', lastLogin: '2026-04-19 20:15', applications: [{ school: 'Wycombe Abbey', status: 'Interview', appliedAt: '2026-04-20' }], phone: '+852 6543 2109', country: 'Hong Kong', status: 'active' },
  { id: 9, userCode: '2026042000001', name: 'Robert Kim', email: 'r.kim@email.com', registeredAt: '2026-04-20', lastLogin: '—', applications: [], phone: '+852 1234 5678', country: 'Hong Kong', status: 'active' },
  { id: 10, userCode: '2026042100001', name: 'Sophie Turner', email: 'sophie.t@email.com', registeredAt: '2026-04-21', lastLogin: '2026-04-19 10:45', applications: [{ school: 'Benenden School', status: 'Applied', appliedAt: '2026-04-22' }], phone: '+44 7700 900555', country: 'United Kingdom', status: 'active' },
])

// Deleted accounts log
const deletedUsers = ref([
  {
    userCode: '2026041800002',
    name: 'Tom Wilson',
    email: 'tom.w@email.com',
    phone: '+44 7700 900666',
    country: 'United Kingdom',
    deletedAt: '2026-04-18 15:30',
    deletedBy: 'Admin',
    reason: 'User requested account deletion via email',
    evidenceFile: 'deletion-request-email.pdf'
  }
])

// Watch filter changes to reset page
watch(filterHasApp, () => {
  currentPage.value = 1
})

const filteredUsers = computed(() => {
  let result = users.value
  
  if (debouncedQuery.value) {
    const q = debouncedQuery.value.toLowerCase()
    result = result.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q)
    )
  }
  
  if (filterHasApp.value === 'applied') {
    result = result.filter(u => u.applications.length > 0)
  } else if (filterHasApp.value === 'notapplied') {
    result = result.filter(u => u.applications.length === 0)
  }
  
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / pageSize.value)))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

const paginationStart = computed(() => {
  if (filteredUsers.value.length === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * pageSize.value, filteredUsers.value.length)
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

const viewUser = (id: number) => {
  selectedUser.value = users.value.find(u => u.id === id)
  showPanel.value = true
}

const editUser = (id: number) => {
  const user = users.value.find(u => u.id === id)
  if (user) {
    editForm.value = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      status: user.status || 'active'
    }
    editModal.value = true
  }
}

const saveEdit = () => {
  alert(`User ${selectedUser.value?.id} updated (password: ${editForm.value.password || 'unchanged'})`)
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

const confirmDeleteUser = () => {
  if (!deleteForm.value.reason.trim()) {
    alert('Please enter a reason for deletion')
    return
  }
  if (confirm(`⚠️ Confirm deletion of ${editForm.value.name}? This action cannot be undone.`)) {
    // Move user to deletedUsers log
    const userToDelete = users.value.find(u => u.id === editForm.value.id)
    if (userToDelete) {
      deletedUsers.value.unshift({
        userCode: userToDelete.userCode,
        name: userToDelete.name,
        email: userToDelete.email,
        phone: userToDelete.phone,
        country: userToDelete.country,
        deletedAt: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Hong_Kong' }),
        deletedBy: 'Admin',
        reason: deleteForm.value.reason,
        evidenceFile: deleteForm.value.file?.name || null
      })
      // Remove from active users
      users.value = users.value.filter(u => u.id !== editForm.value.id)
    }
    alert(`Account deleted for ${editForm.value.name}`)
    deleteModal.value = false
    editModal.value = false
    closePanel()
  }
}

const toggleMenu = (id: number) => {
  alert(`More options for user ${id} — coming soon`)
}

const closePanel = () => {
  showPanel.value = false
  selectedUser.value = null
}

const exportUsers = () => {
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

.th-regdate, .th-lastlogin, .th-apps, .th-actions {
  text-align: center !important;
  padding: 0.875rem 1rem;
}

.td-regdate, .td-lastlogin {
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
  .th-regdate, .td-regdate, .th-lastlogin, .td-lastlogin { display: none; }
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
  .th-regdate, .td-regdate, .th-lastlogin, .td-lastlogin { display: none; }

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