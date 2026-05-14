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
            <NuxtLink to="/operations/promotions" class="nav-item">
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
            <h1 class="page-title">📈 Reports</h1>
            <p class="page-subtitle">Export platform data and analytics</p>
          </div>
        </div>

        <!-- Report Types -->
        <div class="reports-grid">
          <div v-for="report in reportTypes" :key="report.key" class="report-card">
            <div class="report-icon">{{ report.icon }}</div>
            <h3 class="report-title">{{ report.title }}</h3>
            <p class="report-desc">{{ report.description }}</p>
            <div class="report-meta">
              <span class="report-format">{{ report.format }}</span>
              <span class="report-records">{{ report.recordCount }} records</span>
            </div>
            <div class="report-actions">
              <button class="btn btn-primary" @click="exportReport(report.key)">
                📥 Export {{ report.format }}
              </button>
            </div>
          </div>
        </div>

        <!-- Date Range Filter -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">📅 Date Range</h3>
          </div>
          <div class="date-range">
            <div class="date-field">
              <label>From</label>
              <input v-model="dateFrom" type="date" class="date-input" />
            </div>
            <div class="date-field">
              <label>To</label>
              <input v-model="dateTo" type="date" class="date-input" />
            </div>
            <div class="date-presets">
              <button class="btn btn-secondary" @click="setPreset('thisMonth')">This Month</button>
              <button class="btn btn-secondary" @click="setPreset('lastMonth')">Last Month</button>
              <button class="btn btn-secondary" @click="setPreset('thisYear')">This Year</button>
              <button class="btn btn-secondary" @click="setPreset('all')">All Time</button>
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">👁️ Preview — {{ currentPreview.label }}</h3>
            <div class="panel-actions">
              <button class="btn btn-secondary" @click="exportReport(currentPreview.key)">📥 Export CSV</button>
            </div>
          </div>
          <div class="users-table" style="overflow-x: auto;">
            <div class="table-header" :style="{ 'grid-template-columns': currentPreview.columns.map(() => '1fr').join(' '), 'min-width': currentPreview.minWidth + 'px' }">
              <span v-for="col in currentPreview.columns" :key="col">{{ col }}</span>
            </div>
            <div v-for="(row, i) in currentPreview.data" :key="i" class="table-row" :style="{ 'grid-template-columns': currentPreview.columns.map(() => '1fr').join(' '), 'min-width': currentPreview.minWidth + 'px' }">
              <span v-for="(val, j) in row" :key="j" :class="{ 'user-name': j === 0, 'user-email': j > 0 }">{{ val }}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { setMeta } = useSEO()
