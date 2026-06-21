<template>
  <main class="main-content">
    <div class="page-header">
      <h1>📊 School Dashboard</h1>
      <p class="subtitle">Welcome back — here's your admissions snapshot for today.</p>
    </div>

    <!-- Top Stats -->
    <div class="stats-row">
      <div class="stat-card stat-total">
        <div class="stat-number">{{ applications.length }}</div>
        <div class="stat-label">Total Applications</div>
      </div>
      <div class="stat-card stat-review">
        <div class="stat-number">{{ countByPhase(1) }}</div>
        <div class="stat-label">Pending Review (P1)</div>
      </div>
      <div class="stat-card stat-interview">
        <div class="stat-number">{{ countByPhase(2) }}</div>
        <div class="stat-label">In Interview (P2)</div>
      </div>
      <div class="stat-card stat-offering">
        <div class="stat-number">{{ countByPhase(3) }}</div>
        <div class="stat-label">Offering (P3)</div>
      </div>
      <div class="stat-card stat-departure">
        <div class="stat-number">{{ countByPhase(5) }}</div>
        <div class="stat-label">Pre-Departure (P5)</div>
      </div>
      <div class="stat-card stat-enrolled">
        <div class="stat-number">{{ countByPhase(6) }}</div>
        <div class="stat-label">Enrolled (P6)</div>
      </div>
    </div>

    <!-- Two-column: Action Required + Phase Distribution -->
    <div class="dashboard-grid">
      <!-- Left: Action Required -->
      <section class="panel">
        <div class="panel-header">
          <h2>🎯 Needs Your Action</h2>
          <span class="badge badge-warn">{{ actionRequired.length }}</span>
        </div>
        <div v-if="actionRequired.length === 0" class="empty-state">
          <div class="empty-icon">✨</div>
          <p>All caught up — no applications waiting on you right now.</p>
        </div>
        <div v-else class="action-list">
          <NuxtLink
            v-for="app in actionRequired"
            :key="app.id"
            :to="`/school/applications/${app.id}`"
            class="action-item"
          >
            <div class="action-main">
              <div class="action-student">{{ app.studentName }}</div>
              <div class="action-ref">{{ app.refNumber }}</div>
            </div>
            <div class="action-meta">
              <span class="phase-tag" :class="'phase-' + app.currentPhase">{{ phaseLabel(app.currentPhase) }}</span>
              <span class="action-sub">{{ app.subStatus }}</span>
              <span class="action-arrow">→</span>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Right: Phase Distribution -->
      <section class="panel">
        <div class="panel-header">
          <h2>📈 Phase Distribution</h2>
        </div>
        <div class="phase-bars">
          <div
            v-for="phase in [1, 2, 3, 4, 5, 6]"
            :key="phase"
            class="phase-bar-row"
          >
            <div class="phase-bar-label">
              <span class="phase-bar-num">P{{ phase }}</span>
              <span class="phase-bar-name">{{ phaseLabel(phase) }}</span>
            </div>
            <div class="phase-bar-track">
              <div
                class="phase-bar-fill"
                :class="'fill-phase-' + phase"
                :style="{ width: barWidth(phase) + '%' }"
              ></div>
            </div>
            <div class="phase-bar-count">{{ countByPhase(phase) }}</div>
          </div>
        </div>
      </section>
    </div>

    <!-- Recent Applications -->
    <section class="panel panel-recent">
      <div class="panel-header">
        <h2>📋 Recent Applications</h2>
        <NuxtLink to="/school/applications" class="panel-link">View all →</NuxtLink>
      </div>
      <div class="recent-table">
        <div class="recent-row recent-header">
          <div>Student</div>
          <div>Ref</div>
          <div>Phase</div>
          <div>Applied</div>
          <div></div>
        </div>
        <NuxtLink
          v-for="app in recentApps"
          :key="app.id"
          :to="`/school/applications/${app.id}`"
          class="recent-row"
        >
          <div class="recent-name">{{ app.studentName }}</div>
          <div class="recent-ref">{{ app.refNumber }}</div>
          <div><span class="phase-tag" :class="'phase-' + app.currentPhase">{{ phaseLabel(app.currentPhase) }}</span></div>
          <div class="recent-date">{{ formatDate(app.appliedAt) }}</div>
          <div class="recent-arrow">→</div>
        </NuxtLink>
      </div>
    </section>

    <!-- Quick Links -->
    <section class="panel panel-quick">
      <div class="panel-header">
        <h2>🔗 Quick Links</h2>
      </div>
      <div class="quick-grid">
        <NuxtLink to="/school/applications" class="quick-card">
          <div class="quick-icon">📋</div>
          <div class="quick-title">Applications</div>
          <div class="quick-desc">Review, approve, and advance applications</div>
        </NuxtLink>
        <NuxtLink to="/school/admissions" class="quick-card">
          <div class="quick-icon">🎓</div>
          <div class="quick-title">Admissions Landing</div>
          <div class="quick-desc">Public-facing admissions page</div>
        </NuxtLink>
        <NuxtLink to="/school/settings/document-templates" class="quick-card">
          <div class="quick-icon">📄</div>
          <div class="quick-title">Document Templates</div>
          <div class="quick-desc">Manage required documents per phase</div>
        </NuxtLink>
        <NuxtLink to="/school/profile" class="quick-card">
          <div class="quick-icon">🏫</div>
          <div class="quick-title">School Profile</div>
          <div class="quick-desc">Update school info and policies</div>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<script setup>
