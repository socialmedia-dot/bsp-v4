<template>
  <div class="sidebar-wrapper">
    <div v-if="isOpen" class="sidebar-backdrop" @click="close"></div>
    <aside class="sidebar" :class="{ open: isOpen }">
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-title">School Portal</div>
          <NuxtLink to="/school/dashboard" :class="['nav-item', { active: active === 'dashboard' }]" @click="close">
            <span class="nav-icon">📊</span><span>Dashboard</span>
          </NuxtLink>
          <NuxtLink to="/school/applications" :class="['nav-item', { active: active === 'applications' }]" @click="close">
            <span class="nav-icon">📋</span><span>Applications</span>
          </NuxtLink>
          <NuxtLink to="/school/profile" :class="['nav-item', { active: active === 'profile' }]" @click="close">
            <span class="nav-icon">🏫</span><span>School Profile</span>
          </NuxtLink>
          <NuxtLink to="/school/reports" :class="['nav-item', { active: active === 'reports' }]" @click="close">
            <span class="nav-icon">📈</span><span>Reports</span>
          </NuxtLink>
          <NuxtLink to="/school/partnerships" :class="['nav-item', { active: active === 'partnerships' }]" @click="close">
            <span class="nav-icon">🤝</span><span>Partnerships</span>
          </NuxtLink>
          <NuxtLink to="/school/admissions" :class="['nav-item', { active: active === 'admissions' }]" @click="close">
            <span class="nav-icon">🎓</span><span>Admission Settings</span>
          </NuxtLink>
        </div>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
defineProps<{ active?: string }>()
const { isOpen, close } = useSidebarState()
const route = useRoute()
watch(() => route.path, () => { close() })
</script>

<style scoped>
.sidebar-wrapper { position: relative; }
.sidebar { background: #fff; border-right: 1px solid #e2e8f0; flex-shrink: 0; height: calc(100vh - 56px); overflow-y: auto; position: sticky; top: 56px; width: 260px; z-index: 50; }
.sidebar-nav { padding: 1.5rem 0; }
.nav-section { margin-bottom: 1.5rem; }
.nav-section-title { color: #94a3b8; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 0.5rem; padding: 0 1.5rem 0 3.35rem; text-transform: uppercase; }
.nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.5rem; color: #64748b; text-decoration: none; font-weight: 500; font-size: 0.9rem; transition: all 0.2s; border-left: 3px solid transparent; }
.nav-item:hover { background: #f1f5f9; color: #212E54; }
.nav-item.active { background: #eff6ff; color: #212E54; border-left-color: #3b82f6; font-weight: 600; }
.nav-icon { font-size: 1.1rem; }
.sidebar-backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 40; }
@media (max-width: 768px) {
  .sidebar-backdrop { display: block; }
  .sidebar { position: fixed; top: 0; left: 0; height: 100dvh; transform: translateX(-100%); transition: transform 0.3s ease; box-shadow: 4px 0 20px rgba(0,0,0,0.15); z-index: 110; padding-top: 3.5rem; }
  .sidebar.open { transform: translateX(0); }
}
</style>
