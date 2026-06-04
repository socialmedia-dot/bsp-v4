<template>
  <div class="profile-page">
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
        <h1>👤 Student Profile</h1>
        <p>Manage your personal information and documents</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container main-content">

      <!-- Profile Card -->
      <div class="profile-card">
        <div class="profile-avatar">
          <span class="avatar-initials">{{ initials }}</span>
          <button class="avatar-edit-btn" @click="triggerAvatarUpload">📷</button>
        </div>
        <div class="profile-info">
          <h2>{{ profile.fullName || 'Not set' }}</h2>
          <p>{{ profile.email || 'Email not set' }}</p>
          <span class="profile-status" :class="profile.isComplete ? 'status-complete' : 'status-incomplete'">
            {{ profile.isComplete ? '✓ Profile Complete' : '⚠ Please complete your profile' }}
          </span>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="profile-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- Personal Information Tab -->
      <div v-if="activeTab === 'personal'" class="tab-content">
        <div class="form-section">
          <h3>Personal Information</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Full Name *</label>
              <input v-model="profile.fullName" type="text" placeholder="Enter your full name" />
            </div>
            <div class="form-group">
              <label>Date of Birth *</label>
              <input v-model="profile.dateOfBirth" type="date" />
            </div>
            <div class="form-group">
              <label>Gender</label>
              <select v-model="profile.gender">
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nationality *</label>
              <input v-model="profile.nationality" type="text" placeholder="e.g. Hong Kong SAR" />
            </div>
            <div class="form-group">
              <label>Passport Number</label>
              <input v-model="profile.passportNumber" type="text" placeholder="e.g. AB1234567" />
            </div>
            <div class="form-group">
              <label>Passport Expiry</label>
              <input v-model="profile.passportExpiry" type="date" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Contact Information</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Email Address *</label>
              <input v-model="profile.email" type="email" placeholder="your@email.com" />
            </div>
            <div class="form-group">
              <label>Phone Number *</label>
              <input v-model="profile.phone" type="tel" placeholder="+852 1234 5678" />
            </div>
            <div class="form-group full-width">
              <label>Current Address</label>
              <textarea v-model="profile.address" rows="2" placeholder="Enter your full address"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Guardian Information Tab -->
      <div v-if="activeTab === 'guardian'" class="tab-content">
        <div class="form-section">
          <h3>Primary Guardian</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Guardian Name *</label>
              <input v-model="profile.guardian.name" type="text" placeholder="Full name" />
            </div>
            <div class="form-group">
              <label>Relationship *</label>
              <select v-model="profile.guardian.relationship">
                <option value="">Select...</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Legal Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="profile.guardian.email" type="email" placeholder="guardian@email.com" />
            </div>
            <div class="form-group">
              <label>Phone Number *</label>
              <input v-model="profile.guardian.phone" type="tel" placeholder="+852 1234 5678" />
            </div>
            <div class="form-group full-width">
              <label>Address (if different from student)</label>
              <textarea v-model="profile.guardian.address" rows="2" placeholder="Enter address if different"></textarea>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Secondary Guardian (Optional)</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Name</label>
              <input v-model="profile.guardian2.name" type="text" placeholder="Full name" />
            </div>
            <div class="form-group">
              <label>Relationship</label>
              <select v-model="profile.guardian2.relationship">
                <option value="">Select...</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Legal Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="profile.guardian2.email" type="email" placeholder="guardian@email.com" />
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input v-model="profile.guardian2.phone" type="tel" placeholder="+852 1234 5678" />
            </div>
          </div>
        </div>
      </div>

      <!-- Documents Tab -->
      <div v-if="activeTab === 'documents'" class="tab-content">

        <!-- Required Documents -->
        <div class="form-section">
          <h3>Required Documents</h3>
          <p class="section-desc">Upload the following documents for your application</p>

          <div class="document-list">
            <div v-for="doc in requiredDocs" :key="doc.key" class="document-item">
              <div class="doc-info">
                <span class="doc-icon">{{ doc.icon }}</span>
                <div class="doc-details">
                  <span class="doc-name">{{ doc.name }}</span>
                  <span class="doc-status" :class="'status-' + (profile.documents[doc.key] ? 'uploaded' : 'pending')">
                    {{ profile.documents[doc.key] ? '✓ Uploaded' : '⏳ Pending' }}
                  </span>
                </div>
              </div>
              <div class="doc-action">
                <input
                  type="file"
                  :ref="el => docFiles[doc.key] = el"
                  @change="handleDocUpload(doc.key)"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style="display: none;"
                />
                <button
                  class="btn btn-sm"
                  :class="profile.documents[doc.key] ? 'btn-outline' : 'btn-primary'"
                  @click="triggerDocUpload(doc.key)"
                >
                  {{ profile.documents[doc.key] ? 'Replace' : 'Upload' }}
                </button>
                <button
                  v-if="profile.documents[doc.key]"
                  class="btn btn-sm btn-danger"
                  @click="removeDoc(doc.key)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Academic Transcripts (Multiple, Orderable) -->
        <div class="form-section">
          <div class="section-header">
            <div>
              <h3>Academic Transcripts</h3>
              <p class="section-desc">Upload all academic transcripts. Drag to reorder (most recent first).</p>
            </div>
            <button class="btn btn-primary btn-sm" @click="addTranscript">
              + Add Transcript
            </button>
          </div>

          <div v-if="profile.transcripts.length === 0" class="empty-docs">
            <span class="empty-icon">📜</span>
            <p>No transcripts uploaded yet. Click "Add Transcript" to upload your first one.</p>
          </div>

          <div v-else class="transcript-list">
            <div
              v-for="(transcript, index) in profile.transcripts"
              :key="transcript.id"
              class="transcript-item"
              :class="{ draggable: isDragging }"
              draggable="true"
              @dragstart="dragStartTranscript(index, $event)"
              @dragover.prevent="dragOverTranscript(index)"
              @dragend="dragEndTranscript"
            >
              <div class="transcript-drag-handle">⋮⋮</div>
              <div class="transcript-info">
                <div class="transcript-order">#{{ index + 1 }}</div>
                <div class="transcript-details">
                  <span class="transcript-label">{{ transcript.label || 'Transcript ' + (index + 1) }}</span>
                  <span class="transcript-date" v-if="transcript.date">{{ transcript.date }}</span>
                  <span class="transcript-file" v-if="transcript.file">{{ transcript.file.name }}</span>
                </div>
              </div>
              <div class="transcript-actions">
                <button class="btn btn-sm btn-outline" @click="editTranscript(transcript)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="removeTranscript(index)">Remove</button>
              </div>
            </div>
          </div>

          <!-- Add/Edit Transcript Modal -->
          <div v-if="showTranscriptModal" class="mini-modal-overlay" @click.self="closeTranscriptModal">
            <div class="mini-modal">
              <h4>{{ editingTranscript ? 'Edit Transcript' : 'Add Transcript' }}</h4>
              <div class="form-group">
                <label>Label (e.g. "Year 10 Final Exam", "Year 11 Mock")</label>
                <input v-model="transcriptForm.label" type="text" placeholder="Enter label" />
              </div>
              <div class="form-group">
                <label>Date / Period (e.g. "May 2024", "Academic Year 2023-24")</label>
                <input v-model="transcriptForm.date" type="text" placeholder="Enter date or period" />
              </div>
              <div class="form-group">
                <label>Upload File</label>
                <input
                  type="file"
                  ref="transcriptFileInput"
                  @change="handleTranscriptFileUpload"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <p v-if="transcriptForm.file" class="file-selected">✓ {{ transcriptForm.file.name }}</p>
              </div>
              <div class="modal-actions">
                <button class="btn btn-outline" @click="closeTranscriptModal">Cancel</button>
                <button class="btn btn-primary" @click="saveTranscript">Save</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Other Documents (Custom) -->
        <div class="form-section">
          <div class="section-header">
            <div>
              <h3>Other Documents</h3>
              <p class="section-desc">Add any additional documents you want to include with your application.</p>
            </div>
            <button class="btn btn-outline btn-sm" @click="addCustomDoc">
              + Add Document
            </button>
          </div>

          <div v-if="profile.customDocuments.length === 0" class="empty-docs">
            <span class="empty-icon">📎</span>
            <p>No additional documents added. Click "Add Document" to upload extras like awards, certificates, etc.</p>
          </div>

          <div v-else class="document-list">
            <div v-for="(doc, index) in profile.customDocuments" :key="doc.id" class="document-item custom-doc">
              <div class="doc-info">
                <span class="doc-icon">{{ doc.icon || '📄' }}</span>
                <div class="doc-details">
                  <span class="doc-name">{{ doc.name }}</span>
                  <span class="doc-status status-uploaded">✓ {{ doc.file?.name || 'Added' }}</span>
                </div>
              </div>
              <div class="doc-action">
                <button class="btn btn-sm btn-outline" @click="editCustomDoc(index)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="removeCustomDoc(index)">Remove</button>
              </div>
            </div>
          </div>

          <!-- Add/Edit Custom Document Modal -->
          <div v-if="showCustomDocModal" class="mini-modal-overlay" @click.self="closeCustomDocModal">
            <div class="mini-modal">
              <h4>{{ editingCustomDocIndex !== null ? 'Edit Document' : 'Add Document' }}</h4>
              <div class="form-group">
                <label>Document Name</label>
                <input v-model="customDocForm.name" type="text" placeholder="e.g. Music Award, Volunteer Certificate" />
              </div>
              <div class="form-group">
                <label>Icon</label>
                <select v-model="customDocForm.icon">
                  <option value="📄">📄 Document</option>
                  <option value="🏆">🏆 Award</option>
                  <option value="🎓">🎓 Certificate</option>
                  <option value="🎖️">🎖️ Achievement</option>
                  <option value="📋">📋 Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Upload File</label>
                <input
                  type="file"
                  ref="customDocFileInput"
                  @change="handleCustomDocFileUpload"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <p v-if="customDocForm.file" class="file-selected">✓ {{ customDocForm.file.name }}</p>
              </div>
              <div class="modal-actions">
                <button class="btn btn-outline" @click="closeCustomDocModal">Cancel</button>
                <button class="btn btn-primary" @click="saveCustomDoc">Save</button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Academic Tab -->
      <div v-if="activeTab === 'academic'" class="tab-content">
        <div class="form-section">
          <h3>Current/Previous School</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>School Name *</label>
              <input v-model="profile.academic.currentSchool" type="text" placeholder="Enter school name" />
            </div>
            <div class="form-group">
              <label>Grade/Year</label>
              <input v-model="profile.academic.currentGrade" type="text" placeholder="e.g. Year 10" />
            </div>
            <div class="form-group">
              <label>Language of Instruction</label>
              <input v-model="profile.academic.language" type="text" placeholder="e.g. English" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>English Proficiency</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>IELTS Score (if available)</label>
              <input v-model="profile.academic.ielts" type="text" placeholder="e.g. 6.5" />
            </div>
            <div class="form-group">
              <label>TOEFL Score (if available)</label>
              <input v-model="profile.academic.toefl" type="text" placeholder="e.g. 80" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Academic Interests</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Subjects of Interest</label>
              <textarea v-model="profile.academic.interests" rows="3" placeholder="e.g. Mathematics, Physics, Computer Science"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="save-section">
        <button class="btn btn-primary btn-lg" @click="saveProfile">
          💾 Save Profile
        </button>
        <p class="save-hint">Your profile is saved locally. Complete your profile before applying to schools.</p>
      </div>

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

    <!-- Toast Notification -->
    <div v-if="showToast" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>

