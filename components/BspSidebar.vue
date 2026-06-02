<template>
  <div class="sidebar-wrapper">
    <!-- Mobile Hamburger Button -->
    <button
      class="mobile-menu-btn"
      :class="{ active: mobileOpen }"
      @click="mobileOpen = !mobileOpen"
      aria-label="Toggle menu"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <!-- Mobile Overlay Backdrop -->
    <div
      v-if="mobileOpen"
      class="sidebar-backdrop"
      @click="mobileOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: mobileOpen }">
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-title">User Categories</div>
          <NuxtLink to="/BSP/users/personal" :class="['nav-item', { active: active === 'personal' }]">
            <span class="nav-icon">👤</span>
            <span>Personal</span>
            <span class="nav-count">12</span>
          </NuxtLink>
          <NuxtLink to="/BSP/users/school" :class="['nav-item', { active: active === 'school' }]">
            <span class="nav-icon">🏫</span>
            <span>School</span>
            <span class="nav-count">24</span>
          </NuxtLink>
          <NuxtLink to="/BSP/users/consultant" :class="['nav-item', { active: active === 'consultant' }]">
            <span class="nav-icon">💼</span>
            <span>Consultant</span>
            <span class="nav-count">8</span>
          </NuxtLink>
          <NuxtLink to="/BSP/users/business" :class="['nav-item', { active: active === 'business' }]">
            <span class="nav-icon">🏢</span>
            <span>Business</span>
            <span class="nav-count">8</span>
          </NuxtLink>
          <NuxtLink to="/BSP/users/bspstaff" :class="['nav-item', { active: active === 'bspstaff' }]">
            <span class="nav-icon">👔</span>
            <span>BSP Staff</span>
            <span class="nav-count">3</span>
          </NuxtLink>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">Management</div>
          <NuxtLink to="/BSP/dashboard" :class="['nav-item', { active: active === 'dashboard' }]">
            <span class="nav-icon">📊</span>
            <span>Overview</span>
          </NuxtLink>
          <NuxtLink to="/BSP/new-account-applications" :class="['nav-item', { active: active === 'applications' }]">
            <span class="nav-icon">📋</span>
            <span>New Account Applications</span>
          </NuxtLink>
          <NuxtLink to="/BSP/payments" :class="['nav-item', { active: active === 'payments' }]">
            <span class="nav-icon">💳</span>
            <span>Payments</span>
          </NuxtLink>
          <NuxtLink to="/BSP/promo-codes" :class="['nav-item', { active: active === 'promo-codes' }]">
            <span class="nav-icon">🎟️</span>
            <span>Promo Codes</span>
          </NuxtLink>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">Settings</div>
          <NuxtLink to="/BSP/settings/fees" :class="['nav-item', { active: active === 'fees' }]">
            <span class="nav-icon">💰</span>
            <span>Annual Fee</span>
          </NuxtLink>
          <NuxtLink to="/BSP/settings/website" :class="['nav-item', { active: active === 'website' }]">
            <span class="nav-icon">🌐</span>
            <span>Website Settings</span>
          </NuxtLink>
          <NuxtLink to="/BSP/settings/staff" :class="['nav-item', { active: active === 'staff' }]">
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

const mobileOpen = ref(false)

// Close mobile menu on route change
const route = useRoute()
watch(() => route.path, () => {
  mobileOpen.value = false
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
  padding: 1.5rem 1rem;
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
  padding-left: 0.75rem;
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

/* Mobile Hamburger Button */
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 60;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.hamburger-line {
  display: block;
  width: 20px;
  height: 2px;
  background: #212E54;
  border-radius: 2px;
  transition: all 0.3s;
}

.mobile-menu-btn.active .hamburger-line:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.mobile-menu-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
}
.mobile-menu-btn.active .hamburger-line:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
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
  .mobile-menu-btn {
    display: flex;
  }

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
