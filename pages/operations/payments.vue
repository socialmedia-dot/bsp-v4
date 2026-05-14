<template>
  <div class="bsp-dashboard">
    <div class="dashboard-body">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">Role</div>
            <div class="role-switcher">
              <button
                v-for="r in ['manager', 'staff']"
                :key="r"
                :class="['role-btn', { active: currentRole === r }]"
                @click="currentRole = r"
              >
                {{ r === 'manager' ? 'Manager' : 'Staff' }}
              </button>
            </div>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Operations</div>
            <NuxtLink to="/operations/dashboard" class="nav-item">
              <span class="nav-icon">📊</span>
              <span>Overview</span>
            </NuxtLink>
          </div>

          <div v-if="can('applications')" class="nav-section">
            <div class="nav-section-title">Applications</div>
            <NuxtLink to="/operations/applications" class="nav-item">
              <span class="nav-icon">📋</span>
              <span>New Account Applications</span>
            </NuxtLink>
          </div>

          <div v-if="can('users')" class="nav-section">
            <div class="nav-section-title">User Directory</div>
            <NuxtLink to="/operations/users" class="nav-item">
              <span class="nav-icon">👥</span>
              <span>All Users</span>
            </NuxtLink>
          </div>

          <div v-if="can('payments')" class="nav-section">
            <div class="nav-section-title">Finance</div>
            <NuxtLink to="/operations/payments" class="nav-item">
              <span class="nav-icon">💳</span>
              <span>Payments</span>
            </NuxtLink>
            <NuxtLink to="/operations/discounts" class="nav-item">
              <span class="nav-icon">🎟️</span>
              <span>Promo Codes</span>
            </NuxtLink>
            <NuxtLink v-if="can('reports')" to="/operations/reports" class="nav-item">
              <span class="nav-icon">📈</span>
              <span>Reports</span>
            </NuxtLink>
          </div>

          <div v-if="can('notifications') || can('resetPasswords')" class="nav-section">
            <div class="nav-section-title">Support Tools</div>
            <NuxtLink v-if="can('notifications')" to="/operations/notifications" class="nav-item">
              <span class="nav-icon">📢</span>
              <span>Send Notifications</span>
            </NuxtLink>
            <NuxtLink v-if="can('resetPasswords')" to="/operations/reset-passwords" class="nav-item">
              <span class="nav-icon">🔑</span>
              <span>Password Resets</span>
            </NuxtLink>
          </div>
        </nav>
      </aside>

      <main class="main-content">
        <div class="page-header">
          <div class="page-title-area">
            <h1 class="page-title">💳 Payments</h1>
            <p class="page-subtitle">View and manage all member payment records</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" @click="exportCSV">📥 Export CSV</button>
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
        <div class="tabs-bar">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            <span>{{ tab.label }}</span>
            <span class="tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <!-- Filters -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">{{ currentTab.label }} Payments</h3>
            <div class="panel-actions">
              <input v-model="searchQuery" type="text" placeholder="Search by name, email or invoice..." class="search-input" />
            </div>
          </div>

          <div class="users-table" style="overflow-x: auto;">
            <div class="table-header" style="min-width: 720px;">
              <span>Member</span>
              <span>Type</span>
              <span>Invoice</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Due Date</span>
              <span>Actions</span>
            </div>
            <div v-for="payment in filteredPayments" :key="payment.id" class="table-row" style="min-width: 720px;">
              <span class="user-cell">
                <span class="user-avatar">{{ payment.userType === 'school' ? '🏫' : payment.userType === 'consultant' ? '💼' : '👤' }}</span>
                <span>
                  <div class="user-name">{{ payment.name }}</div>
                  <div class="user-email">{{ payment.email }}</div>
                </span>
              </span>
              <span><span class="role-tag">{{ payment.userType }}</span></span>
              <span class="user-email">{{ payment.invoiceNo }}</span>
              <span class="user-name">£{{ payment.amount }}</span>
              <span><span class="status-badge" :class="'status-' + payment.status">{{ payment.status }}</span></span>
              <span class="user-email">{{ payment.membershipExpire }}</span>
              <span class="action-cell">
                <button class="btn-action" @click="viewPayment(payment.id)" title="View">👁️</button>
                <button v-if="payment.status !== 'paid'" class="btn-action" @click="markPaid(payment.id)" title="Mark Paid">✅</button>
                <button v-if="payment.status !== 'paid'" class="btn-action btn-danger" @click="sendReminder(payment.id)" title="Reminder">🔔</button>
              </span>
            </div>
            <div v-if="filteredPayments.length === 0" class="empty-state">
              <p>No payment records found</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">💳 Payment Details</h2>
          <button class="modal-close" @click="showDetail = false">×</button>
        </div>
        <div v-if="selectedPayment" class="modal-body">
          <div class="info-grid">
            <div class="info-item"><span class="info-label">Invoice</span><span class="info-value">{{ selectedPayment.invoiceNo }}</span></div>
            <div class="info-item"><span class="info-label">Amount</span><span class="info-value">£{{ selectedPayment.amount }}</span></div>
            <div class="info-item"><span class="info-label">Period</span><span class="info-value">{{ selectedPayment.period }}</span></div>
            <div class="info-item"><span class="info-label">Status</span><span class="info-value"><span class="status-badge" :class="'status-' + selectedPayment.status">{{ selectedPayment.status }}</span></span></div>
            <div class="info-item"><span class="info-label">Payer</span><span class="info-value">{{ selectedPayment.name }}</span></div>
            <div class="info-item"><span class="info-label">Email</span><span class="info-value">{{ selectedPayment.email }}</span></div>
            <div class="info-item"><span class="info-label">User Code</span><span class="info-value">{{ selectedPayment.userCode }}</span></div>
            <div class="info-item"><span class="info-label">Due Date</span><span class="info-value">{{ selectedPayment.membershipExpire }}</span></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDetail = false">Close</button>
          <button v-if="selectedPayment && selectedPayment.status !== 'paid'" class="btn btn-primary" @click="markPaid(selectedPayment.id); showDetail = false">Mark as Paid</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { setMeta } = useSEO()
