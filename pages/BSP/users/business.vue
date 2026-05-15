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
            <NuxtLink to="/BSP/users/business" class="nav-item active">
              <span class="nav-icon">🏢</span>
              <span>Business</span>
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
            <NuxtLink to="/BSP/promo-codes" class="nav-item">
              <span class="nav-icon">🎟️</span>
              <span>Promo Codes</span>
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
            <h1 class="page-title">🏢 Business Users</h1>
            <p class="page-subtitle">Manage Business partner user accounts</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" @click="exportBusinesses">
              📥 Export CSV
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar">
          <button type="button" class="tab-btn" :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'">
            Active Businesses <span class="tab-count">{{ businesses.length }}</span>
          </button>
          <button type="button" class="tab-btn" :class="{ active: activeTab === 'deleted' }" @click="activeTab = 'deleted'">
            Deleted Accounts <span class="tab-count deleted">{{ deletedBusinesses.length }}</span>
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
                placeholder="Search by name, company or email..."
                @input="onSearchInput"
              />
              <button v-if="searchQuery" class="search-clear" @click="clearSearch">×</button>
            </div>
            <select v-model="filterStatus" class="filter-select">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
          <div class="filter-right">
            <span class="result-count">{{ filteredBusinesses.length }} businesses</span>
          </div>
        </div>

        <!-- Users Table -->
        <div class="users-table-wrapper" v-if="activeTab === 'active'">
          <table class="users-table">
            <thead>
              <tr>
                <th class="th-user">Business</th>
                <th class="th-company">Company</th>
                <th class="th-live">Live Application</th>
                <th class="th-partnered">Partnered School</th>
                <th class="th-completed">Completed</th>
                <th class="th-commission">Commission</th>
                <th class="th-status">Status</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="business in paginatedBusinesses" :key="business.id" class="user-row">
                <td class="td-user">
                  <div class="user-info-cell">
                    <div class="user-details">
                      <span class="consultant-name">{{ business.name }}</span>
                      <span class="consultant-contact">{{ business.phone }}</span>
                      <span class="user-email">{{ business.email }}</span>
                      <span class="user-code-inline">ID: {{ business.userCode }}</span>
                    </div>
                  </div>
                </td>
                <td class="td-company">
                  <span class="company-text">{{ business.company }}</span>
                </td>
                <td class="td-live">
                  <span v-if="business.liveApplications > 0" class="live-badge">
                    {{ business.liveApplications }}
                  </span>
                  <span v-else class="not-applied">—</span>
                </td>
                <td class="td-partnered">
                  <span v-if="business.partneredSchools > 0" class="partnered-badge">
                    {{ business.partneredSchools }}
                  </span>
                  <span v-else class="not-applied">—</span>
                </td>
                <td class="td-completed">
                  <span v-if="business.completedApplications > 0" class="completed-badge">
                    {{ business.completedApplications }}
                  </span>
                  <span v-else class="not-applied">—</span>
                </td>
                <td class="td-commission">
                  <span class="commission-amount">{{ business.commission }}</span>
                </td>
                <td class="td-status">
                  <span class="status-badge" :class="'status-' + (business.status || 'active')">
                    {{ business.status || 'active' }}
                  </span>
                </td>
                <td class="td-actions">
                  <div class="action-buttons">
                    <button type="button" class="btn-action btn-view" @click="viewBusiness(business.id)" title="View Details">
                      👁️
                    </button>
                    <button type="button" class="btn-action btn-edit" @click="editBusiness(business.id)" title="Edit">
                      ✏️
                    </button>
                    <button type="button" class="btn-action btn-more" @click="toggleMenu(business.id)" title="More">
                      ⋮
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedBusinesses.length === 0">
                <td colspan="6" class="empty-state">
                  <div class="empty-content">
                    <span class="empty-icon">🏢</span>
                    <p>No businesses found</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <span class="pagination-info">
            Showing {{ paginationStart }}–{{ paginationEnd }} of {{ filteredBusinesses.length }} businesses
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
                <th class="th-user">Business</th>
                <th class="th-company">Company</th>
                <th class="th-deletedat">Deleted At</th>
                <th class="th-deletedby">Deleted By</th>
                <th class="th-reason">Reason</th>
                <th class="th-evidence">Evidence</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in deletedBusinesses" :key="record.userCode" class="user-row deleted-row">
                <td class="td-user">
                  <div class="user-info-cell">
                    <div class="user-details">
                      <span class="consultant-name">{{ record.name }}</span>
                      <span class="user-email">{{ record.email }}</span>
                      <span class="user-code-inline deleted-code">ID: {{ record.userCode }}</span>
                    </div>
                  </div>
                </td>
                <td class="td-company">
                  <span class="company-text">{{ record.company }}</span>
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
          <div v-if="deletedBusinesses.length === 0" class="empty-state">
            No deleted accounts
          </div>
        </div>
      </main>
    </div>

    <!-- Right Side User Detail Panel -->
    <div v-if="showPanel" class="detail-panel-overlay" @click.self="closePanel">
      <div class="detail-panel">
        <div class="panel-header">
          <h2 class="panel-title">Business Details</h2>
          <button class="panel-close" @click="closePanel">×</button>
        </div>
        <div v-if="selectedBusiness" class="panel-body">
          <div class="panel-section">
            <h3 class="section-title">Business Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Business ID</span>
                <span class="info-value">{{ selectedBusiness.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Name</span>
                <span class="info-value">{{ selectedBusiness.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Company</span>
                <span class="info-value">{{ selectedBusiness.company }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ selectedBusiness.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone</span>
                <span class="info-value">{{ selectedBusiness.phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Live Application</span>
                <span class="info-value">{{ selectedBusiness.liveApplications }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Partnered Schools</span>
                <span class="info-value">{{ selectedBusiness.partneredSchools }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Completed</span>
                <span class="info-value">{{ selectedBusiness.completedApplications }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Commission Rate</span>
                <span class="info-value">{{ selectedBusiness.commission }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Registered</span>
                <span class="info-value">{{ selectedBusiness.registeredAt }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Login</span>
                <span class="info-value">{{ selectedBusiness.lastLogin }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status</span>
                <span class="info-value">
                  <span class="status-badge" :class="'status-' + (selectedBusiness.status || 'active')">
                    {{ selectedBusiness.status || 'active' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="panel-footer">
          <button class="btn btn-secondary" @click="closePanel">Close</button>
          <button class="btn btn-primary" @click="editBusiness(selectedBusiness?.id)">Edit</button>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="editModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">Edit Business</h2>
          <button class="modal-close" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input v-model="editForm.name" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Company</label>
            <input v-model="editForm.company" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="editForm.email" type="email" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input v-model="editForm.phone" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Commission Rate (%)</label>
            <input v-model="editForm.commission" type="number" step="0.1" class="form-input" />
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
          <button class="btn btn-danger" @click="confirmDeleteBusiness">Delete Account</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { setMeta } = useSEO()
setMeta({
  title: 'Business Users — BSP Staff',
  description: 'Manage Business partner user accounts',
  path: '/BSP/users/business',
  type: 'website'
})

// Pagination state
const currentPage = ref(1)
const searchQuery = ref('')
const filterStatus = ref('all')
const showPanel = ref(false)
const selectedBusiness = ref<any>(null)
const editModal = ref(false)
const editForm = ref({ name: '', company: '', email: '', phone: '', commission: '', password: '', status: 'active' })
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
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  debouncedQuery.value = ''
}

const itemsPerPage = 10

// Demo data for businesses
const businesses = ref([
  { id: 'BIZ001', name: 'John Smith', email: 'john@acme.co.uk', phone: '+44 20 1234 5678', company: 'Acme Education Ltd', userCode: 'BIZ-2024-001', liveApplications: 3, partneredSchools: 5, completedApplications: 12, commission: '15%', registeredAt: '2024-01-15', lastLogin: '2024-11-20', status: 'active' },
  { id: 'BIZ002', name: 'Sarah Johnson', email: 'sarah@globaledu.com', phone: '+44 16 2345 6789', company: 'Global Education Partners', userCode: 'BIZ-2024-002', liveApplications: 1, partneredSchools: 3, completedApplications: 8, commission: '12%', registeredAt: '2024-02-20', lastLogin: '2024-11-19', status: 'active' },
  { id: 'BIZ003', name: 'Michael Brown', email: 'michael@brightfutures.uk', phone: '+44 77 3456 7890', company: 'Bright Futures UK', userCode: 'BIZ-2024-003', liveApplications: 5, partneredSchools: 8, completedApplications: 25, commission: '18%', registeredAt: '2024-03-10', lastLogin: '2024-11-21', status: 'active' },
  { id: 'BIZ004', name: 'Emma Wilson', email: 'emma@premier-edu.co.uk', phone: '+44 79 4567 8901', company: 'Premier Education Group', userCode: 'BIZ-2024-004', liveApplications: 2, partneredSchools: 4, completedApplications: 15, commission: '14%', registeredAt: '2024-04-05', lastLogin: '2024-11-18', status: 'suspended' },
  { id: 'BIZ005', name: 'David Lee', email: 'david@eduexcel.com', phone: '+44 78 5678 9012', company: 'EduExcel Consulting', userCode: 'BIZ-2024-005', liveApplications: 4, partneredSchools: 6, completedApplications: 20, commission: '16%', registeredAt: '2024-05-12', lastLogin: '2024-11-21', status: 'active' },
])

const deletedBusinesses = ref([
  { name: 'Tom Clark', email: 'tom@oldfirm.com', company: 'Old Firm Ltd', userCode: 'BIZ-2024-010', deletedAt: '2024-10-15', deletedBy: 'Admin', reason: 'Company ceased operations', evidenceFile: 'closure-notice.pdf' },
])

const filteredBusinesses = computed(() => {
  let result = businesses.value
  
  if (debouncedQuery.value) {
    const q = debouncedQuery.value.toLowerCase()
    result = result.filter(b => 
      b.name.toLowerCase().includes(q) ||
      b.company.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q)
    )
  }
  
  if (filterStatus.value !== 'all') {
    result = result.filter(b => b.status === filterStatus.value)
  }
  
  return result
})

const totalPages = computed(() => Math.ceil(filteredBusinesses.value.length / itemsPerPage))

const paginatedBusinesses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredBusinesses.value.slice(start, start + itemsPerPage)
})

const paginationStart = computed(() => {
  if (filteredBusinesses.value.length === 0) return 0
  return (currentPage.value - 1) * itemsPerPage + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, filteredBusinesses.value.length)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i)
    } else if (current >= total - 2) {
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      for (let i = current - 2; i <= current + 2; i++) pages.push(i)
    }
  }
  
  return pages
})

// Watch for page changes to scroll to top
watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

// Actions
const viewBusiness = (id: string) => {
  selectedBusiness.value = businesses.value.find(b => b.id === id)
  showPanel.value = true
}

const closePanel = () => {
  showPanel.value = false
  selectedBusiness.value = null
}

const editBusiness = (id: string | undefined) => {
  if (!id) return
  const business = businesses.value.find(b => b.id === id)
  if (business) {
    editForm.value = { ...business, password: '' }
    editModal.value = true
    showPanel.value = false
  }
}

const closeEditModal = () => {
  editModal.value = false
}

const saveEdit = () => {
  const index = businesses.value.findIndex(b => b.id === editForm.value.id)
  if (index !== -1) {
    businesses.value[index] = { ...businesses.value[index], ...editForm.value }
  }
  closeEditModal()
}

const suspendUser = () => {
  editForm.value.status = 'suspended'
  saveEdit()
}

const unsuspendUser = () => {
  editForm.value.status = 'active'
  saveEdit()
}

const openDeleteConfirm = () => {
  deleteModal.value = true
}

const closeDeleteModal = () => {
  deleteModal.value = false
  deleteForm.value = { reason: '', file: null }
}

const triggerFileUpload = () => {
  deleteFileInput.value?.click()
}

const handleDeleteFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    deleteForm.value.file = input.files[0]
  }
}

const removeDeleteFile = () => {
  deleteForm.value.file = null
}

const confirmDeleteBusiness = () => {
  if (!deleteForm.value.reason) return
  const index = businesses.value.findIndex(b => b.id === editForm.value.id)
  if (index !== -1) {
    const deleted = businesses.value.splice(index, 1)[0]
    deletedBusinesses.value.unshift({
      name: deleted.name,
      email: deleted.email,
      company: deleted.company,
      userCode: deleted.userCode,
      deletedAt: new Date().toISOString().split('T')[0],
      deletedBy: 'Admin',
      reason: deleteForm.value.reason,
      evidenceFile: deleteForm.value.file?.name || ''
    })
  }
  closeDeleteModal()
  closeEditModal()
}

const toggleMenu = (id: string) => {
  // Menu toggle logic
}

const exportBusinesses = () => {
  const headers = ['ID', 'Name', 'Email', 'Company', 'Live Apps', 'Partnered Schools', 'Completed', 'Commission', 'Status']
  const rows = filteredBusinesses.value.map(b => [
    b.userCode, b.name, b.email, b.company, b.liveApplications, b.partneredSchools, b.completedApplications, b.commission, b.status
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'business-users.csv'
  a.click()
}
</script>

<style scoped>
.bsp-dashboard { background: #f0f4f8; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100vh; }
.dashboard-body { display: flex; min-height: 100vh; }
.sidebar { background: #fff; border-right: 1px solid #e2e8f0; flex-shrink: 0; height: 100vh; overflow-y: auto; position: sticky; top: 0; width: 260px; }
.sidebar-nav { padding: 1.5rem 1rem; }
.nav-section { margin-bottom: 1.5rem; }
.nav-section-title { color: #94a3b8; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 0.5rem; padding-left: 0.75rem; text-transform: uppercase; }
.nav-item { align-items: center; border-radius: 8px; color: #475569; cursor: pointer; display: flex; font-size: 0.875rem; font-weight: 500; gap: 0.75rem; padding: 0.6rem 0.75rem; text-decoration: none; transition: all 0.15s; }
.nav-item:hover { background: #f1f5f9; color: #1e3a5f; }
.nav-item.active { background: #1e3a5f; color: #fff; }
.nav-icon { font-size: 1rem; }
.nav-count { color: #94a3b8; font-size: 0.8rem; margin-left: auto; }
.main-content { flex: 1; overflow: auto; padding: 2rem; }
.page-header { align-items: flex-start; display: flex; justify-content: space-between; margin-bottom: 2rem; }
.page-title { color: #1e3a5f; font-size: 1.5rem; font-weight: 700; margin: 0; }
.page-subtitle { color: #64748b; font-size: 0.875rem; margin: 0.25rem 0 0; }
.page-actions { display: flex; gap: 0.75rem; }
.tab-bar { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
.tab-btn { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; color: #64748b; cursor: pointer; font-size: 0.85rem; font-weight: 600; padding: 0.6rem 1.2rem; transition: all 0.15s; }
.tab-btn.active { background: #1e3a5f; border-color: #1e3a5f; color: #fff; }
.tab-count { align-items: center; background: #fef3c7; border-radius: 20px; color: #92400e; display: inline-flex; font-size: 0.7rem; font-weight: 700; height: 20px; justify-content: center; margin-left: 0.4rem; min-width: 20px; padding: 0 6px; }
.tab-count.deleted { background: #fee2e2; color: #991b1b; }
.filter-bar { align-items: center; display: flex; gap: 1rem; margin-bottom: 1rem; }
.filter-left { display: flex; gap: 1rem; flex: 1; }
.search-box { align-items: center; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; flex: 1; gap: 0.5rem; max-width: 400px; padding: 0.5rem 0.75rem; }
.search-icon { color: #94a3b8; font-size: 0.9rem; }
.search-input { background: transparent; border: none; flex: 1; font-size: 0.875rem; outline: none; }
.search-clear { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.25rem; padding: 0; }
.filter-select { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; color: #475569; font-size: 0.875rem; padding: 0.5rem 1rem; }
.result-count { color: #64748b; font-size: 0.875rem; }
.users-table-wrapper { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
.users-table { border-collapse: collapse; width: 100%; }
.users-table th { background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.03em; padding: 0.75rem 1rem; text-align: left; text-transform: uppercase; }
.users-table td { border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 0.875rem; padding: 0.85rem 1rem; vertical-align: middle; }
.user-row:hover { background: #f8fafc; }
.deleted-row { opacity: 0.7; }
.user-info-cell { align-items: center; display: flex; gap: 0.75rem; }
.user-details { display: flex; flex-direction: column; gap: 0.15rem; }
.consultant-name { color: #1e293b; font-weight: 600; }
.consultant-contact { color: #64748b; font-size: 0.8rem; }
.user-email { color: #94a3b8; font-size: 0.8rem; }
.user-code-inline { background: #f1f5f9; border-radius: 4px; color: #64748b; font-size: 0.75rem; padding: 2px 6px; }
.deleted-code { background: #fee2e2; color: #991b1b; }
.company-text { color: #475569; }
.live-badge { background: #dbeafe; border-radius: 20px; color: #1d4ed8; font-size: 0.75rem; font-weight: 600; padding: 3px 10px; }
.partnered-badge { background: #dcfce7; border-radius: 20px; color: #166534; font-size: 0.75rem; font-weight: 600; padding: 3px 10px; }
.completed-badge { background: #fce7f3; border-radius: 20px; color: #9d174d; font-size: 0.75rem; font-weight: 600; padding: 3px 10px; }
.not-applied { color: #94a3b8; }
.commission-amount { color: #059669; font-weight: 600; }
.status-badge { border-radius: 20px; display: inline-flex; font-size: 0.75rem; font-weight: 600; padding: 3px 10px; }
.status-active { background: #dcfce7; color: #166534; }
.status-suspended { background: #fee2e2; color: #991b1b; }
.status-pending { background: #fef3c7; color: #92400e; }
.action-buttons { align-items: center; display: flex; gap: 0.5rem; }
.btn-action { align-items: center; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; display: flex; font-size: 0.9rem; height: 32px; justify-content: center; transition: all 0.15s; width: 32px; }
.btn-action:hover { background: #f1f5f9; }
.btn-view:hover { background: #dbeafe; }
.btn-edit:hover { background: #fef3c7; }
.empty-state { padding: 3rem; text-align: center; }
.empty-content { align-items: center; display: flex; flex-direction: column; gap: 0.5rem; }
.empty-icon { font-size: 2.5rem; }
.empty-content p { color: #94a3b8; font-size: 0.9rem; margin: 0; }
.pagination { align-items: center; display: flex; justify-content: space-between; margin-top: 1.5rem; padding: 1rem 0; }
.pagination-info { color: #64748b; font-size: 0.875rem; }
.pagination-controls { display: flex; gap: 0.5rem; }
.btn-page { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; color: #475569; cursor: pointer; font-size: 0.875rem; padding: 0.5rem 1rem; transition: all 0.15s; }
.btn-page:hover:not(:disabled) { background: #f1f5f9; }
.btn-page.active { background: #1e3a5f; border-color: #1e3a5f; color: #fff; }
.btn-page:disabled { cursor: not-allowed; opacity: 0.5; }
.detail-panel-overlay { align-items: center; background: rgba(0,0,0,0.4); display: flex; inset: 0; justify-content: flex-end; position: fixed; z-index: 100; }
.detail-panel { background: #fff; box-shadow: -4px 0 20px rgba(0,0,0,0.1); display: flex; flex-direction: column; height: 100vh; overflow-y: auto; width: 420px; }
.panel-header { align-items: center; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; padding: 1.25rem 1.5rem; position: sticky; top: 0; }
.panel-title { color: #1e3a5f; font-size: 1rem; font-weight: 700; margin: 0; }
.panel-close { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.5rem; line-height: 1; padding: 0; }
.panel-close:hover { color: #1e3a5f; }
.panel-body { flex: 1; overflow-y: auto; padding: 1.5rem; }
.panel-section { margin-bottom: 1.5rem; }
.section-title { color: #64748b; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 1rem; text-transform: uppercase; }
.info-grid { display: grid; gap: 0.75rem; grid-template-columns: 1fr 1fr; }
.info-item { display: flex; flex-direction: column; gap: 0.2rem; }
.info-label { color: #94a3b8; font-size: 0.75rem; }
.info-value { color: #1e3a5f; font-size: 0.875rem; font-weight: 600; }
.panel-footer { border-top: 1px solid #e2e8f0; display: flex; gap: 0.75rem; padding: 1rem 1.5rem; }
.modal-overlay { align-items: center; background: rgba(0,0,0,0.5); display: flex; inset: 0; justify-content: center; padding: 1rem; position: fixed; z-index: 200; }
.modal-box { background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); max-width: 440px; width: 100%; }
.modal-header { align-items: center; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; padding: 1.25rem 1.5rem; }
.modal-title { color: #1e3a5f; font-size: 1rem; font-weight: 700; margin: 0; }
.modal-close { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.5rem; line-height: 1; padding: 0; }
.modal-close:hover { color: #1e3a5f; }
.modal-body { padding: 1.5rem; }
.modal-footer { border-top: 1px solid #e2e8f0; display: flex; gap: 0.75rem; justify-content: flex-end; padding: 1rem 1.5rem; }
.form-group { margin-top: 0.75rem; }
.form-label { color: #374151; display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.4rem; }
.label-hint { color: #94a3b8; font-weight: 400; }
.required { color: #ef4444; }
.form-input { border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; font-family: inherit; font-size: 0.875rem; padding: 0.75rem; width: 100%; }
.form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); outline: none; }
.form-textarea { border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; font-family: inherit; font-size: 0.875rem; padding: 0.75rem; resize: vertical; width: 100%; }
.form-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); outline: none; }
.delete-warning { align-items: center; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; color: #991b1b; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; padding: 1rem; text-align: center; }
.warning-icon { font-size: 2rem; }
.delete-warning p { font-size: 0.9rem; margin: 0; }
.file-upload-area { background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 8px; cursor: pointer; padding: 1.5rem; text-align: center; transition: all 0.15s; }
.file-upload-area:hover { border-color: #3b82f6; background: #f0f9ff; }
.upload-placeholder { align-items: center; display: flex; flex-direction: column; gap: 0.25rem; }
.upload-icon { font-size: 1.5rem; }
.upload-hint { color: #94a3b8; font-size: 0.8rem; }
.file-selected { align-items: center; display: flex; gap: 0.5rem; justify-content: center; }
.file-icon { font-size: 1.25rem; }
.file-name { color: #1e3a5f; font-size: 0.875rem; }
.btn-remove-file { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.25rem; padding: 0; }
.btn-remove-file:hover { color: #ef4444; }
.form-hint { color: #64748b; font-size: 0.8rem; margin-top: 0.5rem; }
.warning-hint { color: #d97706; }
.btn { border: none; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 600; padding: 0.6rem 1.2rem; transition: all 0.15s; }
.btn-primary { background: #1e3a5f; color: #fff; }
.btn-primary:hover { background: #2d4a6f; }
.btn-secondary { background: #f1f5f9; color: #475569; }
.btn-secondary:hover { background: #e2e8f0; }
.btn-danger { background: #ef4444; color: #fff; }
.btn-danger:hover { background: #dc2626; }
.btn-action-text { align-items: center; background: none; border: none; color: #475569; cursor: pointer; display: flex; font-size: 0.875rem; gap: 0.5rem; padding: 0.5rem; transition: all 0.15s; width: 100%; }
.btn-action-text:hover { background: #f1f5f9; border-radius: 6px; }
.btn-action-text.btn-success { color: #059669; }
.btn-action-text.btn-danger { color: #ef4444; }
.btn-icon { font-size: 1rem; }
.modal-divider { border-top: 1px solid #e2e8f0; margin: 1rem 0; }
.status-display { align-items: center; display: flex; gap: 0.5rem; }
</style>
