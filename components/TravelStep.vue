<template>
  <div class="travel-step">
    <!-- §24.1 Student Part -->
    <div class="travel-section" :class="mode === 'school' ? 'travel-readonly-mode' : 'travel-editable-mode'">
      <h5 class="travel-section-title">
        👨‍🎓 Student Part — Flight + Transfer
        <span v-if="mode === 'school'" class="travel-section-meta">(read-only here)</span>
        <span v-else class="travel-section-meta">(editable)</span>
      </h5>

      <!-- Read-only display (school side OR after-submit state) -->
      <div v-if="mode === 'school' || (mode === 'student' && !isStudentPartEditing && hasStudentPartData)" class="travel-readonly">
        <div v-if="!hasStudentPartData" class="travel-empty">
          <em>No student travel info submitted yet.</em>
        </div>
        <template v-else>
          <div class="travel-row"><span class="travel-label">✈️ Flight:</span> <span>{{ plan.studentPart.flightNumber || '—' }}</span></div>
          <div class="travel-row"><span class="travel-label">🛬 Airport:</span> <span>{{ plan.studentPart.arrivalAirport || '—' }}</span></div>
          <div class="travel-row"><span class="travel-label">📅 Date / Time:</span> <span>{{ plan.studentPart.arrivalDate || '—' }} {{ plan.studentPart.arrivalTime || '' }}</span></div>
          <div class="travel-row"><span class="travel-label">🚕 Transfer mode:</span> <span>{{ formatTransferMode(plan.studentPart.transferMode) }}</span></div>
          <div v-if="plan.studentPart.transferMode === 'self-taxi'" class="travel-row travel-sub-row">
            <span class="travel-label">Taxi:</span>
            <span>
              {{ plan.studentPart.taxiCompany || '—' }}
              <span v-if="plan.studentPart.taxiDriverName"> · {{ plan.studentPart.taxiDriverName }} ({{ plan.studentPart.taxiDriverPhone || '—' }})</span>
              <span v-if="plan.studentPart.taxiBookingRef"> · Ref: {{ plan.studentPart.taxiBookingRef }}</span>
            </span>
          </div>
          <div v-if="plan.studentPart.transferMode === 'family'" class="travel-row travel-sub-row">
            <span class="travel-label">Contact:</span> <span>{{ plan.studentPart.familyContactName || '—' }} ({{ plan.studentPart.familyContactPhone || '—' }})</span>
          </div>
          <div v-if="plan.studentPart.transferMode === 'public'" class="travel-row travel-sub-row">
            <span class="travel-label">Route:</span> <span>{{ plan.studentPart.publicTransportRoute || '—' }}</span>
          </div>
          <div v-if="plan.studentPart.emergencyContactName" class="travel-row travel-sub-row">
            <span class="travel-label">📞 Emergency:</span> <span>{{ plan.studentPart.emergencyContactName }} ({{ plan.studentPart.emergencyContactPhone || '—' }})</span>
          </div>
          <div v-if="plan.studentPart.notes" class="travel-row travel-sub-row">
            <span class="travel-label">💬 Notes:</span> <span>{{ plan.studentPart.notes }}</span>
          </div>
          <div v-if="plan.studentPart.submittedAt" class="travel-row travel-sub-row travel-meta">Submitted {{ formatDateTime(plan.studentPart.submittedAt) }}</div>
        </template>
        <button v-if="mode === 'student' && hasStudentPartData" class="btn-secondary travel-edit-btn" @click="onEditStudent">✏️ Edit</button>
      </div>

      <!-- Editable form (student side, edit mode) -->
      <div v-else-if="mode === 'student'" class="travel-form">
        <div class="travel-form-row">
          <label>✈️ Flight number</label>
          <input v-model="studentForm.flightNumber" type="text" placeholder="e.g. CX251" />
        </div>
        <div class="travel-form-row">
          <label>🛬 Arrival airport (UK)</label>
          <select v-model="studentForm.arrivalAirport">
            <option value="">— Select —</option>
            <option v-for="a in AIRPORTS" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
        <div class="travel-form-row travel-form-row-2col">
          <div>
            <label>📅 Arrival date</label>
            <input v-model="studentForm.arrivalDate" type="date" />
          </div>
          <div>
            <label>⏰ Arrival time (UK local)</label>
            <input v-model="studentForm.arrivalTime" type="time" />
          </div>
        </div>
        <div class="travel-form-row">
          <label>🚕 Transfer mode</label>
          <div class="travel-radio-group">
            <label v-for="m in TRANSFER_MODES" :key="m.value" class="travel-radio">
              <input type="radio" :value="m.value" v-model="studentForm.transferMode" />
              <span>{{ m.label }}</span>
            </label>
          </div>
        </div>

        <!-- Conditional sub-fields based on transfer mode -->
        <template v-if="studentForm.transferMode === 'self-taxi'">
          <div class="travel-form-row">
            <label>🚕 Taxi company</label>
            <input v-model="studentForm.taxiCompany" type="text" placeholder="e.g. Addison Lee" />
          </div>
          <div class="travel-form-row travel-form-row-2col">
            <div>
              <label>Driver name</label>
              <input v-model="studentForm.taxiDriverName" type="text" placeholder="Optional" />
            </div>
            <div>
              <label>Driver phone</label>
              <input v-model="studentForm.taxiDriverPhone" type="tel" placeholder="+44 7xxx xxx xxx" />
            </div>
          </div>
          <div class="travel-form-row">
            <label>Booking reference (optional)</label>
            <input v-model="studentForm.taxiBookingRef" type="text" placeholder="e.g. ADD-12345" />
          </div>
        </template>

        <template v-else-if="studentForm.transferMode === 'family'">
          <div class="travel-form-row travel-form-row-2col">
            <div>
              <label>Family / guardian name</label>
              <input v-model="studentForm.familyContactName" type="text" placeholder="e.g. Mr. Smith" />
            </div>
            <div>
              <label>Contact phone</label>
              <input v-model="studentForm.familyContactPhone" type="tel" placeholder="+44 7xxx xxx xxx" />
            </div>
          </div>
        </template>

        <template v-else-if="studentForm.transferMode === 'public'">
          <div class="travel-form-row">
            <label>Planned route (train/coach line + station)</label>
            <textarea v-model="studentForm.publicTransportRoute" rows="2" placeholder="e.g. Heathrow Express → Paddington, then Tube to King's Cross"></textarea>
          </div>
        </template>

        <div class="travel-form-row travel-form-row-2col">
          <div>
            <label>📞 Emergency contact name (optional)</label>
            <input v-model="studentForm.emergencyContactName" type="text" placeholder="Parent / guardian" />
          </div>
          <div>
            <label>Emergency phone</label>
            <input v-model="studentForm.emergencyContactPhone" type="tel" placeholder="+xx xxx xxx xxx" />
          </div>
        </div>
        <div class="travel-form-row">
          <label>💬 Notes (optional)</label>
          <textarea v-model="studentForm.notes" rows="2" placeholder="Anything else the school should know"></textarea>
        </div>
        <div class="travel-form-actions">
          <button class="btn-primary" :disabled="!isStudentPartFilled" @click="onSaveStudent">💾 Save travel info</button>
          <button v-if="hasStudentPartData" class="btn-secondary" @click="onCancelStudentEdit">Cancel</button>
        </div>
      </div>
    </div>

    <!-- §24.2 School Part -->
    <div class="travel-section" :class="mode === 'student' ? 'travel-readonly-mode' : 'travel-editable-mode'">
      <h5 class="travel-section-title">
        🏫 School Part — Airport Pickup
        <span v-if="mode === 'student'" class="travel-section-meta">(read-only here)</span>
        <span v-else class="travel-section-meta">(editable)</span>
      </h5>

      <div v-if="mode === 'student' || (mode === 'school' && !isSchoolPartEditing && hasSchoolPartData)" :class="mode === 'student' ? 'travel-readonly' : 'travel-readonly'">
        <div v-if="!hasSchoolPartData" class="travel-empty">
          <em>School has not submitted pickup details yet.</em>
        </div>
        <template v-else>
          <div class="travel-row"><span class="travel-label">🚌 Driver:</span> <span>{{ plan.schoolPart.pickupDriverName || '—' }}</span></div>
          <div class="travel-row"><span class="travel-label">🚐 Vehicle:</span> <span>{{ plan.schoolPart.pickupVehicle || '—' }}</span></div>
          <div class="travel-row"><span class="travel-label">📞 Phone:</span> <span>{{ plan.schoolPart.pickupDriverPhone || '—' }}</span></div>
          <div class="travel-row"><span class="travel-label">⏰ Pickup time:</span> <span>{{ formatDateTime(plan.schoolPart.pickupTime) }}</span></div>
          <div class="travel-row"><span class="travel-label">📍 Pickup point:</span> <span>{{ plan.schoolPart.pickupPoint || '—' }}</span></div>
          <div v-if="plan.schoolPart.notes" class="travel-row travel-sub-row">
            <span class="travel-label">💬 Notes:</span> <span>{{ plan.schoolPart.notes }}</span>
          </div>
          <div v-if="plan.schoolPart.submittedAt" class="travel-row travel-sub-row travel-meta">Last updated {{ formatDateTime(plan.schoolPart.submittedAt) }}</div>
        </template>
        <button v-if="mode === 'school' && hasSchoolPartData" class="btn-secondary travel-edit-btn" @click="onEditSchool">✏️ Edit</button>
      </div>

      <!-- Editable form (school side, edit mode) -->
      <div v-else-if="mode === 'school'" class="travel-form">
        <div class="travel-form-row">
          <label>🚌 Pickup driver name</label>
          <input v-model="schoolForm.pickupDriverName" type="text" placeholder="e.g. John Smith" />
        </div>
        <div class="travel-form-row">
          <label>🚐 Vehicle (model + plate)</label>
          <input v-model="schoolForm.pickupVehicle" type="text" placeholder="e.g. Mercedes Sprinter — AB12 CDE" />
        </div>
        <div class="travel-form-row">
          <label>📞 Driver phone</label>
          <input v-model="schoolForm.pickupDriverPhone" type="tel" placeholder="+44 7xxx xxx xxx" />
        </div>
        <div class="travel-form-row">
          <label>⏰ Scheduled pickup time</label>
          <input v-model="schoolForm.pickupTime" type="datetime-local" />
        </div>
        <div class="travel-form-row">
          <label>📍 Pickup point</label>
          <input v-model="schoolForm.pickupPoint" type="text" placeholder="e.g. LHR Terminal 5 — Arrivals Hall" />
        </div>
        <div class="travel-form-row">
          <label>💬 Notes</label>
          <textarea v-model="schoolForm.notes" rows="2" placeholder="Optional"></textarea>
        </div>
        <div class="travel-form-actions">
          <button class="btn-primary" :disabled="!isSchoolPartFilled" @click="onSaveSchool">💾 Save school pickup details</button>
          <button v-if="hasSchoolPartData" class="btn-secondary" @click="onCancelSchoolEdit">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  plan: { type: Object, required: true },
  mode: { type: String, default: 'student' },  // 'student' | 'school'
  applicationRef: { type: String, required: true },
})

