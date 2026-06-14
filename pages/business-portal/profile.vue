<template>
  <div class="portal-page">
    <div class="dashboard-body">
      <BusinessSidebar active="profile" />
      <main class="main-content">
        <div class="page-header">
          <h1>🏢 Business Profile</h1>
          <p class="subtitle">Draft page — awaiting review</p>
        </div>
        <div class="draft-placeholder">
          <div class="placeholder-icon">🚧</div>
          <h2>Page Under Construction</h2>
          <p>This page is a draft framework. Content and functionality will be added after review.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })
useHead({ title: '🏢 Business Profile — BSP' })
</script>

<style scoped>
.portal-page { min-height: 100vh; background: #f8fafc; }
.dashboard-body { display: flex; min-height: 100vh; }
.main-content { flex: 1; padding: 2rem; }
.page-header { margin-bottom: 2rem; }
.page-header h1 { font-size: 1.75rem; color: #1a1a2e; margin-bottom: 0.5rem; }
.subtitle { color: #f59e0b; font-size: 0.9rem; font-weight: 500; }
.draft-placeholder { background: white; border: 2px dashed #e2e8f0; border-radius: 16px; padding: 4rem 2rem; text-align: center; }
.placeholder-icon { font-size: 3rem; margin-bottom: 1rem; }
.draft-placeholder h2 { color: #1a1a2e; margin-bottom: 0.5rem; }
.draft-placeholder p { color: #6b7280; }
</style>
