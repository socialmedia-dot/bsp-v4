<template>
  <div class="auth-container">
    <div class="auth-box">
      <NuxtLink to="/" style="display: block; text-align: center; margin-bottom: 1.5rem;">
        <span style="font-size: 2rem;">🇬🇧</span>
        <h1 style="font-size: 1.5rem; margin-top: 0.5rem;">British School Portal</h1>
      </NuxtLink>

      <p style="text-align: center; margin-bottom: 1.5rem; color: #64748b; font-size: 0.9rem;">
        Join thousands of families and schools connecting through BSP
      </p>

      <!-- Step Progress (hidden for Personal/student) -->
      <div v-if="activeRole !== 'student'" style="display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 2rem;">
        <div v-for="(stepLabel, idx) in steps" :key="idx" style="display: flex; align-items: center;">
          <div :style="'width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; transition: all 0.3s; ' +
            (currentStep > idx ? 'background: var(--bsp-success); color: white;' : currentStep === idx + 1 ? 'background: var(--bsp-primary); color: white;' : 'background: #e2e8f0; color: #94a3b8;')">
            <span v-if="currentStep > idx">✓</span>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <span v-if="idx < steps.length - 1" :style="'width: 2rem; height: 2px; background: ' + (currentStep > idx + 1 ? 'var(--bsp-success)' : '#e2e8f0') + '; display: block;'"></span>
        </div>
      </div>

      <div v-if="activeRole !== 'student'" style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <span v-for="(stepLabel, idx) in steps" :key="idx"
          :style="'font-size: 0.7rem; font-weight: 600; color: ' + (currentStep === idx + 1 ? 'var(--bsp-primary)' : currentStep > idx ? 'var(--bsp-success)' : '#cbd5e1') + '; text-align: center;'">
          {{ stepLabel }}
        </span>
      </div>

      <!-- Role Tabs -->
      <div class="auth-tabs" style="margin-bottom: 1.5rem;">
        <button
          v-for="role in roles"
          :key="role.value"
          @click="switchRole(role.value)"
          :class="['auth-tab', { active: activeRole === role.value }]"
        >
          {{ role.icon }} {{ role.label }}
        </button>
      </div>

      <!-- Step 1: Account Details -->
      <div v-if="currentStep === 1">
        <form @submit.prevent="nextStep" class="auth-form">
          <div class="form-group">
            <label>👤 Full Name <span style="color: #ef4444;">*</span></label>
            <input v-model="form.name" type="text" placeholder="e.g. Sarah Chen" required />
          </div>
          <div class="form-group">
            <label>📧 Email Address <span style="color: #ef4444;">*</span></label>
            <input v-model="form.email" type="email" placeholder="e.g. sarah@example.com" required />
          </div>
          <div class="form-group">
            <label>🔒 Password <span style="color: #ef4444;">*</span></label>
            <input v-model="form.password" type="password" placeholder="Min. 8 characters" minlength="8" required />
            <p v-if="form.password && form.password.length < 8" style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">Password must be at least 8 characters</p>
          </div>
          <div class="form-group">
            <label>🔒 Confirm Password <span style="color: #ef4444;">*</span></label>
            <input v-model="form.confirmPassword" type="password" placeholder="Repeat your password" required />
            <p v-if="form.confirmPassword && form.password !== form.confirmPassword" style="color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;">Passwords do not match</p>
          </div>

          <!-- Role-specific fields in Step 1 -->
          <div v-if="activeRole === 'school'" class="form-group">
            <label>🏫 School Name</label>
            <input v-model="form.schoolName" type="text" placeholder="e.g. Westminster School" />
          </div>
          <div v-if="activeRole === 'school'" class="form-group">
            <label>💼 Your Role</label>
            <input v-model="form.schoolRole" type="text" placeholder="e.g. Admissions Officer" />
          </div>
          <div v-if="activeRole === 'consultant' || activeRole === 'business'" class="form-group">
            <label>🏢 Company / Organisation</label>
            <input v-model="form.company" type="text" placeholder="e.g. EduConnect Ltd." />
          </div>
          <div v-if="activeRole === 'consultant' || activeRole === 'business'" class="form-group">
            <label>💼 Your Role</label>
            <input v-model="form.role" type="text" placeholder="e.g. Senior Education Consultant" />
          </div>

          <!-- Personal: terms + Create Account -->
          <template v-if="activeRole === 'student'">
            <label style="display: flex; align-items: flex-start; gap: 0.5rem; margin: 1.25rem 0 1rem; cursor: pointer; font-size: 0.85rem; color: #374151;">
              <input type="checkbox" v-model="form.terms" required style="margin-top: 0.2rem; width: 1rem; height: 1rem; cursor: pointer;" />
              <span>I agree to the <NuxtLink to="/terms" target="_blank" style="color: var(--bsp-primary);">Terms of Service</NuxtLink> and <NuxtLink to="/privacy" target="_blank" style="color: var(--bsp-primary);">Privacy Policy</NuxtLink></span>
            </label>
            <button type="button" @click="handleRegister" class="btn btn-primary" style="width: 100%;" :disabled="!isStep1Valid || !form.terms">
              🏁 Create Account
            </button>
          </template>

          <!-- Others: continue to Step 2 -->
          <button v-else type="submit" class="btn btn-primary" style="width: 100%;" :disabled="!isStep1Valid">
            Continue → Step 2: Identity Verification
          </button>
        </form>
      </div>

      <!-- Step 2: Document Upload (for School / Consultant / Business) -->
      <div v-if="currentStep === 2 && activeRole !== 'student'">
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 1rem; border-radius: 0.75rem; margin-bottom: 1.5rem;">
          <p style="font-weight: 600; color: #0369a1; margin: 0 0 0.5rem; font-size: 0.875rem;">🔒 Why do we need this?</p>
          <p style="color: #0c4a6e; margin: 0; font-size: 0.8rem; line-height: 1.5;">
            We verify the identity of schools, consultants, and businesses to maintain trust and safety on our platform. Your document is encrypted and stored securely.
          </p>
        </div>

        <div v-if="activeRole === 'school'" class="upload-area" @click="$refs.schoolFile.click()" @dragover.prevent @drop.prevent="handleSchoolDrop">
          <input type="file" ref="schoolFile" @change="handleSchoolFile" accept=".pdf,.jpg,.jpeg,.png" style="display: none;" />
          <div v-if="!form.schoolFile">
            <p style="font-size: 2rem; margin: 0 0 0.5rem;">📄</p>
            <p style="font-weight: 600; color: #374151; margin: 0 0 0.25rem;">Upload Staff Card or School ID</p>
            <p style="color: #6b7280; margin: 0; font-size: 0.8rem;">PDF, JPG, or PNG · Max 10MB</p>
          </div>
          <div v-else>
            <p style="font-size: 2rem; margin: 0 0 0.5rem;">✅</p>
            <p style="font-weight: 600; color: var(--bsp-success); margin: 0 0 0.25rem;">{{ form.schoolFile.name }}</p>
            <p style="color: #6b7280; margin: 0; font-size: 0.8rem;">Click to change file</p>
          </div>
        </div>

        <div v-if="activeRole === 'consultant' || activeRole === 'business'" class="upload-area" @click="$refs.consultantFile.click()">
          <input type="file" ref="consultantFile" @change="handleConsultantFile" accept=".pdf,.jpg,.jpeg,.png" style="display: none;" />
          <div v-if="!form.consultantFile">
            <p style="font-size: 2rem; margin: 0 0 0.5rem;">📄</p>
            <p style="font-weight: 600; color: #374151; margin: 0 0 0.25rem;">Upload Name Card or Staff Card</p>
            <p style="color: #6b7280; margin: 0; font-size: 0.8rem;">PDF, JPG, or PNG · Max 10MB</p>
          </div>
          <div v-else>
            <p style="font-size: 2rem; margin: 0 0 0.5rem;">✅</p>
            <p style="font-weight: 600; color: var(--bsp-success); margin: 0 0 0.25rem;">{{ form.consultantFile.name }}</p>
            <p style="color: #6b7280; margin: 0; font-size: 0.8rem;">Click to change file</p>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button @click="currentStep = 1" class="btn btn-secondary" style="flex: 1;">
            ← Back
          </button>
          <button @click="nextStep" class="btn btn-primary" style="flex: 2;">
            Continue → Step 3: Review
          </button>
        </div>
      </div>

      <!-- Step 3: Review & Confirm -->
      <div v-if="currentStep === 3">
        <div style="background: #f8fafc; padding: 1.25rem; border-radius: 0.75rem; margin-bottom: 1.5rem; border: 1px solid #e2e8f0;">
          <h4 style="margin: 0 0 1rem; color: #1e293b; font-size: 0.9rem;">📋 Registration Summary</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div>
              <p style="color: #64748b; font-size: 0.75rem; margin: 0;">Account Type</p>
              <p style="font-weight: 600; color: #1e293b; font-size: 0.85rem; margin: 0.2rem 0 0;">{{ currentRoleLabel }}</p>
            </div>
            <div>
              <p style="color: #64748b; font-size: 0.75rem; margin: 0;">Full Name</p>
              <p style="font-weight: 600; color: #1e293b; font-size: 0.85rem; margin: 0.2rem 0 0;">{{ form.name }}</p>
            </div>
            <div style="grid-column: 1 / -1;">
              <p style="color: #64748b; font-size: 0.75rem; margin: 0;">Email</p>
              <p style="font-weight: 600; color: #1e293b; font-size: 0.85rem; margin: 0.2rem 0 0;">{{ form.email }}</p>
            </div>
            <div v-if="form.schoolName" style="grid-column: 1 / -1;">
              <p style="color: #64748b; font-size: 0.75rem; margin: 0;">School / Company</p>
              <p style="font-weight: 600; color: #1e293b; font-size: 0.85rem; margin: 0.2rem 0 0;">{{ form.schoolName || form.company }}</p>
            </div>
            <div v-if="form.schoolRole || form.role" style="grid-column: 1 / -1;">
              <p style="color: #64748b; font-size: 0.75rem; margin: 0;">Role</p>
              <p style="font-weight: 600; color: #1e293b; font-size: 0.85rem; margin: 0.2rem 0 0;">{{ form.schoolRole || form.role }}</p>
            </div>
          </div>
        </div>

        <!-- What happens after registration (for non-Personal roles) -->
        <div v-if="activeRole !== 'student'" style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 1.25rem; border-radius: 0.75rem; margin-bottom: 1.5rem;">
          <h4 style="margin: 0 0 0.75rem; color: #1d4ed8; font-size: 0.875rem;">✨ What happens next?</h4>
          <ul style="margin: 0; padding-left: 1.2rem; color: #1e40af; font-size: 0.8rem; line-height: 1.8;">
            <li>Our team will review your application within <strong>1–2 business days</strong></li>
            <li>Once approved, you will receive an <strong>email notification</strong></li>
            <li>Return to this portal to <strong>pay the annual fee</strong> and activate your account</li>
            <li v-if="activeRole === 'school'">Set up your school profile and start receiving applications</li>
            <li v-if="activeRole === 'consultant'">Access the consultant dashboard and manage student applications</li>
            <li v-if="activeRole === 'business'">Access corporate partnership tools and bulk placement services</li>
          </ul>
        </div>

        <label style="display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 1.5rem; cursor: pointer; font-size: 0.85rem; color: #374151;">
          <input type="checkbox" v-model="form.terms" required style="margin-top: 0.2rem; width: 1rem; height: 1rem; cursor: pointer;" />
          <span>I agree to the <NuxtLink to="/terms" target="_blank" style="color: var(--bsp-primary);">Terms of Service</NuxtLink> and <NuxtLink to="/privacy" target="_blank" style="color: var(--bsp-primary);">Privacy Policy</NuxtLink></span>
        </label>

        <div style="display: flex; gap: 1rem;">
          <button @click="currentStep = activeRole === 'student' ? 1 : 2" class="btn btn-secondary" style="flex: 1;">
            ← Back
          </button>
          <button @click="handleRegister" class="btn btn-primary" style="flex: 2;" :disabled="!form.terms">
            🏁 Create Account
          </button>
        </div>
      </div>

      <!-- Success State: Personal -->
      <div v-if="currentStep === 4 && activeRole === 'student'" style="text-align: center;">
        <div style="width: 5rem; height: 5rem; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2.5rem;">
          🎉
        </div>
        <h3 style="color: #15803d; margin: 0 0 0.75rem;">Account Created!</h3>
        <p style="color: #64748b; font-size: 0.9rem; margin: 0 0 1.5rem;">
          Welcome to BSP, <strong>{{ form.name }}</strong>!<br/>
          A verification email has been sent to <strong>{{ form.email }}</strong>.
        </p>
        <NuxtLink to="/login" class="btn btn-primary" style="display: block; text-decoration: none; text-align: center;">
          Login Now →
        </NuxtLink>
      </div>

      <!-- Pending Approval State: School / Consultant / Business -->
      <div v-if="currentStep === 4 && activeRole !== 'student'" style="text-align: center;">
        <div style="width: 5rem; height: 5rem; background: #fef9c3; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2.5rem;">
          ⏳
        </div>
        <h3 style="color: #a16207; margin: 0 0 0.75rem;">Application Submitted!</h3>
        <p style="color: #64748b; font-size: 0.9rem; margin: 0 0 0.75rem;">
          Thank you, <strong>{{ form.name }}</strong>! Your <strong>{{ currentRoleLabel }}</strong> application has been received.
        </p>
        <p style="color: #92400e; background: #fef3c7; border-radius: 0.75rem; padding: 1rem; font-size: 0.85rem; margin: 0 0 1.5rem;">
          ⏱ Our team will review your application within <strong>1–2 business days</strong>. You will receive an email notification once approved.
        </p>
        <NuxtLink to="/login" class="btn btn-secondary" style="display: block; text-decoration: none; text-align: center;">
          ← Back to Login
        </NuxtLink>
      </div>

      <p v-if="currentStep < 4" style="text-align: center; margin-top: 1.5rem; color: #64748b; font-size: 0.875rem;">
        Already have an account?
        <NuxtLink to="/login" style="color: var(--bsp-primary); font-weight: 600;">Login here</NuxtLink>
      </p>

      <!-- Demo Credentials -->
      <div v-if="currentStep < 4" style="background: #fffbeb; border: 1px solid #fde68a; padding: 1rem; border-radius: 0.75rem; margin-top: 1.5rem;">
        <p style="font-weight: 700; color: #92400e; margin: 0 0 0.5rem; font-size: 0.8rem;">🧪 Demo Accounts</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
          <div>
            <p style="color: #64748b; font-size: 0.7rem; margin: 0;">School</p>
            <p style="color: #374151; font-size: 0.75rem; margin: 0; font-weight: 600;">school@demo.com</p>
          </div>
          <div>
            <p style="color: #64748b; font-size: 0.7rem; margin: 0;">Consultant</p>
            <p style="color: #374151; font-size: 0.75rem; margin: 0; font-weight: 600;">consultant@demo.com</p>
          </div>
          <div>
            <p style="color: #64748b; font-size: 0.7rem; margin: 0;">Student</p>
            <p style="color: #374151; font-size: 0.75rem; margin: 0; font-weight: 600;">student@demo.com</p>
          </div>
          <div>
            <p style="color: #64748b; font-size: 0.7rem; margin: 0;">Password</p>
            <p style="color: #374151; font-size: 0.75rem; margin: 0; font-weight: 600;">demo123</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