const emit = defineEmits(['save-student', 'save-school'])

const AIRPORTS = ['LHR (London Heathrow)', 'LGW (London Gatwick)', 'STN (London Stansted)', 'MAN (Manchester)', 'BHX (Birmingham)', 'EDI (Edinburgh)', 'Other']
const TRANSFER_MODES = [
  { value: 'self-taxi', label: '🚕 Self-arranged taxi' },
  { value: 'school-pickup', label: '🚌 School-arranged pickup' },
  { value: 'family', label: '👨‍👩‍👧 Family / guardian pickup' },
  { value: 'public', label: '🚆 Public transport' },
]

// Edit toggles
const isStudentPartEditing = ref(false)
const isSchoolPartEditing = ref(false)

// Reactive form mirrors — initialise from plan
const studentForm = reactive({ ...emptyStudentForm() })
const schoolForm = reactive({ ...emptySchoolForm() })

function emptyStudentForm() {
  return {
    flightNumber: '', arrivalAirport: '', arrivalDate: '', arrivalTime: '',
    transferMode: '', taxiCompany: '', taxiDriverName: '', taxiDriverPhone: '',
    taxiBookingRef: '', familyContactName: '', familyContactPhone: '',
    publicTransportRoute: '', emergencyContactName: '', emergencyContactPhone: '',
    notes: '',
  }
}

