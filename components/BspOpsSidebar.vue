<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <!-- Role Switcher -->
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
        <NuxtLink to="/operations/dashboard" class="nav-item" exact-active-class="active">
          <span class="nav-icon">📊</span>
          <span class="nav-label">Overview</span>
        </NuxtLink>
      </div>

      <div v-if="can('applications')" class="nav-section">
        <div class="nav-section-title">Applications</div>
        <NuxtLink to="/operations/applications" class="nav-item" exact-active-class="active">
          <span class="nav-icon">📋</span>
          <span class="nav-label">New Account Applications</span>
          <span v-if="pendingApplications > 0" class="nav-badge">{{ pendingApplications }}</span>
        </NuxtLink>
      </div>

      <div v-if="can('users')" class="nav-section">
        <div class="nav-section-title">User Directory</div>
        <NuxtLink v-if="can('manageUsers')" to="/operations/users" class="nav-item" exact-active-class="active">
          <span class="nav-icon">👤</span>
          <span class="nav-label">Personal</span>
          <span class="nav-count">{{ stats.totalPersonal }}</span>
        </NuxtLink>
        <NuxtLink v-if="can('manageUsers')" to="/operations/users" class="nav-item" exact-active-class="active">
          <span class="nav-icon">🏫</span>
          <span class="nav-label">School</span>
          <span class="nav-count">{{ stats.totalSchools }}</span>
        </NuxtLink>
        <NuxtLink v-if="can('manageUsers')" to="/operations/users" class="nav-item" exact-active-class="active">
          <span class="nav-icon">💼</span>
          <span class="nav-label">Consultant</span>
          <span class="nav-count">{{ stats.totalAgents }}</span>
        </NuxtLink>
        <NuxtLink v-if="!can('manageUsers') && can('viewUsers')" to="/operations/users" class="nav-item" exact-active-class="active">
          <span class="nav-icon">👥</span>
          <span class="nav-label">View Users</span>
        </NuxtLink>
      </div>

      <div v-if="can('payments')" class="nav-section">
        <div class="nav-section-title">Finance</div>
        <NuxtLink to="/operations/payments" class="nav-item" exact-active-class="active">
          <span class="nav-icon">💳</span>
          <span class="nav-label">Payments</span>
        </NuxtLink>
        <NuxtLink v-if="can('reports')" to="/operations/reports" class="nav-item" exact-active-class="active">
          <span class="nav-icon">📈</span>
          <span class="nav-label">Reports</span>
        </NuxtLink>
      </div>

      <div v-if="can('notifications') || can('resetPasswords')" class="nav-section">
        <div class="nav-section-title">Support Tools</div>
        <NuxtLink v-if="can('notifications')" to="/operations/notifications" class="nav-item" exact-active-class="active">
          <span class="nav-icon">📢</span>
          <span class="nav-label">Send Notifications</span>
        </NuxtLink>
        <NuxtLink v-if="can('resetPasswords')" to="/operations/reset-passwords" class="nav-item" exact-active-class="active">
          <span class="nav-icon">🔑</span>
          <span class="nav-label">Password Resets</span>
        </NuxtLink>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
interface Props {
  pendingApplications?: number
  stats?: {
    totalPersonal?: number
    totalSchools?: number
    totalAgents?: number
    totalUsers?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  pendingApplications: 0,
  stats: () => ({
    totalPersonal: 0,
    totalSchools: 0,
    totalAgents: 0,
    totalUsers: 0
  })
})

const currentRole = ref<'manager' | 'staff'>('manager')

const permissions: Record<string, string[]> = {
  manager: ['applications', 'approveApplications', 'users', 'manageUsers', 'payments', 'reports', 'notifications'],
  staff: ['applications', 'reviewApplications', 'users', 'viewUsers', 'notifications', 'resetPasswords'],
}

const can = (permission: string): boolean => {
  return permissions[currentRole.value]?.includes(permission) || false
}
</script>

<style scoped>
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
  overflow-x: hidden;
}

.nav-section {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  padding: 0 0.25rem;
}

.nav-section-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  padding: 0 1.5rem;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
  user-select: none;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.25rem;
  height: 44px;
  width: 100%;
  border-radius: 8px;
  color: #64748b;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  position: relative;
  box-sizing: border-box;
  white-space: nowrap;
  transition: background-color 0.2s, color 0.2s;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #212E54;
}

.nav-item.active {
  background: #eff6ff;
  color: #212E54;
  box-shadow: inset 3px 0 0 0 #3b82f6;
}

.nav-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  width: 1.25rem;
  text-align: center;
  line-height: 1;
}

.nav-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-count {
  flex-shrink: 0;
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  line-height: 1;
}

.nav-badge {
  flex-shrink: 0;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  margin-left: 0.5rem;
  line-height: 1;
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
  border-color: #3b82f6;
  color: #212E54;
}

.role-btn.active {
  background: #212E54;
  color: white;
  border-color: #212E54;
}
</style>
