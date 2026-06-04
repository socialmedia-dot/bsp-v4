<template>
  <div class="sitemap-page">
    <div class="sitemap-header">
      <h1>🗺️ BSP v4 Sitemap & Progress</h1>
      <p>British School Portal — Real-time Development Progress</p>
      <p class="updated">
        Version: v4-{{ commitHash }} | Updated: {{ meta.updated }}
      </p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: overallPercent + '%' }"></div>
        <span class="progress-text">{{ completedCount }} / {{ totalCount }} items ({{ overallPercent }}%)</span>
      </div>
    </div>

    <!-- Portal Completion Overview -->
    <div class="portal-overview">
      <h2>📊 Portal Completion Rates</h2>
      <div class="portal-grid">
        <div v-for="m in modules" :key="m.key" class="portal-card">
          <div class="portal-header">
            <span class="portal-emoji">{{ m.emoji }}</span>
            <span class="portal-name">{{ m.label }}</span>
            <span class="portal-percent">{{ modulePercent(m) }}%</span>
          </div>
          <div class="portal-bar-bg">
            <div
              class="portal-bar-fill"
              :style="{ width: modulePercent(m) + '%' }"
              :class="moduleBarClass(m)"
            ></div>
          </div>
          <div class="portal-count">
            {{ m.items.filter(i => i.status === 'done').length }} / {{ m.items.length }} done
            <span v-if="m.items.some(i => i.status === 'in_progress')" class="wip-badge">🚧 WIP</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Updates -->
    <div class="recent-updates">
      <h2>🕐 Recent Updates</h2>
      <ul class="update-list">
        <li v-for="(update, idx) in recentUpdates" :key="idx">
          <span class="update-date">{{ update.date }}</span>
          <span class="update-text">{{ update.text }}</span>
        </li>
      </ul>
    </div>

    <!-- All Pages by Module -->
    <div class="sitemap-grid">
      <div v-for="m in modules" :key="m.key" class="sitemap-section">
        <div class="section-header">
          <h2>{{ m.emoji }} {{ m.label }}</h2>
          <div class="section-bar">
            <div class="section-fill" :style="{ width: modulePercent(m) + '%' }"></div>
            <span>{{ m.items.filter(i => i.status === 'done').length }}/{{ m.items.length }}</span>
          </div>
        </div>
        <ul>
          <li v-for="item in m.items" :key="item.path" :class="item.status">
            <span class="status-icon">{{ statusIcon(item.status) }}</span>
            <NuxtLink v-if="item.status === 'done' && item.path" :to="item.path">{{ item.label }}</NuxtLink>
            <span v-else class="todo-link">{{ item.label }}</span>
            <span v-if="item.date && item.status === 'done'" class="item-date">{{ item.date }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Milestones -->
    <div class="milestones-panel">
      <h2>🏁 Milestones</h2>
      <div class="milestone-list">
        <div v-for="ms in milestones" :key="ms.date" class="milestone-item">
          <div class="milestone-date">{{ ms.date }}</div>
          <div class="milestone-body">
            <div class="milestone-label">{{ ms.label }}</div>
            <div class="milestone-desc">{{ ms.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary-panel">
      <h3>📈 Development Stats</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-number">{{ completedCount }}</span>
          <span class="summary-label">Completed</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">{{ inProgressCount }}</span>
          <span class="summary-label">In Progress</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">{{ plannedCount }}</span>
          <span class="summary-label">Planned</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">{{ meta.totalVueFiles }}</span>
          <span class="summary-label">Vue Files</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">{{ totalCount }}</span>
          <span class="summary-label">Total Items</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">{{ overallPercent }}%</span>
          <span class="summary-label">Overall</span>
        </div>
      </div>
    </div>

    <!-- Links -->
    <div class="quick-links">
      <NuxtLink to="/roadmap" class="roadmap-btn">📋 View Full Roadmap →</NuxtLink>
    </div>

    <div class="sitemap-footer">
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
const completedCount = allItems.filter(i => i.status === 'done').length
const inProgressCount = allItems.filter(i => i.status === 'in_progress').length
const plannedCount = allItems.filter(i => i.status === 'planned').length
const totalCount = allItems.length
const overallPercent = Math.round((completedCount / totalCount) * 100)

function modulePercent(m) {
  const done = m.items.filter(i => i.status === 'done').length
  return Math.round((done / m.items.length) * 100)
}

function moduleBarClass(m) {
  const pct = modulePercent(m)
  if (pct === 100) return 'done'
  if (pct >= 60) return 'good'
  if (pct >= 30) return 'mid'
  return 'low'
}

function statusIcon(status) {
  if (status === 'done') return '✅'
  if (status === 'in_progress') return '🚧'
  return '📋'
}
</script>

<style scoped>
.sitemap-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.sitemap-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 2px solid #e5e7eb;
}

.sitemap-header h1 {
  font-size: 2.2rem;
  color: #1a1a2e;
  margin-bottom: 10px;
}

.sitemap-header p {
  color: #6b7280;
  font-size: 1.05rem;
}

.updated {
  font-size: 0.85rem;
  color: #9ca3af;
  margin-top: 8px;
}

/* Overall progress bar */
.progress-bar {
  max-width: 420px;
  margin: 20px auto 0;
  height: 32px;
  background: #e5e7eb;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 16px;
  transition: width 0.6s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.85rem;
  font-weight: 700;
  color: #374151;
  white-space: nowrap;
}

/* Portal Overview */
.portal-overview {
  margin-bottom: 30px;
}

.portal-overview h2 {
  font-size: 1.15rem;
  color: #1a1a2e;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3b82f6;
}

.portal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.portal-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 16px;
}

.portal-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.portal-emoji { font-size: 1rem; }
.portal-name { color: #1a1a2e; flex: 1; }
.portal-percent { color: #3b82f6; font-weight: 700; }

.portal-bar-bg {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.portal-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}
.portal-bar-fill.done { background: #10b981; }
.portal-bar-fill.good { background: #34d399; }
.portal-bar-fill.mid { background: #fbbf24; }
.portal-bar-fill.low { background: #f87171; }

.portal-count {
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.wip-badge {
  background: #fef3c7;
  color: #92400e;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Recent Updates */
.recent-updates {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
}

.recent-updates h2 {
  font-size: 1.1rem;
  color: #1a1a2e;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3b82f6;
}

.update-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 10px 24px;
}

.update-list li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 0.9rem;
  line-height: 1.4;
}

.update-date {
  color: #6b7280;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.update-text {
  color: #374151;
}

/* Sitemap Grid */
.sitemap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.sitemap-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.section-header {
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 2px solid #3b82f6;
}

.section-header h2 {
  font-size: 1.05rem;
  color: #1a1a2e;
  margin-bottom: 10px;
}

/* Section mini progress bar */
.section-bar {
  height: 20px;
  background: #e5e7eb;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.section-fill {
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #34d399);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.section-bar span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem;
  font-weight: 700;
  color: #374151;
}

.sitemap-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sitemap-section li {
  padding: 7px 0;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sitemap-section li:last-child {
  border-bottom: none;
}

.status-icon {
  font-size: 0.9rem;
  flex-shrink: 0;
}

.todo-link {
  color: #9ca3af;
}

.item-date {
  margin-left: auto;
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
}

/* Milestones */
.milestones-panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
}

.milestones-panel h2 {
  font-size: 1.1rem;
  color: #1a1a2e;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3b82f6;
}

.milestone-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.milestone-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.milestone-item:last-child {
  border-bottom: none;
}

.milestone-date {
  color: #6b7280;
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
  min-width: 90px;
}

.milestone-label {
  font-weight: 600;
  color: #1a1a2e;
  font-size: 0.9rem;
}

.milestone-desc {
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 2px;
}

/* Summary */
.summary-panel {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  color: #ffffff;
}

.summary-panel h3 {
  font-size: 1.1rem;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
}

.summary-item {
  text-align: center;
}

.summary-number {
  display: block;
  font-size: 1.6rem;
  font-weight: 700;
  color: #60a5fa;
}

.summary-label {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 4px;
}

/* Quick Links */
.quick-links {
  text-align: center;
  margin-bottom: 30px;
}

.roadmap-btn {
  display: inline-block;
  background: #3b82f6;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}

.roadmap-btn:hover {
  background: #2563eb;
}

/* Footer */
.sitemap-footer {
  text-align: center;
  margin-top: auto;
  padding-top: 30px;
  color: #9ca3af;
  font-size: 0.85rem;
}

.sitemap-footer a {
  color: #3b82f6;
  text-decoration: none;
}

.sitemap-footer a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 640px) {
  .sitemap-header h1 {
    font-size: 1.6rem;
  }
  .portal-grid {
    grid-template-columns: 1fr;
  }
  .update-list {
    grid-template-columns: 1fr;
  }
  .summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
