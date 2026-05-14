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
            <NuxtLink to="/BSP/new-account-applications" class="nav-item">
              <span class="nav-icon">📋</span>
              <span>New Account Applications</span>
            </NuxtLink>
            <NuxtLink to="/BSP/payments" class="nav-item active">
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
            <h1 class="page-title">💳 Payment Management TEST</h1>
            <p class="page-subtitle">View and manage all member payment records</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" @click="exportPayments">
              📥 Export CSV
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card">
            <span class="summary-label">Total Revenue</span>
            <span class="summary-value">£{{ totalRevenue.toLocaleString() }}</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Paid This Month</span>
            <span class="summary-value">£{{ paidThisMonth.toLocaleString() }}</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Pending</span>
            <span class="summary-value pending">{{ pendingCount }}</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Overdue</span>
            <span class="summary-value overdue">{{ overdueCount }}</span>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar">
          <button type="button" class="tab-btn" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
            All Payments <span class="tab-count">{{ payments.length }}</span>
          </button>
          <button type="button" class="tab-btn" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">
            Pending <span class="tab-count pending">{{ pendingCount }}</span>
          </button>
          <button type="button" class="tab-btn" :class="{ active: activeTab === 'paid' }" @click="activeTab = 'paid'">
            Paid <span class="tab-count paid">{{ paidCount }}</span>
          </button>
          <button type="button" class="tab-btn" :class="{ active: activeTab === 'overdue' }" @click="activeTab = 'overdue'">
            Overdue <span class="tab-count overdue">{{ overdueCount }}</span>
          </button>
        </div>

        <!-- Filters -->
        <div class="filter-bar">
          <div class="filter-left">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input 
                v-model="searchQuery" 
                type="text" 
                class="search-input" 
                placeholder="Search by name, email or invoice..."
                @input="onSearchInput"
              />
              <button v-if="searchQuery" class="search-clear" @click="clearSearch">×</button>
            </div>
            <select v-model="filterType" class="filter-select">
              <option value="all">All Types</option>
              <option value="school">School</option>
              <option value="consultant">Consultant</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <div class="filter-right">
            <span class="result-count">{{ filteredPayments.length }} records</span>
          </div>
        </div>

        <!-- Payments Table -->
        <div class="users-table-wrapper">
          <table class="users-table">
            <thead>
              <tr>
                <th class="th-user">Member</th>
                <th class="th-code">User Code</th>
                <th class="th-type">Type</th>
                <th class="th-invoice">Invoice #</th>
                <th class="th-amount">Amount</th>
                <th class="th-period">Period</th>
                <th class="th-status">Status</th>
                <th class="th-date">Due Date</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in paginatedPayments" :key="payment.id" class="user-row">
                <td class="td-user">
                  <div class="user-info-cell">
                    <div class="user-details">
                      <span class="member-name">{{ payment.name }}</span>
                      <span class="member-email">{{ payment.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="td-code">
                  <span class="user-code">{{ payment.userCode }}</span>
                </td>
                <td class="td-type">
                  <span class="type-badge" :class="'type-' + payment.userType">{{ payment.userType }}</span>
                </td>
                <td class="td-invoice">
                  <span class="invoice-code">{{ payment.invoiceNo }}</span>
                </td>
                <td class="td-amount">
                  <span class="amount">£{{ payment.amount }}</span>
                </td>
                <td class="td-period">{{ payment.period }}</td>
                <td class="td-status">
                  <span class="status-badge" :class="'status-' + payment.status">{{ payment.status }}</span>
                </td>
                <td class="td-date">
                  <div class="due-date-cell">
                    <span class="due-date">{{ payment.membershipExpire || '—' }}</span>
                    <span v-if="payment.status === 'paid' && payment.date" class="paid-on">· Paid {{ payment.date }}</span>
                  </div>
                </td>
                <td class="td-actions">
                  <div class="action-buttons">
                    <button type="button" class="btn-action btn-view" @click="viewPayment(payment.id)" title="View Details">👁️</button>
                    <button type="button" v-if="payment.status === 'pending' || payment.status === 'overdue'" class="btn-action btn-edit" @click="openMarkPaid(payment.id)" title="Mark as Paid">✅</button>
                    <button type="button" v-if="payment.status === 'pending' || payment.status === 'overdue'" class="btn-action btn-more" @click="openReminder(payment.id)" title="Send Reminder">🔔</button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedPayments.length === 0">
                <td colspan="9" class="empty-state">
                  <div class="empty-content">
                    <span class="empty-icon">💳</span>
                    <p>No payment records found</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <span class="pagination-info">
            Showing {{ paginationStart }}–{{ paginationEnd }} of {{ filteredPayments.length }} records
          </span>
          <div class="pagination-controls">
            <button class="btn-page" :disabled="currentPage === 1" @click="currentPage--">← Previous</button>
            <button v-for="page in visiblePages" :key="page" class="btn-page" :class="{ active: page === currentPage }" @click="currentPage = page">{{ page }}</button>
            <button class="btn-page" :disabled="currentPage === totalPages" @click="currentPage++">Next →</button>
          </div>
        </div>
      </main>
    </div>

    <!-- Payment Detail Panel (Right Side) -->
    <div v-if="showDetailPanel" class="detail-panel-overlay" @click.self="closeDetailPanel">
      <div class="detail-panel">
        <div class="panel-header">
          <h2 class="panel-title">💳 Payment Details</h2>
          <button class="panel-close" @click="closeDetailPanel">×</button>
        </div>
        <div v-if="selectedPayment" class="panel-body">
          <div class="panel-section">
            <h3 class="section-title">Invoice Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Invoice Number</span>
                <span class="info-value">{{ selectedPayment.invoiceNo }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Amount</span>
                <span class="info-value">£{{ selectedPayment.amount }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Period</span>
                <span class="info-value">{{ selectedPayment.period }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status</span>
                <span class="info-value">
                  <span class="status-badge" :class="'status-' + selectedPayment.status">{{ selectedPayment.status }}</span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Payment Date</span>
                <span class="info-value">{{ selectedPayment.date || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Membership Expire</span>
                <span class="info-value" :class="'expire-' + getExpireStatus(selectedPayment.membershipExpire)">{{ selectedPayment.membershipExpire }}</span>
              </div>
            </div>
          </div>
          <div class="panel-section">
            <h3 class="section-title">Payer Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name</span>
                <span class="info-value">{{ selectedPayment.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ selectedPayment.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">User Type</span>
                <span class="info-value">
                  <span class="type-badge" :class="'type-' + selectedPayment.userType">{{ selectedPayment.userType }}</span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">User Code</span>
                <span class="info-value code-value">{{ selectedPayment.userCode }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="panel-footer">
          <button class="btn btn-secondary" @click="closeDetailPanel">Close</button>
          <button v-if="selectedPayment && (selectedPayment.status === 'pending' || selectedPayment.status === 'overdue')" class="btn btn-primary" @click="closeDetailPanel; openMarkPaid(selectedPayment.id)">Mark as Paid</button>
        </div>
      </div>
    </div>

    <!-- Mark as Paid Confirmation Modal -->
    <div v-if="showMarkPaidModal" class="modal-overlay" @click.self="cancelMarkPaid">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">Confirm Payment</h2>
          <button class="modal-close" @click="cancelMarkPaid">×</button>
        </div>
        <div class="modal-body">
          <div class="confirm-message">
            <span class="confirm-icon">✅</span>
            <p>Are you sure you want to mark invoice <strong>{{ payments.find(p => p.id === markPaidId)?.invoiceNo }}</strong> as <strong>paid</strong>?</p>
            <p class="confirm-sub">This action will record today's date as the payment date.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelMarkPaid">Cancel</button>
          <button class="btn btn-success" @click="confirmMarkPaid">Confirm Paid</button>
        </div>
      </div>
    </div>

    <!-- Send Reminder Modal -->
    <div v-if="showReminderModal" class="modal-overlay" @click.self="cancelReminder">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">🔔 Send Payment Reminder</h2>
          <button class="modal-close" @click="cancelReminder">×</button>
        </div>
        <div class="modal-body">
          <div class="reminder-info">
            <p><strong>To:</strong> {{ reminderPayment?.name }} &lt;{{ reminderPayment?.email }}&gt;</p>
            <p><strong>Invoice:</strong> {{ reminderPayment?.invoiceNo }} (£{{ reminderPayment?.amount }})</p>
          </div>
          <div class="form-group">
            <label class="form-label">Reminder Message</label>
            <textarea v-model="reminderMessage" class="form-textarea" rows="6"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Send Via</label>
            <div class="send-options">
              <label class="send-option"><input type="checkbox" checked> Email</label>
              <label class="send-option"><input type="checkbox"> In-app Notification</label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelReminder">Cancel</button>
          <button class="btn btn-primary" @click="sendReminder">Send Reminder</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchQuery = ref('')
const filterType = ref('all')
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)

// Debounced search
let searchTimer: ReturnType<typeof setTimeout>
const debouncedQuery = ref('')
const onSearchInput = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedQuery.value = searchQuery.value
    currentPage.value = 1
  }, 300)
}
const clearSearch = () => {
  searchQuery.value = ''
  debouncedQuery.value = ''
  currentPage.value = 1
}

// Helper: get expiry status
const getExpireStatus = (dateStr: string): string => {
  if (!dateStr || dateStr === '—') return 'ok'
  const now = new Date()
  const expire = new Date(dateStr)
  const days = Math.ceil((expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'expired'
  if (days <= 7) return 'critical'
  if (days <= 30) return 'warning'
  return 'ok'
}

// Mock payment data
const payments = ref([
  { id: 1, name: "St. Mary's School", email: 'finance@stmarys.edu.uk', userCode: '2026011500001', userType: 'school', invoiceNo: 'INV-2026-001', amount: 299, period: '2026 Annual', status: 'paid', date: '2026-01-15', membershipExpire: '2026-10-01' },
  { id: 2, name: 'Brighton College', email: 'admissions@brightoncollege.edu.uk', userCode: '2026022000001', userType: 'school', invoiceNo: 'INV-2026-002', amount: 299, period: '2026 Annual', status: 'paid', date: '2026-02-20', membershipExpire: '2026-10-01' },
  { id: 3, name: 'Victoria Education Group', email: 'victoria@vedu.com.hk', userCode: '2026011000001', userType: 'consultant', invoiceNo: 'INV-2026-003', amount: 199, period: '2026 Annual', status: 'pending', date: '—', membershipExpire: '2026-10-01' },
  { id: 4, name: 'UK Study Link', email: 'james@ukstudylink.com', userCode: '2026022500001', userType: 'consultant', invoiceNo: 'INV-2026-004', amount: 199, period: '2026 Annual', status: 'pending', date: '—', membershipExpire: '2026-10-01' },
  { id: 5, name: 'Mr. Alan Foster', email: 'alan@ukboarding.com', userCode: 'P2026030100001', userType: 'personal', invoiceNo: 'INV-2026-005', amount: 99, period: '2026 Annual', status: 'overdue', date: '—', membershipExpire: '2026-10-01' },
  { id: 6, name: 'Elite Education Consultancy', email: 'sarah@eliteedu.hk', userCode: '2026031200001', userType: 'consultant', invoiceNo: 'INV-2026-006', amount: 199, period: '2026 Annual', status: 'paid', date: '2026-03-12', membershipExpire: '2026-10-01' },
  { id: 7, name: 'Global Study Partners', email: 'emma@globalstudy.hk', userCode: '2026041500001', userType: 'consultant', invoiceNo: 'INV-2026-007', amount: 199, period: '2026 Annual', status: 'pending', date: '—', membershipExpire: '2026-10-01' },
  { id: 8, name: 'Harrow School', email: 'harrow@harrowschool.org.uk', userCode: '2025060100001', userType: 'school', invoiceNo: 'INV-2026-008', amount: 299, period: '2026 Annual', status: 'paid', date: '2026-03-01', membershipExpire: '2027-10-01' },
  { id: 9, name: 'Eton College', email: 'admissions@etoncollege.org.uk', userCode: '2026041800001', userType: 'school', invoiceNo: 'INV-2026-009', amount: 299, period: '2026 Annual', status: 'overdue', date: '—', membershipExpire: '2026-10-01' },
  { id: 10, name: 'British Education HK', email: 'david@briteduhk.com', userCode: '2026040500001', userType: 'consultant', invoiceNo: 'INV-2026-010', amount: 199, period: '2026 Annual', status: 'paid', date: '2026-04-05', membershipExpire: '2026-10-01' },
  { id: 11, name: 'Wellington College', email: 'info@wellingtoncollege.org.uk', userCode: '2026031000001', userType: 'school', invoiceNo: 'INV-2026-011', amount: 299, period: '2026 Annual', status: 'pending', date: '—', membershipExpire: '2026-10-01' },
  { id: 12, name: "St. Paul's School", email: 'admissions@stpaulsschool.org.uk', userCode: '2026042100001', userType: 'school', invoiceNo: 'INV-2026-012', amount: 299, period: '2026 Annual', status: 'paid', date: '2026-04-10', membershipExpire: '2026-10-01' }
])

// Computed stats
const totalRevenue = computed(() => payments.value.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0))
const paidThisMonth = computed(() => {
  const now = new Date()
  return payments.value.filter(p => p.status === 'paid' && p.date.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)).reduce((sum, p) => sum + p.amount, 0)
})
const pendingCount = computed(() => payments.value.filter(p => p.status === 'pending').length)
const paidCount = computed(() => payments.value.filter(p => p.status === 'paid').length)
const overdueCount = computed(() => payments.value.filter(p => p.status === 'overdue').length)

// Filtered by tab + search + type
const filteredPayments = computed(() => {
  let result = payments.value

  if (activeTab.value !== 'all') {
    result = result.filter(p => p.status === activeTab.value)
  }

  if (debouncedQuery.value) {
    const q = debouncedQuery.value.toLowerCase()
    result = result.filter(p => 
      p.userCode.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) || 
      p.email.toLowerCase().includes(q) ||
      p.invoiceNo.toLowerCase().includes(q)
    )
  }

  if (filterType.value !== 'all') {
    result = result.filter(p => p.userType === filterType.value)
  }

  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPayments.value.length / pageSize.value)))

const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredPayments.value.slice(start, start + pageSize.value)
})

const paginationStart = computed(() => filteredPayments.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1)
const paginationEnd = computed(() => Math.min(currentPage.value * pageSize.value, filteredPayments.value.length))

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else if (current <= 4) {
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
  return pages
})

// Detail Panel
const showDetailPanel = ref(false)
const selectedPayment = ref<typeof payments.value[0] | null>(null)

const viewPayment = (id: number) => {
  const p = payments.value.find(x => x.id === id)
  if (p) {
    selectedPayment.value = p
    showDetailPanel.value = true
  }
}

const closeDetailPanel = () => {
  showDetailPanel.value = false
  selectedPayment.value = null
}

// Mark as Paid Modal
const showMarkPaidModal = ref(false)
const markPaidId = ref<number | null>(null)

const openMarkPaid = (id: number) => {
  markPaidId.value = id
  showMarkPaidModal.value = true
}

const confirmMarkPaid = () => {
  const p = payments.value.find(x => x.id === markPaidId.value)
  if (p) {
    p.status = 'paid'
    p.date = new Date().toISOString().split('T')[0]
  }
  showMarkPaidModal.value = false
  markPaidId.value = null
}

const cancelMarkPaid = () => {
  showMarkPaidModal.value = false
  markPaidId.value = null
}

// Send Reminder Modal
const showReminderModal = ref(false)
const reminderPayment = ref<typeof payments.value[0] | null>(null)
const reminderMessage = ref('')

const openReminder = (id: number) => {
  const p = payments.value.find(x => x.id === id)
  if (p) {
    reminderPayment.value = p
    reminderMessage.value = `Dear ${p.name},\n\nThis is a friendly reminder that payment for invoice ${p.invoiceNo} (\u00a3${p.amount}) is still pending.\n\nPlease settle at your earliest convenience.\n\nBest regards,\nBSP Finance Team`
    showReminderModal.value = true
  }
}

const sendReminder = () => {
  showReminderModal.value = false
  reminderPayment.value = null
  reminderMessage.value = ''
}

const cancelReminder = () => {
  showReminderModal.value = false
  reminderPayment.value = null
  reminderMessage.value = ''
}

const exportPayments = () => {
  alert('Export CSV — coming soon')
}

watch(filterType, () => { currentPage.value = 1 })
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

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.summary-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.summary-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--bsp-primary);
}

