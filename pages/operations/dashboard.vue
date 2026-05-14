<template>
  <div class="bsp-dashboard">
    <div class="dashboard-body">
      <!-- Left Sidebar Navigation -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <!-- Role Switcher (Demo) -->
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
            <NuxtLink to="/operations/dashboard" class="nav-item active">
              <span class="nav-icon">📊</span>
              <span>Overview</span>
            </NuxtLink>
          </div>

          <div v-if="can('applications')" class="nav-section">
            <div class="nav-section-title">Applications</div>
            <NuxtLink to="/operations/applications" class="nav-item">
              <span class="nav-icon">📋</span>
              <span>New Account Applications</span>
              <span v-if="pendingApplications > 0" class="nav-badge">{{ pendingApplications }}</span>
            </NuxtLink>
          </div>

          <div v-if="can('users')" class="nav-section">
            <div class="nav-section-title">User Directory</div>
            <NuxtLink v-if="can('manageUsers')" to="/operations/users" class="nav-item">
              <span class="nav-icon">👤</span>
              <span>Personal</span>
              <span class="nav-count">{{ stats.totalPersonal }}</span>
            </NuxtLink>
            <NuxtLink v-if="can('manageUsers')" to="/operations/users" class="nav-item">
              <span class="nav-icon">🏫</span>
              <span>School</span>
              <span class="nav-count">{{ stats.totalSchools }}</span>
            </NuxtLink>
            <NuxtLink v-if="can('manageUsers')" to="/operations/users" class="nav-item">
              <span class="nav-icon">💼</span>
              <span>Consultant</span>
              <span class="nav-count">{{ stats.totalAgents }}</span>
            </NuxtLink>
            <NuxtLink v-if="!can('manageUsers') && can('viewUsers')" to="/operations/users" class="nav-item">
              <span class="nav-icon">👥</span>
              <span>View Users</span>
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

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Welcome Banner -->
        <div class="welcome-banner">
          <div class="welcome-text">
            <h2>👋 Welcome back, {{ userName }}!</h2>
            <p>BSP Operations Portal — {{ roleLabel }} Access</p>
          </div>
          <div class="welcome-date">
            {{ currentDate }}
          </div>
        </div>

        <!-- Quick Stats Cards -->
        <div class="stats-grid">
          <div v-if="can('applications')" class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.pendingApprovals }}</div>
              <div class="stat-label">Pending Applications</div>
            </div>
            <div class="stat-arrow">→</div>
          </div>
          <div v-if="can('applications')" class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.approvedToday }}</div>
              <div class="stat-label">Processed Today</div>
            </div>
          </div>
          <div v-if="can('payments')" class="stat-card stat-card-highlight">
            <div class="stat-icon">💳</div>
            <div class="stat-info">
              <div class="stat-number">£{{ stats.monthlyRevenue }}</div>
              <div class="stat-label">Monthly Revenue</div>
            </div>
          </div>
          <div v-if="can('users')" class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalUsers }}</div>
              <div class="stat-label">Total Users</div>
            </div>
          </div>
          <div v-if="can('notifications') && !can('payments')" class="stat-card">
            <div class="stat-icon">📢</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.notificationsSent }}</div>
              <div class="stat-label">Notifications Sent</div>
            </div>
          </div>
          <div v-if="can('resetPasswords') && !can('payments')" class="stat-card">
            <div class="stat-icon">🔑</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.passwordResets }}</div>
              <div class="stat-label">Password Resets</div>
            </div>
          </div>
        </div>

        <!-- Pending Applications Panel -->
        <div v-if="can('applications')" class="panel">
          <div class="panel-header">
            <h3 class="panel-title">⏳ Pending Applications</h3>
            <NuxtLink to="/operations/applications" class="panel-link">View all →</NuxtLink>
          </div>
          <div class="applications-list">
            <div v-for="app in pendingApplicationsList" :key="app.id" class="application-item">
              <div class="app-icon">{{ app.roleIcon }}</div>
              <div class="app-info">
                <div class="app-name">{{ app.name }}</div>
                <div class="app-meta">{{ app.email }} · {{ app.roleLabel }}</div>
                <div class="app-time">Submitted {{ app.submittedAt }}</div>
              </div>
              <div class="app-actions">
                <button v-if="can('approveApplications')" class="btn btn-approve" @click="approveApplication(app.id)">✅ Approve</button>
                <button v-if="can('approveApplications')" class="btn btn-reject" @click="rejectApplication(app.id)">❌ Reject</button>
                <span v-if="!can('approveApplications') && can('reviewApplications')" class="review-badge">Under Review</span>
              </div>
            </div>
            <div v-if="pendingApplicationsList.length === 0" class="empty-state">
              <p>🎉 No pending applications</p>
            </div>
          </div>
        </div>

        <!-- Recent Users Panel -->
        <div v-if="can('users')" class="panel">
          <div class="panel-header">
            <h3 class="panel-title">👥 Recent Users</h3>
            <NuxtLink to="/operations/users" class="panel-link">View all →</NuxtLink>
          </div>
          <div class="users-table">
            <div class="table-header">
              <span>User</span>
              <span>Role</span>
              <span>Joined</span>
              <span>Status</span>
            </div>
            <div v-for="user in recentUsers" :key="user.id" class="table-row">
              <span class="user-cell">
                <span class="user-avatar">{{ user.avatar }}</span>
                {{ user.name }}
              </span>
              <span><span class="role-tag">{{ user.roleLabel }}</span></span>
              <span>{{ user.joinedAt }}</span>
              <span><span class="status-badge status-active">✓ Active</span></span>
            </div>
          </div>
        </div>

        <!-- Support Queue Panel (Staff only) -->
        <div v-if="can('resetPasswords') || can('notifications')" class="panel">
          <div class="panel-header">
            <h3 class="panel-title">🎧 Support Queue</h3>
            <NuxtLink to="/operations/support" class="panel-link">View all →</NuxtLink>
          </div>
          <div class="applications-list">
            <div v-for="ticket in supportTickets" :key="ticket.id" class="application-item">
              <div class="app-icon">{{ ticket.icon }}</div>
              <div class="app-info">
                <div class="app-name">{{ ticket.title }}</div>
                <div class="app-meta">{{ ticket.user }} · {{ ticket.type }}</div>
                <div class="app-time">{{ ticket.time }}</div>
              </div>
              <div class="app-actions">
                <button class="btn btn-approve" @click="handleTicket(ticket.id)">Handle</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3 class="section-title">⚡ Quick Actions</h3>
          <div class="actions-grid">
            <button v-if="can('applications')" class="action-btn">
              <span class="action-icon">📋</span>
              <span>Review Applications</span>
            </button>
            <button v-if="can('manageUsers')" class="action-btn">
              <span class="action-icon">👤</span>
              <span>Manage Users</span>
            </button>
            <button v-if="can('payments')" class="action-btn">
              <span class="action-icon">💳</span>
              <span>View Payments</span>
            </button>
            <button v-if="can('reports')" class="action-btn">
              <span class="action-icon">📈</span>
              <span>Export Reports</span>
            </button>
            <button v-if="can('notifications')" class="action-btn">
              <span class="action-icon">📢</span>
              <span>Send Notification</span>
            </button>
            <button v-if="can('resetPasswords')" class="action-btn">
              <span class="action-icon">🔑</span>
              <span>Reset Password</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { setMeta } = useSEO()
