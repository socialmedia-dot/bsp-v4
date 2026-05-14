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

          <div class="nav-section">
            <div class="nav-section-title">User Directory</div>
            <NuxtLink to="/operations/users" class="nav-item active">
              <span class="nav-icon">👥</span>
              <span>All Users</span>
            </NuxtLink>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Finance</div>
            <NuxtLink to="/operations/payments" class="nav-item">
              <span class="nav-icon">💳</span>
              <span>Payments</span>
            </NuxtLink>
            <NuxtLink to="/operations/promotions" class="nav-item">
              <span class="nav-icon">🎟️</span>
              <span>Promo Codes</span>
            </NuxtLink>
            <NuxtLink to="/operations/reports" class="nav-item">
              <span class="nav-icon">📈</span>
              <span>Reports</span>
            </NuxtLink>
          </div>
        </nav>
      </aside>

      <main class="main-content">
        <div class="page-header">
          <div class="page-title-area">
            <h1 class="page-title">👥 User Directory</h1>
            <p class="page-subtitle">View and manage all platform users</p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-bar">
          <button
            v-for="tab in userTabs"
            :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
            <span class="tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <!-- Users Table -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">{{ currentTab.label }} Users</h3>
            <div class="panel-actions">
              <input v-model="searchQuery" type="text" placeholder="Search users..." class="search-input" />
              <button v-if="can('manageUsers')" class="btn btn-primary">+ Add User</button>
            </div>
          </div>
          <div class="users-table">
            <div class="table-header">
              <span>User</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span v-if="can('manageUsers')">Actions</span>
            </div>
            <div v-for="user in filteredUsers" :key="user.id" class="table-row">
              <span class="user-cell">
                <span class="user-avatar">{{ user.avatar }}</span>
                <span>
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-email-mobile">{{ user.email }}</div>
                </span>
              </span>
              <span class="user-email">{{ user.email }}</span>
              <span><span class="role-tag">{{ user.roleLabel }}</span></span>
              <span><span class="status-badge" :class="'status-' + user.status">{{ user.status }}</span></span>
              <span v-if="can('manageUsers')" class="action-cell">
                <button class="btn-action" title="Edit">✏️</button>
                <button class="btn-action btn-danger" title="Suspend">🙈</button>
              </span>
            </div>
            <div v-if="filteredUsers.length === 0" class="empty-state">
              <p>No users found</p>
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
  title: 'User Directory — BSP Operations Portal',
  description: 'BSP Operations Portal User Directory',
  path: '/operations/users',
  type: 'website'
})

const currentRole = ref<'manager' | 'staff'>('manager')

const permissions: Record<string, string[]> = {
  manager: ['users', 'manageUsers', 'viewUsers'],
  staff: ['users', 'viewUsers'],
}

const can = (permission: string): boolean => {
  return permissions[currentRole.value]?.includes(permission) || false
}

const activeTab = ref('all')
const searchQuery = ref('')

const userTabs = [
  { key: 'all', label: 'All', icon: '👥', count: 44 },
  { key: 'personal', label: 'Personal', icon: '👤', count: 12 },
  { key: 'school', label: 'School', icon: '🏫', count: 24 },
  { key: 'consultant', label: 'Consultant', icon: '💼', count: 8 },
]

const currentTab = computed(() => userTabs.find(t => t.key === activeTab.value) || userTabs[0])

const allUsers = [
  { id: 1, name: 'Greenwich School', email: 'admin@greenwich.edu.hk', role: 'school', roleLabel: 'School', status: 'active', avatar: '🏫' },
  { id: 2, name: 'Westminster Academy', email: 'info@westminster.edu', role: 'school', roleLabel: 'School', status: 'active', avatar: '🏫' },
  { id: 3, name: 'John Smith', email: 'john@consultant.com', role: 'consultant', roleLabel: 'Consultant', status: 'active', avatar: '👔' },
  { id: 4, name: 'Sarah Chen', email: 'sarah@edu.com', role: 'consultant', roleLabel: 'Consultant', status: 'active', avatar: '👩‍💼' },
  { id: 5, name: 'Mike Johnson', email: 'mike@gmail.com', role: 'personal', roleLabel: 'Personal', status: 'active', avatar: '👨' },
  { id: 6, name: 'Emma Wilson', email: 'emma@outlook.com', role: 'personal', roleLabel: 'Personal', status: 'inactive', avatar: '👩' },
]

const filteredUsers = computed(() => {
  let users = activeTab.value === 'all' ? allUsers : allUsers.filter(u => u.role === activeTab.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }
  return users
})
</script>

<style scoped>
:root {
  --bsp-primary: #212E54;
  --bsp-secondary: #3b82f6;
  --bsp-accent: #C1AA78;
  --bsp-dark: #1e293b;
  --bsp-light: #f8fafc;
  --bsp-success: #10b981;
  --bsp-danger: #ef4444;
}

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

.tabs-bar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
.tab-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 600; font-size: 0.85rem; color: #64748b; cursor: pointer; transition: all 0.2s; }
.tab-btn:hover { border-color: #3b82f6; color: #212E54; }
.tab-btn.active { background: #212E54; color: white; border-color: #212E54; }
.tab-icon { font-size: 1.1rem; }
.tab-count { background: rgba(0,0,0,0.15); color: inherit; padding: 0.15rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; }

.panel { background: white; border-radius: 10px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; }
.panel-title { font-size: 1rem; font-weight: 600; color: #1e293b; }
.panel-actions { display: flex; gap: 0.75rem; align-items: center; }
.search-input { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.85rem; width: 200px; }
.search-input:focus { outline: none; border-color: #3b82f6; }
.btn { padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: none; transition: all 0.2s; }
.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }

.users-table { display: flex; flex-direction: column; overflow-x: auto; }
.table-header { display: grid; grid-template-columns: 2fr 2fr 1fr 1fr 1fr; gap: 1rem; padding: 0.75rem 1rem; background: #f8fafc; border-radius: 6px; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; min-width: 640px; }
.table-row { display: grid; grid-template-columns: 2fr 2fr 1fr 1fr 1fr; gap: 1rem; padding: 0.875rem 1rem; align-items: center; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; min-width: 640px; }
.table-row:last-child { border-bottom: none; }
.user-cell { display: flex; align-items: center; gap: 0.75rem; font-weight: 500; }
.user-avatar { font-size: 1.25rem; }
.user-name { font-weight: 600; }
.user-email { color: #64748b; font-size: 0.85rem; }
.user-email-mobile { display: none; color: #64748b; font-size: 0.8rem; }
.role-tag { background: #eff6ff; color: #3b82f6; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.status-badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-active { background: #d1fae5; color: #047857; }
.status-inactive { background: #f1f5f9; color: #64748b; }
.action-cell { display: flex; gap: 0.35rem; }
.btn-action { background: none; border: none; font-size: 1rem; cursor: pointer; padding: 0.35rem; border-radius: 4px; }
.btn-action:hover { background: #f1f5f9; }
.btn-action.btn-danger:hover { background: #fee2e2; }
.empty-state { text-align: center; padding: 2rem; color: #64748b; }

@media (max-width: 1024px) {
  .table-header, .table-row { min-width: 640px; }
  .user-email-mobile { display: none; }
}
@media (max-width: 768px) {
  .sidebar { display: none; }
  .tabs-bar { flex-wrap: wrap; }
  .panel-actions { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
  .table-header, .table-row { min-width: 640px; }
}
</style>
