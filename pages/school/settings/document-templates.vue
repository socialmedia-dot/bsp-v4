<template>
  <div class="school-settings-page">
    <header class="page-header">
      <h1>📋 Document Templates</h1>
      <p>
        Configure default documents required for each phase. These will auto-populate
        into each application record when a student enters that phase. Per-application
        overrides are allowed on each app's detail page.
      </p>
    </header>

    <nav class="phase-tabs" aria-label="Phase selector">
      <button
        v-for="p in phases"
        :key="p.id"
        type="button"
        :class="['phase-tab-btn', { active: activePhase === p.id }]"
        @click="activePhase = p.id"
      >
        <span class="phase-tab-num">Phase {{ p.id }}</span>
        <span class="phase-tab-name">{{ p.name }}</span>
      </button>
    </nav>

    <section v-if="activePhase === 3" class="phase-section">
      <h2>💰 Phase 3 — Offering</h2>
      <p class="phase-section-desc">
        Default documents required when the school issues a conditional offer
        (offer letter, acceptance form, etc.).
      </p>
      <DocumentTemplateEditor
        v-model="schoolDefaults.phase3Templates"
        :phase="3"
      />
    </section>

    <section v-if="activePhase === 4" class="phase-section">
      <h2>📄 Phase 4 — Admission Documents</h2>
      <p class="phase-section-desc">
        Default documents prepared by the school for the student (paperwork, uniform,
        medical forms, etc.). CAS letter is only included when the student requested a
        visa (see §19).
      </p>
      <DocumentTemplateEditor
        v-model="schoolDefaults.phase4Templates"
        :phase="4"
      />
    </section>

    <section v-if="activePhase === 5" class="phase-section">
      <h2>✈️ Phase 5 — Pre-Departure</h2>
      <p class="phase-section-desc">
        Default documents for pre-departure (boarding info, arrival form, transport
        arrangements, etc.).
      </p>
      <DocumentTemplateEditor
        v-model="schoolDefaults.phase5Templates"
        :phase="5"
      />
    </section>

    <footer class="page-footer">
      <button type="button" class="btn-primary" @click="saveDefaults">
        💾 Save Defaults
      </button>
      <button type="button" class="btn-secondary" @click="resetDefaults">
        ↻ Reset to System Defaults
      </button>
      <span v-if="lastSaved" class="last-saved">
        Last saved: {{ formatDateTime(lastSaved) }}
      </span>
      <span v-if="!lastSaved && loaded" class="last-saved">
        Loaded from local storage. Click Save to persist changes.
      </span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  useP2Store,
  type DocumentTemplate,
  P5_SUB_STATUS,
} from '~/composables/useP2Store'

definePageMeta({ layout: 'school' })
useHead({ title: '📋 Document Templates — School Settings — BSP' })

// ── Phase metadata (rev 3.0) ─────────────────────────────────────────────────
const phases = [
  { id: 3 as const, name: 'Offering' },
  { id: 4 as const, name: 'Admission Documents' },
  { id: 5 as const, name: 'Pre-Departure' },
]

const activePhase = ref<3 | 4 | 5>(3)

// ── System default templates ────────────────────────────────────────────────
// Shipped on first load. Users can edit / remove / add. Persisted to localStorage.
function buildSystemDefaults(): {
  phase3Templates: DocumentTemplate[]
  phase4Templates: DocumentTemplate[]
  phase5Templates: DocumentTemplate[]
} {
  return {
    phase3Templates: [
      {
        id: 'tpl-p3-1',
        phase: 3,
        category: 'admission',
        name: 'Offer Letter',
        description: 'Conditional offer letter issued by the school',
        required: true,
        displayOrder: 1,
        active: true,
      },
      {
        id: 'tpl-p3-2',
        phase: 3,
        category: 'admission',
        name: 'Acceptance Form',
        description: 'Parent/guardian signs and returns the acceptance form',
        required: true,
        displayOrder: 2,
        active: true,
      },
      {
        id: 'tpl-p3-3',
        phase: 3,
        category: 'financial',
        name: 'Deposit Invoice',
        description: 'Deposit payment invoice + bank details',
        required: true,
        displayOrder: 3,
        active: true,
      },
    ],
    phase4Templates: [
      {
        id: 'tpl-p4-cas',
        phase: 4,
        category: 'admission',
        name: 'CAS Letter (if visa needed)',
        description:
          'Confirmation of Acceptance for Studies — required for student visa application',
        required: false, // only required if visaRequested
        displayOrder: 1,
        active: true,
      },
      {
        id: 'tpl-p4-uniform',
        phase: 4,
        category: 'other',
        name: 'Uniform Order Form',
        description: 'School uniform order form for parents to complete',
        required: false,
        displayOrder: 2,
        active: true,
      },
      {
        id: 'tpl-p4-medical',
        phase: 4,
        category: 'medical',
        name: 'Medical Form',
        description: 'School medical / vaccination form (to be filled by GP)',
        required: true,
        displayOrder: 3,
        active: true,
      },
    ],
    phase5Templates: [
      {
        id: 'tpl-p5-arrival',
        phase: 5,
        category: 'travel',
        name: 'Arrival Form',
        description: 'Flight + arrival time + taxi arrangement details',
        required: true,
        displayOrder: 1,
        active: true,
      },
      {
        id: 'tpl-p5-boarding',
        phase: 5,
        category: 'other',
        name: 'Boarding Information',
        description: 'Boarding house details + arrival instructions',
        required: true,
        displayOrder: 2,
        active: true,
      },
      {
        // P5_SUB_STATUS.P5_TRAVEL_ARRANGED — what school collects from student
        id: 'tpl-p5-guardian-id',
        phase: 5,
        category: 'identity',
        name: 'Guardian Passport Copy',
        description: 'Passport scan of accompanying parent/guardian (for airport pickup)',
        required: false,
        displayOrder: 3,
        active: true,
      },
    ],
  }
}

