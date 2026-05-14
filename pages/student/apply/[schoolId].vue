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

        <!-- Section 1: Student Information -->
        <div class="form-section">
          <h2 class="section-title">👤 Student Information</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Full Name *</label>
              <input v-model="form.student.name" type="text" placeholder="Full name as on passport" required />
            </div>
            <div class="form-group">
              <label>Date of Birth *</label>
              <input v-model="form.student.dob" type="date" required />
            </div>
            <div class="form-group">
              <label>Gender *</label>
              <select v-model="form.student.gender" required>
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nationality *</label>
              <input v-model="form.student.nationality" type="text" placeholder="e.g. Chinese, British" required />
            </div>
            <div class="form-group">
              <label>First Language *</label>
              <input v-model="form.student.firstLanguage" type="text" placeholder="e.g. Mandarin, English" required />
            </div>
          </div>
        </div>

        <!-- Section 2: Academic Background -->
        <div class="form-section">
          <h2 class="section-title">📚 Academic Background</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Current School *</label>
              <input v-model="form.academic.currentSchool" type="text" placeholder="Name of current school" required />
            </div>
            <div class="form-group">
              <label>Year / Grade *</label>
              <input v-model="form.academic.yearGrade" type="text" placeholder="e.g. Year 10, Grade 9" required />
            </div>
            <div class="form-group full-width">
              <label>Academic Subjects</label>
              <textarea v-model="form.academic.subjects" placeholder="List your main subjects and grades" rows="3"></textarea>
            </div>
          </div>
        </div>

        <!-- Section 3: Documents -->
        <div class="form-section">
          <h2 class="section-title">📎 Documents</h2>
          <p class="section-desc">Please upload the following documents (PDF, JPG, PNG — max 5MB each)</p>
          <div class="upload-grid">
            <div class="upload-item">
              <label>Passport Copy *</label>
              <div class="upload-box">
                <span class="upload-icon">📄</span>
                <span>Click to upload or drag</span>
                <span class="upload-hint">PDF, JPG, PNG</span>
              </div>
            </div>
            <div class="upload-item">
              <label>School Reports (last 2 years)</label>
              <div class="upload-box">
                <span class="upload-icon">📊</span>
                <span>Click to upload or drag</span>
                <span class="upload-hint">PDF preferred</span>
              </div>
            </div>
            <div class="upload-item">
              <label>Recommendation Letter</label>
              <div class="upload-box">
                <span class="upload-icon">✉️</span>
                <span>Click to upload or drag</span>
                <span class="upload-hint">PDF preferred</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4: Additional Information -->
        <div class="form-section">
          <h2 class="section-title">✨ Additional Information</h2>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Hobbies & Interests</label>
              <textarea v-model="form.additional.hobbies" placeholder="List your hobbies and interests" rows="2"></textarea>
            </div>
            <div class="form-group full-width">
              <label>Extracurricular Activities</label>
              <textarea v-model="form.additional.activities" placeholder="Sports, clubs, volunteer work, etc." rows="2"></textarea>
            </div>
            <div class="form-group full-width">
              <label>Special Needs / Medical Conditions</label>
              <textarea v-model="form.additional.specialNeeds" placeholder="Please provide any relevant information" rows="2"></textarea>
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
      </div>
      <div class="container" style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
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
        "Selected School"
})

const form = ref({
  student: {
    name: '',
    dob: '',
    gender: '',
    nationality: '',
    firstLanguage: ''
  },
  academic: {
    currentSchool: '',
    yearGrade: '',
    subjects: ''
  },
  additional: {
    hobbies: '',
    activities: '',
    specialNeeds: ''
  },
  declared: false
})

const handleSubmit = () => {
  console.log('Application submitted:', form.value)
  alert(`Application submitted successfully!\n\nStudent: ${form.value.student.name}\nSchool: ${school.value.name}\n\nThis is a demo — no actual submission occurred.`)
}
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

.upload-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.upload-item label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
.upload-box { border: 2px dashed #d1d5db; border-radius: 0.5rem; padding: 1.5rem 1rem; text-align: center; cursor: pointer; transition: all 0.2s; }
.upload-box:hover { border-color: #3B82F6; background: #f8fafc; }
.upload-icon { display: block; font-size: 1.5rem; margin-bottom: 0.5rem; }
.upload-box span:not(.upload-icon):not(.upload-hint) { display: block; font-size: 0.8rem; color: #64748b; }
.upload-hint { display: block; font-size: 0.7rem !important; color: #94a3b8 !important; margin-top: 0.25rem; }

.declaration-box { background: #f8fafc; border-radius: 0.5rem; padding: 1.25rem; }
.checkbox-label { display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; font-size: 0.875rem; color: #374151; line-height: 1.5; }

.form-actions { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; }
.btn-primary { background: #3B82F6; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #1e40af; }
.btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
.btn-secondary { background: white; color: #374151; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: 1px solid #d1d5db; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; }
.btn-secondary:hover { background: #f9fafb; }

.footer { background: #1e293b; color: white; padding: 3rem 0 1rem; margin-top: auto; }
.footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
.footer h4 { margin-bottom: 1rem; }

@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
  .upload-grid { grid-template-columns: 1fr; }
  .nav-links { gap: 0.75rem; }
}
</style>
