<template>
  <div class="dashboard-page">
    <!-- Navbar (mirrors other student pages) -->
    <header class="navbar">
      <div class="container navbar-content">
        <NuxtLink to="/" class="logo">
          <img src="/img/logo-bsp.jpg" alt="British School Portal Logo" class="logo-img">
        </NuxtLink>
        <nav>
          <ul class="nav-links">
            <li><NuxtLink to="/student/dashboard" class="active">Dashboard</NuxtLink></li>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li><NuxtLink to="/schools">Schools</NuxtLink></li>
            <li><NuxtLink to="/student/profile">Profile</NuxtLink></li>
            <li><NuxtLink to="/student/applications">My Applications</NuxtLink></li>
            <li><NuxtLink to="/student/login" class="btn btn-primary">Logout</NuxtLink></li>
          </ul>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <div class="page-header">
        <h1>👋 Welcome back, Xiaoming</h1>
        <p class="subtitle">Here's your application progress at a glance.</p>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card stat-total">
          <div class="stat-number">{{ applications.length }}</div>
          <div class="stat-label">Total Applications</div>
        </div>
        <div class="stat-card stat-pending">
          <div class="stat-number">{{ countByStatus('Pending') }}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card stat-review">
          <div class="stat-number">{{ countByStatus('Under Review') }}</div>
          <div class="stat-label">Under Review</div>
        </div>
        <div class="stat-card stat-offer">
          <div class="stat-number">{{ countByStatus('Offer') }}</div>
          <div class="stat-label">Offers Received</div>
        </div>
      </div>

      <!-- Application Progress -->
      <section class="panel">
        <div class="panel-header">
          <h2>📋 Your Applications & Progress</h2>
          <NuxtLink to="/student/applications" class="panel-link">View all →</NuxtLink>
        </div>
        <div v-if="applications.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>You haven't submitted any applications yet.</p>
          <NuxtLink to="/schools" class="btn btn-primary empty-cta">Browse Schools →</NuxtLink>
        </div>
        <div v-else class="app-cards">
          <NuxtLink
            v-for="app in applications"
            :key="app.id"
            :to="`/student/applications/${app.id}`"
            class="app-card"
          >
            <div class="app-card-header">
              <img :src="app.schoolPhoto" :alt="app.schoolName" class="app-card-photo" />
              <div class="app-card-title">
                <div class="app-card-school">{{ app.schoolName }}</div>
                <div class="app-card-meta">{{ app.programme }} · Intake {{ app.intake }}</div>
              </div>
              <span class="status-badge" :class="'status-' + app.statusKey">{{ app.status }}</span>
            </div>

            <!-- Progress bar (P1 -> P6) -->
            <div class="progress-track">
              <div
                v-for="step in 6"
                :key="step"
                class="progress-step"
                :class="{
                  'progress-step-done': step < progressIndex(app.status),
                  'progress-step-current': step === progressIndex(app.status),
                  'progress-step-future': step > progressIndex(app.status)
                }"
              >
                <div class="progress-dot">{{ step }}</div>
                <div class="progress-label">{{ phaseShortName(step) }}</div>
              </div>
              <div
                class="progress-fill"
                :style="{ width: progressPercent(app.status) + '%' }"
              ></div>
            </div>

            <div class="app-card-footer">
              <span class="footer-meta">📅 Applied {{ app.submittedDate }}</span>
              <span v-if="app.unreadMessages > 0" class="footer-meta footer-msg">💬 {{ app.unreadMessages }} new message{{ app.unreadMessages > 1 ? 's' : '' }}</span>
              <span v-if="app.pendingDocuments > 0" class="footer-meta footer-doc">📄 {{ app.pendingDocuments }} doc{{ app.pendingDocuments > 1 ? 's' : '' }} pending</span>
              <span class="footer-arrow">→</span>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Quick Links -->
      <section class="panel">
        <div class="panel-header">
          <h2>🔗 Quick Links</h2>
        </div>
        <div class="quick-grid">
          <NuxtLink to="/student/profile" class="quick-card">
            <div class="quick-icon">👤</div>
            <div class="quick-title">My Profile</div>
            <div class="quick-desc">Update personal information and documents</div>
          </NuxtLink>
          <NuxtLink to="/student/applications" class="quick-card">
            <div class="quick-icon">📭</div>
            <div class="quick-title">My Applications</div>
            <div class="quick-desc">Track all submitted applications in detail</div>
          </NuxtLink>
          <NuxtLink to="/schools" class="quick-card">
            <div class="quick-icon">🏫</div>
            <div class="quick-title">Browse Schools</div>
            <div class="quick-desc">Find and apply to new schools</div>
          </NuxtLink>
          <NuxtLink to="/schools" class="quick-card">
            <div class="quick-icon">📝</div>
            <div class="quick-title">Apply to a School</div>
            <div class="quick-desc">Browse schools and start a new application</div>
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })
useHead({ title: '📊 Student Dashboard — BSP' })

