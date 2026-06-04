<template>
  <div class="sitemap-page">
    <div class="sitemap-header">
      <h1>🗺️ Sitemap</h1>
      <p>British School Portal — All Pages & Development Progress</p>
      <p class="updated">Version: 9f65c82 | Updated: {{ currentDate }}</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        <span class="progress-text">{{ completedCount }} / {{ totalCount }} pages ({{ progressPercent }}%)</span>
      </div>
    </div>

    <div class="sitemap-grid">
      <!-- Public Pages -->
      <div class="sitemap-section">
        <h2>🌐 Public Pages</h2>
        <ul>
          <li><span class="status done">✅</span> <NuxtLink to="/">Home</NuxtLink></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/schools — School Directory</span></li>
          <li><span class="status done">✅</span> <NuxtLink to="/search">Search</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/bsp">BSP Page</NuxtLink></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/school/[city]/[slug] — School Profile</span></li>
          <li><span class="status done">✅</span> <NuxtLink to="/consultants">Consultants Directory</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/consultant/hong-kong/uk-study-link">Consultant Profile</NuxtLink> <span class="note">(sample)</span></li>
          <li><span class="status done">✅</span> <NuxtLink to="/business/singapore/global-study-group-ltd">Business Profile</NuxtLink> <span class="note">(sample)</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/about — About BSP</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/contact — Contact Us</span></li>
        </ul>
      </div>

      <!-- Student Portal -->
      <div class="sitemap-section">
        <h2>🎓 Student Portal</h2>
        <ul>
          <li><span class="status done">✅</span> <NuxtLink to="/student/login">Student Login</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/student/register">Student Registration</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/student/apply/demo-school">Apply to School</NuxtLink> <span class="note">(sample · multi-file upload, reorder, rename)</span></li>
          <li><span class="status done">✅</span> <NuxtLink to="/student/applications">My Applications</NuxtLink></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/student/profile — Student Profile</span></li>
        </ul>
      </div>

      <!-- School Portal -->
      <div class="sitemap-section">
        <h2>🏫 School Portal</h2>
        <ul>
          <li><span class="status todo">❌</span> <span class="todo-link">/school/login — School Login</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/school/dashboard — School Dashboard</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/school/applications — Application Management</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/school/applications/[id] — Application Detail</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/school/profile — School Profile Settings</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/school/ai-agent — AI Agent (v4)</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/school/reports — Admissions Reports (v4)</span></li>
        </ul>
      </div>

      <!-- Operations Portal -->
      <div class="sitemap-section">
        <h2>🔧 Operations Portal</h2>
        <ul>
          <li><span class="status done">✅</span> <NuxtLink to="/operations/dashboard">Operations Dashboard</NuxtLink></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/operations/schools — School Management</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/operations/consultants — Consultant Management</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/operations/payments — Payment Records</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/operations/discounts — Discount Codes</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/operations/settings — Operations Settings</span></li>
        </ul>
      </div>

      <!-- Consultant Portal -->
      <div class="sitemap-section">
        <h2>💼 Consultant Portal</h2>
        <ul>
          <li><span class="status todo">❌</span> <span class="todo-link">/consultant/login — Consultant Login</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/consultant/dashboard — Consultant Dashboard</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/consultant/students — Student List</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/consultant/students/[id] — Student Detail</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/consultant/profile — Consultant Profile</span></li>
        </ul>
      </div>

      <!-- BSP Operations Portal -->
      <div class="sitemap-section">
        <h2>⚙️ BSP Admin Portal</h2>
        <ul>
          <li><span class="status done">✅</span> <NuxtLink to="/BSP/dashboard">BSP Dashboard</NuxtLink> <span class="note">(Overview)</span></li>
          <li><span class="status done">✅</span> <NuxtLink to="/BSP/new-account-applications">New Account Applications</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/BSP/users/school">School Users</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/BSP/users/consultant">Consultant Users</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/BSP/users/personal">Personal Users</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/BSP/users/bspstaff">BSP Staff Users</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/BSP/payments">Payments</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/BSP/settings/fees">Annual Fee Settings</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/BSP/settings/website">Website Settings</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/BSP/settings/staff">Staff Settings</NuxtLink></li>
        </ul>
      </div>

      <!-- Legal -->
      <div class="sitemap-section">
        <h2>📜 Legal & Info</h2>
        <ul>
          <li><span class="status done">✅</span> <NuxtLink to="/sitemap">Sitemap</NuxtLink> <span class="note">(this page)</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/faq — FAQ</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/terms — Terms of Service</span></li>
          <li><span class="status todo">❌</span> <span class="todo-link">/privacy — Privacy Policy</span></li>
        </ul>
      </div>

      <!-- Auth -->
      <div class="sitemap-section">
        <h2>🔐 Authentication</h2>
        <ul>
          <li><span class="status done">✅</span> <NuxtLink to="/login">Login</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/login/operations">Operations Login</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/register">Register</NuxtLink></li>
          <li><span class="status done">✅</span> <NuxtLink to="/payment">Payment</NuxtLink></li>
        </ul>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary-panel">
      <h3>📊 Development Summary</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-number">{{ completedCount }}</span>
          <span class="summary-label">Completed</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">{{ todoCount }}</span>
          <span class="summary-label">To Do</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">{{ totalCount }}</span>
          <span class="summary-label">Total Pages</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">{{ progressPercent }}%</span>
          <span class="summary-label">Progress</span>
        </div>
      </div>
    </div>

    <div class="sitemap-footer">
      <p>© 2026 British School Portal. All rights reserved.</p>
      <p>Deployed URL: <a :href="deployedUrl" target="_blank">{{ deployedUrl }}</a></p>
    </div>
  </div>