function emptySchoolForm() {
  return {
    pickupDriverName: '', pickupVehicle: '', pickupDriverPhone: '',
    pickupTime: '', pickupPoint: '', notes: '',
  }
}

const hasStudentPartData = computed(() => !!props.plan.studentPart?.submittedAt)
const hasSchoolPartData = computed(() => !!props.plan.schoolPart?.submittedAt)

const isStudentPartFilled = computed(() => {
  return !!(studentForm.flightNumber && studentForm.arrivalDate && studentForm.arrivalTime && studentForm.transferMode)
})

const isSchoolPartFilled = computed(() => {
  return !!(schoolForm.pickupDriverName && schoolForm.pickupVehicle && schoolForm.pickupDriverPhone)
})

function formatTransferMode(m) {
  const found = TRANSFER_MODES.find(t => t.value === m)
  return found ? found.label : (m || '—')
}

function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

function onEditStudent() {
  // Pre-fill form with current plan data
  Object.assign(studentForm, emptyStudentForm(), props.plan.studentPart)
  isStudentPartEditing.value = true
}

function onCancelStudentEdit() {
  isStudentPartEditing.value = false
  Object.assign(studentForm, emptyStudentForm())
}

function onSaveStudent() {
  emit('save-student', { ...studentForm })
  isStudentPartEditing.value = false
}

