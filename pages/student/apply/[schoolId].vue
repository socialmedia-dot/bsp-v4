<template>
  <div class="apply-page">
    <!-- Header -->
    <header class="navbar">
      <div class="container navbar-content">
        <NuxtLink to="/" class="logo">
          <img src="/img/logo-bsp.jpg" alt="British School Portal Logo" class="logo-img">
        </NuxtLink>
        <nav>
          <ul class="nav-links">
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li><NuxtLink to="/schools">Schools</NuxtLink></li>
            <li><NuxtLink to="/student/applications">My Applications</NuxtLink></li>
            <li><NuxtLink to="/student/login" class="btn btn-primary">Logout</NuxtLink></li>
          </ul>
        </nav>
      </div>
    </header>

    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb">
          <NuxtLink to="/schools">Schools</NuxtLink>
          <span> / </span>
          <span>Apply to {{ school?.name || 'School' }}</span>
        </div>
        <h1>📋 School Application</h1>
        <p v-if="school">Apply to: <strong>{{ school.name }}</strong></p>
      </div>
    </div>

    <!-- Form -->
    <div class="container main-content">
      <form @submit.prevent="handleSubmit" class="apply-form">

        <!-- Section 1: Profile Summary -->
        <div class="form-section profile-summary">
          <h2 class="section-title">👤 Profile Information</h2>
          <p class="section-desc">The following information will be automatically submitted from your profile. Please <NuxtLink to="/student/profile" class="inline-link">update your profile</NuxtLink> if anything is incorrect.</p>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Name</span>
              <span class="summary-value">{{ profilePreview.fullName || 'Not set' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Date of Birth</span>
              <span class="summary-value">{{ profilePreview.dateOfBirth || 'Not set' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Gender</span>
              <span class="summary-value">{{ profilePreview.gender || 'Not set' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Nationality</span>
              <span class="summary-value">{{ profilePreview.nationality || 'Not set' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Passport</span>
              <span class="summary-value">{{ profilePreview.passportNumber || 'Not set' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Current School</span>
              <span class="summary-value">{{ profilePreview.currentSchool || 'Not set' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Current Grade</span>
              <span class="summary-value">{{ profilePreview.currentGrade || 'Not set' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">First Language</span>
              <span class="summary-value">{{ profilePreview.firstLanguage || 'Not set' }}</span>
            </div>
          </div>
        </div>

        <!-- Section 2: Entry Preferences -->
        <div class="form-section">
          <h2 class="section-title">🎓 Entry Preferences</h2>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Entry Year / Type *</label>
              <div v-if="availableEntryOptions.length" class="radio-group">
                <label
                  v-for="opt in availableEntryOptions"
                  :key="opt.value"
                  class="radio-option"
                  :class="{ active: form.entry.entryOption === opt.value }"
                >
                  <input
                    type="radio"
                    v-model="form.entry.entryOption"
                    :value="opt.value"
                    required
                  />
                  <span class="radio-dot"></span>
                  <span class="radio-label">{{ opt.label }}</span>
                </label>
              </div>
              <div v-else class="no-options">
                No entry options currently available for this school.
              </div>
            </div>

            <div class="form-group full-width">
              <label>Grade Applying For *</label>
              <div v-if="school.openGrades?.length" class="radio-group">
                <label
                  v-for="grade in school.openGrades"
                  :key="grade"
                  class="radio-option"
                  :class="{ active: form.entry.grade === grade }"
                >
                  <input
                    type="radio"
                    v-model="form.entry.grade"
                    :value="grade"
                    required
                  />
                  <span class="radio-dot"></span>
                  <span class="radio-label">{{ grade }}</span>
                </label>
              </div>
              <div v-else class="no-options">
                No grades currently open for this school.
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: School-Specific Questions -->
        <div class="form-section">
          <h2 class="section-title">🏫 School-Specific Information</h2>
          <p class="section-desc">This helps the school understand your specific needs.</p>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Do you require a student visa to study in the UK? *</label>
              <div class="radio-group">
                <label class="radio-option" :class="{ active: form.schoolSpecific.visaRequired === true }">
                  <input type="radio" v-model="form.schoolSpecific.visaRequired" :value="true" required />
                  <span class="radio-dot"></span>
                  <span class="radio-label">Yes, I need a student visa</span>
                </label>
                <label class="radio-option" :class="{ active: form.schoolSpecific.visaRequired === false }">
                  <input type="radio" v-model="form.schoolSpecific.visaRequired" :value="false" required />
                  <span class="radio-dot"></span>
                  <span class="radio-label">No, I do not need a visa</span>
                </label>
              </div>
            </div>

            <div class="form-group full-width">
              <label>Are you interested in boarding? *</label>
              <div class="radio-group">
                <label class="radio-option" :class="{ active: form.schoolSpecific.boarding === 'full' }">
                  <input type="radio" v-model="form.schoolSpecific.boarding" value="full" required />
                  <span class="radio-dot"></span>
                  <span class="radio-label">Full Boarding</span>
                </label>
                <label class="radio-option" :class="{ active: form.schoolSpecific.boarding === 'weekly' }">
                  <input type="radio" v-model="form.schoolSpecific.boarding" value="weekly" required />
                  <span class="radio-dot"></span>
                  <span class="radio-label">Weekly Boarding</span>
                </label>
                <label class="radio-option" :class="{ active: form.schoolSpecific.boarding === 'day' }">
                  <input type="radio" v-model="form.schoolSpecific.boarding" value="day" required />
                  <span class="radio-dot"></span>
                  <span class="radio-label">Day Student</span>
                </label>
                <label class="radio-option" :class="{ active: form.schoolSpecific.boarding === 'flexi' }">
                  <input type="radio" v-model="form.schoolSpecific.boarding" value="flexi" required />
                  <span class="radio-dot"></span>
                  <span class="radio-label">Flexible Boarding</span>
                </label>
              </div>
            </div>

            <div class="form-group full-width">
              <label>Any additional information for the school?</label>
              <textarea v-model="form.schoolSpecific.additionalInfo" placeholder="e.g. SEN requirements, dietary needs, sibling already at school..." rows="3"></textarea>
            </div>
          </div>
        </div>

        <!-- Section 4: Documents -->
        <div class="form-section">
          <h2 class="section-title">📎 Documents</h2>
          <p class="section-desc">Please upload the following documents (PDF, JPG, PNG — max 5MB each). You can select multiple files at once.</p>

          <div v-for="doc in documents" :key="doc.id" class="doc-category">
            <div class="doc-label">{{ doc.label }} {{ doc.required ? '*' : '' }}</div>
            <div
              class="upload-area-multiple"
              @click="triggerFileInput(doc.id)"
              @dragover.prevent
              @drop.prevent="handleDrop($event, doc.id)"
            >
              <input
                :ref="el => setFileInputRef(el, doc.id)"
                type="file"
                multiple
                @change="handleFiles($event, doc.id)"
                accept=".pdf,.jpg,.jpeg,.png"
                style="display: none;"
              />
              <span class="upload-icon-big">📤</span>
              <span class="upload-text">Click or drag files here to upload</span>
              <span class="upload-hint">PDF, JPG, PNG · Max 5MB each</span>
            </div>

            <!-- Uploaded File List -->
            <div v-if="doc.files.length > 0" class="file-list">
              <div
                v-for="(file, index) in doc.files"
                :key="file.id"
                class="file-item"
              >
                <span class="file-icon">{{ getFileIcon(file.type) }}</span>
                <div class="file-info">
                  <span
                    v-if="!file.editing"
                    class="file-name"
                    @click="startRename(doc.id, index)"
                    title="Click to rename"
                  >{{ file.name }}</span>
                  <input
                    v-else
                    v-model="file.tempName"
                    @blur="finishRename(doc.id, index)"
                    @keyup.enter="finishRename(doc.id, index)"
                    class="file-rename-input"
                    type="text"
                  />
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                </div>
                <div class="file-actions">
                  <button
                    type="button"
                    class="file-btn"
                    @click="moveFile(doc.id, index, -1)"
                    :disabled="index === 0"
                    title="Move up"
                  >⬆️</button>
                  <button
                    type="button"
                    class="file-btn"
                    @click="moveFile(doc.id, index, 1)"
                    :disabled="index === doc.files.length - 1"
                    title="Move down"
                  >⬇️</button>
                  <button
                    type="button"
                    class="file-btn"
                    @click="startRename(doc.id, index)"
                    title="Rename"
                  >✏️</button>
                  <button
                    type="button"
                    class="file-btn delete"
                    @click="removeFile(doc.id, index)"
                    title="Delete"
                  >🗑️</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 5: Declaration -->
        <div class="form-section">
          <h2 class="section-title">✅ Declaration</h2>
          <div class="declaration-box">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.declared" required />
              <span>I confirm that all information provided is accurate and complete. I understand that providing false information may result in my application being rejected or my offer being withdrawn.</span>
            </label>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <NuxtLink to="/schools" class="btn btn-secondary">← Back to Schools</NuxtLink>
          <button type="submit" class="btn btn-primary" :disabled="!form.declared">
            Submit Application
          </button>
        </div>

      </form>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer-content">
        <div>
          <h4>British School Portal</h4>
          <p>Helping families find the right UK school since 2024.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><NuxtLink to="/schools">Find Schools</NuxtLink></li>
            <li><NuxtLink to="/student/login">Student Login</NuxtLink></li>
            <li><NuxtLink to="/student/register">Register</NuxtLink></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>Email: info@britishschoolportal.co.uk</li>
          </ul>
        </div>
      </div>
      <div class="container footer-bottom">
        <p>&copy; 2024 British School Portal. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>

definePageMeta({ layout: false })

const route = useRoute()
const schoolId = route.params.schoolId

const school = ref({
  id: schoolId,
  name: schoolId === '1' ? "St. Mary's College" :
        schoolId === '2' ? "Kingsfield School" :
        schoolId === '3' ? "Greenwich Academy" :
        schoolId === '4' ? "Edinburgh International School" :
        schoolId === '5' ? "Cardiff Grammar School" :
        schoolId === '6' ? "Brighton Prep School" :
        "Selected School",
  entrySettings: {
    allowInYear: true,
    allowCurrentYearSept: true,
    allowNextYearSept: true,
    allowYearAfterSept: true,
    customOptions: [
      { name: 'Summer School 2026' }
    ]
  },
  openGrades: ['Year 10', 'Year 11', 'Year 12', 'Year 13']
})

const form = ref({
  entry: {
    entryOption: '',
    grade: ''
  },
  schoolSpecific: {
    visaRequired: null,
    boarding: '',
    additionalInfo: ''
  },
  declared: false
})

// Profile preview data (in real app, fetch from API / localStorage)
const profilePreview = ref({
  fullName: 'Alex Chen',
  dateOfBirth: '2008-03-15',
  gender: 'Male',
  nationality: 'Hong Kong SAR',
  passportNumber: 'K123456(7)',
  currentSchool: 'Queen\'s College Hong Kong',
  currentGrade: 'Year 10',
  firstLanguage: 'Cantonese'
})

const fileInputRefs = ref({})
const setFileInputRef = (el, id) => { if (el) fileInputRefs.value[id] = el }

const documents = ref([
  { id: 'passport', label: 'Passport Copy', required: true, files: [] },
  { id: 'school-reports', label: 'School Reports (last 2 years)', required: false, files: [] },
  { id: 'recommendation', label: 'Recommendation Letter', required: false, files: [] }
])

const triggerFileInput = (docId) => {
  fileInputRefs.value[docId]?.click()
}

const handleFiles = (event, docId) => {
  const files = Array.from(event.target.files)
  addFiles(docId, files)
  event.target.value = ''
}

const handleDrop = (event, docId) => {
  const files = Array.from(event.dataTransfer.files)
  addFiles(docId, files)
}

const addFiles = (docId, files) => {
  const doc = documents.value.find(d => d.id === docId)
  if (!doc) return
  files.forEach(file => {
    doc.files.push({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      tempName: file.name,
      size: file.size,
      type: file.type,
      file: file,
      editing: false
    })
  })
}

const removeFile = (docId, index) => {
  const doc = documents.value.find(d => d.id === docId)
  if (doc) doc.files.splice(index, 1)
}

const moveFile = (docId, index, direction) => {
  const doc = documents.value.find(d => d.id === docId)
  if (!doc) return
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= doc.files.length) return
  const temp = doc.files[index]
  doc.files[index] = doc.files[newIndex]
  doc.files[newIndex] = temp
}

const startRename = (docId, index) => {
  const doc = documents.value.find(d => d.id === docId)
  if (!doc) return
  doc.files[index].editing = true
  doc.files[index].tempName = doc.files[index].name
}

const finishRename = (docId, index) => {
  const doc = documents.value.find(d => d.id === docId)
  if (!doc) return
  if (doc.files[index].tempName.trim()) {
    doc.files[index].name = doc.files[index].tempName.trim()
  }
  doc.files[index].editing = false
}

const getFileIcon = (type) => {
  if (type.includes('pdf')) return '📄'
  if (type.includes('image')) return '🖼️'
  return '📎'
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const handleSubmit = () => {
  console.log('Application submitted:', form.value)
  console.log('Profile:', profilePreview.value)
  console.log('Documents:', documents.value)
  const totalFiles = documents.value.reduce((sum, d) => sum + d.files.length, 0)
  alert(`Application submitted successfully!\n\nSchool: ${school.value.name}\nEntry: ${form.value.entry.entryOption || 'Not selected'}\nGrade: ${form.value.entry.grade || 'Not selected'}\nVisa required: ${form.value.schoolSpecific.visaRequired === true ? 'Yes' : form.value.schoolSpecific.visaRequired === false ? 'No' : 'Not selected'}\nBoarding: ${form.value.schoolSpecific.boarding || 'Not selected'}\nDocuments uploaded: ${totalFiles} file(s)\n\nThis is a demo — no actual submission occurred.`)
}

// Entry options based on school settings + current date
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

// 下一個9月入學年份：如果而家過咗9月，下個入學年份係明年
const nextSeptYear = currentMonth >= 9 ? currentYear + 1 : currentYear

const availableEntryOptions = computed(() => {
  const opts = []
  const s = school.value.entrySettings || {}
  if (s.allowInYear) opts.push({ value: `${currentYear}-in-year`, label: 'In-year Admission' })
  if (s.allowCurrentYearSept) opts.push({ value: `${nextSeptYear}-09`, label: `September ${nextSeptYear}` })
  if (s.allowNextYearSept) opts.push({ value: `${nextSeptYear + 1}-09`, label: `September ${nextSeptYear + 1}` })
  if (s.allowYearAfterSept) opts.push({ value: `${nextSeptYear + 2}-09`, label: `September ${nextSeptYear + 2}` })
  // Custom options
  if (s.customOptions?.length) {
    s.customOptions.forEach((opt, i) => {
      opts.push({ value: `custom-${i}`, label: opt.name })
    })
  }
  return opts
})
</script>

<style scoped>
.apply-page { min-height: 100vh; display: flex; flex-direction: column; }

.navbar { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.navbar-content { display: flex; align-items: center; justify-content: space-between; padding-top: 0.8rem; padding-bottom: 0.8rem; }
.logo { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; }
.logo-img { height: 50px; width: auto; border-radius: 4px; }
.nav-links { display: flex; list-style: none; gap: 2rem; margin: 0; padding: 0; }
.nav-links a { text-decoration: none; color: #374151; font-weight: 500; }
.nav-links .btn-primary { background: #3B82F6; color: white; padding: 0.5rem 1.25rem; border-radius: 0.5rem; }

.page-header { background: linear-gradient(135deg, #3B82F6 0%, #1e40af 100%); color: white; padding: 2rem 0; }
.page-header .breadcrumb { font-size: 0.875rem; opacity: 0.8; margin-bottom: 0.5rem; }
.page-header .breadcrumb a { color: white; text-decoration: none; }
.page-header .breadcrumb a:hover { text-decoration: underline; }
.page-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }

.main-content { padding: 2rem 0; flex: 1; max-width: 800px; margin: 0 auto; width: 100%; }

.apply-form { display: flex; flex-direction: column; gap: 2rem; }

.form-section { background: white; border-radius: 0.75rem; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.section-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; }
.section-desc { font-size: 0.875rem; color: #64748b; margin-bottom: 1.25rem; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
.form-group input, .form-group select, .form-group textarea { padding: 0.65rem 0.85rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9rem; transition: all 0.2s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.form-group textarea { resize: vertical; }

/* Profile Summary */
.profile-summary { background: #f8fafc; border: 1px solid #e2e8f0; }
.inline-link { color: #3b82f6; font-weight: 600; text-decoration: none; }
.inline-link:hover { text-decoration: underline; }
.summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem 1.5rem; }
@media (max-width: 768px) { .summary-grid { grid-template-columns: 1fr; } }
.summary-item { display: flex; flex-direction: column; gap: 2px; }
.summary-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.03em; }
.summary-value { font-size: 0.9rem; font-weight: 500; color: #1e293b; }

/* Radio group */
.radio-group { display: flex; flex-direction: column; gap: 0.6rem; }
.radio-option { display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem 0.85rem; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: #fff; }
.radio-option:hover { border-color: #cbd5e1; background: #f8fafc; }
.radio-option.active { border-color: #3b82f6; background: #eff6ff; }
.radio-option input { display: none; }
.radio-dot { width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
.radio-option.active .radio-dot { border-color: #3b82f6; background: #3b82f6; }
.radio-dot::after { content: ''; width: 6px; height: 6px; background: white; border-radius: 50%; opacity: 0; transition: opacity 0.2s; }
.radio-option.active .radio-dot::after { opacity: 1; }
.radio-label { font-size: 0.85rem; font-weight: 500; color: #374151; }
.no-options { font-size: 0.85rem; color: #94a3b8; padding: 1rem; background: #f8fafc; border-radius: 8px; text-align: center; }

.upload-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.upload-item label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
.upload-box { border: 2px dashed #d1d5db; border-radius: 0.5rem; padding: 1.5rem 1rem; text-align: center; cursor: pointer; transition: all 0.2s; }
.upload-box:hover { border-color: #3B82F6; background: #f8fafc; }
.upload-icon { display: block; font-size: 1.5rem; margin-bottom: 0.5rem; }
.upload-box span:not(.upload-icon):not(.upload-hint) { display: block; font-size: 0.8rem; color: #64748b; }
.upload-hint { display: block; font-size: 0.7rem !important; color: #94a3b8 !important; margin-top: 0.25rem; }

/* Document Upload */
.doc-category { margin-bottom: 2rem; }
.doc-category:last-child { margin-bottom: 0; }
.doc-label { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }

.upload-area-multiple {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 2rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}
.upload-area-multiple:hover {
  border-color: #3B82F6;
  background: #f0f7ff;
}
.upload-icon-big { display: block; font-size: 2rem; margin-bottom: 0.5rem; }
.upload-text { display: block; font-size: 0.9rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem; }

.file-list { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: background 0.15s;
}
.file-item:hover { background: #f1f5f9; }
.file-icon { font-size: 1.25rem; flex-shrink: 0; }
.file-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }
.file-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-name:hover { color: #3B82F6; text-decoration: underline; }
.file-size { font-size: 0.75rem; color: #94a3b8; }
.file-rename-input {
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #3B82F6;
  border-radius: 0.35rem;
  outline: none;
  width: 100%;
  max-width: 300px;
}
.file-actions { display: flex; gap: 0.25rem; flex-shrink: 0; }
.file-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.35rem;
  padding: 0.35rem 0.45rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1;
}
.file-btn:hover:not(:disabled) { background: #f1f5f9; border-color: #cbd5e1; }
.file-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.file-btn.delete:hover:not(:disabled) { background: #fef2f2; border-color: #fecaca; }

.declaration-box { background: #f8fafc; border-radius: 0.5rem; padding: 1.25rem; }
.checkbox-label { display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; font-size: 0.875rem; color: #374151; line-height: 1.5; }

/* Radio group */
.radio-group { display: flex; flex-direction: column; gap: 0.6rem; }
.radio-option { display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1rem; border: 2px solid #e2e8f0; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; background: #fff; }
.radio-option:hover { border-color: #cbd5e1; background: #f8fafc; }
.radio-option.active { border-color: #3B82F6; background: #eff6ff; }
.radio-option input { display: none; }
.radio-dot { width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
.radio-option.active .radio-dot { border-color: #3B82F6; background: #3B82F6; }
.radio-dot::after { content: ''; width: 6px; height: 6px; background: white; border-radius: 50%; opacity: 0; transition: opacity 0.2s; }
.radio-option.active .radio-dot::after { opacity: 1; }
.radio-label { font-size: 0.9rem; font-weight: 500; color: #1e293b; }
.no-options { font-size: 0.85rem; color: #94a3b8; padding: 0.75rem 0; }

.form-actions { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; }
.btn-primary { background: #3B82F6; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #1e40af; }
.btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
.btn-secondary { background: white; color: #374151; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: 1px solid #d1d5db; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; }
.btn-secondary:hover { background: #f9fafb; }

.footer { background: #1e293b; color: white; padding: 3rem 0 1rem; margin-top: auto; }
.footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
.footer h4 { margin-bottom: 1rem; }
.footer-bottom { text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem; color: #94a3b8; }

@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
  .upload-grid { grid-template-columns: 1fr; }
  .nav-links { gap: 0.75rem; }
}
</style>
