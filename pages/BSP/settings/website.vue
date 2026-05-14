<template>
  <div class="bsp-dashboard">
    <div class="dashboard-body">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">User Categories</div>
            <NuxtLink to="/BSP/users/personal" class="nav-item">
              <span class="nav-icon">👤</span>
              <span>Personal</span>
            </NuxtLink>
            <NuxtLink to="/BSP/users/school" class="nav-item">
              <span class="nav-icon">🏫</span>
              <span>School</span>
            </NuxtLink>
            <NuxtLink to="/BSP/users/consultant" class="nav-item">
              <span class="nav-icon">💼</span>
              <span>Consultant</span>
            </NuxtLink>
            <NuxtLink to="/BSP/users/bspstaff" class="nav-item">
              <span class="nav-icon">👔</span>
              <span>BSP Staff</span>
            </NuxtLink>
          </div>
          <div class="nav-section">
            <div class="nav-section-title">Management</div>
            <NuxtLink to="/BSP/dashboard" class="nav-item">
              <span class="nav-icon">📊</span>
              <span>Overview</span>
            </NuxtLink>
            <NuxtLink to="/BSP/new-account-applications" class="nav-item">
              <span class="nav-icon">📋</span>
              <span>New Account Applications</span>
            </NuxtLink>
            <NuxtLink to="/BSP/payments" class="nav-item">
              <span class="nav-icon">💳</span>
              <span>Payments</span>
            </NuxtLink>
          </div>
          <div class="nav-section">
            <div class="nav-section-title">Settings</div>
            <NuxtLink to="/BSP/settings/fees" class="nav-item">
              <span class="nav-icon">💰</span>
              <span>Annual Fee</span>
            </NuxtLink>
            <NuxtLink to="/BSP/settings/website" class="nav-item active">
              <span class="nav-icon">🌐</span>
              <span>Website Settings</span>
            </NuxtLink>
            <NuxtLink to="/BSP/settings/staff" class="nav-item">
              <span class="nav-icon">👔</span>
              <span>Staff</span>
            </NuxtLink>
          </div>
        </nav>
      </aside>
      <main class="main-content">
        <div class="page-header">
          <div class="page-title-area">
            <h1 class="page-title">🌐 Website Settings</h1>
            <p class="page-subtitle">Configure site information, branding and contact details</p>
          </div>
        </div>
        <div class="settings-section">
          <div class="section-header">
            <h2 class="section-title">Site Information</h2>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Site Name</label>
              <input v-model="site.name" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Tagline</label>
              <input v-model="site.tagline" type="text" class="form-input" />
            </div>
            <div class="form-group full-width">
              <label class="form-label">Site Description</label>
              <textarea v-model="site.description" class="form-textarea" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="settings-section">
          <div class="section-header">
            <h2 class="section-title">Contact Information</h2>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Support Email</label>
              <input v-model="site.supportEmail" type="email" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Support Phone</label>
              <input v-model="site.supportPhone" type="text" class="form-input" />
            </div>
            <div class="form-group full-width">
              <label class="form-label">Office Address</label>
              <textarea v-model="site.address" class="form-textarea" rows="2"></textarea>
            </div>
          </div>
        </div>
        <div class="settings-section">
          <div class="section-header">
            <h2 class="section-title">Social Media</h2>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Facebook</label>
              <input v-model="site.social.facebook" type="url" class="form-input" placeholder="https://facebook.com/..." />
            </div>
            <div class="form-group">
              <label class="form-label">Instagram</label>
              <input v-model="site.social.instagram" type="url" class="form-input" placeholder="https://instagram.com/..." />
            </div>
            <div class="form-group">
              <label class="form-label">LinkedIn</label>
              <input v-model="site.social.linkedin" type="url" class="form-input" placeholder="https://linkedin.com/..." />
            </div>
            <div class="form-group">
              <label class="form-label">YouTube</label>
              <input v-model="site.social.youtube" type="url" class="form-input" placeholder="https://youtube.com/..." />
            </div>
          </div>
        </div>
        <div class="settings-footer">
          <button class="btn btn-primary" @click="saveSettings">💾 Save Changes</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const site = ref({
  name: 'British School Portal',
  tagline: 'Connecting Students with UK Boarding Schools',
  description: 'The British School Portal (BSP) is a comprehensive platform connecting students, parents, and education consultants with UK boarding schools.',
  supportEmail: 'support@britishschoolportal.com',
  supportPhone: '+44 20 7946 0958',
  address: '10 Newark, London, United Kingdom',
  social: { facebook: '', instagram: '', linkedin: '', youtube: '' }
})
const saveSettings = () => { alert('Website settings saved!') }
</script>

<style scoped>
.bsp-dashboard { min-height: 100vh; background: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; }
.dashboard-body { display: flex; min-height: 100vh; }
.sidebar { width: 260px; background: white; border-right: 1px solid #e2e8f0; padding: 1.5rem 0; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
.nav-section { margin-bottom: 1.5rem; }
.nav-section-title { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; padding: 0 1.5rem; margin-bottom: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.5rem; color: #64748b; text-decoration: none; font-weight: 500; font-size: 0.9rem; transition: all 0.2s; border-left: 3px solid transparent; }
.nav-item:hover { background: #f1f5f9; color: #212E54; }
.nav-item.active { background: #eff6ff; color: #212E54; border-left-color: #3b82f6; font-weight: 600; }
.nav-icon { font-size: 1.1rem; }
.main-content { flex: 1; padding: 2rem; max-width: 1200px; }
.page-header { margin-bottom: 2rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #212E54; margin-bottom: 0.25rem; }
.page-subtitle { font-size: 0.9rem; color: #64748b; }
.settings-section { background: white; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.section-header { margin-bottom: 1.25rem; }
.section-title { font-size: 1.1rem; font-weight: 600; color: #1e293b; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group.full-width { grid-column: 1 / -1; }
.form-label { font-size: 0.8rem; font-weight: 600; color: #64748b; }
.form-input, .form-textarea { padding: 0.65rem 0.875rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem; font-family: inherit; }
.form-input:focus, .form-textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.form-textarea { resize: vertical; }
.btn { padding: 0.6rem 1.25rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }
.settings-footer { display: flex; justify-content: flex-end; }
@media (max-width: 768px) {
  .sidebar { display: none; }
  .main-content { padding: 1rem; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>