definePageMeta({ layout: false })

const activeTab = ref('personal')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const docFiles = ref({})

const tabs = [
  { key: 'personal', label: 'Personal', icon: '👤' },
  { key: 'guardian', label: 'Guardian', icon: '👨‍👩‍👧' },
  { key: 'documents', label: 'Documents', icon: '📄' },
  { key: 'academic', label: 'Academic', icon: '📚' }
]

const requiredDocs = [
  { key: 'passport', name: 'Passport Copy', icon: '🛂' },
  { key: 'reference', name: 'Teacher Reference', icon: '✉️' },
  { key: 'englishCert', name: 'English Certificate (IELTS/TOEFL)', icon: '📋' }
]

const profile = reactive({
  fullName: '',
  dateOfBirth: '',
  gender: '',
  nationality: '',
  passportNumber: '',
  passportExpiry: '',
  email: '',
  phone: '',
  address: '',
  guardian: {
    name: '',
    relationship: '',
    email: '',
    phone: '',
    address: ''
  },
  guardian2: {
    name: '',
    relationship: '',
    email: '',
    phone: ''
  },
  documents: {
    passport: null,
    transcript: null,
    reference: null,
    englishCert: null
  },
  transcripts: [],
  customDocuments: [],
  academic: {
    currentSchool: '',
    currentGrade: '',
    language: '',
    ielts: '',
    toefl: '',
    interests: ''
  },
  isComplete: false
})