const DEFAULTS_KEY = 'bsp-v4-school-default-templates'

const schoolDefaults = ref<{
  phase3Templates: DocumentTemplate[]
  phase4Templates: DocumentTemplate[]
  phase5Templates: DocumentTemplate[]
}>(buildSystemDefaults())

const loaded = ref(false)
const lastSaved = ref<string | null>(null)

// ── Load on mount ──────────────────────────────────────────────────────────
onMounted(() => {
  if (typeof window === 'undefined') return
  const stored = localStorage.getItem(DEFAULTS_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Merge with system defaults so newly-added system templates appear
      // when a school upgrades to a new rev.
      const sys = buildSystemDefaults()
      schoolDefaults.value = {
        phase3Templates: parsed.phase3Templates ?? sys.phase3Templates,
        phase4Templates: parsed.phase4Templates ?? sys.phase4Templates,
        phase5Templates: parsed.phase5Templates ?? sys.phase5Templates,
      }
    } catch (e) {
      console.warn('[document-templates] failed to parse stored defaults', e)
    }
  }
  loaded.value = true
})

// ── Save / reset ───────────────────────────────────────────────────────────
function saveDefaults() {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEFAULTS_KEY, JSON.stringify(schoolDefaults.value))
  lastSaved.value = new Date().toISOString()
}

function resetDefaults() {
  if (typeof window === 'undefined') return
  const ok = confirm(
    'Reset all phase templates to system defaults? This cannot be undone.'
  )
  if (!ok) return
  localStorage.removeItem(DEFAULTS_KEY)
  // Reload to pick up system defaults from a clean state
  window.location.reload()
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString()
}

// Reference P5_SUB_STATUS to keep it in the import graph (avoids accidental
// removal by dead-code linters; documents the relationship to §18.1).
void P5_SUB_STATUS
</script>

<style scoped>
.school-settings-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  color: #1a1a2e;
  margin: 0 0 0.5rem 0;
}
.page-header p {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
  max-width: 720px;
  line-height: 1.5;
}

/* Phase tabs */
.phase-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0;
}
.phase-tab-btn {
  background: transparent;
  border: 1px solid transparent;
  border-bottom: none;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-size: 0.85rem;
  color: #475569;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  transition: background 0.15s, color 0.15s;
}
.phase-tab-btn:hover {
  background: #f1f5f9;
}
.phase-tab-btn.active {
  background: #fff;
  border-color: #e2e8f0;
  border-bottom: 1px solid #fff;
  margin-bottom: -1px;
  color: #1e293b;
  font-weight: 600;
}
.phase-tab-num {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #3b82f6;
}
.phase-tab-name {
  font-size: 0.95rem;
}
.phase-tab-btn.active .phase-tab-num {
  color: #1d4ed8;
}

/* Phase section */
.phase-section {
  margin-top: 2rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.5rem;
}
.phase-section h2 {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}
.phase-section-desc {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

/* Footer */
.page-footer {
  margin-top: 2rem;
  padding: 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.btn-primary {
  background: #3b82f6;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover {
  background: #2563eb;
}
.btn-secondary {
  background: #fff;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-secondary:hover {
  background: #f8fafc;
}
.last-saved {
  color: #6b7280;
  font-size: 0.8rem;
  margin-left: auto;
}
</style>
