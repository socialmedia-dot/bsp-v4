<template>
  <div class="phase-timeline">
    <div class="phase-track">
      <div
        v-for="(phase, idx) in phases"
        :key="phase.key"
        class="phase-step"
        :class="{
          'phase-done': idx + 1 < currentPhase,
          'phase-active': idx + 1 === currentPhase,
          'phase-pending': idx + 1 > currentPhase
        }"
      >
        <div class="phase-connector" v-if="idx > 0"></div>
        <div class="phase-dot">
          <span v-if="idx + 1 < currentPhase">✓</span>
          <span v-else>{{ idx + 1 }}</span>
        </div>
        <div class="phase-label">{{ phase.label }}</div>
        <div v-if="phase.subStatus && idx + 1 === currentPhase" class="phase-sub">
          <span class="sub-dot" :class="subStatusClass"></span>
          {{ phase.subStatus }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentPhase: { type: Number, default: 1 },
  subStatus: { type: String, default: '' }
})

const phases = [
  { key: 'submitted', label: 'Application Submitted' },
  { key: 'interview', label: 'Interview & Assessment' },
  { key: 'decision', label: 'Decision' },
  { key: 'offer', label: 'Offer & Acceptance' },
  { key: 'documents', label: 'Admission Documents' },
  { key: 'visa', label: 'Visa & Travel' },
  { key: 'enrolled', label: 'Enrolled' }
]

const subStatusClass = computed(() => {
  const s = props.subStatus?.toLowerCase() || ''
  if (s.includes('reject')) return 'sub-rejected'
  if (s.includes('pending') || s.includes('awaiting')) return 'sub-pending'
  if (s.includes('complete') || s.includes('approved') || s.includes('confirmed')) return 'sub-done'
  return 'sub-progress'
})
</script>

<style scoped>
.phase-timeline {
  padding: 1.5rem 0;
  overflow-x: auto;
}
.phase-track {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-width: 700px;
  position: relative;
}
.phase-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  text-align: center;
}
.phase-connector {
  position: absolute;
  top: 14px;
  left: -50%;
  width: 100%;
  height: 3px;
  background: #e2e8f0;
  z-index: 0;
}
.phase-step.phase-done .phase-connector,
.phase-step.phase-active .phase-connector {
  background: #3b82f6;
}
.phase-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  z-index: 1;
  background: #e2e8f0;
  color: #64748b;
  border: 2px solid #e2e8f0;
}
.phase-done .phase-dot {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}
.phase-active .phase-dot {
  background: #fff;
  color: #3b82f6;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.15);
}
.phase-label {
  margin-top: 0.5rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  line-height: 1.3;
  max-width: 90px;
}
.phase-done .phase-label,
.phase-active .phase-label {
  color: #1e293b;
}
.phase-sub {
  margin-top: 0.35rem;
  font-size: 0.65rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f8fafc;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
}
.sub-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.sub-done { background: #10b981; }
.sub-progress { background: #f59e0b; }
.sub-pending { background: #64748b; }
.sub-rejected { background: #ef4444; }
</style>