setMeta({
  title: 'Payments — BSP Operations Portal',
  description: 'BSP Operations Portal Payments',
  path: '/operations/payments',
  type: 'website'
})

const currentRole = ref<'manager' | 'staff'>('manager')
const permissions: Record<string, string[]> = {
  manager: ['applications', 'approveApplications', 'users', 'manageUsers', 'payments', 'reports', 'notifications'],
  staff: ['applications', 'reviewApplications', 'users', 'viewUsers', 'notifications', 'resetPasswords'],
}
const can = (permission: string): boolean => {
  return permissions[currentRole.value]?.includes(permission) || false
}

const activeTab = ref('all')
const searchQuery = ref('')

const tabs = [
  { key: 'all', label: 'All', count: 12 },
  { key: 'pending', label: 'Pending', count: 0 },
  { key: 'paid', label: 'Paid', count: 0 },
  { key: 'overdue', label: 'Overdue', count: 0 },
]

const currentTab = computed(() => tabs.find(t => t.key === activeTab.value) || tabs[0])

const payments = ref([
  { id: 1, name: "St. Mary's School", email: 'finance@stmarys.edu.uk', userCode: '2026011500001', userType: 'school', invoiceNo: 'INV-2026-001', amount: 299, period: '2026 Annual', status: 'paid', date: '2026-01-15', membershipExpire: '2026-10-01' },
  { id: 2, name: 'Brighton College', email: 'admissions@brightoncollege.edu.uk', userCode: '2026022000001', userType: 'school', invoiceNo: 'INV-2026-002', amount: 299, period: '2026 Annual', status: 'paid', date: '2026-02-20', membershipExpire: '2026-10-01' },
  { id: 3, name: 'Victoria Education Group', email: 'victoria@vedu.com.hk', userCode: '2026011000001', userType: 'consultant', invoiceNo: 'INV-2026-003', amount: 199, period: '2026 Annual', status: 'pending', date: '—', membershipExpire: '2026-10-01' },
  { id: 4, name: 'UK Study Link', email: 'james@ukstudylink.com', userCode: '2026022500001', userType: 'consultant', invoiceNo: 'INV-2026-004', amount: 199, period: '2026 Annual', status: 'pending', date: '—', membershipExpire: '2026-10-01' },
  { id: 5, name: 'Mr. Alan Foster', email: 'alan@ukboarding.com', userCode: 'P2026030100001', userType: 'personal', invoiceNo: 'INV-2026-005', amount: 0, period: '2026 Annual', status: 'overdue', date: '—', membershipExpire: '2026-10-01' },
  { id: 6, name: 'Elite Education Consultancy', email: 'sarah@eliteedu.hk', userCode: '2026031200001', userType: 'consultant', invoiceNo: 'INV-2026-006', amount: 199, period: '2026 Annual', status: 'paid', date: '2026-03-12', membershipExpire: '2026-10-01' },
  { id: 7, name: 'Global Study Partners', email: 'emma@globalstudy.hk', userCode: '2026041500001', userType: 'consultant', invoiceNo: 'INV-2026-007', amount: 199, period: '2026 Annual', status: 'pending', date: '—', membershipExpire: '2026-10-01' },
  { id: 8, name: 'Harrow School', email: 'harrow@harrowschool.org.uk', userCode: '2025060100001', userType: 'school', invoiceNo: 'INV-2026-008', amount: 299, period: '2026 Annual', status: 'paid', date: '2026-03-01', membershipExpire: '2027-10-01' },
  { id: 9, name: 'Eton College', email: 'admissions@etoncollege.org.uk', userCode: '2026041800001', userType: 'school', invoiceNo: 'INV-2026-009', amount: 299, period: '2026 Annual', status: 'overdue', date: '—', membershipExpire: '2026-10-01' },
  { id: 10, name: 'British Education HK', email: 'david@briteduhk.com', userCode: '2026040500001', userType: 'consultant', invoiceNo: 'INV-2026-010', amount: 199, period: '2026 Annual', status: 'paid', date: '2026-04-05', membershipExpire: '2026-10-01' },
  { id: 11, name: 'Wellington College', email: 'info@wellingtoncollege.org.uk', userCode: '2026031000001', userType: 'school', invoiceNo: 'INV-2026-011', amount: 299, period: '2026 Annual', status: 'pending', date: '—', membershipExpire: '2026-10-01' },
  { id: 12, name: "St. Paul's School", email: 'admissions@stpaulsschool.org.uk', userCode: '2026042100001', userType: 'school', invoiceNo: 'INV-2026-012', amount: 299, period: '2026 Annual', status: 'paid', date: '2026-04-10', membershipExpire: '2026-10-01' }
])

