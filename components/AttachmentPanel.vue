<template>
  <div class="attachment-panel">
    <h3 class="panel-title">📁 Attachments</h3>
    <div v-for="group in groupedAttachments" :key="group.phase" class="att-group">
      <div class="att-group-header">
        <span class="att-phase-dot" :class="phaseClass(group.phase)"></span>
        <span class="att-phase-label">Phase {{ group.phase }}: {{ group.phaseLabel }}</span>
      </div>
      <div class="att-list">
        <div v-for="att in group.items" :key="att.id" class="att-item">
          <span class="att-icon">📄</span>
          <div class="att-info">
            <div class="att-name">{{ att.fileName }}</div>
            <div class="att-meta">
              {{ att.fileSize }} · {{ att.uploadedByRole }} · {{ formatDate(att.createdAt) }}
            </div>
          </div>
          <button class="att-download" @click="download(att)">⬇️</button>
        </div>
      </div>
    </div>
    <div v-if="attachments.length === 0" class="att-empty">
      No attachments yet.
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  attachments: { type: Array, default: () => [] }
})

const groupedAttachments = computed(() => {
  const map = {}
  for (const att of props.attachments) {
    const key = att.phase || 0
    if (!map[key]) {
      map[key] = { phase: key, phaseLabel: att.phaseLabel || 'General', items: [] }
    }
    map[key].items.push(att)
  }
  return Object.values(map).sort((a, b) => a.phase - b.phase)
})

function phaseClass(phase) {
  const colors = ['', 'dot-p1', 'dot-p2', 'dot-p3', 'dot-p4', 'dot-p5', 'dot-p6', 'dot-p7']
  return colors[phase] || 'dot-default'
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function download(att) {
  alert(`Download ${att.fileName} — API connection pending`)
}
</script>

<style scoped>
.attachment-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
}
.panel-title { margin: 0 0 1rem; font-size: 1rem; }
.att-group { margin-bottom: 1rem; }
.att-group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
}
.att-phase-dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-p1 { background: #3b82f6; }
.dot-p2 { background: #8b5cf6; }
.dot-p3 { background: #f59e0b; }
.dot-p4 { background: #10b981; }
.dot-p5 { background: #06b6d4; }
.dot-p6 { background: #ec4899; }
.dot-p7 { background: #14b8a6; }
.dot-default { background: #94a3b8; }

.att-list { display: flex; flex-direction: column; gap: 6px; }
.att-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.5rem 0.6rem;
  background: #f8fafc;
  border-radius: 8px;
}
.att-icon { font-size: 1.1rem; }
.att-info { flex: 1; min-width: 0; }
.att-name { font-size: 0.82rem; font-weight: 500; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.att-meta { font-size: 0.7rem; color: #94a3b8; }
.att-download {
  background: none; border: none; cursor: pointer; font-size: 1rem; padding: 4px; border-radius: 6px;
}
.att-download:hover { background: #e2e8f0; }
.att-empty { color: #94a3b8; font-size: 0.85rem; text-align: center; padding: 1rem; }
</style>