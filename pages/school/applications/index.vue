<template>
  <main class="main-content">
    <div class="page-header">
      <h1>📋 Applications</h1>
      <p class="subtitle">Manage and review student applications</p>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-number">{{ applications.length }}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ pendingCount }}</div>
        <div class="stat-label">Pending Review</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ interviewCount }}</div>
        <div class="stat-label">Interview</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ offerCount }}</div>
        <div class="stat-label">Offer</div>
      </div>
    </div>

    <!-- Applications List -->
    <div class="applications-list">
      <NuxtLink
        v-for="app in applications"
        :key="app.id"
        :to="`/school/applications/${app.id}`"
        class="app-card"
      >
        <div class="app-header">
          <div>
            <div class="app-ref">{{ app.refNumber }}</div>
            <div class="app-student">{{ app.studentName }}</div>
          </div>
          <span class="phase-tag" :class="'phase-' + app.currentPhase">{{ phaseLabel(app.currentPhase) }}</span>
        </div>
        <div class="app-details">
          <span>🏫 {{ app.schoolName }}</span>
          <span>📅 {{ app.yearOfEntry }}</span>
          <span>🌐 {{ app.studentNationality }}</span>
        </div>
        <div class="app-meta">
          <span>Applied {{ formatDate(app.appliedAt) }}</span>
          <span v-if="app.consultantName" class="consultant-tag">👤 {{ app.consultantName }}</span>
        </div>
      </NuxtLink>
    </div>
  </main>
</template>

<script setup>
definePageMeta({ layout: 'school' })
useHead({ title: '📋 Applications — BSP' })

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
    currentPhase: 4,
    subStatus: 'Documents Awaiting',
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
    currentPhase: 7,
    subStatus: 'Enrolled',
    consultantName: 'Sarah Chen',
    appliedAt: '2024-10-15T10:00:00Z'
  }
])

const pendingCount = computed(() => applications.value.filter(a => a.currentPhase === 1).length)
const interviewCount = computed(() => applications.value.filter(a => a.currentPhase === 2).length)
const offerCount = computed(() => applications.value.filter(a => a.currentPhase === 4).length)

const phaseLabels = ['', 'Review', 'Interview', 'Decision', 'Offer', 'Documents', 'Visa', 'Enrolled']

function phaseLabel(phase) {
  return phaseLabels[phase] || 'Unknown'
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function openApp(app) {
  navigateTo(`/school/applications/${app.id}`)
}
</script>

<style scoped>
.main-content { flex: 1; padding: 2rem; }
.page-header { margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.75rem; color: #1a1a2e; margin-bottom: 0.25rem; }
.subtitle { color: #64748b; font-size: 0.9rem; }

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
@media (max-width: 768px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
.stat-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem; text-align: center; }
.stat-number { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
.stat-label { font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; }

/* List */
.applications-list { display: flex; flex-direction: column; gap: 0.75rem; }
.app-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem 1.25rem; cursor: pointer; transition: box-shadow 0.15s; }
.app-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-color: #cbd5e1; }
.app-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
.app-ref { font-size: 0.75rem; color: #3b82f6; font-weight: 600; background: #dbeafe; padding: 2px 8px; border-radius: 12px; display: inline-block; margin-bottom: 0.25rem; }
.app-student { font-size: 1rem; font-weight: 600; color: #1e293b; }
.phase-tag { font-size: 0.7rem; font-weight: 600; padding: 3px 10px; border-radius: 12px; text-transform: uppercase; }
.phase-1 { background: #fef3c7; color: #92400e; }
.phase-2 { background: #dbeafe; color: #1d4ed8; }
.phase-3 { background: #fce7f3; color: #be185d; }
.phase-4 { background: #dcfce7; color: #15803d; }
.phase-5 { background: #cffafe; color: #0e7490; }
.phase-6 { background: #f3e8ff; color: #7c3aed; }
.phase-7 { background: #ecfdf5; color: #047857; }
.app-details { display: flex; gap: 1rem; font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; flex-wrap: wrap; }
.app-meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #94a3b8; }
.consultant-tag { background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 12px; }
</style>