<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <!-- User Categories -->
      <div class="nav-section">
        <div class="nav-section-title">User Categories</div>
        <NuxtLink to="/BSP/users/personal" class="nav-item" exact-active-class="active">
          <span class="nav-icon">👤</span>
          <span class="nav-label">Personal</span>
          <span class="nav-count">{{ stats.totalPersonal }}</span>
        </NuxtLink>
        <NuxtLink to="/BSP/users/school" class="nav-item" exact-active-class="active">
          <span class="nav-icon">🏫</span>
          <span class="nav-label">School</span>
          <span class="nav-count">{{ stats.totalSchools }}</span>
        </NuxtLink>
        <NuxtLink to="/BSP/users/consultant" class="nav-item" exact-active-class="active">
          <span class="nav-icon">💼</span>
          <span class="nav-label">Consultant</span>
          <span class="nav-count">{{ stats.totalAgents }}</span>
        </NuxtLink>
        <NuxtLink to="/BSP/users/business" class="nav-item" exact-active-class="active">
          <span class="nav-icon">🏢</span>
          <span class="nav-label">Business</span>
          <span class="nav-count">{{ stats.totalBusiness }}</span>
        </NuxtLink>
        <NuxtLink to="/BSP/users/bspstaff" class="nav-item" exact-active-class="active">
          <span class="nav-icon">👔</span>
          <span class="nav-label">BSP Staff</span>
          <span class="nav-count">{{ stats.totalStaff }}</span>
        </NuxtLink>
      </div>

      <!-- Management -->
      <div class="nav-section">
        <div class="nav-section-title">Management</div>
        <NuxtLink to="/BSP/dashboard" class="nav-item" exact-active-class="active">
          <span class="nav-icon">📊</span>
          <span class="nav-label">Overview</span>
        </NuxtLink>
        <NuxtLink to="/BSP/new-account-applications" class="nav-item" exact-active-class="active">
          <span class="nav-icon">📋</span>
          <span class="nav-label">Account Applications</span>
          <span v-if="pendingApplications > 0" class="nav-badge">{{ pendingApplications }}</span>
        </NuxtLink>
        <NuxtLink to="/BSP/payments" class="nav-item" exact-active-class="active">
          <span class="nav-icon">💳</span>
          <span class="nav-label">Payments</span>
        </NuxtLink>
        <NuxtLink to="/BSP/promo-codes" class="nav-item" exact-active-class="active">
          <span class="nav-icon">🎟️</span>
          <span class="nav-label">Promo Codes</span>
        </NuxtLink>
      </div>

      <!-- Settings -->
      <div class="nav-section">
        <div class="nav-section-title">Settings</div>
        <NuxtLink to="/BSP/settings/fees" class="nav-item" exact-active-class="active">
          <span class="nav-icon">💰</span>
          <span class="nav-label">Annual Fee</span>
          <span class="nav-count" style="visibility:hidden">0</span>
        </NuxtLink>
        <NuxtLink to="/BSP/settings/website" class="nav-item" exact-active-class="active">
          <span class="nav-icon">🌐</span>
          <span class="nav-label">Website Settings</span>
          <span class="nav-count" style="visibility:hidden">0</span>
        </NuxtLink>
        <NuxtLink to="/BSP/settings/staff" class="nav-item" exact-active-class="active">
          <span class="nav-icon">👔</span>
          <span class="nav-label">Staff</span>
          <span class="nav-count" style="visibility:hidden">0</span>
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
    totalBusiness?: number
    totalStaff?: number
  }
}

withDefaults(defineProps<Props>(), {
  pendingApplications: 0,
  stats: () => ({
    totalPersonal: 0,
    totalSchools: 0,
    totalAgents: 0,
    totalBusiness: 0,
    totalStaff: 0
  })
})
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
</style>
