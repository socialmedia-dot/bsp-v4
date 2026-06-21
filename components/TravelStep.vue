<template>
  <div class="travel-step">
    <!-- §24.1 ✈️ Flight section — only when visaRequested === true, optional, jointly editable -->
    <div v-if="visaRequested" class="travel-section travel-flight-section">
      <h5 class="travel-section-title">
        ✈️ Flight
        <span class="travel-section-meta">(visa applicant · optional · both can edit)</span>
      </h5>

      <!-- Read-only display (after data saved) -->
      <div v-if="!isFlightEditing && hasFlightData" class="travel-readonly">
        <div class="travel-row"><span class="travel-label">✈️ Flight:</span> <span>{{ plan.flight.flightNumber || '—' }}</span></div>
        <div class="travel-row"><span class="travel-label">🛬 Airport:</span> <span>{{ plan.flight.arrivalAirport || '—' }}</span></div>
        <div class="travel-row"><span class="travel-label">📅 Date / Time:</span> <span>{{ plan.flight.arrivalDate || '—' }} {{ plan.flight.arrivalTime || '' }}</span></div>
        <div v-if="plan.flight.notes" class="travel-row travel-sub-row">
          <span class="travel-label">💬 Notes:</span> <span class="travel-notes">{{ plan.flight.notes }}</span>
        </div>
        <div v-if="plan.flight.lastEditedAt" class="travel-row travel-sub-row travel-meta">
          Last edited by {{ plan.flight.lastEditedBy || '—' }} at {{ formatDateTime(plan.flight.lastEditedAt) }}
        </div>
        <button class="btn-secondary travel-edit-btn" @click="onEditFlight">✏️ Edit</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="!isFlightEditing" class="travel-empty">
        <em>No flight info yet. Add below if known.</em>
        <button class="btn-secondary travel-edit-btn" @click="onEditFlight">➕ Add flight info</button>
      </div>

      <!-- Edit form (flight fields each on own row + free-text notes at bottom) -->
      <div v-else class="travel-form">
        <div class="travel-form-row">
          <label>✈️ Flight number</label>
          <input v-model="flightForm.flightNumber" type="text" placeholder="e.g. CX251" />
        </div>
        <div class="travel-form-row">
          <label>🛬 Arrival airport (UK)</label>
          <select v-model="flightForm.arrivalAirport">
            <option value="">— Select —</option>
            <option v-for="a in AIRPORTS" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
        <div class="travel-form-row travel-form-row-2col">
          <div>
            <label>📅 Arrival date</label>
            <input v-model="flightForm.arrivalDate" type="date" />
          </div>
          <div>
            <label>⏰ Arrival time (UK local)</label>
            <input v-model="flightForm.arrivalTime" type="time" />
          </div>
        </div>

        <!-- Free-text notes box at bottom — both sides can write -->
        <div class="travel-form-row">
          <label>💬 Notes <span class="travel-label-hint">(free text — either side can write anything important)</span></label>
          <textarea v-model="flightForm.notes" rows="3" placeholder="e.g. 'Flight delayed 2h', 'BA rebooked to CX257 same day'"></textarea>
        </div>

        <div class="travel-form-actions">
          <button class="btn-primary" @click="onSaveFlight">💾 Save flight info</button>
          <button class="btn-secondary" @click="onCancelFlightEdit">Cancel</button>
        </div>
      </div>
    </div>

    <!-- §24.2 🚗 To-school Transportation section — always shown, both can edit, ETA required -->
    <div class="travel-section travel-transport-section">
      <h5 class="travel-section-title">
        🚗 To-school Transportation
        <span class="travel-section-meta">(for all · both school and pupil can edit · ETA required)</span>
      </h5>

      <!-- Read-only display (after data saved) -->
      <div v-if="!isTransportEditing && hasTransportData" class="travel-readonly">
        <div class="travel-row"><span class="travel-label">🚕 Mode:</span> <span>{{ formatMode(plan.transportation.mode) }}</span></div>
        <div class="travel-row"><span class="travel-label">⏰ ETA:</span> <span>{{ formatDateTime(plan.transportation.eta) }}</span></div>

        <!-- Taxi sub-rows -->
        <template v-if="plan.transportation.mode === 'taxi'">
          <div v-if="plan.transportation.taxiCompany" class="travel-row travel-sub-row">
            <span class="travel-label">Taxi company:</span> <span>{{ plan.transportation.taxiCompany }}</span>
          </div>
          <div v-if="plan.transportation.driverName || plan.transportation.driverPhone" class="travel-row travel-sub-row">
            <span class="travel-label">Driver:</span> <span>{{ plan.transportation.driverName || '—' }} ({{ plan.transportation.driverPhone || '—' }})</span>
          </div>
          <div v-if="plan.transportation.vehicle" class="travel-row travel-sub-row">
            <span class="travel-label">Vehicle:</span> <span>{{ plan.transportation.vehicle }}</span>
          </div>
          <div v-if="plan.transportation.bookingRef" class="travel-row travel-sub-row">
            <span class="travel-label">Booking ref:</span> <span>{{ plan.transportation.bookingRef }}</span>
          </div>
        </template>

        <!-- Train sub-row -->
        <template v-if="plan.transportation.mode === 'train'">
          <div v-if="plan.transportation.trainRoute" class="travel-row travel-sub-row">
            <span class="travel-label">Route:</span> <span class="travel-notes">{{ plan.transportation.trainRoute }}</span>
          </div>
        </template>

        <!-- Parents sub-rows -->
        <template v-if="plan.transportation.mode === 'parents'">
          <div v-if="plan.transportation.parentName || plan.transportation.parentPhone" class="travel-row travel-sub-row">
            <span class="travel-label">Parent / guardian:</span> <span>{{ plan.transportation.parentName || '—' }} ({{ plan.transportation.parentPhone || '—' }})</span>
          </div>
        </template>

        <div v-if="plan.transportation.notes" class="travel-row travel-sub-row">
          <span class="travel-label">💬 Notes:</span> <span class="travel-notes">{{ plan.transportation.notes }}</span>
        </div>
        <div v-if="plan.transportation.lastEditedAt" class="travel-row travel-sub-row travel-meta">
          Last edited by {{ plan.transportation.lastEditedBy || '—' }} at {{ formatDateTime(plan.transportation.lastEditedAt) }}
        </div>
        <button class="btn-secondary travel-edit-btn" @click="onEditTransport">✏️ Edit</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="!isTransportEditing" class="travel-empty">
        <em>No transportation details yet. Pick a mode below to start.</em>
        <button class="btn-secondary travel-edit-btn" @click="onEditTransport">➕ Add transportation</button>
      </div>

      <!-- Edit form (each line on its own row, free-text notes at bottom) -->
      <div v-else class="travel-form">
        <!-- Mode + ETA — both required for the gate -->
        <div class="travel-form-row">
          <label>🚕 Transfer mode <span class="travel-required">*</span></label>
          <div class="travel-radio-group">
            <label v-for="m in TRANSPORT_MODES" :key="m.value" class="travel-radio">
              <input type="radio" :value="m.value" v-model="transportForm.mode" />
              <span>{{ m.label }}</span>
            </label>
          </div>
        </div>

        <div class="travel-form-row">
          <label>⏰ ETA (estimated arrival at school) <span class="travel-required">*</span></label>
          <input v-model="transportForm.eta" type="datetime-local" />
          <span class="travel-label-hint">Required for "Mark Travel Arranged"</span>
        </div>

        <!-- Taxi sub-fields — each on own row -->
        <template v-if="transportForm.mode === 'taxi'">
          <div class="travel-form-row">
            <label>🚕 Taxi company</label>
            <input v-model="transportForm.taxiCompany" type="text" placeholder="e.g. Addison Lee" />
          </div>
          <div class="travel-form-row travel-form-row-2col">
            <div>
              <label>Driver name</label>
              <input v-model="transportForm.driverName" type="text" placeholder="Optional" />
            </div>
            <div>
              <label>Driver phone</label>
              <input v-model="transportForm.driverPhone" type="tel" placeholder="+44 7xxx xxx xxx" />
            </div>
          </div>
          <div class="travel-form-row travel-form-row-2col">
            <div>
              <label>Vehicle (model + plate)</label>
              <input v-model="transportForm.vehicle" type="text" placeholder="e.g. Mercedes Sprinter — AB12 CDE" />
            </div>
            <div>
              <label>Booking reference</label>
              <input v-model="transportForm.bookingRef" type="text" placeholder="Optional" />
            </div>
          </div>
        </template>

        <!-- Train sub-field -->
        <template v-if="transportForm.mode === 'train'">
          <div class="travel-form-row">
            <label>🚆 Planned route (line + station + changeovers)</label>
            <textarea v-model="transportForm.trainRoute" rows="2" placeholder="e.g. Heathrow Express → Paddington, then Tube Northern Line to King's Cross"></textarea>
          </div>
        </template>

        <!-- Parents sub-fields -->
        <template v-if="transportForm.mode === 'parents'">
          <div class="travel-form-row travel-form-row-2col">
            <div>
              <label>Parent / guardian name</label>
              <input v-model="transportForm.parentName" type="text" placeholder="e.g. Mr. Smith" />
            </div>
            <div>
              <label>Contact phone</label>
              <input v-model="transportForm.parentPhone" type="tel" placeholder="+44 7xxx xxx xxx" />
            </div>
          </div>
        </template>

        <!-- Free-text notes box at bottom — both sides can write -->
        <div class="travel-form-row">
          <label>💬 Notes <span class="travel-label-hint">(free text — either side can write anything important)</span></label>
          <textarea v-model="transportForm.notes" rows="3" placeholder="e.g. 'Parents bringing younger sibling too', 'Train strikes possible — fallback taxi booked'"></textarea>
        </div>

        <div class="travel-form-actions">
          <button class="btn-primary" :disabled="!isTransportFilled" :title="!isTransportFilled ? 'Pick a mode and ETA first' : 'Save transportation'" @click="onSaveTransport">💾 Save transportation</button>
          <button class="btn-secondary" @click="onCancelTransportEdit">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({
  plan: { type: Object, required: true },
  mode: { type: String, default: 'student' },  // 'student' | 'school' — used for audit stamp
  applicationRef: { type: String, required: true },
  visaRequested: { type: Boolean, default: false },  // §24.1 — controls Flight section visibility
})

