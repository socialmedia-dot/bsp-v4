<template>
  <aside class="sidebar">
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
</template>

<script setup lang="ts">
defineProps<{
  active?: string
}>()
</script>

<style scoped>
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
</style>