// Mock applications — aligned with /student/applications/index.vue mock data
const applications = ref([
  {
    id: 'APP-2024-001',
    schoolName: "St. Mary's College",
    schoolLocation: 'London, United Kingdom',
    status: 'Under Review',
    statusKey: 'review',
    submittedDate: '15 Mar 2024',
    lastUpdate: '2 hours ago',
    intake: 'Sep 2024',
    programme: 'Year 10',
    schoolPhoto: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80',
    unreadMessages: 1,
    pendingDocuments: 1
  },
  {
    id: 'APP-2024-002',
    schoolName: 'Greenwich Academy',
    schoolLocation: 'London, United Kingdom',
    status: 'Offer',
    statusKey: 'offer',
    submittedDate: '28 Feb 2024',
    lastUpdate: '1 day ago',
    intake: 'Sep 2024',
    programme: 'Year 12',
    schoolPhoto: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
    unreadMessages: 0,
    pendingDocuments: 0
  },
  {
    id: 'APP-2024-003',
    schoolName: 'Kingsfield School',
    schoolLocation: 'London, United Kingdom',
    status: 'Pending',
    statusKey: 'pending',
    submittedDate: '20 Mar 2024',
    lastUpdate: '5 days ago',
    intake: 'Sep 2024',
    programme: 'Year 11',
    schoolPhoto: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&q=80',
    unreadMessages: 0,
    pendingDocuments: 2
  }
])

function countByStatus(status) {
  return applications.value.filter(a => a.status === status).length
}

// Map student-side status → pipeline phase index (1-6)
// Pending = phase 1, Under Review = phase 1, Offer = phase 3, Rejected = phase 6 (final)
// (mapped onto BSP v4 6-phase pipeline: 1=Application, 2=Interview, 3=Offering, 4=Admission, 5=Pre-Departure, 6=Enrolled)
function progressIndex(status) {
  if (status === 'Pending') return 1
  if (status === 'Under Review') return 2
  if (status === 'Offer') return 3
  if (status === 'Rejected') return 6
  return 1
}

function phaseShortName(step) {
  return ['', 'Applied', 'Review', 'Offer', 'Docs', 'Travel', 'Done'][step] || ''
}

function progressPercent(status) {
  // Fill bar up to the current phase dot
  const idx = progressIndex(status)
  return Math.min((idx / 6) * 100, 100)
}
</script>

