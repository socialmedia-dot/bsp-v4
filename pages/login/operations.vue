<template>
  <div class="login-page">
    <!-- Header -->
    <header class="navbar">
      <div class="container navbar-content">
        <a href="/" class="logo">
          <img src="/img/logo-bsp.jpg" alt="British School Portal Logo" class="logo-img">
        </a>
        <nav>
          <ul class="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/schools">Schools</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/login/operations" class="btn btn-primary">Operations Login</a></li>
          </ul>
        </nav>
      </div>
    </header>
    
    <!-- Staff Login Form -->
    <div class="auth-container">
    <div class="auth-box">
      <a href="/" style="display: block; text-align: center; margin-bottom: 1.5rem;">
        <span style="font-size: 2rem;">🏫</span>
        <h1 style="font-size: 1.5rem; margin-top: 0.5rem;">BSP Operations Login</h1>
        <p style="font-size: 0.875rem; color: #64748b; margin-top: 0.25rem;">British School Portal — Operations Portal</p>
      </a>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="staff@bsp.com" 
            required 
          />
        </div>
        <div class="form-group password-group">
          <label>Password</label>
          <div class="password-input-wrapper">
            <input 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="••••••••" 
              required 
            />
            <button 
              type="button" 
              class="password-toggle" 
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" v-model="form.remember" />
            <span style="font-size: 0.875rem; color: #64748b;">Remember me</span>
          </label>
          <a href="/forgot-password" style="font-size: 0.875rem; color: var(--bsp-primary);">
            Forgot password?
          </a>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">
          Sign In
        </button>
      </form>
      
      <div class="divider">
        <span>or</span>
      </div>
      
      <div style="background: #eff6ff; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 0.8rem; border-left: 3px solid var(--bsp-primary);">
        <p style="font-weight: 600; margin-bottom: 0.25rem;">Demo Staff Account:</p>
        <p style="color: #64748b; margin: 0;">Email: staff@demo.com</p>
        <p style="color: #64748b; margin: 0;">Password: staff123</p>
      </div>
      
      <p style="text-align: center; margin-top: 1.5rem; color: #64748b;">
        <a href="/login" style="color: var(--bsp-primary); font-weight: 500; text-decoration: none;">
          ← Back to Student Login
        </a>
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
            <li><a href="/schools">Find Schools</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/register">Register</a></li>
                      <li><a href="/sitemap">Sitemap</a></li>
          </ul>
        </div>
        <div>
          <h4>For Schools</h4>
          <ul>
            <li><a href="/register?role=school">Register School</a></li>
            <li><a href="/login">School Login</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>Email: info@britishschoolportal.co.uk</li>
            <li>WhatsApp: +44 7xxx</li>
          </ul>
        </div>
      </div>
      <div class="container" style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
        <p>© 2024 British School Portal. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
const form = ref({
  email: '',
  password: '',
  remember: false
})

const showPassword = ref(false)

const handleLogin = () => {
  console.log('Staff Login:', form.value)
  alert('Staff login functionality would connect to the BSP API.\n\nThis is a demo.')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.login-page .navbar {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.login-page .navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
}

.login-page .logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}

.login-page .logo-img {
  height: 50px;
  width: auto;
  border-radius: 4px;
}

.login-page .nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.login-page .nav-links a {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
}

.login-page .nav-links .btn-primary {
  background: var(--bsp-primary);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
}

.login-page .footer {
  background: #1e293b;
  color: white;
  padding: 3rem 0 1rem;
  margin-top: auto;
}

.login-page .footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.login-page .footer h4 {
  margin-bottom: 1rem;
  color: #fff;
}

.login-page .footer ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.login-page .footer li {
  margin-bottom: 0.5rem;
  color: rgba(255,255,255,0.7);
}

.login-page .footer a {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
}

.login-page .footer a:hover {
  color: white;
}

.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.auth-box {
  background: white;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 400px;
}

.auth-form .form-group {
  margin-bottom: 1.25rem;
}

.auth-form label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.auth-form input[type="email"],
.auth-form input[type="password"],
.auth-form input[type="text"] {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.auth-form input:focus {
  outline: none;
  border-color: var(--bsp-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.password-input-wrapper {
  position: relative;
}

.password-input-wrapper input {
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.password-toggle:hover {
  opacity: 1;
}

.btn-primary {
  background: var(--bsp-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: block;
  text-align: center;
}

.btn-primary:hover {
  background: #1e40af;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  padding: 0 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}
</style>