const totalRevenue = computed(() => payments.value.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0))
const paidThisMonth = computed(() => {
  const now = new Date()
  return payments.value.filter(p => p.status === 'paid' && p.date.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)).reduce((sum, p) => sum + p.amount, 0)
})
const pendingCount = computed(() => payments.value.filter(p => p.status === 'pending').length)
const paidCount = computed(() => payments.value.filter(p => p.status === 'paid').length)
const overdueCount = computed(() => payments.value.filter(p => p.status === 'overdue').length)

// Update tab counts
watchEffect(() => {
  tabs[0].count = payments.value.length
  tabs[1].count = pendingCount.value
  tabs[2].count = paidCount.value
  tabs[3].count = overdueCount.value
})

const filteredPayments = computed(() => {
  let result = payments.value
  if (activeTab.value !== 'all') {
    result = result.filter(p => p.status === activeTab.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.invoiceNo.toLowerCase().includes(q))
  }
  return result
})

const showDetail = ref(false)
const selectedPayment = ref<typeof payments.value[0] | null>(null)

const viewPayment = (id: number) => {
  selectedPayment.value = payments.value.find(p => p.id === id) || null
  showDetail.value = true
}

const markPaid = (id: number) => {
  const p = payments.value.find(x => x.id === id)
  if (p) { p.status = 'paid'; p.date = new Date().toISOString().split('T')[0] }
}

const sendReminder = (id: number) => {
  const p = payments.value.find(x => x.id === id)
  alert(`Reminder sent to ${p?.name} (${p?.email}) for invoice ${p?.invoiceNo}`)
}

