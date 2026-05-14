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
            <li><NuxtLink to="/about">About</NuxtLink></li>
            <li><NuxtLink to="/login" class="btn btn-primary">Login</NuxtLink></li>
          </ul>
        </nav>
      </div>
    </header>
    
    <!-- Login Form -->
    <div class="auth-container">
    <div class="auth-box">
      <NuxtLink to="/" style="display: block; text-align: center; margin-bottom: 1.5rem;">
        <span style="font-size: 2rem;">🏫</span>
        <h1 style="font-size: 1.5rem; margin-top: 0.5rem;">British School Portal</h1>
      </NuxtLink>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>Email</label>
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" v-model="form.remember" />
            <span style="font-size: 0.875rem; color: #64748b;">Remember me</span>
          </label>
          <NuxtLink to="/forgot-password" style="font-size: 0.875rem; color: var(--bsp-primary);">
            Forgot password?
          </NuxtLink>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">
          Login
        </button>
      </form>
      
      <div class="divider">
        <span>or</span>
      </div>
      
      <NuxtLink to="/register" class="btn btn-google" style="width: 100%; text-decoration: none;">
        <svg class="google-icon" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Register with Google
      </NuxtLink>
      
      <p style="text-align: center; margin-top: 1.5rem; color: #64748b;">
        Don't have an account? 
        <NuxtLink to="/register" style="color: var(--bsp-primary); font-weight: 600;">Register here</NuxtLink>
      </p>
      
      <!-- Demo Account Info -->
      <div style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-top: 1.5rem; font-size: 0.8rem;">
        <p style="font-weight: 600; margin-bottom: 0.5rem;">Demo Account:</p>
        <p style="color: #64748b;">Email: demo@school.com</p>
        <p style="color: #64748b;">Password: demo123</p>
      </div>
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
            <li><NuxtLink to="/login">Login</NuxtLink></li>
            <li><NuxtLink to="/register">Register</NuxtLink></li>
                      <li><NuxtLink to="/sitemap">Sitemap</NuxtLink></li>
          </ul>
        </div>
        <div>
          <h4>For Schools</h4>
          <ul>
            <li><NuxtLink to="/register?role=school">Register School</NuxtLink></li>
            <li><NuxtLink to="/login">School Login</NuxtLink></li>
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
        <p>&copy; 2024 British School Portal. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>

const { setMeta } = useSEO()
setMeta({
  title: 'Login to Your BSP Account',
  description: 'Login to your British School Portal account to manage applications, view school offers, and track admission status.',
  path: '/login',
  type: 'website'
})

const form = ref({
  email: '',
  password: '',
  remember: false
})

const handleLogin = () => {
  console.log('Login:', form.value)
  alert('Login functionality would connect to the BSP API.\n\nThis is a demo.')
}

definePageMeta({
  layout: false
})
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

.btn-google {
  background: white;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-google:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.google-icon {
  width: 20px;
  height: 20px;
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