const { setMeta } = useSEO()
setMeta({
  title: 'Create Account — Register for BSP',
  description: 'Create your BSP account to browse UK schools, submit online applications, and track admission progress. Free registration for students, schools, and education consultants.',
  path: '/register',
  type: 'website'
})

const currentStep = ref(1)
const activeRole = ref('student')
const steps = computed(() => activeRole.value === 'student'
    ? ['Account', 'Review']
    : ['Account', 'Verify', 'Review'])

const roles = [
  { value: 'student',   label: 'Personal',    icon: '👤' },
  { value: 'consultant', label: 'Consultant', icon: '💼' },
  { value: 'school',    label: 'School',      icon: '🏫' },
  { value: 'business',  label: 'Business',    icon: '🏢' },
]

const currentRoleLabel = computed(() => roles.find(r => r.value === activeRole.value)?.label || 'Personal')

const needsDoc = computed(() => ['school', 'consultant', 'business'].includes(activeRole.value))
const hasFile = computed(() => !needsDoc.value || !!(form.value.schoolFile || form.value.consultantFile))

const isStep1Valid = computed(() => {
  if (!form.value.name || !form.value.email || !form.value.password) return false
  if (form.value.password !== form.value.confirmPassword) return false
  if (form.value.password.length < 8) return false
  if (activeRole.value === 'school' && !form.value.schoolName) return false
  return true
})

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  schoolName: '',
  schoolRole: '',
  schoolFile: null,
  company: '',
  role: '',
  consultantFile: null,
  terms: false
})

