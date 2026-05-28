<template>
  <div class="roadmap-page">
    <!-- Hero -->
    <div class="roadmap-header">
      <h1>📃 BSP v4 Roadmap</h1>
      <p>Development roadmap — see what is shipped, what is in progress, and what is coming next.</p>
      <p class="updated">
        Version: v4-{{ commitHash }} | Updated: {{ meta.updated }}
      </p>

      <!-- Overall Progress -->
      <div class="overall-progress">
        <div class="progress-bar">
          <div class="progress-fill done" :style="{ width: donePercent + '%' }"></div>
          <div class="progress-fill wip" :style="{ width: wipPercent + '%', left: donePercent + '%' }"></div>
        </div>
        <div class="progress-legend">
          <span><span class="dot done"></span> Done {{ doneCount }} ({{ donePercent }}%)</span>
          <span><span class="dot wip"></span> WIP {{ wipCount }} ({{ wipPercent }}%)</span>
          <span><span class="dot planned"></span> Planned {{ plannedCount }} ({{ plannedPercent }}%)</span>
        </div>
      </div>

      <!-- Top Stats -->
      <div class="stats-row">
        <div class="stat-box">
          <span class="stat-num">{{ doneCount }}</span>
          <span class="stat-label">Shipped</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">{{ wipCount }}</span>
          <span class="stat-label">In Progress</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">{{ plannedCount }}</span>
          <span class="stat-label">Planned</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">{{ meta.totalVueFiles }}</span>
          <span class="stat-label">Vue Pages</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">{{ modules.length }}</span>
          <span class="stat-label">Modules</span>
        </div>
      </div>
    </div>

    <!-- Three Column Board -->
    <div class="board">
      <!-- Done -->
      <div class="board-column">
        <div class="column-header done">
          <span class="column-icon">✅</span>
          <span class="column-title">Completed</span>
          <span class="column-count">{{ doneCount }}</span>
        </div>
        <div class="column-body">
          <div v-for="m in doneModules" :key="m.key" class="module-group">
            <div class="module-header">
              <span>{{ m.emoji }}</span>
              <span>{{ m.label }}</span>
              <span class="module-count">{{ m.items.length }}</span>
            </div>
            <div class="item-list">
              <div v-for="item in m.items" :key="item.path" class="item-card done">
                <div class="item-title">{{ item.label }}</div>
                <div v-if="item.path" class="item-path">{{ item.path }}</div>
                <div class="item-footer">
                  <span class="item-date">{{ item.date || 'N/A' }}</span>
                  <span class="item-badge done">Done</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="doneCount === 0" class="empty-state">No completed items yet.</div>
        </div>
      </div>

      <!-- In Progress -->
      <div class="board-column">
        <div class="column-header wip">
          <span class="column-icon">🚧</span>
          <span class="column-title">In Progress</span>
          <span class="column-count">{{ wipCount }}</span>
        </div>
        <div class="column-body">
          <div v-for="m in wipModules" :key="m.key" class="module-group">
            <div class="module-header">
              <span>{{ m.emoji }}</span>
              <span>{{ m.label }}</span>
              <span class="module-count">{{ m.items.length }}</span>
            </div>
            <div class="item-list">
              <div v-for="item in m.items" :key="item.path" class="item-card wip">
                <div class="item-title">{{ item.label }}</div>
                <div v-if="item.path" class="item-path">{{ item.path }}</div>
                <div class="item-footer">
                  <span class="item-badge wip">WIP</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="wipCount === 0" class="empty-state">Nothing in progress right now.</div>
        </div>
      </div>

      <!-- Planned -->
      <div class="board-column">
        <div class="column-header planned">
          <span class="column-icon">📋</span>
          <span class="column-title">Planned</span>
          <span class="column-count">{{ plannedCount }}</span>
        </div>
        <div class="column-body">
          <div v-for="m in plannedModules" :key="m.key" class="module-group">
            <div class="module-header">
              <span>{{ m.emoji }}</span>
              <span>{{ m.label }}</span>
              <span class="module-count">{{ m.items.length }}</span>
            </div>
            <div class="item-list">
              <div v-for="item in m.items" :key="item.path" class="item-card planned">
                <div class="item-title">{{ item.label }}</div>
                <div v-if="item.path" class="item-path">{{ item.path }}</div>
                <div class="item-footer">
                  <span class="item-badge planned">Planned</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="plannedCount === 0" class="empty-state">No planned items — everything is shipped!</div>
        </div>
      </div>
    </div>

    <!-- Milestones -->
    <div class="milestones-section">
      <h2>🏁 Milestones</h2>
      <div class="milestone-timeline">
        <div v-for="(ms, idx) in milestones" :key="idx" class="timeline-item">
          <div class="timeline-dot" :class="{ achieved: idx < achievedMilestoneCount }"></div>
          <div class="timeline-content">
            <div class="timeline-date">{{ ms.date }}</div>
            <div class="timeline-label">{{ ms.label }}</div>
            <div class="timeline-desc">{{ ms.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Updates -->
    <div class="recent-section">
      <h2>🕐 Recent Updates</h2>
      <ul class="recent-list">
        <li v-for="(update, idx) in recentUpdates.slice(0, 8)" :key="idx">
          <span class="recent-date">{{ update.date }}</span>
          <span class="recent-text">{{ update.text }}</span>
        </li>
      </ul>
    </div>

    <!-- Footer Nav -->
    <div class="quick-links">
      <NuxtLink to="/sitemap" class="back-btn">← Back to Sitemap</NuxtLink>
    </div>

    <div class="roadmap-footer">
      <p>© 2026 British School Portal. All rights reserved.</p>
      <p>Production URL: <a :href="meta.deployedUrl" target="_blank">{{ meta.deployedUrl }}</a></p>
    </div>
  </div>
</template>

<script setup>
import roadmapData from '~/assets/data/roadmap.json'

const config = useRuntimeConfig()
const meta = roadmapData.meta
const modules = roadmapData.modules
const recentUpdates = roadmapData.recentUpdates
const milestones = roadmapData.milestones

const commitHash = config.public.gitCommit || 'unknown'

const allItems = modules.flatMap(m => m.items)
const doneCount = allItems.filter(i => i.status === 'done').length
const wipCount = allItems.filter(i => i.status === 'in_progress').length
const plannedCount = allItems.filter(i => i.status === 'planned').length
const totalCount = allItems.length

const donePercent = Math.round((doneCount / totalCount) * 100)
const wipPercent = Math.round((wipCount / totalCount) * 100)
const plannedPercent = Math.round((plannedCount / totalCount) * 100)

// Group items by module within each status
const doneModules = modules
  .map(m => ({ ...m, items: m.items.filter(i => i.status === 'done') }))
  .filter(m => m.items.length > 0)

const wipModules = modules
  .map(m => ({ ...m, items: m.items.filter(i => i.status === 'in_progress') }))
  .filter(m => m.items.length > 0)

const plannedModules = modules
  .map(m => ({ ...m, items: m.items.filter(i => i.status === 'planned') }))
  .filter(m => m.items.length > 0)

// Milestones: count achieved (all have dates in past for now)
const achievedMilestoneCount = milestones.filter(m => new Date(m.date) <= new Date()).length
</script>

<style scoped>
.roadmap-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.roadmap-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 2px solid #e5e7eb;
}

.roadmap-header h1 {
  font-size: 2.2rem;
  color: #1a1a2e;
  margin-bottom: 10px;
}

.roadmap-header p {
  color: #6b7280;
  font-size: 1.05rem;
}

.updated {
  font-size: 0.85rem;
  color: #9ca3af;
  margin-top: 8px;
}

/* Overall Progress */
.overall-progress {
  max-width: 600px;
  margin: 24px auto 0;
}

.progress-bar {
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  display: flex;
}

.progress-fill {
  height: 100%;
  transition: width 0.6s ease;
}
.progress-fill.done {
  background: linear-gradient(90deg, #10b981, #34d399);
}
.progress-fill.wip {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  position: absolute;
  top: 0;
}

.progress-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
  font-size: 0.8rem;
  color: #6b7280;
}

.progress-legend span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.dot.done { background: #10b981; }
.dot.wip { background: #fbbf24; }
.dot.planned { background: #9ca3af; }

/* Stats Row */
.stats-row {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.stat-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 22px;
  text-align: center;
  min-width: 90px;
}

.stat-num {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}

/* Three Column Board */
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  align-items: start;
}

.board-column {
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.column-header {
  padding: 14px 16px;
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.95rem;
}

.column-header.done { background: #d1fae5; color: #065f46; }
.column-header.wip { background: #fef3c7; color: #92400e; }
.column-header.planned { background: #f3f4f6; color: #374151; }

.column-icon { font-size: 1.1rem; }
.column-title { flex: 1; }
.column-count {
  background: rgba(255,255,255,0.7);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
}

.column-body {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Module Group */
.module-group {
  background: #ffffff;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #e5e7eb;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  font-size: 0.8rem;
  color: #374151;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f3f4f6;
}

.module-count {
  margin-left: auto;
  background: #f3f4f6;
  color: #6b7280;
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.7rem;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-card {
  border-radius: 6px;
  padding: 10px;
  border-left: 3px solid;
  background: #fafafa;
}

.item-card.done { border-left-color: #10b981; }
.item-card.wip { border-left-color: #f59e0b; }
.item-card.planned { border-left-color: #9ca3af; }

.item-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: #1a1a2e;
}

.item-path {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
  font-family: monospace;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.item-date {
  font-size: 0.7rem;
  color: #9ca3af;
}

.item-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}
.item-badge.done { background: #d1fae5; color: #065f46; }
.item-badge.wip { background: #fef3c7; color: #92400e; }
.item-badge.planned { background: #e5e7eb; color: #374151; }

.empty-state {
  text-align: center;
  color: #9ca3af;
  font-size: 0.85rem;
  padding: 20px;
}

/* Milestones */
.milestones-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
}

.milestones-section h2 {
  font-size: 1.1rem;
  color: #1a1a2e;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3b82f6;
}

.milestone-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e5e7eb;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #e5e7eb;
  margin-top: 4px;
  flex-shrink: 0;
}

.timeline-dot.achieved {
  background: #10b981;
  box-shadow: 0 0 0 2px #10b981;
}

.timeline-content {
  flex: 1;
}

.timeline-date {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
}

.timeline-label {
  font-weight: 600;
  color: #1a1a2e;
  font-size: 0.9rem;
  margin-top: 2px;
}

.timeline-desc {
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 2px;
}

/* Recent */
.recent-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
}

.recent-section h2 {
  font-size: 1.1rem;
  color: #1a1a2e;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3b82f6;
}

.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 10px 24px;
}

.recent-list li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 0.9rem;
  line-height: 1.4;
}

.recent-date {
  color: #6b7280;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.recent-text {
  color: #374151;
}

/* Quick Links */
.quick-links {
  text-align: center;
  margin-bottom: 30px;
}

.back-btn {
  display: inline-block;
  background: #6b7280;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #4b5563;
}

/* Footer */
.roadmap-footer {
  text-align: center;
  margin-top: auto;
  padding-top: 30px;
  color: #9ca3af;
  font-size: 0.85rem;
}

.roadmap-footer a {
  color: #3b82f6;
  text-decoration: none;
}

.roadmap-footer a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 900px) {
  .board {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .roadmap-header h1 {
    font-size: 1.6rem;
  }
  .stats-row {
    gap: 10px;
  }
  .stat-box {
    padding: 10px 14px;
    min-width: 70px;
  }
  .stat-num {
    font-size: 1.2rem;
  }
}
</style>
