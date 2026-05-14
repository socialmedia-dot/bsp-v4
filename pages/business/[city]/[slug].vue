<template>
  <div class="profile-page">
    <!-- Header Banner -->
    <div class="profile-banner business-banner">
      <div class="banner-content">
        <div class="banner-icon">🏢</div>
        <div class="banner-meta">
          <span class="profile-type">Business Account</span>
          <span class="profile-country">{{ business?.location || '—' }}</span>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-if="!business" class="not-found">
      <div class="not-found-icon">🔍</div>
      <h1>Business Not Found</h1>
      <p>The business you're looking for doesn't exist or has been removed.</p>
      <NuxtLink to="/" class="back-link">← Back to Home</NuxtLink>
    </div>

    <!-- Profile Content -->
    <div v-else class="profile-container">
      <!-- Main Info Card -->
      <div class="profile-card main-card">
        <div class="card-header">
          <div class="business-avatar">🏢</div>
          <div class="business-title">
            <h1 class="business-name">{{ business.company }}</h1>
            <div class="business-contact">{{ business.name }}</div>
            <div class="business-badges">
              <span class="status-badge" :class="'status-' + (business.status || 'pending')">
                {{ business.status || 'pending' }}
              </span>
              <span class="country-badge">
                📍 {{ business.location }}
              </span>
            </div>
          </div>
        </div>

        <div class="card-body">
          <!-- Contact Information -->
          <div class="info-section">
            <h3 class="section-title">📞 Contact Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Contact Name</span>
                <span class="info-value">{{ business.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">
                  <a :href="'mailto:' + business.email" class="info-link">{{ business.email }}</a>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone</span>
                <span class="info-value">
                  <a :href="'tel:' + business.phone" class="info-link">{{ business.phone }}</a>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Role</span>
                <span class="info-value">{{ business.role }}</span>
              </div>
            </div>
          </div>

          <!-- Application Details -->
          <div class="info-section">
            <h3 class="section-title">📋 Application Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Application ID</span>
                <span class="info-value mono">APP-{{ String(business.id).padStart(5, '0') }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Submitted</span>
                <span class="info-value">{{ business.submittedDate }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">Notes</span>
                <span class="info-value notes">{{ business.notes || '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Card -->
      <div class="profile-card sidebar-card">
        <div class="card-body">
          <!-- Status Timeline -->
          <div class="info-section">
            <h3 class="section-title">📅 Timeline</h3>
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-dot active"></div>
                <div class="timeline-content">
                  <span class="timeline-label">Application Submitted</span>
                  <span class="timeline-date">{{ business.submittedDate }}</span>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot" :class="business.approvedDate ? 'active' : ''"></div>
                <div class="timeline-content">
                  <span class="timeline-label">Approved</span>
                  <span class="timeline-date">{{ business.approvedDate || 'Pending' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Document Status -->
          <div class="info-section">
            <h3 class="section-title">📎 Document</h3>
            <div class="doc-status">
              <span class="doc-badge">📄 {{ business.documentStatus || 'Uploaded' }}</span>
            </div>
          </div>

          <!-- CTA -->
          <div class="cta-box">
            <p class="cta-text">Interested in partnering with this business?</p>
            <a :href="'mailto:' + business.email" class="cta-btn">📧 Contact Business</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const city = route.params.city as string

// Mock data — same as new-account-applications (type === 'Business')
const businesses = [
  {
    id: 3,
    name: 'Mr. Jason Lam',
    email: 'jason@globalstudygroup.com',
    type: 'Business',
    company: 'Global Study Group Ltd',
    phone: '+852 4567 8901',
    location: 'Singapore',
    submittedDate: '2026-04-23',
    approvedDate: null,
    rejectedDate: null,
    status: 'pending',
    role: 'Regional Director',
    documentStatus: 'Uploaded',
    notes: 'Regional education agency expanding into UK market. Requesting multi-agent licensing.'
  },
  {
    id: 9,
    name: 'Mr. Andrew Hui',
    email: 'andrew@edustart.com.hk',
    type: 'Business',
    company: 'EduStart Education Services',
    phone: '+852 9012 3456',
    location: 'Hong Kong',
    submittedDate: '2026-04-10',
    approvedDate: '2026-04-12',
    rejectedDate: null,
    status: 'approved',
    role: 'Managing Director',
    documentStatus: 'Uploaded',
    notes: 'Business account approved. Multi-agent licence granted.'
  },
]

// Slugify helper
const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Find business by slug
const business = computed(() => {
  return businesses.find(b => slugify(b.company) === slug) || null
})

// SEO meta
const { setMeta } = useSEO()
setMeta({
  title: business.value ? `${business.value.company} — BSP Business Profile` : 'Business Not Found',
  description: business.value
    ? `${business.value.company} (${business.value.role}) in ${business.value.location}. ${business.value.notes || ''}`
    : 'Business profile not found.',
  path: `/business/${city}/${slug}`,
  type: 'website'
})
</script>

<style scoped>
/* Reset & Base */
* { margin: 0; padding: 0; box-sizing: border-box; }

.profile-page {
  min-height: 100vh;
  background: #f0f2f5;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
}

/* Banner */
.profile-banner {
  background: linear-gradient(135deg, #065f46 0%, #047857 100%);
  padding: 2rem 2rem 3rem;
}

.business-banner {
  background: linear-gradient(135deg, #065f46 0%, #047857 100%);
}

.banner-content {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.banner-icon {
  font-size: 3rem;
  background: rgba(255,255,255,0.15);
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.profile-type {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.6);
  font-weight: 600;
}

.profile-country {
  font-size: 1rem;
  color: rgba(255,255,255,0.9);
  font-weight: 500;
}

/* Not Found */
.not-found {
  max-width: 480px;
  margin: 4rem auto;
  text-align: center;
  padding: 2rem;
}

.not-found-icon { font-size: 4rem; margin-bottom: 1rem; }
.not-found h1 { font-size: 1.5rem; color: #212E54; margin-bottom: 0.5rem; }
.not-found p { color: #64748b; margin-bottom: 1.5rem; }
.back-link { color: #3b82f6; text-decoration: none; font-weight: 500; }

/* Container */
.profile-container {
  max-width: 960px;
  margin: -1.5rem auto 2rem;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1rem;
  align-items: start;
}

/* Cards */
.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.main-card .card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.business-avatar {
  font-size: 2.5rem;
  width: 64px;
  height: 64px;
  background: #ecfdf5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.business-title { flex: 1; }

.business-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #212E54;
  margin-bottom: 0.25rem;
}

.business-contact {
  font-size: 0.95rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.business-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-approved { background: #d1fae5; color: #047857; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-rejected { background: #fee2e2; color: #991b1b; }

.country-badge {
  background: #eff6ff;
  color: #1e40af;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-body {
  padding: 1.5rem;
}

.info-section {
  margin-bottom: 1.5rem;
}

.info-section:last-child { margin-bottom: 0; }

.section-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  font-weight: 700;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-weight: 600;
}

.info-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
}

.info-link {
  color: #3b82f6;
  text-decoration: none;
}

.info-link:hover { text-decoration: underline; }

.mono {
  font-family: monospace;
  font-size: 0.85rem;
}

.notes {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 3px solid #e2e8f0;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: 0.75rem;
  padding-bottom: 1rem;
  position: relative;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 18px;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item:last-child { padding-bottom: 0; }

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e2e8f0;
  flex-shrink: 0;
  margin-top: 2px;
}

.timeline-dot.active {
  background: #047857;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.timeline-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.timeline-date {
  font-size: 0.75rem;
  color: #64748b;
}

/* Document */
.doc-status {
  padding: 0.75rem;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #86efac;
}

.doc-badge {
  font-size: 0.85rem;
  font-weight: 600;
  color: #047857;
}

/* CTA */
.cta-box {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #065f46, #047857);
  border-radius: 10px;
  text-align: center;
}

.cta-text {
  color: rgba(255,255,255,0.8);
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.cta-btn {
  display: inline-block;
  background: white;
  color: #065f46;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  transition: transform 0.2s;
}

.cta-btn:hover { transform: translateY(-1px); }

/* Responsive */
@media (max-width: 768px) {
  .profile-container { grid-template-columns: 1fr; }
  .sidebar-card { order: -1; }
  .info-grid { grid-template-columns: 1fr; }
  .business-name { font-size: 1.2rem; }
}
</style>
