<template>
  <div class="doc-template-editor">
    <!-- Header -->
    <div class="dte-header">
      <span class="dte-phase-badge">{{ phaseLabel }} Document Templates</span>
      <span class="dte-count">{{ editedTemplates.length }} template{{ editedTemplates.length !== 1 ? 's' : '' }}</span>
    </div>

    <!-- Empty state -->
    <div v-if="editedTemplates.length === 0" class="dte-empty">
      <p>No templates configured for this phase.</p>
      <button v-if="!readonly" class="btn btn-primary" @click="addTemplate">
        + Add First Template
      </button>
    </div>

    <!-- Template list -->
    <div v-else class="dte-list">
      <div
        v-for="(tpl, idx) in editedTemplates"
        :key="tpl.id"
        class="dte-card"
        :class="{ 'dte-card-inactive': !tpl.active }"
      >
        <!-- Card header row -->
        <div class="dte-card-header">
          <span class="dte-card-index">{{ idx + 1 }}</span>

          <!-- Active toggle -->
          <label v-if="!readonly" class="dte-toggle">
            <input type="checkbox" v-model="tpl.active" @change="emitChange" />
            <span class="dte-toggle-label">{{ tpl.active ? 'Active' : 'Inactive' }}</span>
          </label>
          <span v-else class="dte-badge" :class="tpl.active ? 'badge-active' : 'badge-inactive'">
            {{ tpl.active ? 'Active' : 'Inactive' }}
          </span>

          <!-- Remove button (edit mode only) -->
          <button
            v-if="!readonly"
            class="dte-btn-remove"
            title="Remove template"
            @click="removeTemplate(idx)"
          >
            &#10005;
          </button>
        </div>

        <!-- Fields grid -->
        <div class="dte-fields">
          <!-- Name -->
          <div class="dte-field">
            <label class="dte-field-label">Name <span v-if="tpl.required" class="dte-required">*</span></label>
            <input
              v-if="!readonly"
              v-model="tpl.name"
              type="text"
              class="dte-input"
              placeholder="e.g. Passport Copy"
              @input="emitChange"
            />
            <span v-else class="dte-field-value">{{ tpl.name }}</span>
          </div>

          <!-- Description -->
          <div class="dte-field dte-field-full">
            <label class="dte-field-label">Description</label>
            <textarea
              v-if="!readonly"
              v-model="tpl.description"
              class="dte-textarea"
              placeholder="Optional description or instructions for this document..."
              rows="2"
              @input="emitChange"
            ></textarea>
            <span v-else class="dte-field-value dte-field-desc">{{ tpl.description || '—' }}</span>
          </div>

          <!-- Category + Display Order row -->
          <div class="dte-field">
            <label class="dte-field-label">Category</label>
            <select
              v-if="!readonly"
              v-model="tpl.category"
              class="dte-select"
              @change="emitChange"
            >
              <option value="admission">Admission</option>
              <option value="identity">Identity</option>
              <option value="financial">Financial</option>
              <option value="travel">Travel</option>
              <option value="medical">Medical</option>
              <option value="other">Other</option>
            </select>
            <span v-else class="dte-field-value">{{ capitalize(tpl.category) }}</span>
          </div>

          <div class="dte-field">
            <label class="dte-field-label">Display Order</label>
            <input
              v-if="!readonly"
              v-model.number="tpl.displayOrder"
              type="number"
              min="1"
              class="dte-input dte-input-narrow"
              @input="emitChange"
            />
            <span v-else class="dte-field-value">{{ tpl.displayOrder }}</span>
          </div>

          <!-- Required toggle -->
          <div class="dte-field">
            <label class="dte-field-label">Required</label>
            <label v-if="!readonly" class="dte-checkbox-row">
              <input type="checkbox" v-model="tpl.required" @change="emitChange" />
              <span>Required for submission</span>
            </label>
            <span v-else class="dte-field-value">
              {{ tpl.required ? 'Yes' : 'Optional' }}
            </span>
          </div>

          <!-- Sample URL (read-only display only) -->
          <div class="dte-field">
            <label class="dte-field-label">Sample URL</label>
            <span v-if="tpl.sampleUrl" class="dte-field-value">
              <a :href="tpl.sampleUrl" target="_blank" rel="noopener" class="dte-link">View sample &#8599;</a>
            </span>
            <span v-else class="dte-field-value dte-muted">—</span>
          </div>

          <!-- rev 3.11: Pre-uploaded file (auto-pre-fills school application page queue) -->
          <div class="dte-field dte-field-full">
            <label class="dte-field-label">
              Pre-uploaded File
              <span class="dte-hint">— sends automatically when school enters this phase</span>
            </label>
            <div v-if="tpl.fileDataUrl" class="dte-file-uploaded">
              <div class="dte-file-info">
                <span class="dte-file-icon">📄</span>
                <div class="dte-file-meta">
                  <span class="dte-file-name">{{ tpl.fileName }}</span>
                  <span class="dte-file-sub">{{ formatFileSize(tpl.fileSize) }} · {{ tpl.mimeType }} · uploaded {{ formatDate(tpl.uploadedAt) }}</span>
                </div>
              </div>
              <div class="dte-file-actions" v-if="!readonly">
                <label :for="`tpl-file-${tpl.id}`" class="btn btn-secondary btn-sm">Replace file</label>
                <button type="button" class="btn btn-secondary btn-sm" @click="removeTemplateFile(idx)">Remove file</button>
              </div>
            </div>
            <div v-else-if="!readonly" class="dte-file-empty">
              <label :for="`tpl-file-${tpl.id}`" class="btn btn-primary btn-sm">📤 Upload file</label>
              <span class="dte-hint dte-muted">PDF / JPEG / PNG, max 5 MB</span>
            </div>
            <div v-else class="dte-field-value dte-muted">No file attached</div>
            <input
              v-if="!readonly"
              :id="`tpl-file-${tpl.id}`"
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              style="display:none"
              @change="onTemplateFile($event, idx)"
            />
          </div>
        </div>
      </div>
      <!-- /.dte-card -->

      <!-- Add button -->
      <button v-if="!readonly" class="btn btn-secondary dte-add-btn" @click="addTemplate">
        + Add Template
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DocumentTemplate } from '~/composables/useP2Store'