const initials = computed(() => {
  if (!profile.fullName) return '?'
  return profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

// Transcript management
const showTranscriptModal = ref(false)
const editingTranscript = ref(null)
const transcriptForm = reactive({ label: '', date: '', file: null })
const transcriptDragIndex = ref(-1)
const isDragging = ref(false)

// Custom document management
const showCustomDocModal = ref(false)
const editingCustomDocIndex = ref(null)
const customDocForm = reactive({ name: '', icon: '📄', file: null })

// Load profile from localStorage
onMounted(() => {
  const saved = localStorage.getItem('studentProfile')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      Object.assign(profile, parsed)
    } catch (e) {
      console.warn('Failed to parse saved profile')
    }
  }
})

// Transcript functions
function addTranscript() {
  editingTranscript.value = null
  transcriptForm.label = ''
  transcriptForm.date = ''
  transcriptForm.file = null
  showTranscriptModal.value = true
}

function editTranscript(transcript) {
  editingTranscript.value = transcript
  transcriptForm.label = transcript.label || ''
  transcriptForm.date = transcript.date || ''
  transcriptForm.file = transcript.file || null
  showTranscriptModal.value = true
}

function saveTranscript() {
  if (editingTranscript.value) {
    editingTranscript.value.label = transcriptForm.label
    editingTranscript.value.date = transcriptForm.date
    if (transcriptForm.file) {
      editingTranscript.value.file = transcriptForm.file
    }
  } else {
    profile.transcripts.push({
      id: Date.now(),
      label: transcriptForm.label,
      date: transcriptForm.date,
      file: transcriptForm.file
    })
  }
  showTranscriptModal.value = false
  showToastNotification('Transcript saved!', 'success')
}