const exportCSV = () => {
  const headers = ['Invoice No', 'Name', 'Email', 'Type', 'Amount', 'Status', 'Date', 'Due Date']
  const rows = filteredPayments.value.map(p => [p.invoiceNo, p.name, p.email, p.userType, p.amount, p.status, p.date, p.membershipExpire])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
:root { --bsp-primary: #212E54; --bsp-secondary: #3b82f6; --bsp-accent: #C1AA78; --bsp-dark: #1e293b; --bsp-light: #f8fafc; --bsp-success: #10b981; --bsp-danger: #ef4444; }
* { margin: 0; padding: 0; box-sizing: border-box; }
.bsp-dashboard { min-height: 100vh; background: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; }
.dashboard-body { display: flex; min-height: 100vh; }

.sidebar { width: 260px; background: white; border-right: 1px solid #e2e8f0; padding: 1.5rem 0; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
.nav-section { margin-bottom: 1.5rem; }
.nav-section-title { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; padding: 0 1.5rem; margin-bottom: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.5rem; color: #64748b; text-decoration: none; font-weight: 500; font-size: 0.9rem; transition: all 0.2s; border-left: 3px solid transparent; }
.nav-item:hover { background: #f1f5f9; color: #212E54; }
.nav-item.active { background: #eff6ff; color: #212E54; border-left-color: #3b82f6; font-weight: 600; }
.nav-icon { font-size: 1.1rem; }

.role-switcher { display: flex; gap: 0.5rem; padding: 0 1.5rem; margin-bottom: 0.5rem; }
.role-btn { flex: 1; padding: 0.5rem; border: 1px solid #e2e8f0; background: white; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; color: #64748b; transition: all 0.2s; }
.role-btn:hover { border-color: #3b82f6; color: #212E54; }
.role-btn.active { background: #212E54; color: white; border-color: #212E54; }

.main-content { flex: 1; padding: 1.5rem 2rem; overflow-y: auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #212E54; margin-bottom: 0.25rem; }
.page-subtitle { font-size: 0.9rem; color: #64748b; }
.page-actions { display: flex; gap: 0.75rem; }

.summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.summary-card { background: white; padding: 1.25rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); display: flex; flex-direction: column; }
.summary-label { font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; }
.summary-value { font-size: 1.5rem; font-weight: 700; color: #212E54; }
.summary-value.pending { color: #f59e0b; }
.summary-value.overdue { color: #ef4444; }

.tabs-bar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
.tab-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 600; font-size: 0.85rem; color: #64748b; cursor: pointer; transition: all 0.2s; }
.tab-btn:hover { border-color: #3b82f6; color: #212E54; }
.tab-btn.active { background: #212E54; color: white; border-color: #212E54; }
.tab-count { background: rgba(0,0,0,0.15); color: inherit; padding: 0.15rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; }

.panel { background: white; border-radius: 10px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; }
.panel-title { font-size: 1rem; font-weight: 600; color: #1e293b; }
.panel-actions { display: flex; gap: 0.75rem; align-items: center; }
.search-input { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.85rem; width: 240px; }
.search-input:focus { outline: none; border-color: #3b82f6; }

.users-table { display: flex; flex-direction: column; overflow-x: auto; }
.table-header { display: grid; grid-template-columns: 2fr 1fr 1.5fr 1fr 1fr 1fr 1fr; gap: 1rem; padding: 0.75rem 1rem; background: #f8fafc; border-radius: 6px; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; min-width: 720px; }
.table-row { display: grid; grid-template-columns: 2fr 1fr 1.5fr 1fr 1fr 1fr 1fr; gap: 1rem; padding: 0.875rem 1rem; align-items: center; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; min-width: 720px; }
.table-row:last-child { border-bottom: none; }
.user-cell { display: flex; align-items: center; gap: 0.75rem; font-weight: 500; }
.user-avatar { font-size: 1.25rem; }
.user-name { font-weight: 600; }
.user-email { color: #64748b; font-size: 0.85rem; }
.role-tag { background: #eff6ff; color: #3b82f6; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-paid { background: #d1fae5; color: #047857; }
.status-pending { background: #fef3c7; color: #b45309; }
.status-overdue { background: #fee2e2; color: #b91c1c; }
.action-cell { display: flex; gap: 0.35rem; }
.btn-action { background: none; border: none; font-size: 1rem; cursor: pointer; padding: 0.35rem; border-radius: 4px; }
.btn-action:hover { background: #f1f5f9; }
.btn-action.btn-danger:hover { background: #fee2e2; }
.empty-state { text-align: center; padding: 2rem; color: #64748b; }

.btn { padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: none; transition: all 0.2s; }
.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }
.btn-secondary { background: #f1f5f9; color: #374151; border: 1px solid #e2e8f0; }
.btn-secondary:hover { background: #e2e8f0; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-box { background: white; border-radius: 12px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #e2e8f0; }
.modal-title { font-size: 1.1rem; font-weight: 600; }
.modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
.modal-body { padding: 1.25rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.25rem; border-top: 1px solid #e2e8f0; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.info-item { display: flex; flex-direction: column; gap: 0.25rem; }
.info-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; }
.info-value { font-size: 0.9rem; font-weight: 600; color: #1e293b; }

@media (max-width: 768px) {
  .sidebar { display: none; }
  .summary-cards { grid-template-columns: repeat(2, 1fr); }
  .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
}
</style>