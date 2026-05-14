<template>
  <div class="profile-page">
    <!-- Header Banner -->
    <div class="profile-banner consultant-banner">
      <div class="banner-content">
        <div class="banner-icon">💼</div>
        <div class="banner-meta">
          <span class="profile-type">Education Consultant</span>
          <span class="profile-country">{{ consultant?.location || '—' }}</span>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-if="!consultant" class="not-found">
      <div class="not-found-icon">🔍</div>
      <h1>Consultant Not Found</h1>
      <p>The consultant you're looking for doesn't exist or has been removed.</p>
      <NuxtLink to="/" class="back-link">← Back to Home</NuxtLink>
    </div>

    <!-- Profile Content -->
    <div v-else class="profile-container">
      <!-- Main Info Card -->
      <div class="profile-card main-card">
        <div class="card-header">
          <div class="consultant-avatar">💼</div>
          <div class="consultant-title">
            <h1 class="consultant-name">{{ consultant.name }}</h1>
            <div class="consultant-company">{{ consultant.company }}</div>
            <div class="consultant-badges">
              <span class="status-badge" :class="'status-' + (consultant.status || 'active')">
                {{ consultant.status || 'active' }}
              </span>
              <span class="country-badge">
                📍 {{ consultant.location }}
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
                <span class="info-label">Email</span>
                <span class="info-value">
                  <a :href="'mailto:' + consultant.email" class="info-link">{{ consultant.email }}</a>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone</span>
                <span class="info-value">
                  <a :href="'tel:' + consultant.phone" class="info-link">{{ consultant.phone }}</a>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Company</span>
                <span class="info-value">{{ consultant.company }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Consultant ID</span>
                <span class="info-value mono">{{ consultant.userCode }}</span>
              </div>
            </div>
          </div>

          <!-- Performance Stats -->
          <div class="info-section">
            <h3 class="section-title">📊 Performance</h3>
            <div class="perf-grid">
              <div class="perf-item">
                <span class="perf-value">{{ consultant.liveApplications }}</span>
                <span class="perf-label">Live Applications</span>
              </div>
              <div class="perf-item">
                <span class="perf-value">{{ consultant.partneredSchools }}</span>
                <span class="perf-label">Partnered Schools</span>
              </div>
              <div class="perf-item">
                <span class="perf-value">{{ consultant.completedApplications }}</span>
                <span class="perf-label">Completed</span>
              </div>
              <div class="perf-item">
                <span class="perf-value accent">{{ consultant.commission }}</span>
                <span class="perf-label">Commission Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Card -->
      <div class="profile-card sidebar-card">
        <div class="card-body">
          <!-- Quick Stats -->
          <div class="info-section">
            <h3 class="section-title">📅 Details</h3>
            <div class="stats-list">
              <div class="stat-item">
                <span class="stat-icon">📋</span>
                <span class="stat-label">Registered</span>
                <span class="stat-value">{{ consultant.registeredAt }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🕐</span>
                <span class="stat-label">Last Login</span>
                <span class="stat-value">{{ consultant.lastLogin }}</span>
              </div>
            </div>
          </div>

          <!-- Referred Schools -->
          <div v-if="consultant.referredList && consultant.referredList.length > 0" class="info-section">
            <h3 class="section-title">🏫 Referred Schools</h3>
            <div class="referred-list">
              <div v-for="(school, idx) in consultant.referredList" :key="idx" class="referred-item">
                <span class="referred-name">{{ school.name }}</span>
                <span class="referred-status" :class="'status-' + school.status.toLowerCase()">{{ school.status }}</span>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div class="cta-box">
            <p class="cta-text">Interested in working with this consultant?</p>
            <a :href="'mailto:' + consultant.email" class="cta-btn">📧 Contact Consultant</a>
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

// Mock data — same as agent.vue
const consultants = [
  { id: 1, userCode: '2026011000001', name: 'Ms. Victoria Chan', company: 'Victoria Education Group', email: 'victoria@vedu.com.hk', phone: '+852 2345 6789', registeredAt: '2026-01-10', lastLogin: '2026-04-21 09:30', liveApplications: 2, partneredSchools: 8, completedApplications: 12, commission: '12%', status: 'active', location: 'Hong Kong', referredList: [
    { name: "St. Mary's School", status: 'Active' },
    { name: 'Brighton College', status: 'Active' },
    { name: "King's College School", status: 'Active' },
    { name: 'Wycombe Abbey', status: 'Pending' },
    { name: 'Benenden School', status: 'Active' }
  ]},
  { id: 2, userCode: '2026022500001', name: 'Mr. James Wong', company: 'UK Study Link', email: 'james@ukstudylink.com', phone: '+852 3456 7890', registeredAt: '2026-02-25', lastLogin: '2026-04-20 16:45', liveApplications: 1, partneredSchools: 5, completedApplications: 8, commission: '10%', status: 'active', location: 'Hong Kong', referredList: [
    { name: 'Harrow School', status: 'Active' },
    { name: 'Eton College', status: 'Active' },
    { name: "Cheltenham Ladies' College", status: 'Active' }
  ]},
  { id: 3, userCode: '2026031200001', name: 'Ms. Sarah Li', company: 'Elite Education Consultancy', email: 'sarah@eliteedu.hk', phone: '+852 4567 8901', registeredAt: '2026-03-12', lastLogin: '2026-04-19 14:20', liveApplications: 1, partneredSchools: 4, completedApplications: 5, commission: '8%', status: 'active', location: 'Hong Kong', referredList: [
    { name: "St. Paul's School", status: 'Active' },
    { name: 'Downe House School', status: 'Pending' }
  ]},
  { id: 4, userCode: '2026040500001', name: 'Mr. David Thompson', company: 'British Education HK', email: 'david@briteduhk.com', phone: '+44 7700 900123', registeredAt: '2026-04-05', lastLogin: '2026-04-21 11:00', liveApplications: 3, partneredSchools: 6, completedApplications: 2, commission: '15%', status: 'active', location: 'United Kingdom', referredList: [
    { name: 'Wellington College', status: 'Active' }
  ]},
  { id: 5, userCode: '2026041500001', name: 'Ms. Emma Liu', company: 'Global Study Partners', email: 'emma@globalstudy.hk', phone: '+852 5678 9012', registeredAt: '2026-04-15', lastLogin: '2026-04-20 10:30', liveApplications: 0, partneredSchools: 3, completedApplications: 0, commission: '5%', status: 'pending', location: 'Hong Kong', referredList: [] },
  { id: 6, userCode: '2026041800001', name: 'Mr. Robert Chen', company: 'Oxford Education Consultants', email: 'robert@oxfordedu.com', phone: '+852 6789 0123', registeredAt: '2026-04-18', lastLogin: '2026-04-19 15:00', liveApplications: 0, partneredSchools: 10, completedApplications: 4, commission: '10%', status: 'suspended', location: 'Hong Kong', referredList: [
    { name: 'Charterhouse', status: 'Suspended' }
  ]},
  { id: 7, userCode: '2026042100001', name: 'Ms. Grace Wang', company: 'Cambridge Agents Ltd', email: 'grace@cambridgeagents.com', phone: '+852 7890 1234', registeredAt: '2026-04-21', lastLogin: '—', liveApplications: 0, partneredSchools: 2, completedApplications: 0, commission: '8%', status: 'active', location: 'Hong Kong', referredList: [] },
  { id: 8, userCode: '2025080100001', name: 'Mr. Peter Zhang', company: 'Crown Education International', email: 'peter@crownedu.com', phone: '+852 8901 2345', registeredAt: '2025-08-01', lastLogin: '2026-04-18 17:30', liveApplications: 4, partneredSchools: 15, completedApplications: 28, commission: '18%', status: 'active', location: 'Hong Kong', referredList: [
    { name: 'Dulwich College', status: 'Active' },
    { name: "St. George's School", status: 'Active' },
    { name: 'Shrewsbury School', status: 'Active' },
    { name: 'Winchester College', status: 'Active' },
    { name: "St. Paul's School", status: 'Active' },
    { name: 'Eton College', status: 'Active' },
    { name: 'Harrow School', status: 'Active' }
  ]},
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

// Find consultant by slug (slug = company name)
const consultant = computed(() => {
  return consultants.find(c => slugify(c.company) === slug) || null
})

// SEO meta
const { setMeta } = useSEO()
setMeta({
  title: consultant.value ? `${consultant.value.name} — ${consultant.value.company}` : 'Consultant Not Found',
  description: consultant.value
    ? `${consultant.value.name} from ${consultant.value.company} in ${consultant.value.location}. Education consultant with ${consultant.value.completedApplications} completed applications.`
    : 'Consultant profile not found.',
  path: `/consultant/${city}/${slug}`,
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
  background: linear-gradient(135deg, #1e5f74 0%, #2a7f9a 100%);
  padding: 2rem 2rem 3rem;
}

.consultant-banner {
  background: linear-gradient(135deg, #1e5f74 0%, #2a7f9a 100%);
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

.consultant-avatar {
  font-size: 2.5rem;
  width: 64px;
  height: 64px;
  background: #eff6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.consultant-title { flex: 1; }

.consultant-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #212E54;
  margin-bottom: 0.25rem;
}

.consultant-company {
  font-size: 0.95rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.consultant-badges {
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

.status-active { background: #d1fae5; color: #047857; }
.status-suspended { background: #fef3c7; color: #92400e; }
.status-pending { background: #fef3c7; color: #92400e; }

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

/* Performance Grid */
.perf-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.perf-item {
  background: #f8fafc;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
}

.perf-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 800;
  color: #212E54;
  line-height: 1;
  margin-bottom: 0.35rem;
}

.perf-value.accent {
  color: #047857;
}

.perf-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  font-weight: 600;
}

/* Stats */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-icon { font-size: 1.25rem; }
.stat-label { flex: 1; font-size: 0.85rem; color: #64748b; }
.stat-value { font-size: 0.9rem; font-weight: 700; color: #1e293b; }

/* Referred List */
.referred-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.referred-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

.referred-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1e293b;
}

.referred-status {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.referred-status.status-active { background: #d1fae5; color: #047857; }
.referred-status.status-pending { background: #fef3c7; color: #92400e; }
.referred-status.status-suspended { background: #fee2e2; color: #991b1b; }

/* CTA */
.cta-box {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #1e5f74, #2a7f9a);
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
  color: #1e5f74;
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
  .perf-grid { grid-template-columns: 1fr 1fr; }
  .consultant-name { font-size: 1.2rem; }
}
</style>
