<template>
  <div class="visa-confirm-step">

    <!-- N/A state: no visa required -->
    <div v-if="!visaRequested" class="visa-na">
      <div class="visa-na-icon">&#127761;</div>
      <p>No student visa required for this application.</p>
      <p class="visa-na-sub">This step is only applicable for international students requiring a CAS and visa.</p>
    </div>

    <!-- Visa sub-step -->
    <template v-else>

      <!-- Step header -->
      <div class="visa-header">
        <span class="visa-step-emoji">&#128467;&#65039;</span>
        <div>
          <h4 class="visa-title">Step 2 &mdash; Confirm Visa Granted</h4>
          <p class="visa-subtitle">Upload your visa granted letter (PDF), then confirm below.</p>
        </div>
      </div>

      <!-- Upload section -->
      <div class="visa-upload-section">
        <input
          ref="fileInputRef"
          type="file"
          accept="application/pdf"
          style="display: none"
          @change="onFileSelected"
        />

        <button
          class="btn btn-secondary visa-upload-btn"
          @click="fileInputRef?.click()"
          :disabled="uploading"
        >
          <span class="btn-icon">&#128196;</span>
          {{ phase5VisaGrantedDocument ? 'Replace Visa PDF' : 'Upload Visa PDF' }}
        </button>

        <p v-if="uploading" class="visa-uploading-msg">Processing...</p>
      </div>

      <!-- Uploaded PDF info -->
      <div v-if="phase5VisaGrantedDocument" class="visa-pdf-info">
        <div class="visa-pdf-badge">
          <span class="pdf-icon">&#10003;</span>
          <div>
            <div class="pdf-name">{{ phase5VisaGrantedDocument.name }}</div>
            <div class="pdf-date">Uploaded {{ formatDateTime(phase5VisaGrantedDocument.uploadedAt) }}</div>
          </div>
        </div>
      </div>

      <!-- Confirm button -->
      <div class="visa-confirm-section">
        <button
          class="btn btn-primary visa-confirm-btn"
          :disabled="!phase5VisaGrantedDocument"
          @click="emit('confirm-granted')"
        >
          &#10003; Confirm Visa Granted
        </button>

        <p v-if="!phase5VisaGrantedDocument" class="visa-hint">
          Please upload your visa granted PDF above to unlock confirmation.
        </p>
      </div>

      <!-- Already confirmed message -->
      <div v-if="phase5VisaGrantedAt" class="visa-confirmed-msg">
        <span class="confirmed-icon">&#127881;</span>
        Visa granted confirmed on {{ formatDateTime(phase5VisaGrantedAt) }}.
        Reference: <strong>{{ applicationRef }}</strong>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
interface VisaGrantedDoc {
  name: string
  dataUrl: string
  uploadedAt: string
}

interface Props {
  /** Application reference number */
  applicationRef: string
  /** The currently uploaded visa PDF document, if any */
  phase5VisaGrantedDocument: VisaGrantedDoc | null
  /** ISO timestamp when student confirmed visa granted */
  phase5VisaGrantedAt: string | null
  /** Whether the application requires a student visa (from P1 selection) */
  visaRequested: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** Emitted when student clicks "Confirm Visa Granted" */
  'confirm-granted': []
  /** Emitted after a PDF is successfully read as dataUrl */
  'upload': [doc: VisaGrantedDoc]
}>()

// ── Refs ─────────────────────────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

// ── File handling ────────────────────────────────────────────────────────────
function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.type !== 'application/pdf') {
    alert('Please upload a PDF file (.pdf only)')
    // Reset input so same file can be re-selected
    if (fileInputRef.value) fileInputRef.value.value = ''
    return
  }

  uploading.value = true
  const reader = new FileReader()

  reader.onload = () => {
    uploading.value = false
    const doc: VisaGrantedDoc = {
      name: file.name,
      dataUrl: reader.result as string,
      uploadedAt: new Date().toISOString(),
    }
    emit('upload', doc)
    // Reset file input so @change fires again even for same file
    if (fileInputRef.value) fileInputRef.value.value = ''
  }

  reader.onerror = () => {
    uploading.value = false
    alert('Failed to read the file. Please try again.')
    if (fileInputRef.value) fileInputRef.value.value = ''
  }

  reader.readAsDataURL(file)
}

// ── Formatting ──────────────────────────────────────────────────────────────
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>

<style scoped>
/* ── Container ─────────────────────────────────────────── */
.visa-confirm-step {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
}

/* ── N/A state ──────────────────────────────────────────── */
.visa-na {
  padding: 2rem 1.5rem;
  text-align: center;
  color: #64748b;
}

.visa-na-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.visa-na p { margin: 0; }
.visa-na-sub {
  margin-top: 0.5rem !important;
  font-size: 0.8rem;
  color: #94a3b8;
}

/* ── Header ─────────────────────────────────────────────── */
.visa-header {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  background: #eff6ff;
  border-bottom: 1px solid #dbeafe;
}

.visa-step-emoji {
  font-size: 1.5rem;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.visa-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--bsp-primary, #212E54);
  margin: 0 0 0.2rem 0;
}

.visa-subtitle {
  font-size: 0.8rem;
  color: #475569;
  margin: 0;
}

/* ── Upload section ─────────────────────────────────────── */
.visa-upload-section {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.visa-upload-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-icon { font-size: 1rem; }

.visa-upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.visa-uploading-msg {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* ── PDF info ───────────────────────────────────────────── */
.visa-pdf-info {
  padding: 0 1.25rem 1rem;
}

.visa-pdf-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
  padding: 0.5rem 0.875rem;
}

.pdf-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bsp-success, #10b981);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.pdf-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #065f46;
}

.pdf-date {
  font-size: 0.72rem;
  color: #059669;
  margin-top: 0.1rem;
}

/* ── Confirm section ────────────────────────────────────── */
.visa-confirm-section {
  padding: 0 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.visa-confirm-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.visa-confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.visa-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}

/* ── Already confirmed ──────────────────────────────────── */
.visa-confirmed-msg {
  margin: 0 1.25rem 1.25rem;
  padding: 0.75rem 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  color: #065f46;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.confirmed-icon { font-size: 1.1rem; }
</style>
