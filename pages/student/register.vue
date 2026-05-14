<template>
  <div class="register-page">
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
            <li><NuxtLink to="/consultants">Consultants</NuxtLink></li>
            <li><NuxtLink to="/student/login" class="btn btn-primary">Login</NuxtLink></li>
          </ul>
        </nav>
      </div>
    </header>

    <!-- Register Form -->
    <div class="auth-container">
      <div class="auth-box">
        <NuxtLink to="/" style="display: block; text-align: center; margin-bottom: 1.5rem; text-decoration: none;">
          <span style="font-size: 2rem;">🎓</span>
          <h1 style="font-size: 1.5rem; color: #1e293b; margin-top: 0.5rem;">Create Student Account</h1>
        </NuxtLink>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label>Full Name</label>
            <input
              v-model="form.fullName"
              type="text"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Create a password"
              required
              minlength="8"
            />
          </div>
          <div class="form-group">
            <label>Confirm Password</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
            />
          </div>

          <div v-if="form.password && form.confirmPassword && form.password !== form.confirmPassword" class="error-msg">
            ⚠️ Passwords do not match
          </div>

          <div class="terms-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.agreedToTerms" required />
              <span>I agree to the <NuxtLink to="/terms" style="color: #3B82F6;">Terms of Service</NuxtLink> and <NuxtLink to="/privacy" style="color: #3B82F6;">Privacy Policy</NuxtLink></span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="!isFormValid">
            Create Account
          </button>
        </form>

        <p style="text-align: center; margin-top: 1.5rem; color: #64748b; font-size: 0.875rem;">
          Already have an account?
          <NuxtLink to="/student/login" style="color: #3B82F6; font-weight: 600;">Login here</NuxtLink>
        </p>
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
            <li><NuxtLink to="/consultants">Consultants</NuxtLink></li>
            <li><NuxtLink to="/student/login">Login</NuxtLink></li>
                      <li><NuxtLink to="/sitemap">Sitemap</NuxtLink></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>Email: info@britishschoolportal.co.uk</li>
          </ul>
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

const form = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreedToTerms: false
})

const isFormValid = computed(() => {
  return form.value.fullName &&
    form.value.email &&
    form.value.password.length >= 8 &&
    form.value.password === form.value.confirmPassword &&
    form.value.agreedToTerms
})

const handleRegister = () => {
  console.log('Student Register:', form.value)
  alert('Student registration would connect to the BSP API.\n\nThis is a demo.')
}
</script>

<style scoped>
.register-page { min-height: 100vh; display: flex; flex-direction: column; }

.navbar { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.navbar-content { display: flex; align-items: center; justify-content: space-between; padding-top: 0.8rem; padding-bottom: 0.8rem; }
.logo { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; }
.logo-img { height: 50px; width: auto; border-radius: 4px; }
.nav-links { display: flex; list-style: none; gap: 2rem; margin: 0; padding: 0; }
.nav-links a { text-decoration: none; color: #374151; font-weight: 500; }
.nav-links .btn-primary { background: #3B82F6; color: white; padding: 0.5rem 1.25rem; border-radius: 0.5rem; }

.auth-container { flex: 1; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem 1rem; }
.auth-box { background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); width: 100%; max-width: 420px; }

.auth-form .form-group { margin-bottom: 1.25rem; }
.auth-form label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
.auth-form input[type="email"], .auth-form input[type="password"], .auth-form input[type="text"] { width: 100%; padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; transition: all 0.2s; }
.auth-form input:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.error-msg { background: #fef2f2; color: #dc2626; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; margin-bottom: 1rem; }

.terms-row { margin-bottom: 1.5rem; }
.checkbox-label { display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; color: #64748b; line-height: 1.4; }

.btn-primary { background: #3B82F6; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; transition: background 0.2s; display: block; width: 100%; text-align: center; }
.btn-primary:hover:not(:disabled) { background: #1e40af; }
.btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }

.footer { background: #1e293b; color: white; padding: 3rem 0 1rem; margin-top: auto; }
.footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
.footer h4 { margin-bottom: 1rem; }
.footer ul { list-style: none; padding: 0; }
.footer li { margin-bottom: 0.5rem; color: rgba(255,255,255,0.7); }
.footer a { color: rgba(255,255,255,0.7); text-decoration: none; }
.footer a:hover { color: white; }
</style>