</template>

<script setup>
const currentDate = new Date().toLocaleDateString('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const deployedUrl = 'https://33a3f9d6.bsp-v3.pages.dev'

// Progress tracking
const totalCount = 51
const completedCount = 26
const todoCount = totalCount - completedCount
const progressPercent = Math.round((completedCount / totalCount) * 100)
</script>

<style scoped>
.sitemap-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.sitemap-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #e5e7eb;
}

.sitemap-header h1 {
  font-size: 2.5rem;
  color: #1a1a2e;
  margin-bottom: 10px;
}

.sitemap-header p {
  color: #6b7280;
  font-size: 1.1rem;
}

.updated {
  font-size: 0.9rem;
  color: #9ca3af;
  margin-top: 10px;
}

/* Progress bar */
.progress-bar {
  max-width: 400px;
  margin: 20px auto 0;
  height: 28px;
  background: #e5e7eb;
  border-radius: 14px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 14px;
  transition: width 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: 700;
  color: #374151;
  white-space: nowrap;
}

.sitemap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.sitemap-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.sitemap-section h2 {
  font-size: 1.15rem;
  color: #1a1a2e;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3b82f6;
}

.sitemap-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sitemap-section li {
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sitemap-section li:last-child {
  border-bottom: none;
}

.status {
  font-size: 0.9rem;
  flex-shrink: 0;
}

.status.done {
  color: #10b981;
}

.status.todo {
  color: #ef4444;
}

.sitemap-section a {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.92rem;
  transition: color 0.2s;
}

.sitemap-section a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.todo-link {
  color: #9ca3af;
  font-size: 0.92rem;
}

.note {
  color: #9ca3af;
  font-size: 0.75rem;
  margin-left: auto;
}

/* Summary panel */
.summary-panel {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  border-radius: 12px;
  padding: 28px;
  margin-bottom: 40px;
}

.summary-panel h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  text-align: center;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-number {
  font-size: 1.8rem;
  font-weight: 800;
  color: #3b82f6;
}

.summary-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.sitemap-footer {
  text-align: center;
  padding-top: 30px;
  border-top: 2px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: auto;
}

.sitemap-footer a {
  color: #3b82f6;
}

@media (max-width: 768px) {
  .sitemap-grid {
    grid-template-columns: 1fr;
  }
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