function removeTranscript(index) {
  profile.transcripts.splice(index, 1)
  showToastNotification('Transcript removed', 'info')
}

function dragStartTranscript(index, event) {
  transcriptDragIndex.value = index
  isDragging.value = true
  event.dataTransfer.effectAllowed = 'move'
}

function dragOverTranscript(index) {
  if (transcriptDragIndex.value === -1 || transcriptDragIndex.value === index) return
  const items = [...profile.transcripts]
  const draggedItem = items.splice(transcriptDragIndex.value, 1)[0]
  items.splice(index, 0, draggedItem)
  profile.transcripts = items
  transcriptDragIndex.value = index
}

function dragEndTranscript() {
  transcriptDragIndex.value = -1
  isDragging.value = false
}

function handleTranscriptFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    transcriptForm.file = {
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString()
    }
  }
}

function closeTranscriptModal() {
  showTranscriptModal.value = false
}

// Custom document functions
function addCustomDoc() {
  editingCustomDocIndex.value = null
  customDocForm.name = ''
  customDocForm.icon = '📄'
  customDocForm.file = null
  showCustomDocModal.value = true
}

function editCustomDoc(index) {
  editingCustomDocIndex.value = index
  const doc = profile.customDocuments[index]
  customDocForm.name = doc.name || ''
  customDocForm.icon = doc.icon || '📄'
  customDocForm.file = doc.file || null
  showCustomDocModal.value = true
}