interface Props {
  /** Which phase: 3 | 4 | 5 */
  phase: 3 | 4 | 5
  /** v-model: the templates array for this phase */
  modelValue: DocumentTemplate[]
  /** If true, render all fields as read-only text */
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [templates: DocumentTemplate[]]
}>()

// ── Local editable copy ───────────────────────────────────────────────────────
const editedTemplates = ref<DocumentTemplate[]>([])

// Sync from prop → local on mount / prop change
watch(
  () => props.modelValue,
  (val) => {
    editedTemplates.value = JSON.parse(JSON.stringify(val))
  },
  { immediate: true, deep: true },
)

// ── Helpers ──────────────────────────────────────────────────────────────────
const PHASE_LABELS: Record<number, string> = {
  3: 'P3 – Offering',
  4: 'P4 – Admission Documents',
  5: 'P5 – Pre-Departure',
}
const phaseLabel = computed(() => PHASE_LABELS[props.phase] ?? `Phase ${props.phase}`)

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function uid() {
  return `tpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

function formatFileSize(bytes?: number) {
  if (!bytes && bytes !== 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}

function onTemplateFile(event: Event, idx: number) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    alert(`File type "${file.type || 'unknown'}" not allowed. Please use PDF, JPEG, or PNG.`)
    input.value = ''
    return
  }
  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    alert(`File too large (${formatFileSize(file.size)}). Max 5 MB.`)
    input.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const dataUrl = reader.result as string
    const tpl = editedTemplates.value[idx]
    if (!tpl) return
    tpl.fileDataUrl = dataUrl
    tpl.fileName = file.name
    tpl.mimeType = file.type
    tpl.fileSize = file.size
    tpl.uploadedAt = new Date().toISOString()
    emitChange()
  }
  reader.onerror = () => {
    alert('Failed to read file. Please try again.')
  }
  reader.readAsDataURL(file)
  // Reset input so the same file can be re-uploaded later if needed
  input.value = ''
}

function removeTemplateFile(idx: number) {
  const tpl = editedTemplates.value[idx]
  if (!tpl) return
  if (!confirm(`Remove pre-uploaded file from "${tpl.name}"? Future phase entries will not auto-pre-fill this template.`)) return
  tpl.fileDataUrl = undefined
  tpl.fileName = undefined
  tpl.mimeType = undefined
  tpl.fileSize = undefined
  tpl.uploadedAt = undefined
  emitChange()
}

// ── Actions ──────────────────────────────────────────────────────────────────
function emitChange() {
  emit('update:modelValue', JSON.parse(JSON.stringify(editedTemplates.value)))
}

function addTemplate() {
  const newTpl: DocumentTemplate = {
    id: uid(),
    phase: props.phase,
    category: 'other',
    name: 'New Template',
    description: '',
    required: false,
    displayOrder: editedTemplates.value.length + 1,
    active: true,
  }
  editedTemplates.value.push(newTpl)
  emitChange()
}

function removeTemplate(idx: number) {
  editedTemplates.value.splice(idx, 1)
  // Re-index displayOrder
  editedTemplates.value.forEach((tpl, i) => {
    tpl.displayOrder = i + 1
  })
  emitChange()
}
</script>

<style scoped>
/* ── Container ─────────────────────────────────────────── */
.doc-template-editor {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
}

/* ── Header ─────────────────────────────────────────────── */
.dte-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.dte-phase-badge {
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--bsp-primary, #212E54);
}

.dte-count {
  font-size: 0.75rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
}

/* ── Empty ───────────────────────────────────────────────── */
.dte-empty {
  padding: 2rem 1.25rem;
  text-align: center;
  color: #64748b;
}
.dte-empty p { margin-bottom: 1rem; }

/* ── List ────────────────────────────────────────────────── */
.dte-list {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

/* ── Card ───────────────────────────────────────────────── */
.dte-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: opacity 0.2s ease;
}

.dte-card-inactive {
  opacity: 0.55;
}

/* ── Card header ────────────────────────────────────────── */
.dte-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.875rem;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.dte-card-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--bsp-secondary, #3b82f6);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}

/* ── Toggle ─────────────────────────────────────────────── */
.dte-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-size: 0.75rem;
  color: #475569;
}

.dte-toggle input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: var(--bsp-secondary, #3b82f6);
}

.dte-toggle-label { font-weight: 500; }

/* ── Badge (readonly) ───────────────────────────────────── */
.dte-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 99px;
}
.badge-active  { background: #d1fae5; color: #065f46; }
.badge-inactive { background: #f1f5f9; color: #64748b; }

/* ── Remove button ──────────────────────────────────────── */
.dte-btn-remove {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 0.875rem;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  transition: color 0.15s, background 0.15s;
}
.dte-btn-remove:hover {
  color: var(--bsp-danger, #ef4444);
  background: #fef2f2;
}

/* ── Fields grid ───────────────────────────────────────── */
.dte-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding: 0.875rem;
}

.dte-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.dte-field-full {
  grid-column: 1 / -1;
}

.dte-field-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.dte-required {
  color: var(--bsp-danger, #ef4444);
}

/* ── Inputs ─────────────────────────────────────────────── */
.dte-input,
.dte-textarea,
.dte-select {
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: #1e293b;
  background: #fff;
  transition: border-color 0.15s;
}

.dte-input:focus,
.dte-textarea:focus,
.dte-select:focus {
  outline: none;
  border-color: var(--bsp-secondary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dte-textarea {
  resize: vertical;
  min-height: 56px;
}

.dte-input-narrow {
  max-width: 80px;
}

.dte-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  padding-right: 1.75rem;
}

/* ── Field value (readonly display) ─────────────────────── */
.dte-field-value {
  font-size: 0.85rem;
  color: #1e293b;
  padding: 0.4rem 0;
}

.dte-field-desc {
  color: #64748b;
  font-size: 0.8rem;
}

.dte-muted { color: #94a3b8; }

.dte-link {
  color: var(--bsp-secondary, #3b82f6);
  text-decoration: underline;
  font-size: 0.8rem;
}

/* ── Checkbox row ───────────────────────────────────────── */
.dte-checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: #475569;
  padding: 0.25rem 0;
}

.dte-checkbox-row input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: var(--bsp-secondary, #3b82f6);
}

/* ── Add button ──────────────────────────────────────────── */
.dte-add-btn {
  align-self: flex-start;
  margin-top: 0.25rem;
}

/* ── rev 3.11: Pre-uploaded file field ───────────────────── */
.dte-hint {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: #94a3b8;
  font-size: 0.7rem;
  margin-left: 0.3rem;
}

.dte-file-uploaded {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.4rem;
}

.dte-file-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  min-width: 0;
}

.dte-file-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.dte-file-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.dte-file-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0c4a6e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dte-file-sub {
  font-size: 0.7rem;
  color: #64748b;
}

.dte-file-actions {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.btn-sm {
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
}

.dte-file-empty {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .dte-file-uploaded {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .dte-file-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .dte-file-empty {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
  }
}
</style>
