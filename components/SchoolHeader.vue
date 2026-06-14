<template>
  <header class="school-header">
    <div class="header-left">
      <button class="hamburger" @click="toggle">☰</button>
      <NuxtLink to="/" class="logo-link">
        <img src="/img/logo-bsp.jpg" alt="British School Portal" class="logo-img">
      </NuxtLink>
    </div>
    <div class="header-right">
      <span class="school-name">🏫 Westminster School</span>
      <span class="user-pill">👤 School Admin</span>
      <NuxtLink to="/login" class="logout">Logout</NuxtLink>
    </div>
  </header>
</template>

<script setup>
const { toggle } = useSidebarState()
</script>

<style scoped>
.school-header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 60;
  flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 0.75rem; }
.hamburger {
  display: none;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
}
.logo-img { height: 32px; border-radius: 4px; }
.header-right { display: flex; align-items: center; gap: 1rem; font-size: 0.85rem; }
.school-name { font-weight: 600; color: #1e293b; }
.user-pill { background: #f1f5f9; padding: 4px 10px; border-radius: 12px; color: #475569; font-size: 0.8rem; }
.logout { color: #64748b; text-decoration: none; font-size: 0.8rem; font-weight: 500; }
.logout:hover { color: #ef4444; }
@media (max-width: 768px) {
  .hamburger { display: block; }
  .school-name { display: none; }
  .header-right { gap: 0.75rem; }
}
</style>