.summary-value.pending { color: var(--bsp-warning); }
.summary-value.overdue { color: var(--bsp-danger); }

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

.tab-btn:hover { color: var(--bsp-secondary); }

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

.tab-count.pending { background: #fef3c7; color: #92400e; }
.tab-count.paid { background: #d1fae5; color: #047857; }
.tab-count.overdue { background: #fee2e2; color: #991b1b; }

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

/* Table */
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

.th-type, .th-code, .th-invoice, .th-amount, .th-period, .th-status, .th-date, .th-actions {
  text-align: center !important;
}

.td-type, .td-code, .td-invoice, .td-amount, .td-period, .td-status, .td-date {
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

.member-name {
  display: block;
  font-weight: 600;
  color: var(--bsp-dark);
  font-size: 0.9rem;
}

.member-email {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
}

.invoice-code {
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.amount {
  font-size: 0.9rem;
  font-weight: 700;
  color: #047857;
}

.type-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.type-school { background: #eff6ff; color: var(--bsp-secondary); }
.type-consultant { background: #fef3c7; color: #92400e; }
.type-personal { background: #f3e8ff; color: #7c3aed; }

.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-paid { background: #d1fae5; color: #047857; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-overdue { background: #fee2e2; color: #991b1b; }

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

/* Detail Panel */
.detail-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex;
  justify-content: flex-end;
}

.detail-panel {
  width: 420px;
  max-width: 90vw;
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.25s ease;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.panel-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--bsp-primary);
}

.panel-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.panel-close:hover { color: var(--bsp-dark); }

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.panel-section { margin-bottom: 1.5rem; }

.panel-section:last-child { margin-bottom: 0; }

.section-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-item:last-child { border-bottom: none; }

.info-label {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}

.info-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--bsp-dark);
}

.panel-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.panel-footer .btn {
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.panel-footer .btn-secondary {
  background: white;
  color: #64748b;
  border-color: #e2e8f0;
}

.panel-footer .btn-secondary:hover { background: #f8fafc; }

.panel-footer .btn-primary {
  background: var(--bsp-success);
  color: white;
}

.panel-footer .btn-primary:hover { background: #059669; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-box {
  background: white;
  border-radius: 12px;
  width: 480px;
  max-width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
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
  color: var(--bsp-primary);
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
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.modal-footer .btn {
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.modal-footer .btn-secondary {
  background: white;
  color: #64748b;
  border-color: #e2e8f0;
}

.modal-footer .btn-secondary:hover { background: #f8fafc; }

.modal-footer .btn-success {
  background: var(--bsp-success);
  color: white;
}

.modal-footer .btn-success:hover { background: #059669; }

.modal-footer .btn-primary {
  background: var(--bsp-secondary);
  color: white;
}

.modal-footer .btn-primary:hover { background: #2563eb; }

/* Confirm Message */
.confirm-message {
  text-align: center;
  padding: 1rem 0;
}

.confirm-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 1rem;
}

.confirm-message p {
  font-size: 0.95rem;
  color: var(--bsp-dark);
  margin-bottom: 0.5rem;
}

.confirm-sub {
  font-size: 0.85rem !important;
  color: #94a3b8 !important;
}

/* Reminder Modal */
.reminder-info {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.reminder-info p {
  font-size: 0.85rem;
  color: var(--bsp-dark);
  margin-bottom: 0.35rem;
}

.reminder-info p:last-child { margin-bottom: 0; }

.form-group { margin-bottom: 1rem; }

.form-group:last-child { margin-bottom: 0; }

.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.4rem;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--bsp-secondary);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.send-options {
  display: flex;
  gap: 1rem;
}

.send-option {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--bsp-dark);
  cursor: pointer;
}

.send-option input { cursor: pointer; }

/* Responsive */
@media (max-width: 1024px) {
  .summary-cards { grid-template-columns: repeat(2, 1fr); }
  .users-table { font-size: 0.85rem; }
}

@media (max-width: 768px) {
  .sidebar { display: none; }
  .dashboard-body { flex-direction: column; }
  .summary-cards { grid-template-columns: repeat(2, 1fr); }
  .filter-left { flex-direction: column; }
  .search-box { max-width: 100%; }
  .page-header { flex-direction: column; gap: 1rem; }
  .main-content { padding: 1rem; }
  .tab-btn { padding: 0.6rem 1rem; font-size: 0.85rem; }
  .users-table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .users-table { min-width: 700px; }
  .pagination { flex-direction: column; gap: 0.75rem; align-items: flex-start; }
}
</style>