definePageMeta({ layout: 'school' })
useHead({ title: '📊 School Dashboard — BSP' })

// Seed applications (matches /school/applications/index.vue)
const applications = ref([
  {
    id: '2026-X7K9M2P4',
    refNumber: '2026-X7K9M2P4',
    studentName: 'Zhang Xiaoming',
    studentNationality: 'Hong Kong',
    schoolName: 'Westminster School',
    yearOfEntry: 'September 2027',
    currentPhase: 2,
    subStatus: 'Awaiting Confirmation',
    consultantName: 'Sarah Chen',
    appliedAt: '2026-05-15T10:00:00Z'
  },
  {
    id: '2026-A3F7K9M2',
    refNumber: '2026-A3F7K9M2',
    studentName: 'Li Wei',
    studentNationality: 'China',
    schoolName: 'Westminster School',
    yearOfEntry: 'September 2027',
    currentPhase: 1,
    subStatus: 'Pending Review',
    consultantName: null,
    appliedAt: '2026-06-01T09:30:00Z'
  },
  {
    id: '2026-P9M2K7X3',
    refNumber: '2026-P9M2K7X3',
    studentName: 'Wang Fang',
    studentNationality: 'Singapore',
    schoolName: 'Westminster School',
    yearOfEntry: 'September 2026',
    currentPhase: 3,
    subStatus: 'Awaiting Confirmation',
    consultantName: 'James Wong',
    appliedAt: '2026-04-20T14:00:00Z'
  },
  {
    id: '2025-ENROLLED1',
    refNumber: '2025-ENROLLED1',
    studentName: 'Chen Meilin',
    studentNationality: 'China',
    schoolName: 'Westminster School',
    yearOfEntry: 'September 2025',
    currentPhase: 6,
    subStatus: 'Enrolled',
    consultantName: 'Sarah Chen',
    appliedAt: '2024-10-15T10:00:00Z'
  }
])

// rev 3.0 phase labels — see docs/admission-pipeline-v2.md §14
const phaseLabels = ['', 'Review', 'Interview', 'Offering', 'Admission Documents', 'Pre-Departure', 'Enrolled']

function phaseLabel(phase) {
  return phaseLabels[phase] || 'Unknown'
}

function countByPhase(phase) {
  return applications.value.filter(a => a.currentPhase === phase).length
}

// "Needs Action" = apps where school has an outstanding task
// P1 — review & advance
// P2 — confirm interview / decision
// P3 — confirm deposit once paid
const actionRequired = computed(() => {
  return applications.value.filter(a => {
    if (a.currentPhase === 1) return true
    if (a.currentPhase === 2 && a.subStatus === 'Awaiting Confirmation') return true
    if (a.currentPhase === 3 && a.subStatus === 'Awaiting Confirmation') return true
    return false
  })
})

// Recent = sorted by appliedAt desc, top 5
const recentApps = computed(() => {
  return [...applications.value]
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
    .slice(0, 5)
})