function saveCustomDoc() {
  if (!customDocForm.name.trim()) {
    showToastNotification('Please enter a document name', 'error')
    return
  }
  if (editingCustomDocIndex.value !== null) {
    profile.customDocuments[editingCustomDocIndex.value] = {
      id: profile.customDocuments[editingCustomDocIndex.value].id,
      name: customDocForm.name,
      icon: customDocForm.icon,
      file: customDocForm.file
    }
  } else {
    profile.customDocuments.push({
      id: Date.now(),
      name: customDocForm.name,
      icon: customDocForm.icon,
      file: customDocForm.file
    })
  }
  showCustomDocModal.value = false
  showToastNotification('Document saved!', 'success')
}

function removeCustomDoc(index) {
  profile.customDocuments.splice(index, 1)
  showToastNotification('Document removed', 'info')
}

function handleCustomDocFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    customDocForm.file = {
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString()
    }
  }
}

function closeCustomDocModal() {
  showCustomDocModal.value = false
}

function triggerAvatarUpload() {
  // For now, just show a toast
  showToastNotification('Profile photo upload coming soon', 'info')
}

function triggerDocUpload(key) {
  const input = docFiles.value[key]
  if (input) input.click()
}

function handleDocUpload(key) {
  const input = docFiles.value[key]
  if (input && input.files.length > 0) {
    const file = input.files[0]
    // Store file name for display
    profile.documents[key] = {
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString()
    }
    showToastNotification(`${requiredDocs.find(d => d.key === key)?.name} uploaded!`, 'success')
  }
}

function removeDoc(key) {
  profile.documents[key] = null
  const input = docFiles.value[key]
  if (input) input.value = ''
}

function showToastNotification(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

function checkProfileComplete() {
  const required = [
    profile.fullName,
    profile.dateOfBirth,
    profile.nationality,
    profile.email,
    profile.phone,
    profile.guardian.name,
    profile.guardian.relationship,
    profile.guardian.phone,
    profile.academic.currentSchool
  ]
  profile.isComplete = required.every(field => field && field.trim() !== '')
}

function saveProfile() {
  checkProfileComplete()
  try {
    localStorage.setItem('studentProfile', JSON.stringify(profile))
    showToastNotification('Profile saved successfully!', 'success')
  } catch (e) {
    showToastNotification('Failed to save profile', 'error')
  }
}
</script>

<style scoped>
.profile-page { min-height: 100vh; display: flex; flex-direction: column; }

/* Profile Card */
.profile-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  color: white;
}

.profile-avatar {
  position: relative;
  width: 80px;
  height: 80px;
}

.avatar-initials {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.profile-info h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
}

.profile-info p {
  margin: 0 0 0.5rem 0;
  opacity: 0.9;
}

.profile-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-complete { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.status-incomplete { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }

/* Tabs */
.profile-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
  overflow-x: auto;
}

.tab-btn {
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
  border-radius: 0.5rem 0.5rem 0 0;
  transition: all 0.2s;
}