const emit = defineEmits(['save-flight', 'save-transportation'])

const AIRPORTS = ['LHR (London Heathrow)', 'LGW (London Gatwick)', 'STN (London Stansted)', 'MAN (Manchester)', 'BHX (Birmingham)', 'EDI (Edinburgh)', 'Other']
const TRANSPORT_MODES = [
  { value: 'taxi', label: '🚕 Airport taxi' },
  { value: 'train', label: '🚆 Train' },
  { value: 'parents', label: '👨‍👩‍👧 Drop off by parents' },
]

// Edit toggles — both sections independently toggleable
const isFlightEditing = ref(false)
const isTransportEditing = ref(false)

// Reactive form mirrors — initialise from plan
const flightForm = reactive({ ...emptyFlightForm() })
const transportForm = reactive({ ...emptyTransportForm() })

function emptyFlightForm() {
  return {
    flightNumber: '', arrivalAirport: '', arrivalDate: '', arrivalTime: '',
    notes: '',
  }
}

function emptyTransportForm() {
  return {
    mode: '', eta: '',
    taxiCompany: '', driverName: '', driverPhone: '', vehicle: '', bookingRef: '',
    trainRoute: '',
    parentName: '', parentPhone: '',
    notes: '',
  }
}

const hasFlightData = computed(() => {
  const f = props.plan.flight || {}
  return !!(f.flightNumber || f.arrivalAirport || f.arrivalDate || f.arrivalTime || f.notes || f.lastEditedAt)
})