// Phase bar width = (count / total) * 100, with min visible if any apps
function barWidth(phase) {
  const total = applications.value.length
  if (total === 0) return 0
  const count = countByPhase(phase)
  return Math.max((count / total) * 100, count > 0 ? 8 : 0)
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.main-content { flex: 1; padding: 2rem; }
.page-header { margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.75rem; color: #1a1a2e; margin-bottom: 0.25rem; }
.subtitle { color: #64748b; font-size: 0.9rem; }

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
@media (max-width: 1100px) { .stats-row { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 640px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
.stat-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem; text-align: center; transition: transform 0.15s, box-shadow 0.15s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.stat-number { font-size: 1.75rem; font-weight: 700; color: #1e293b; line-height: 1.2; }
.stat-label { font-size: 0.7rem; color: #94a3b8; margin-top: 0.25rem; text-transform: uppercase; letter-spacing: 0.02em; }
.stat-review .stat-number { color: #92400e; }
.stat-interview .stat-number { color: #1d4ed8; }
.stat-offering .stat-number { color: #be185d; }
.stat-departure .stat-number { color: #0e7490; }
.stat-enrolled .stat-number { color: #7c3aed; }

/* Dashboard Grid */
.dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem; }
@media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } }

/* Panels */
.panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; }
.panel-recent, .panel-quick { margin-bottom: 1.25rem; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.panel-header h2 { font-size: 1rem; color: #1a1a2e; margin: 0; font-weight: 600; }
.panel-link { font-size: 0.85rem; color: #3b82f6; text-decoration: none; font-weight: 500; }
.panel-link:hover { text-decoration: underline; }
.badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
.badge-warn { background: #fef3c7; color: #92400e; }

/* Empty state */
.empty-state { text-align: center; padding: 2rem 1rem; color: #94a3b8; }
.empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
.empty-state p { font-size: 0.85rem; margin: 0; }

/* Action list */
.action-list { display: flex; flex-direction: column; gap: 0.5rem; }
.action-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #fef9e7; border: 1px solid #fde68a; border-radius: 8px; text-decoration: none; transition: background 0.15s, border-color 0.15s; }
.action-item:hover { background: #fef3c7; border-color: #f59e0b; }
.action-main { display: flex; flex-direction: column; gap: 2px; }
.action-student { font-size: 0.9rem; font-weight: 600; color: #1e293b; }
.action-ref { font-size: 0.7rem; color: #92400e; font-weight: 500; }
.action-meta { display: flex; align-items: center; gap: 0.5rem; }
.action-sub { font-size: 0.75rem; color: #92400e; }
.action-arrow { color: #92400e; font-size: 1.1rem; font-weight: 600; }

/* Phase tags */
.phase-tag { font-size: 0.7rem; font-weight: 600; padding: 3px 10px; border-radius: 12px; text-transform: uppercase; white-space: nowrap; }
.phase-1 { background: #fef3c7; color: #92400e; }
.phase-2 { background: #dbeafe; color: #1d4ed8; }
.phase-3 { background: #fce7f3; color: #be185d; }
.phase-4 { background: #dcfce7; color: #15803d; }
.phase-5 { background: #cffafe; color: #0e7490; }
.phase-6 { background: #f3e8ff; color: #7c3aed; }

/* Phase bars */
.phase-bars { display: flex; flex-direction: column; gap: 0.6rem; }
.phase-bar-row { display: grid; grid-template-columns: 90px 1fr 28px; align-items: center; gap: 0.5rem; }
.phase-bar-label { display: flex; align-items: center; gap: 0.4rem; }
.phase-bar-num { font-size: 0.7rem; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 6px; min-width: 28px; text-align: center; }
.phase-bar-name { font-size: 0.8rem; color: #475569; }
.phase-bar-track { background: #f1f5f9; border-radius: 4px; height: 10px; overflow: hidden; }
.phase-bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; min-width: 4px; }
.fill-phase-1 { background: #f59e0b; }
.fill-phase-2 { background: #3b82f6; }
.fill-phase-3 { background: #ec4899; }
.fill-phase-4 { background: #22c55e; }
.fill-phase-5 { background: #06b6d4; }
.fill-phase-6 { background: #a855f7; }
.phase-bar-count { font-size: 0.85rem; font-weight: 600; color: #1e293b; text-align: right; }

/* Recent table */
.recent-table { display: flex; flex-direction: column; gap: 0.25rem; }
.recent-row { display: grid; grid-template-columns: 1.5fr 1.2fr 0.8fr 1fr 30px; gap: 0.75rem; padding: 0.65rem 0.75rem; align-items: center; border-radius: 6px; text-decoration: none; color: inherit; font-size: 0.85rem; transition: background 0.15s; }
.recent-row:not(.recent-header):hover { background: #f8fafc; }
.recent-header { font-size: 0.7rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; padding-bottom: 0.4rem; border-bottom: 1px solid #e2e8f0; }
.recent-name { font-weight: 600; color: #1e293b; }
.recent-ref { font-size: 0.75rem; color: #3b82f6; font-family: monospace; }
.recent-date { font-size: 0.8rem; color: #64748b; }
.recent-arrow { color: #94a3b8; font-weight: 600; }
@media (max-width: 640px) {
  .recent-row { grid-template-columns: 1fr 80px 30px; gap: 0.5rem; }
  .recent-ref, .recent-date, .recent-header > div:nth-child(2), .recent-header > div:nth-child(4) { display: none; }
}

/* Quick grid */
.quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
@media (max-width: 900px) { .quick-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .quick-grid { grid-template-columns: 1fr; } }
.quick-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem; text-decoration: none; color: inherit; transition: all 0.15s; }
.quick-card:hover { background: #fff; border-color: #3b82f6; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1); }
.quick-icon { font-size: 1.5rem; margin-bottom: 0.4rem; }
.quick-title { font-size: 0.9rem; font-weight: 600; color: #1e293b; margin-bottom: 0.2rem; }
.quick-desc { font-size: 0.75rem; color: #64748b; line-height: 1.3; }
</style>