.tab-btn:hover { background: #f1f5f9; }
.tab-btn.active {
  color: #3b82f6;
  border-bottom: 3px solid #3b82f6;
  margin-bottom: -2px;
}

/* Form Sections */
.tab-content { animation: fadeIn 0.3s ease; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-section {
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.form-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.section-desc {
  color: #64748b;
  margin: -0.5rem 0 1rem 0;
  font-size: 0.9rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group.full-width { grid-column: 1 / -1; }

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Document List */
.document-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.document-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.doc-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.doc-icon { font-size: 1.5rem; }

.doc-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.doc-name { font-weight: 600; color: #1e293b; }

.doc-status {
  font-size: 0.8rem;
  font-weight: 500;
}

.status-uploaded { color: #10b981; }
.status-pending { color: #f59e0b; }

.doc-action {
  display: flex;
  gap: 0.5rem;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.section-header h3 { margin: 0 0 0.25rem 0; }
.section-header .section-desc { margin: 0; }

/* Empty Docs */
.empty-docs {
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px dashed #e2e8f0;
}

.empty-docs .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
.empty-docs p { margin: 0; color: #64748b; font-size: 0.9rem; }

/* Transcript List */
.transcript-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.transcript-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.transcript-item.draggable {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.transcript-item:hover {
  border-color: #cbd5e1;
}

.transcript-drag-handle {
  cursor: grab;
  color: #94a3b8;
  font-size: 1rem;
  padding: 0.25rem;
  user-select: none;
}

.transcript-drag-handle:active { cursor: grabbing; }

.transcript-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.transcript-order {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.transcript-details {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.transcript-label { font-weight: 600; color: #1e293b; }
.transcript-date { font-size: 0.85rem; color: #64748b; }
.transcript-file { font-size: 0.8rem; color: #94a3b8; }

.transcript-actions {
  display: flex;
  gap: 0.5rem;
}

/* Mini Modal */
.mini-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.mini-modal {
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.mini-modal h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.mini-modal .form-group {
  margin-bottom: 1rem;
}

.mini-modal .form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.35rem;
}

.mini-modal .form-group input,
.mini-modal .form-group select {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.95rem;
}

.mini-modal .form-group input:focus,
.mini-modal .form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.mini-modal .form-group input[type="file"] {
  padding: 0.5rem;
  background: #f8fafc;
}

.file-selected {
  margin: 0.5rem 0 0 0;
  color: #10b981;
  font-size: 0.85rem;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.25rem;
}

/* Custom Doc */
.custom-doc {
  background: #fffbeb;
  border-color: #fef3c7;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.9rem;
}

.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
.btn-lg { padding: 0.75rem 1.5rem; font-size: 1rem; }

.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }
.btn-outline { background: transparent; border: 1px solid #3b82f6; color: #3b82f6; }
.btn-outline:hover { background: #eff6ff; }
.btn-danger { background: #ef4444; color: white; }
.btn-danger:hover { background: #dc2626; }

/* Save Section */
.save-section {
  text-align: center;
  padding: 2rem 0;
  border-top: 1px solid #e2e8f0;
  margin-top: 1rem;
}

.save-hint {
  color: #64748b;
  font-size: 0.85rem;
  margin-top: 0.75rem;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.875rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  color: white;
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

.toast.success { background: #10b981; }
.toast.error { background: #ef4444; }
.toast.info { background: #3b82f6; }

@keyframes slideUp {
  from { opacity: 0; transform: translateX(-50%) translateY(1rem); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* Page Header */
.page-header {
  background: linear-gradient(to right, #f8fafc, #fff);
  padding: 2rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.page-header h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
.page-header p { margin: 0.25rem 0 0 0; color: #64748b; }

/* Main Content */
.main-content { flex: 1; padding: 2rem 0; }

/* Navbar */
.navbar {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}

.logo-img { height: 50px; width: auto; border-radius: 4px; }

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-links .btn-primary {
  background: #3B82F6;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

/* Footer */
.footer {
  background: #1e293b;
  color: white;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  padding: 3rem 1rem;
}

.footer h4 { margin: 0 0 0.75rem 0; }
.footer p { color: rgba(255,255,255,0.7); margin: 0; }
.footer ul { list-style: none; padding: 0; margin: 0; }
.footer li { margin: 0.4rem 0; }
.footer a { color: rgba(255,255,255,0.7); text-decoration: none; }
.footer a:hover { color: white; }

.footer-bottom {
  text-align: center;
  padding: 1.5rem 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .profile-card { flex-direction: column; text-align: center; }
  .profile-tabs { gap: 0.25rem; }
  .tab-btn { padding: 0.5rem 0.75rem; font-size: 0.85rem; }
  .document-item { flex-direction: column; gap: 1rem; align-items: flex-start; }
  .doc-action { width: 100%; justify-content: flex-end; }
  .nav-links { gap: 1rem; }
}
</style>