const hasTransportData = computed(() => {
  const t = props.plan.transportation || {}
  return !!(t.mode || t.eta || t.lastEditedAt)
})

// Gate: mode + ETA are required for the Transportation section to be considered filled.
const isTransportFilled = computed(() => {
  return !!(transportForm.mode && transportForm.eta)
})

function formatMode(m) {
  const found = TRANSPORT_MODES.find(x => x.value === m)
  return found ? found.label : (m || '—')
}

function formatDateTime(value) {
  if (!value) return '—'
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return value }
}

// Flight handlers
function onEditFlight() {
  Object.assign(flightForm, emptyFlightForm(), props.plan.flight || {})
  isFlightEditing.value = true
}
function onCancelFlightEdit() {
  isFlightEditing.value = false
  Object.assign(flightForm, emptyFlightForm())
}
function onSaveFlight() {
  emit('save-flight', { ...flightForm }, props.mode)
  isFlightEditing.value = false
}

// Transportation handlers
function onEditTransport() {
  Object.assign(transportForm, emptyTransportForm(), props.plan.transportation || {})
  isTransportEditing.value = true
}
function onCancelTransportEdit() {
  isTransportEditing.value = false
  Object.assign(transportForm, emptyTransportForm())
}
function onSaveTransport() {
  emit('save-transportation', { ...transportForm }, props.mode)
  isTransportEditing.value = false
}
</script>

<style scoped>
.travel-step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.travel-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.travel-flight-section { background: #fef3c7; border-color: #fcd34d; }    /* visa-only, amber */
.travel-transport-section { background: #ecfeff; border-color: #a5f3fc; }  /* always, cyan */

.travel-section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.6rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.travel-section-meta {
  font-size: 0.72rem;
  color: #475569;
  font-weight: 500;
}

.travel-readonly { display: flex; flex-direction: column; gap: 0.3rem; }
.travel-row {
  font-size: 0.85rem;
  color: #1e293b;
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}
.travel-row.travel-sub-row { padding-left: 0.5rem; color: #475569; }
.travel-row.travel-meta { font-size: 0.72rem; color: #94a3b8; font-style: italic; margin-top: 0.3rem; }
.travel-label { font-weight: 600; min-width: 110px; }
.travel-notes { white-space: pre-wrap; }
.travel-empty {
  font-size: 0.85rem;
  color: #64748b;
  padding: 0.4rem 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
}
.travel-edit-btn { margin-top: 0.5rem; align-self: flex-start; }

.travel-form { display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.3rem; }
.travel-form-row { display: flex; flex-direction: column; gap: 0.25rem; }
.travel-form-row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }
.travel-form-row label { font-size: 0.78rem; font-weight: 600; color: #475569; }
.travel-label-hint { font-size: 0.7rem; font-weight: 400; color: #94a3b8; }
.travel-required { color: #dc2626; font-weight: 700; }
.travel-form-row input,
.travel-form-row select,
.travel-form-row textarea {
  padding: 0.45rem 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: inherit;
  background: #fff;
}
.travel-form-row input:disabled,
.travel-form-row select:disabled,
.travel-form-row textarea:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}
.travel-radio-group { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.travel-radio { display: flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; font-weight: 500; cursor: pointer; }
.travel-form-actions { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.3rem; }
</style>