setMeta({
  title: 'Reports — BSP Operations Portal',
  description: 'BSP Operations Portal Reports',
  path: '/operations/reports',
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

const dateFrom = ref('')
const dateTo = ref('')

const setPreset = (preset: string) => {
  const now = new Date()
  if (preset === 'thisMonth') {
    dateFrom.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    dateTo.value = now.toISOString().split('T')[0]
  } else if (preset === 'lastMonth') {
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    dateFrom.value = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-01`
    dateTo.value = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-${new Date(now.getFullYear(), now.getMonth(), 0).getDate()}`
  } else if (preset === 'thisYear') {
    dateFrom.value = `${now.getFullYear()}-01-01`
    dateTo.value = now.toISOString().split('T')[0]
  } else {
    dateFrom.value = '2024-01-01'
    dateTo.value = now.toISOString().split('T')[0]
  }
}
setPreset('thisYear')

const reportTypes = [
  { key: 'payments', icon: '💳', title: 'Payment Records', description: 'All payment transactions with status, amounts and dates', format: 'CSV', recordCount: 156 },
  { key: 'users', icon: '👥', title: 'User Directory', description: 'Complete list of all platform users by type', format: 'CSV', recordCount: 312 },
  { key: 'applications', icon: '📋', title: 'New Applications', description: 'Account applications with approval status', format: 'CSV', recordCount: 48 },
  { key: 'revenue', icon: '💰', title: 'Revenue Summary', description: 'Monthly revenue breakdown by user type', format: 'CSV', recordCount: 24 },
]

const currentPreviewKey = ref('payments')
const currentPreview = computed(() => {
  if (currentPreviewKey.value === 'payments') {
    return {
      key: 'payments',
      label: 'Payment Records',
      columns: ['Invoice', 'Name', 'Type', 'Amount', 'Status', 'Date'],
      minWidth: 640,
      data: [
        ['INV-2026-001', "St. Mary's School", 'School', '£299', 'Paid', '2026-01-15'],
        ['INV-2026-002', 'Brighton College', 'School', '£299', 'Paid', '2026-02-20'],
        ['INV-2026-003', 'Victoria Education', 'Consultant', '£199', 'Pending', '—'],
        ['INV-2026-004', 'UK Study Link', 'Consultant', '£199', 'Pending', '—'],
        ['INV-2026-005', 'Mr. Alan Foster', 'Personal', '£0', 'Overdue', '—'],
      ]
    }
  }
  if (currentPreviewKey.value === 'users') {
    return {
      key: 'users',
      label: 'User Directory',
      columns: ['Name', 'Email', 'Type', 'Status', 'Joined'],
      minWidth: 560,
      data: [
        ['Greenwich School', 'admin@greenwich.edu.hk', 'School', 'Active', '2026-04-18'],
        ['John Smith', 'john@consultant.com', 'Consultant', 'Active', '2026-04-17'],
        ['Mike Johnson', 'mike@gmail.com', 'Personal', 'Active', '2026-04-15'],
        ['Westminster Academy', 'info@westminster.edu', 'School', 'Active', '2026-04-12'],
      ]
    }
  }
  if (currentPreviewKey.value === 'applications') {
    return {
      key: 'applications',
      label: 'New Applications',
      columns: ['Name', 'Email', 'Type', 'Status', 'Submitted'],
      minWidth: 560,
      data: [
        ['Greenwich School', 'admin@greenwich.edu.hk', 'School', 'Pending', '2 hours ago'],
        ['Sarah Education', 'sarah@sarah-edu.com', 'Consultant', 'Pending', '5 hours ago'],
        ['Apex Business Ltd', 'contact@apexbiz.com', 'Business', 'Under Review', '1 day ago'],
      ]
    }
  }
  return {
    key: 'revenue',
    label: 'Revenue Summary',
    columns: ['Month', 'Schools', 'Consultants', 'Personal', 'Total'],
    minWidth: 560,
    data: [
      ['2026-01', '£1,495', '£597', '£0', '£2,092'],
      ['2026-02', '£897', '£398', '£0', '£1,295'],
      ['2026-03', '£1,196', '£597', '£0', '£1,793'],
      ['2026-04', '£598', '£199', '£0', '£797'],
    ]
  }
})

const exportReport = (key: string) => {
  const report = reportTypes.find(r => r.key === key)
  const preview = currentPreview.value
  if (!report) return

  const headers = preview.columns
  const rows = preview.data
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${key}-report-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
:root { --bsp-primary: #212E54; --bsp-secondary: #3b82f6; --bsp-dark: #1e293b; --bsp-light: #f8fafc; }
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

.reports-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.report-card { background: white; border-radius: 10px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); display: flex; flex-direction: column; }
.report-icon { font-size: 2rem; margin-bottom: 0.75rem; }
.report-title { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; }
.report-desc { font-size: 0.85rem; color: #64748b; margin-bottom: 1rem; flex: 1; }
.report-meta { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
.report-format { background: #eff6ff; color: #3b82f6; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; }
.report-records { color: #94a3b8; font-size: 0.8rem; }
.report-actions { margin-top: auto; }

.panel { background: white; border-radius: 10px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 1.5rem; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; }
.panel-title { font-size: 1rem; font-weight: 600; color: #1e293b; }
.panel-actions { display: flex; gap: 0.75rem; }

.date-range { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
.date-field { display: flex; flex-direction: column; gap: 0.35rem; }
.date-field label { font-size: 0.8rem; font-weight: 500; color: #64748b; }
.date-input { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem; }
.date-presets { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.users-table { display: flex; flex-direction: column; overflow-x: auto; }
.table-header { display: grid; gap: 1rem; padding: 0.75rem 1rem; background: #f8fafc; border-radius: 6px; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
.table-row { display: grid; gap: 1rem; padding: 0.875rem 1rem; align-items: center; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; }
.table-row:last-child { border-bottom: none; }
.user-name { font-weight: 600; }
.user-email { color: #64748b; font-size: 0.85rem; }

.btn { padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: none; transition: all 0.2s; }
.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }
.btn-secondary { background: #f1f5f9; color: #374151; border: 1px solid #e2e8f0; }
.btn-secondary:hover { background: #e2e8f0; }

@media (max-width: 768px) {
  .sidebar { display: none; }
  .reports-grid { grid-template-columns: 1fr; }
  .date-range { flex-direction: column; align-items: stretch; }
  .date-presets { justify-content: flex-start; }
}
</style>