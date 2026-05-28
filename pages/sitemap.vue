<template>
  <div class="sitemap-page">
    <div class="sitemap-header">
      <h1>🗺️ BSP v4 Sitemap & Progress</h1>
      <p>British School Portal — 實時開發進度一覽</p>
      <p class="updated">Version: v4-{{ latestCommit }} | Updated: {{ currentDate }}</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: overallPercent + '%' }"></div>
        <span class="progress-text">{{ completedCount }} / {{ totalCount }} pages ({{ overallPercent }}%)</span>
      </div>
    </div>

    <!-- Recent Updates -->
    <div class="recent-updates">
      <h2>🕐 最近更新</h2>
      <ul class="update-list">
        <li v-for="(update, idx) in recentUpdates" :key="idx">
          <span class="update-date">{{ update.date }}</span>
          <span class="update-text">{{ update.text }}</span>
        </li>
      </ul>
    </div>

    <div class="sitemap-grid">
      <!-- Public Pages -->
      <div class="sitemap-section">
        <div class="section-header">
          <h2>🌐 Public Pages</h2>
          <div class="section-bar">
            <div class="section-fill" :style="{ width: sectionPercent('public') + '%' }"></div>
            <span>{{ sectionDone('public') }}/{{ sectionTotal('public') }}</span>
          </div>
        </div>
        <ul>
          <li v-for="p in sections.public" :key="p.path">
            <span class="status" :class="p.done ? 'done' : 'todo'">{{ p.done ? '✅' : '📋' }}</span>
            <NuxtLink v-if="p.done" :to="p.path">{{ p.label }}</NuxtLink>
            <span v-else class="todo-link">{{ p.path }} — {{ p.label }}</span>
          </li>
        </ul>
      </div>

      <!-- Auth -->
      <div class="sitemap-section">
        <div class="section-header">
          <h2>🔐 Authentication</h2>
          <div class="section-bar">
            <div class="section-fill" :style="{ width: sectionPercent('auth') + '%' }"></div>
            <span>{{ sectionDone('auth') }}/{{ sectionTotal('auth') }}</span>
          </div>
        </div>
        <ul>
          <li v-for="p in sections.auth" :key="p.path">
            <span class="status" :class="p.done ? 'done' : 'todo'">{{ p.done ? '✅' : '📋' }}</span>
            <NuxtLink v-if="p.done" :to="p.path">{{ p.label }}</NuxtLink>
            <span v-else class="todo-link">{{ p.path }} — {{ p.label }}</span>
          </li>
        </ul>
      </div>

      <!-- Student Portal -->
      <div class="sitemap-section">
        <div class="section-header">
          <h2>🎓 Student Portal</h2>
          <div class="section-bar">
            <div class="section-fill" :style="{ width: sectionPercent('student') + '%' }"></div>
            <span>{{ sectionDone('student') }}/{{ sectionTotal('student') }}</span>
          </div>
        </div>
        <ul>
          <li v-for="p in sections.student" :key="p.path">
            <span class="status" :class="p.done ? 'done' : 'todo'">{{ p.done ? '✅' : '📋' }}</span>
            <NuxtLink v-if="p.done" :to="p.path">{{ p.label }}</NuxtLink>
            <span v-else class="todo-link">{{ p.path }} — {{ p.label }}</span>
          </li>
        </ul>
      </div>

      <!-- Operations Portal -->
      <div class="sitemap-section">
        <div class="section-header">
          <h2>🔧 Operations Portal</h2>
          <div class="section-bar">
            <div class="section-fill" :style="{ width: sectionPercent('operations') + '%' }"></div>
            <span>{{ sectionDone('operations') }}/{{ sectionTotal('operations') }}</span>
          </div>
        </div>
        <ul>
          <li v-for="p in sections.operations" :key="p.path">
            <span class="status" :class="p.done ? 'done' : 'todo'">{{ p.done ? '✅' : '📋' }}</span>
            <NuxtLink v-if="p.done" :to="p.path">{{ p.label }}</NuxtLink>
            <span v-else class="todo-link">{{ p.path }} — {{ p.label }}</span>
          </li>
        </ul>
      </div>

      <!-- Admin Portal -->
      <div class="sitemap-section">
        <div class="section-header">
          <h2>⚙️ BSP Admin Portal</h2>
          <div class="section-bar">
            <div class="section-fill" :style="{ width: sectionPercent('admin') + '%' }"></div>
            <span>{{ sectionDone('admin') }}/{{ sectionTotal('admin') }}</span>
          </div>
        </div>
        <ul>
          <li v-for="p in sections.admin" :key="p.path">
            <span class="status" :class="p.done ? 'done' : 'todo'">{{ p.done ? '✅' : '📋' }}</span>
            <NuxtLink v-if="p.done" :to="p.path">{{ p.label }}</NuxtLink>
            <span v-else class="todo-link">{{ p.path }} — {{ p.label }}</span>
          </li>
        </ul>
      </div>

      <!-- School Portal -->
      <div class="sitemap-section">
        <div class="section-header">
          <h2>🏫 School Portal</h2>
          <div class="section-bar">
            <div class="section-fill" :style="{ width: sectionPercent('school') + '%' }"></div>
            <span>{{ sectionDone('school') }}/{{ sectionTotal('school') }}</span>
          </div>
        </div>
        <ul>
          <li v-for="p in sections.school" :key="p.path">
            <span class="status" :class="p.done ? 'done' : 'todo'">{{ p.done ? '✅' : '📋' }}</span>
            <NuxtLink v-if="p.done" :to="p.path">{{ p.label }}</NuxtLink>
            <span v-else class="todo-link">{{ p.path }} — {{ p.label }}</span>
          </li>
        </ul>
      </div>

      <!-- Consultant Portal -->
      <div class="sitemap-section">
        <div class="section-header">
          <h2>💼 Consultant Portal</h2>
          <div class="section-bar">
            <div class="section-fill" :style="{ width: sectionPercent('consultant') + '%' }"></div>
            <span>{{ sectionDone('consultant') }}/{{ sectionTotal('consultant') }}</span>
          </div>
        </div>
        <ul>
          <li v-for="p in sections.consultant" :key="p.path">
            <span class="status" :class="p.done ? 'done' : 'todo'">{{ p.done ? '✅' : '📋' }}</span>
            <NuxtLink v-if="p.done" :to="p.path">{{ p.label }}</NuxtLink>
            <span v-else class="todo-link">{{ p.path }} — {{ p.label }}</span>
          </li>
        </ul>
      </div>

      <!-- Legal -->
      <div class="sitemap-section">
        <div class="section-header">
          <h2>📜 Legal & Info</h2>
          <div class="section-bar">
            <div class="section-fill" :style="{ width: sectionPercent('legal') + '%' }"></div>
            <span>{{ sectionDone('legal') }}/{{ sectionTotal('legal') }}</span>
          </div>
        </div>
        <ul>
          <li v-for="p in sections.legal" :key="p.path">
            <span class="status" :class="p.done ? 'done' : 'todo'">{{ p.done ? '✅' : '📋' }}</span>
            <NuxtLink v-if="p.done" :to="p.path">{{ p.label }}</NuxtLink>
            <span v-else class="todo-link">{{ p.path }} — {{ p.label }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary-panel">
      <h3>📊 開發統計</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-number">{{ completedCount }}</span>
          <span class="summary-label">已完成</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">{{ todoCount }}</span>
          <span class="summary-label">規劃中</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">{{ totalCount }}</span>
          <span class="summary-label">總頁面</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">{{ overallPercent }}%</span>
          <span class="summary-label">整體進度</span>
        </div>
      </div>
    </div>

    <div class="sitemap-footer">
      <p>© 2026 British School Portal. All rights reserved.</p>
      <p>Production URL: <a :href="deployedUrl" target="_blank">{{ deployedUrl }}</a></p>
    </div>
  </div>
</template>

<script setup>
const currentDate = new Date().toLocaleDateString('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const latestCommit = '2741ee1'
const deployedUrl = 'https://bsp-v4.pages.dev'

const recentUpdates = [
  { date: '2026-05-21', text: '統一 Settings 側邊欄 CSS，修正 Promo Codes 縮排' },
  { date: '2026-05-21', text: '補齊 new-account-applications 側邊欄缺失連結' },
  { date: '2026-05-21', text: '移除 payments 側邊欄重複 Promo Codes 連結' },
  { date: '2026-05-21', text: '全站 .main-content 加 min-height:100vh，統一版面高度' },
  { date: '2026-05-20', text: '新增 /BSP/users/business 商業用戶管理頁面' },
  { date: '2026-05-20', text: 'Consultant / Business 註冊表單新增公司地址欄位' },
  { date: '2026-05-19', text: 'School 註冊表單新增學校地址欄位' },
  { date: '2026-05-18', text: '新註冊流程：付款後經 Manager 審批' },
  { date: '2026-05-16', text: '新增 Operations /applications Manager 審批頁面' },
  { date: '2026-05-15', text: 'Admin Staff Settings 新增 Add Role 及權限編輯功能' },
]

const sections = {
  public: [
    { path: '/', label: 'Home', done: true },
    { path: '/search', label: 'Search', done: true },
    { path: '/bsp', label: 'BSP Page', done: true },
    { path: '/consultants', label: 'Consultants Directory', done: true },
    { path: '/consultant/:city/:slug', label: 'Consultant Profile', done: true },
    { path: '/business/:city/:slug', label: 'Business Profile', done: true },
    { path: '/news/:slug', label: 'News Article', done: true },
    { path: '/schools', label: 'School Directory', done: false },
    { path: '/school/:city/:slug', label: 'School Profile', done: false },
    { path: '/about', label: 'About BSP', done: false },
    { path: '/contact', label: 'Contact Us', done: false },
  ],
  auth: [
    { path: '/login', label: 'Login', done: true },
    { path: '/login/operations', label: 'Operations Login', done: true },
    { path: '/register', label: 'Register', done: true },
    { path: '/payment', label: 'Payment', done: true },
  ],
  student: [
    { path: '/student/login', label: 'Student Login', done: true },
    { path: '/student/register', label: 'Student Registration', done: true },
    { path: '/student/apply/:schoolId', label: 'Apply to School', done: true },
    { path: '/student/applications', label: 'My Applications', done: true },
    { path: '/student/profile', label: 'Student Profile', done: false },
  ],
  operations: [
    { path: '/operations', label: 'Operations Landing', done: true },
    { path: '/operations/dashboard', label: 'Operations Dashboard', done: true },
    { path: '/operations/applications', label: 'New User Applications', done: true },
    { path: '/operations/payments', label: 'Payment Records', done: true },
    { path: '/operations/reports', label: 'Reports', done: true },
    { path: '/operations/users', label: 'User Management', done: true },
    { path: '/operations/schools', label: 'School Management', done: false },
    { path: '/operations/consultants', label: 'Consultant Management', done: false },
    { path: '/operations/settings', label: 'Operations Settings', done: false },
  ],
  admin: [
    { path: '/BSP/dashboard', label: 'BSP Dashboard', done: true },
    { path: '/BSP/new-account-applications', label: 'New Account Applications', done: true },
    { path: '/BSP/users/school', label: 'School Users', done: true },
    { path: '/BSP/users/consultant', label: 'Consultant Users', done: true },
    { path: '/BSP/users/personal', label: 'Personal Users', done: true },
    { path: '/BSP/users/bspstaff', label: 'BSP Staff Users', done: true },
    { path: '/BSP/users/business', label: 'Business Users', done: true },
    { path: '/BSP/payments', label: 'Payments', done: true },
    { path: '/BSP/promo-codes', label: 'Promo Codes', done: true },
    { path: '/BSP/settings/fees', label: 'Fee Settings', done: true },
    { path: '/BSP/settings/website', label: 'Website Settings', done: true },
    { path: '/BSP/settings/staff', label: 'Staff Settings', done: true },
  ],
  school: [
    { path: '/school/login', label: 'School Login', done: false },
    { path: '/school/dashboard', label: 'School Dashboard', done: false },
    { path: '/school/applications', label: 'Application Management', done: false },
    { path: '/school/applications/:id', label: 'Application Detail', done: false },
    { path: '/school/profile', label: 'School Profile', done: false },
    { path: '/school/ai-agent', label: 'AI Agent', done: false },
    { path: '/school/reports', label: 'Admissions Reports', done: false },
  ],
  consultant: [
    { path: '/consultant/login', label: 'Consultant Login', done: false },
    { path: '/consultant/dashboard', label: 'Consultant Dashboard', done: false },
    { path: '/consultant/students', label: 'Student List', done: false },
    { path: '/consultant/students/:id', label: 'Student Detail', done: false },
    { path: '/consultant/profile', label: 'Consultant Profile', done: false },
  ],
  legal: [
    { path: '/sitemap', label: 'Sitemap', done: true },
    { path: '/faq', label: 'FAQ', done: false },
    { path: '/terms', label: 'Terms of Service', done: false },
    { path: '/privacy', label: 'Privacy Policy', done: false },
  ],
}

const allPages = Object.values(sections).flat()
const completedCount = allPages.filter(p => p.done).length
const totalCount = allPages.length
const todoCount = totalCount - completedCount
const overallPercent = Math.round((completedCount / totalCount) * 100)

function sectionDone(key) {
  return sections[key].filter(p => p.done).length
}
function sectionTotal(key) {
  return sections[key].length
}
function sectionPercent(key) {
  return Math.round((sectionDone(key) / sectionTotal(key)) * 100)
}
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
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 2px solid #e5e7eb;
}

.sitemap-header h1 {
  font-size: 2.2rem;
  color: #1a1a2e;
  margin-bottom: 10px;
}

.sitemap-header p {
  color: #6b7280;
  font-size: 1.05rem;
}

.updated {
  font-size: 0.85rem;
  color: #9ca3af;
  margin-top: 8px;
}

/* Overall progress bar */
.progress-bar {
  max-width: 420px;
  margin: 20px auto 0;
  height: 32px;
  background: #e5e7eb;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 16px;
  transition: width 0.6s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.85rem;
  font-weight: 700;
  color: #374151;
  white-space: nowrap;
}

/* Recent Updates */
.recent-updates {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
}

.recent-updates h2 {
  font-size: 1.1rem;
  color: #1a1a2e;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3b82f6;
}

.update-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 10px 24px;
}

.update-list li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 0.9rem;
  line-height: 1.4;
}

.update-date {
  color: #6b7280;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.update-text {
  color: #374151;
}

/* Sitemap Grid */
.sitemap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.sitemap-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.section-header {
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 2px solid #3b82f6;
}

.section-header h2 {
  font-size: 1.05rem;
  color: #1a1a2e;
  margin-bottom: 10px;
}

/* Section mini progress bar */
.section-bar {
  height: 20px;
  background: #e5e7eb;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.section-fill {
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #34d399);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.section-bar span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem;
  font-weight: 700;
  color: #374151;
}

.sitemap-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sitemap-section li {
  padding: 7px 0;
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
  color: #f59e0b;
}

.sitemap-section a {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.sitemap-section a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.todo-link {
  color: #9ca3af;
  font-size: 0.9rem;
}

/* Summary panel */
.summary-panel {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  border-radius: 12px;
  padding: 28px;
  margin-bottom: 30px;
}

.summary-panel h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.15rem;
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
  .update-list {
    grid-template-columns: 1fr;
  }
}
</style>