<style scoped>
/* Page wrapper + navbar (mirrors pages/student/applications/index.vue) */
.dashboard-page { min-height: 100vh; display: flex; flex-direction: column; background: #f8fafc; }
.navbar { background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 1rem 0; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
.navbar-content { display: flex; justify-content: space-between; align-items: center; }
.logo-img { height: 40px; }
.nav-links { display: flex; gap: 1.5rem; list-style: none; margin: 0; padding: 0; align-items: center; }
.nav-links a { text-decoration: none; color: #475569; font-weight: 500; font-size: 0.9rem; transition: color 0.15s; }
.nav-links a:hover, .nav-links a.active { color: #3b82f6; }
.nav-links .btn { padding: 0.5rem 1rem; border-radius: 6px; }
.btn { display: inline-block; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 0.9rem; cursor: pointer; border: none; transition: background 0.15s; }
.btn-primary { background: #3b82f6; color: #fff; }
.btn-primary:hover { background: #2563eb; }

/* Main content */
.main-content { flex: 1; padding: 2rem 1.5rem; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
.page-header { margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.75rem; color: #1a1a2e; margin: 0 0 0.25rem 0; font-weight: 700; }
.subtitle { color: #64748b; font-size: 0.95rem; margin: 0; }

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
@media (max-width: 768px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
.stat-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; text-align: center; transition: transform 0.15s, box-shadow 0.15s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.stat-number { font-size: 2rem; font-weight: 700; color: #1e293b; line-height: 1.2; }
.stat-label { font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; text-transform: uppercase; letter-spacing: 0.02em; font-weight: 500; }
.stat-pending .stat-number { color: #d97706; }
.stat-review .stat-number { color: #2563eb; }
.stat-offer .stat-number { color: #059669; }

/* Panels */
.panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.25rem; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.panel-header h2 { font-size: 1.1rem; color: #1a1a2e; margin: 0; font-weight: 600; }
.panel-link { font-size: 0.85rem; color: #3b82f6; text-decoration: none; font-weight: 500; }
.panel-link:hover { text-decoration: underline; }

/* Empty state */
.empty-state { text-align: center; padding: 2.5rem 1rem; color: #94a3b8; }
.empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }
.empty-state p { font-size: 0.95rem; margin: 0 0 1rem 0; }
.empty-cta { display: inline-block; padding: 0.6rem 1.25rem; }

/* Application cards */
.app-cards { display: flex; flex-direction: column; gap: 1rem; }
.app-card { display: block; padding: 1.25rem; background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 10px; text-decoration: none; transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s; }
.app-card:hover { border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.08); transform: translateY(-1px); }
.app-card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
.app-card-photo { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.app-card-title { flex: 1; min-width: 0; }
.app-card-school { font-size: 0.95rem; font-weight: 600; color: #1e293b; }
.app-card-meta { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }

/* Status badge (mirrors /student/applications style) */
.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; white-space: nowrap; }
.status-pending { background: #fef3c7; color: #d97706; }
.status-review { background: #dbeafe; color: #2563eb; }
.status-offer { background: #d1fae5; color: #059669; }
.status-rejected { background: #fee2e2; color: #dc2626; }

/* Progress track (P1-P6) */
.progress-track { position: relative; display: flex; justify-content: space-between; padding: 0 0.5rem 1.75rem 0.5rem; }
.progress-track::before { content: ''; position: absolute; top: 13px; left: 8%; right: 8%; height: 3px; background: #e2e8f0; border-radius: 2px; z-index: 0; }
.progress-fill { position: absolute; top: 13px; left: 8%; height: 3px; background: linear-gradient(90deg, #3b82f6, #10b981); border-radius: 2px; z-index: 0; transition: width 0.4s ease; }
.progress-step { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; flex: 1; }
.progress-dot { width: 28px; height: 28px; border-radius: 50%; background: #e2e8f0; color: #94a3b8; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; border: 3px solid #fff; transition: all 0.2s; }
.progress-step-done .progress-dot { background: #3b82f6; color: #fff; }
.progress-step-current .progress-dot { background: #10b981; color: #fff; box-shadow: 0 0 0 4px rgba(16,185,129,0.15); transform: scale(1.1); }
.progress-label { font-size: 0.65rem; color: #64748b; margin-top: 6px; font-weight: 500; white-space: nowrap; }
.progress-step-current .progress-label { color: #10b981; font-weight: 600; }
.progress-step-done .progress-label { color: #3b82f6; }

/* Card footer */
.app-card-footer { display: flex; align-items: center; gap: 1rem; font-size: 0.75rem; color: #64748b; flex-wrap: wrap; padding-top: 0.25rem; }
.footer-meta { display: inline-flex; align-items: center; gap: 0.25rem; }
.footer-msg { color: #2563eb; font-weight: 500; }
.footer-doc { color: #d97706; font-weight: 500; }
.footer-arrow { margin-left: auto; color: #94a3b8; font-size: 1rem; }

/* Quick Links */
.quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
@media (max-width: 900px) { .quick-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .quick-grid { grid-template-columns: 1fr; } }
.quick-card { display: block; padding: 1.25rem; background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 10px; text-decoration: none; transition: all 0.15s; }
.quick-card:hover { border-color: #3b82f6; background: #f0f7ff; transform: translateY(-2px); }
.quick-icon { font-size: 1.75rem; margin-bottom: 0.5rem; }
.quick-title { font-size: 0.95rem; font-weight: 600; color: #1e293b; margin-bottom: 0.25rem; }
.quick-desc { font-size: 0.75rem; color: #94a3b8; line-height: 1.4; }
</style>