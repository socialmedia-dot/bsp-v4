<template>
  <div class="phase-stepper" :class="{ 'phase-stepper-rejected': rejected }">
    <div class="phase-stepper-track">
      <div
        v-for="(phase, idx) in phases"
        :key="phase.id"
        class="phase-stepper-item"
        :class="{
          'phase-stepper-done':   phase.id < currentPhase,
          'phase-stepper-active':  phase.id === currentPhase,
          'phase-stepper-locked':  phase.id > currentPhase,
        }"
      >
        <!-- Connector line (only between items) -->
        <div v-if="idx > 0" class="phase-stepper-connector"
          :class="{ 'connector-done': phase.id <= currentPhase }"
        ></div>

        <!-- Circle -->
        <div class="phase-stepper-circle">
          <span v-if="phase.id < currentPhase" class="check-mark">&#10003;</span>
          <span v-else>{{ phase.id }}</span>
        </div>

        <!-- Label -->
        <div class="phase-stepper-label">{{ phase.name }}</div>
      </div>
    </div>

    <!-- Rejected banner -->
    <div v-if="rejected" class="phase-stepper-rejected-badge">
      &#10060; Application Rejected
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** Current phase 1-6 */
  currentPhase: number
  /** Optional: show 'Rejected' banner overlay */
  rejected?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  rejected: false,
})

const phases = [
  { id: 1, name: 'Application' },
  { id: 2, name: 'Interview' },
  { id: 3, name: 'Offering' },
  { id: 4, name: 'Admission Docs' },
  { id: 5, name: 'Pre-Departure' },
  { id: 6, name: 'Enrolled' },
]
</script>

<style scoped>
/* ── Container ─────────────────────────────────────────── */
.phase-stepper {
  padding: 1.25rem 1rem;
  background: #fff;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  position: relative;
}

/* ── Track (horizontal row) ─────────────────────────────── */
.phase-stepper-track {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
}

/* ── Individual step ───────────────────────────────────── */
.phase-stepper-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  text-align: center;
}

/* ── Connector line ────────────────────────────────────── */
.phase-stepper-connector {
  position: absolute;
  top: 16px;
  right: 50%;
  width: 100%;
  height: 2px;
  background: #e2e8f0;
  z-index: 0;
  transition: background 0.3s ease;
}
.connector-done {
  background: var(--bsp-secondary, #3b82f6);
}

/* ── Circle ────────────────────────────────────────────── */
.phase-stepper-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  z-index: 1;
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

/* done: green filled */
.phase-stepper-done .phase-stepper-circle {
  background: var(--bsp-success, #10b981);
  color: #fff;
  border-color: var(--bsp-success, #10b981);
}

/* active: white + blue border + glow */
.phase-stepper-active .phase-stepper-circle {
  background: #fff;
  color: var(--bsp-secondary, #3b82f6);
  border-color: var(--bsp-secondary, #3b82f6);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

/* locked: grey */
.phase-stepper-locked .phase-stepper-circle {
  background: #f1f5f9;
  color: #94a3b8;
  border-color: #e2e8f0;
}

/* ── Label ─────────────────────────────────────────────── */
.phase-stepper-label {
  margin-top: 0.5rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  line-height: 1.3;
  max-width: 80px;
  word-break: break-word;
  transition: color 0.3s ease;
}

.phase-stepper-done .phase-stepper-label {
  color: var(--bsp-dark, #1e293b);
}
.phase-stepper-active .phase-stepper-label {
  color: var(--bsp-secondary, #3b82f6);
}

/* ── Rejected state ───────────────────────────────────── */
.phase-stepper-rejected .phase-stepper-active .phase-stepper-circle {
  background: var(--bsp-danger, #ef4444);
  color: #fff;
  border-color: var(--bsp-danger, #ef4444);
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
}

.phase-stepper-rejected .phase-stepper-active .phase-stepper-label {
  color: var(--bsp-danger, #ef4444);
}

.phase-stepper-rejected-badge {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--bsp-danger, #ef4444);
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  padding: 0.4rem 0.75rem;
}
</style>
