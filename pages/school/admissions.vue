<template>
  <main class="main-content">
    <div class="page-header">
      <h1>🎓 Admission Settings</h1>
      <p class="subtitle">Manage entry options and admission preferences</p>
    </div>

    <div class="settings-grid">
      <!-- Entry Admission Settings -->
      <div class="settings-card">
        <div class="card-header">
          <h2>📅 Entry Options</h2>
          <p class="card-desc">Control which entry types students can apply for</p>
        </div>

        <div class="settings-form">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">In-year Admission</div>
              <div class="setting-hint">Allow students to apply for mid-year entry (e.g. June {{ currentYear }})</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.allowInYear" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">September {{ nextSeptYear }}</div>
              <div class="setting-hint">Accept applications for the upcoming September intake</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.allowCurrentYearSept" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">September {{ nextSeptYear + 1 }}</div>
              <div class="setting-hint">Accept applications for next year's September intake</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.allowNextYearSept" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">September {{ nextSeptYear + 2 }}</div>
              <div class="setting-hint">Accept applications for the following year's September intake</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.allowYearAfterSept" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Custom Entry Options -->
        <div class="custom-section">
          <div class="card-header" style="margin-top: 1.5rem;">
            <h2>✨ Custom Entry Options</h2>
            <p class="card-desc">Add your own entry types (e.g. Summer School, Short Course)</p>
          </div>
          <div class="custom-list">
            <div v-for="(opt, i) in settings.customOptions" :key="i" class="custom-row">
              <span class="custom-name">{{ opt.name }}</span>
              <button type="button" class="custom-delete" @click="removeCustomOption(i)">🗑️</button>
            </div>
            <div v-if="!settings.customOptions.length" class="custom-empty">No custom options added</div>
          </div>
          <div class="custom-add">
            <input
              v-model="newCustomOption"
              type="text"
              placeholder="e.g. Summer School 2026"
              class="custom-input"
              @keyup.enter="addCustomOption"
            />
            <button type="button" class="btn-add" @click="addCustomOption" :disabled="!newCustomOption.trim()">+ Add</button>
          </div>
        </div>

        <div class="grades-section">
          <div class="card-header" style="margin-top: 1.5rem;">
            <h2>📚 Open Grades</h2>
            <p class="card-desc">Select which grades/years are open for applications</p>
          </div>
          <div class="grades-grid">
            <label
              v-for="grade in allGrades"
              :key="grade"
              class="grade-checkbox"
              :class="{ active: settings.openGrades.includes(grade) }"
            >
              <input
                type="checkbox"
                :value="grade"
                v-model="settings.openGrades"
              />
              <span class="check-box"></span>
              <span class="check-label">{{ grade }}</span>
            </label>
          </div>
        </div>

        <div class="preview-box">
          <div class="preview-title">👁️ Student Preview</div>
          <p class="preview-desc">Students will see these options when applying:</p>
          <div class="preview-options">
            <span v-if="settings.allowInYear" class="preview-tag">In-year</span>
            <span v-if="settings.allowCurrentYearSept" class="preview-tag">September {{ nextSeptYear }}</span>
            <span v-if="settings.allowNextYearSept" class="preview-tag">September {{ nextSeptYear + 1 }}</span>
            <span v-if="settings.allowYearAfterSept" class="preview-tag">September {{ nextSeptYear + 2 }}</span>
            <span v-for="(opt, i) in settings.customOptions" :key="i" class="preview-tag">{{ opt.name }}</span>
            <span v-if="!anyEntryOpen" class="preview-tag preview-closed">No entries open</span>
          </div>
          <p v-if="settings.openGrades.length" class="preview-desc" style="margin-top: 0.5rem;">Open grades: {{ settings.openGrades.join(', ') }}</p>
        </div>

        <div class="card-actions">
          <button class="btn-save" @click="saveSettings" :disabled="saving">
            {{ saving ? '🔄 Saving...' : '💾 Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
definePageMeta({ layout: 'school' })
useHead({ title: '🎓 Admission Settings — School Portal' })

const currentYear = new Date().getFullYear()

const settings = ref({
  allowInYear: true,
  allowCurrentYearSept: true,
  allowNextYearSept: true,
  allowYearAfterSept: true,
  openGrades: ['Year 10', 'Year 11', 'Year 12', 'Year 13'],
  customOptions: [
    { name: 'Summer School 2026' }
  ]
})

const allGrades = ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13', 'Sixth Form']

const currentMonth = new Date().getMonth() + 1
const nextSeptYear = currentMonth >= 9 ? currentYear + 1 : currentYear

const anyEntryOpen = computed(() =>
  settings.value.allowInYear ||
  settings.value.allowCurrentYearSept ||
  settings.value.allowNextYearSept ||
  settings.value.allowYearAfterSept ||
  (settings.value.customOptions?.length > 0)
)

const saving = ref(false)
const newCustomOption = ref('')

function addCustomOption() {
  const name = newCustomOption.value.trim()
  if (!name) return
  settings.value.customOptions.push({ name })
  newCustomOption.value = ''
}

function removeCustomOption(index) {
  settings.value.customOptions.splice(index, 1)
}

function saveSettings() {
  saving.value = true
  // TODO: API call
  setTimeout(() => {
    saving.value = false
    alert('✅ Settings saved successfully!')
  }, 800)
}
</script>

<style scoped>
.main-content { flex: 1; padding: 2rem; }
.page-header { margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.5rem; color: #1e293b; margin: 0; }
.subtitle { color: #64748b; font-size: 0.9rem; margin: 0.25rem 0 0; }

.settings-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; max-width: 700px; }
@media (max-width: 1024px) { .settings-grid { grid-template-columns: 1fr; } }

.settings-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; }
.card-header { margin-bottom: 1.25rem; }
.card-header h2 { font-size: 1.1rem; color: #1e293b; margin: 0 0 0.25rem; }
.card-desc { font-size: 0.8rem; color: #64748b; margin: 0; }

/* Toggle rows */
.settings-form { display: flex; flex-direction: column; gap: 1rem; }
.setting-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9; }
.setting-row:last-child { border-bottom: none; }
.setting-info { flex: 1; }
.setting-label { font-size: 0.9rem; font-weight: 600; color: #1e293b; }
.setting-hint { font-size: 0.78rem; color: #94a3b8; margin-top: 2px; }

/* Toggle switch */
.toggle-switch { position: relative; display: inline-block; width: 48px; height: 26px; cursor: pointer; flex-shrink: 0; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0; background: #e2e8f0; border-radius: 26px; transition: 0.25s; }
.toggle-slider::before { content: ''; position: absolute; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.25s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
.toggle-switch input:checked + .toggle-slider { background: #3b82f6; }
.toggle-switch input:checked + .toggle-slider::before { transform: translateX(22px); }

/* Preview */
.preview-box { background: #f8fafc; border-radius: 10px; padding: 1rem; margin-top: 1rem; }
.preview-title { font-size: 0.8rem; font-weight: 700; color: #64748b; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.03em; }
.preview-desc { font-size: 0.78rem; color: #94a3b8; margin: 0 0 0.5rem; }
.preview-options { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.preview-tag { background: #dbeafe; color: #1d4ed8; font-size: 0.78rem; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
.preview-closed { background: #fee2e2; color: #b91c1c; }

/* Actions */
.card-actions { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
.btn-save { background: #3b82f6; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-save:hover:not(:disabled) { background: #2563eb; }
.btn-save:disabled { background: #93c5fd; cursor: not-allowed; }
.btn-secondary { display: inline-block; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 0.6rem 1.25rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: all 0.2s; }
.btn-secondary:hover { background: #e2e8f0; }

/* Grades grid */
.grades-section { margin-top: 0.5rem; }
.grades-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6rem; }
@media (max-width: 768px) { .grades-grid { grid-template-columns: repeat(2, 1fr); } }
.grade-checkbox { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.75rem; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: #fff; }
.grade-checkbox:hover { border-color: #cbd5e1; background: #f8fafc; }
.grade-checkbox.active { border-color: #3b82f6; background: #eff6ff; }
.grade-checkbox input { display: none; }
.check-box { width: 16px; height: 16px; border: 2px solid #cbd5e1; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
.grade-checkbox.active .check-box { border-color: #3b82f6; background: #3b82f6; }
.check-box::after { content: '✓'; color: white; font-size: 0.7rem; opacity: 0; transition: opacity 0.2s; }
.grade-checkbox.active .check-box::after { opacity: 1; }
.check-label { font-size: 0.85rem; font-weight: 500; color: #1e293b; }

/* Custom options */
.custom-section { margin-top: 0.5rem; }
.custom-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }
.custom-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
.custom-name { font-size: 0.85rem; font-weight: 500; color: #1e293b; }
.custom-delete { background: none; border: none; cursor: pointer; font-size: 0.9rem; padding: 0.2rem; opacity: 0.6; transition: opacity 0.2s; }
.custom-delete:hover { opacity: 1; }
.custom-empty { font-size: 0.8rem; color: #94a3b8; padding: 0.5rem 0; }
.custom-add { display: flex; gap: 0.5rem; }
.custom-input { flex: 1; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.85rem; }
.custom-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }
.btn-add { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-add:hover:not(:disabled) { background: #2563eb; }
.btn-add:disabled { background: #93c5fd; cursor: not-allowed; }
</style>