const switchRole = (role) => {
  activeRole.value = role
  currentStep.value = 1
}

const handleConsultantFile = (event) => {
  form.value.consultantFile = event.target.files[0]
}

const handleSchoolFile = (event) => {
  form.value.schoolFile = event.target.files[0]
}

const handleSchoolDrop = (event) => {
  form.value.schoolFile = event.dataTransfer.files[0]
}

const nextStep = () => {
  // student/personal skips Step 2 (identity verification)
  if (activeRole.value === 'student' && currentStep.value === 1) {
    currentStep.value = 3
  } else {
    currentStep.value++
  }
}

const handleRegister = () => {
  currentStep.value = 4
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #212E54 0%, #3b82f6 100%);
  padding: 1rem;
}

.auth-box {
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.auth-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.auth-tab {
  flex: 1 1 calc(50% - 0.25rem);
  padding: 0.65rem 0.25rem;
  text-align: center;
  border: none;
  border-radius: 0.5rem;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.75rem;
  transition: all 0.3s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 420px) {
  .auth-tab {
    flex: 1 1 calc(25% - 0.375rem);
    font-size: 0.7rem;
  }
}

.auth-tab.active {
  background: var(--bsp-primary);
  color: white;
}

.auth-form .form-group {
  margin-bottom: 1.1rem;
}

.auth-form label {
  display: block;
  color: #374151;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
}

.auth-form input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.auth-form input:focus {
  border-color: var(--bsp-primary);
  box-shadow: 0 0 0 3px rgba(33, 51, 96, 0.1);
  outline: none;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.upload-area:hover {
  border-color: var(--bsp-primary);
  background: #f0f9ff;
}
</style>