setMeta({
  title: 'BSP Operations Portal',
  description: 'BSP Operations Portal',
  path: '/operations/dashboard',
  type: 'website'
})

// Current role — in production this comes from auth state
const currentRole = ref<'manager' | 'staff'>('manager')
const userName = ref('Sarah')

const roleLabel = computed(() => {
  return currentRole.value === 'manager' ? 'Manager' : 'Staff'
})

// Permission matrix aligned with screenshot
const permissions: Record<string, string[]> = {
  manager: ['applications', 'approveApplications', 'users', 'manageUsers', 'payments', 'reports', 'notifications'],
  staff: ['applications', 'reviewApplications', 'users', 'viewUsers', 'notifications', 'resetPasswords'],
}

const can = (permission: string): boolean => {
  return permissions[currentRole.value]?.includes(permission) || false
}

const pendingApplications = ref(3)
const stats = ref({
  pendingApprovals: 3,
  approvedToday: 2,
  monthlyRevenue: 4250,
  totalUsers: 44,
  totalPersonal: 12,
  totalSchools: 24,
  totalAgents: 8,
  notificationsSent: 156,
  passwordResets: 23,
})

const pendingApplicationsList = ref([
  {
    id: 1,
    name: 'Greenwich School',
    email: 'admin@greenwich.edu.hk',
    role: 'school',
    roleIcon: '🏫',
    roleLabel: 'School',
    submittedAt: '2 hours ago'
  },
  {
    id: 2,
    name: 'Sarah Education',
    email: 'sarah@sarah-edu.com',
    role: 'consultant',
    roleIcon: '💼',
    roleLabel: 'Consultant',
    submittedAt: '5 hours ago'
  },
  {
    id: 3,
    name: 'Apex Business Ltd',
    email: 'contact@apexbiz.com',
    role: 'business',
    roleIcon: '🏢',
    roleLabel: 'Business',
    submittedAt: '1 day ago'
  }
])

