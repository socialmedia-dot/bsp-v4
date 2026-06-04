<template>
  <div class="bsp-dashboard">
    <div class="dashboard-body">
      <BspSidebar active="website" />
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
/* No page-specific styles needed — uses global bsp-admin.css */
</style>
