<template>
  <div class="login-page">
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
            <li><NuxtLink to="/student/register" class="btn btn-secondary">Register</NuxtLink></li>
          </ul>
        </nav>
      </div>
    </header>

    <!-- Login Form -->
    <div class="auth-container">
      <div class="auth-box">
        <NuxtLink to="/" style="display: block; text-align: center; margin-bottom: 1.5rem; text-decoration: none;">
          <span style="font-size: 2rem;">🎓</span>
          <h1 style="font-size: 1.5rem; color: #1e293b; margin-top: 0.5rem;">Student & Parent Portal</h1>
        </NuxtLink>

        <form @submit.prevent="handleLogin" class="auth-form">
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
              placeholder="••••••••"
              required
            />
          </div>
          <div class="form-actions">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.remember" />
              <span>Remember me</span>
            </label>
            <NuxtLink to="/student/forgot-password" class="forgot-link">Forgot password?</NuxtLink>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">
            Login
          </button>
        </form>

        <div class="divider"><span>or</span></div>

        <NuxtLink to="/student/register" class="btn btn-secondary" style="width: 100%; text-align: center; text-decoration: none;">
          Create an Account
        </NuxtLink>

        <p style="text-align: center; margin-top: 1.5rem; color: #64748b; font-size: 0.875rem;">
          Are you a school? <NuxtLink to="/login" style="color: #3B82F6; font-weight: 600;">School Login</NuxtLink>
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
            <li><NuxtLink to="/student/register">Register</NuxtLink></li>
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
  email: '',
  password: '',
  remember: false
})

const handleLogin = () => {
  console.log('Student Login:', form.value)
  alert('Student login would connect to the BSP API.\n\nThis is a demo.')
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; flex-direction: column; }

.navbar { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.navbar-content { display: flex; align-items: center; justify-content: space-between; padding-top: 0.8rem; padding-bottom: 0.8rem; }
.logo { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; }
.logo-img { height: 50px; width: auto; border-radius: 4px; }
.nav-links { display: flex; list-style: none; gap: 2rem; margin: 0; padding: 0; }
.nav-links a { text-decoration: none; color: #374151; font-weight: 500; }
.nav-links .btn-secondary { background: transparent; border: 2px solid #3B82F6; color: #3B82F6; padding: 0.5rem 1.25rem; border-radius: 0.5rem; font-weight: 600; }
.nav-links .btn-secondary:hover { background: #3B82F6; color: white; }

.auth-container { flex: 1; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem 1rem; }
.auth-box { background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); width: 100%; max-width: 420px; }

.auth-form .form-group { margin-bottom: 1.25rem; }
.auth-form label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
.auth-form input[type="email"], .auth-form input[type="password"], .auth-form input[type="text"] { width: 100%; padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; transition: all 0.2s; }
.auth-form input:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.form-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; color: #64748b; }
.forgot-link { font-size: 0.875rem; color: #3B82F6; text-decoration: none; }
.forgot-link:hover { text-decoration: underline; }

.btn-primary { background: #3B82F6; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; transition: background 0.2s; display: block; }
.btn-primary:hover { background: #1e40af; }
.btn-secondary { background: white; color: #374151; padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: block; }
.btn-secondary:hover { background: #f9fafb; }

.divider { display: flex; align-items: center; margin: 1.5rem 0; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }
.divider span { padding: 0 1rem; color: #6b7280; font-size: 0.875rem; }

.footer { background: #1e293b; color: white; padding: 3rem 0 1rem; margin-top: auto; }
.footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
.footer h4 { margin-bottom: 1rem; }
.footer ul { list-style: none; padding: 0; }
.footer li { margin-bottom: 0.5rem; color: rgba(255,255,255,0.7); }
.footer a { color: rgba(255,255,255,0.7); text-decoration: none; }
.footer a:hover { color: white; }
</style>