const recentUsers = ref([
  { id: 1, name: 'Westminster Academy', avatar: '🏫', role: 'school', roleLabel: 'School', joinedAt: '2026-04-18', status: 'active' },
  { id: 2, name: 'John Smith', avatar: '👔', role: 'consultant', roleLabel: 'Consultant', joinedAt: '2026-04-17', status: 'active' },
  { id: 3, name: 'TechCorp Ltd', avatar: '🏢', role: 'business', roleLabel: 'Business', joinedAt: '2026-04-15', status: 'active' },
])

const supportTickets = ref([
  { id: 1, title: 'Password reset request', user: 'Mary Chen', type: 'Account', time: '10 min ago', icon: '🔑' },
  { id: 2, title: 'Cannot update school profile', user: 'Greenwich School', type: 'Technical', time: '25 min ago', icon: '🏫' },
  { id: 3, title: 'Payment confirmation pending', user: 'John Smith', type: 'Billing', time: '1 hour ago', icon: '💳' },
])

const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

const approveApplication = (id: number) => {
  pendingApplications.value--
}

const rejectApplication = (id: number) => {
  pendingApplications.value--
}

const handleTicket = (id: number) => {
  console.log('Handling ticket', id)
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

/* Dashboard Layout */
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

.nav-section {
  margin-bottom: 1.5rem;
}

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

/* Role Switcher */
.role-switcher {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.5rem;
  margin-bottom: 0.5rem;
}

.role-btn {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.role-btn:hover {
  border-color: var(--bsp-secondary);
  color: var(--bsp-primary);
}

.role-btn.active {
  background: var(--bsp-primary);
  color: white;
  border-color: var(--bsp-primary);
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 1.5rem 2rem;
  overflow-y: auto;
}

.welcome-banner {
  background: linear-gradient(135deg, var(--bsp-primary) 0%, #2d3f6b 100%);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(33, 46, 84, 0.25);
}

.welcome-text h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.welcome-text p { opacity: 0.85; font-size: 0.95rem; }
.welcome-date { font-size: 0.9rem; opacity: 0.85; }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card-highlight {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.stat-card-highlight .stat-number,
.stat-card-highlight .stat-label { color: white; }

.stat-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 10px;
}

.stat-card-highlight .stat-icon { background: rgba(255,255,255,0.2); }

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--bsp-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.stat-arrow {
  margin-left: auto;
  font-size: 1.25rem;
  color: #cbd5e1;
}

/* Panels */
.panel {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--bsp-dark);
}

.panel-link {
  font-size: 0.85rem;
  color: var(--bsp-secondary);
  text-decoration: none;
  font-weight: 500;
}

.panel-link:hover { text-decoration: underline; }

/* Applications List */
.applications-list { display: flex; flex-direction: column; gap: 0.75rem; }

.application-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  transition: background 0.2s;
}

.application-item:hover { background: #f1f5f9; }

.app-icon { font-size: 2rem; }

.app-info { flex: 1; }

.app-name { font-weight: 600; color: var(--bsp-dark); font-size: 0.95rem; }

.app-meta { font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; }

.app-time { font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem; }

.app-actions { display: flex; gap: 0.5rem; }

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-approve {
  background: var(--bsp-success);
  color: white;
}

.btn-approve:hover { background: #059669; }

.btn-reject {
  background: #fee2e2;
  color: var(--bsp-danger);
}

.btn-reject:hover { background: #fecaca; }

.review-badge {
  font-size: 0.75rem;
  color: #f59e0b;
  font-weight: 600;
  background: #fffbeb;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-size: 0.95rem;
}

/* Users Table */
.users-table { display: flex; flex-direction: column; }

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.875rem 1rem;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
}

.table-row:last-child { border-bottom: none; }

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.user-avatar { font-size: 1.25rem; }

.role-tag {
  background: #eff6ff;
  color: var(--bsp-secondary);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-active {
  background: #d1fae5;
  color: #047857;
}

/* Quick Actions */
.quick-actions {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--bsp-dark);
  margin-bottom: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--bsp-dark);
  font-weight: 500;
  font-size: 0.85rem;
}

.action-btn:hover {
  background: #eff6ff;
  border-color: var(--bsp-secondary);
  color: var(--bsp-primary);
}

.action-icon { font-size: 1.75rem; }

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
  .table-header, .table-row { grid-template-columns: 2fr 1fr 1fr; }
  .table-header span:nth-child(3),
  .table-row span:nth-child(3) { display: none; }
}

@media (max-width: 768px) {
  .sidebar { display: none; }
  .dashboard-body { flex-direction: column; }
  .stats-grid { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: 1fr 1fr; }
}
</style>
