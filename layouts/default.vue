<template>
  <div class="layout">
    <!-- Header -->
    <header class="navbar">
      <div class="container navbar-content">
        <NuxtLink to="/" class="logo">
          <img src="/img/logo-bsp.jpg" alt="British School Portal Logo" class="logo-img" />
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

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>

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
      <div class="container footer-bottom">
        <p>© 2024 British School Portal. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style>
/* Global Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Layout */
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  flex: 1;
}

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
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}

.logo-img {
  height: 50px;
  width: auto;
  border-radius: 4px;
}

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

.nav-links a:hover {
  color: #1e40af;
}

.nav-links .btn-primary {
  background: #3B82F6;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.nav-links .btn-primary:hover {
  background: #1e40af;
}

/* Footer */
.footer {
  background: #1e293b;
  color: white;
  padding: 3rem 0 1rem;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.footer h4 {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.footer ul {
  list-style: none;
  padding: 0;
}

.footer li {
  margin-bottom: 0.5rem;
  color: rgba(255,255,255,0.7);
  font-size: 0.875rem;
}

.footer a {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 0.875rem;
}

.footer a:hover {
  color: white;
}

.footer-bottom {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  font-size: 0.875rem;
  color: rgba(255,255,255,0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links {
    gap: 1rem;
  }
  
  .nav-links a {
    font-size: 0.85rem;
  }
  
  .logo-img {
    height: 40px;
  }
}
</style>
