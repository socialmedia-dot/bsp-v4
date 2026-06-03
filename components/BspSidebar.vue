<template>
  <div class="sidebar-wrapper">
    <!-- Mobile Overlay Backdrop -->
    <div
      v-if="isOpen"
      class="sidebar-backdrop"
      @click="close"
    ></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: isOpen }">
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-title">User Categories</div>
          <NuxtLink to="/BSP/users/personal" :class="['nav-item', { active: active === 'personal' }]" @click="close">
            <span class="nav-icon">👤</span>
            <span>Personal</span>
            <span class="nav-count">12</span>
          </NuxtLink>
          <NuxtLink to="/BSP/users/school" :class="['nav-item', { active: active === 'school' }]" @click="close">
            <span class="nav-icon">🏫</span>
            <span>School</span>
            <span class="nav-count">24</span>
          </NuxtLink>
          <NuxtLink to="/BSP/users/consultant" :class="['nav-item', { active: active === 'consultant' }]" @click="close">
            <span class="nav-icon">💼</span>
            <span>Consultant</span>
            <span class="nav-count">8</span>
          </NuxtLink>
          <NuxtLink to="/BSP/users/business" :class="['nav-item', { active: active === 'business' }]" @click="close">
            <span class="nav-icon">🏢</span>
            <span>Business</span>
            <span class="nav-count">8</span>
          </NuxtLink>
          <NuxtLink to="/BSP/users/bspstaff" :class="['nav-item', { active: active === 'bspstaff' }]" @click="close">
            <span class="nav-icon">👔</span>
            <span>BSP Staff</span>
            <span class="nav-count">3</span>
          </NuxtLink>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">Management</div>
          <NuxtLink to="/BSP/dashboard" :class="['nav-item', { active: active === 'dashboard' }]" @click="close">
            <span class="nav-icon">📊</span>
            <span>Overview</span>
          </NuxtLink>
          <NuxtLink to="/BSP/new-account-applications" :class="['nav-item', { active: active === 'applications' }]" @click="close">
            <span class="nav-icon">📋</span>
            <span>New Account Applications</span>
          </NuxtLink>
          <NuxtLink to="/BSP/payments" :class="['nav-item', { active: active === 'payments' }]" @click="close">
            <span class="nav-icon">💳</span>
            <span>Payments</span>
          </NuxtLink>
          <NuxtLink to="/BSP/promo-codes" :class="['nav-item', { active: active === 'promo-codes' }]" @click="close">
            <span class="nav-icon">🎟️</span>
            <span>Promo Codes</span>
          </NuxtLink>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">Settings</div>
          <NuxtLink to="/BSP/settings/fees" :class="['nav-item', { active: active === 'fees' }]" @click="close">
            <span class="nav-icon">💰</span>
            <span>Annual Fee</span>
          </NuxtLink>
          <NuxtLink to="/BSP/settings/website" :class="['nav-item', { active: active === 'website' }]" @click="close">
            <span class="nav-icon">🌐</span>
            <span>Website Settings</span>
          </NuxtLink>
          <NuxtLink to="/BSP/settings/staff" :class="['nav-item', { active: active === 'staff' }]" @click="close">
            <span class="nav-icon">👔</span>
            <span>Staff</span>
          </NuxtLink>
        </div>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  active?: string
}>()

const { isOpen, close } = useSidebarState()

// Close sidebar on route change
const route = useRoute()
watch(() => route.path, () => {
  close()
})
</script>

<style scoped>
.sidebar-wrapper {
  position: relative;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #e2e8f0;
  border-radius: 0;
  box-shadow: none;
  flex-shrink: 0;
  height: 100vh;
  margin-right: 0;
  overflow-y: auto;
  padding: 0;
  position: sticky;
  top: 0;
  width: 260px;
  z-index: 50;
}

.sidebar-nav {
  padding: 1.5rem 0;
}

.nav-section {
  margin-bottom: 1.5rem;
}

.nav-section-title {
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  padding: 0 1.5rem 0 3.35rem;
  text-transform: uppercase;
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
  color: #212E54;
}

.nav-item.active {
  background: #eff6ff;
  color: #212E54;
  border-left-color: #3b82f6;
  font-weight: 600;
}

.nav-icon {
  font-size: 1.1rem;
}

.nav-count {
  margin-left: auto;
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
}

/* Mobile Overlay Backdrop */
.sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 40;
}

/* ============================================
   MOBILE RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .sidebar-backdrop {
    display: block;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: 4px 0 20px rgba(0,0,0,0.15);
    z-index: 50;
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