function onEditSchool() {
  Object.assign(schoolForm, emptySchoolForm(), props.plan.schoolPart)
  isSchoolPartEditing.value = true
}

function onCancelSchoolEdit() {
  isSchoolPartEditing.value = false
  Object.assign(schoolForm, emptySchoolForm())
}

function onSaveSchool() {
  emit('save-school', { ...schoolForm })
  isSchoolPartEditing.value = false
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
.travel-section.travel-readonly-mode { background: #f1f5f9; }
.travel-section.travel-editable-mode { background: #fffbeb; border-color: #fcd34d; }
.travel-section-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.6rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.travel-section-meta {
  font-size: 0.72rem;
  color: #64748b;
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
.travel-empty {
  font-size: 0.85rem;
  color: #64748b;
  padding: 0.4rem 0;
}
.travel-empty-hint { font-size: 0.78rem; color: #94a3b8; margin: 0.3rem 0 0 0; }
.travel-edit-btn { margin-top: 0.5rem; align-self: flex-start; }

.travel-form { display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.3rem; }
.travel-form-row { display: flex; flex-direction: column; gap: 0.25rem; }
.travel-form-row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }
.travel-form-row label { font-size: 0.78rem; font-weight: 600; color: #475569; }
.travel-form-row input, .travel-form-row select, .travel-form-row textarea {
  padding: 0.45rem 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: inherit;
  background: #fff;
}
.travel-form-row input:disabled, .travel-form-row select:disabled, .travel-form-row textarea:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}
.travel-radio-group { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.travel-radio { display: flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; font-weight: 500; cursor: pointer; }
.travel-form-actions { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.3rem; }
.travel-meta-inline { font-size: 0.72rem; color: #94a3b8; font-style: italic; }
</style>