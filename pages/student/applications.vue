<template>
  <div class="applications-page">
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
            <li><NuxtLink to="/student/applications" class="active">My Applications</NuxtLink></li>
            <li><NuxtLink to="/student/login" class="btn btn-primary">Logout</NuxtLink></li>
          </ul>
        </nav>
      </div>
    </header>

    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <h1>📭 My Applications</h1>
        <p>Track and manage your school applications</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container main-content">

      <!-- Tabs -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="tab-count">{{ tabCount(tab.key) }}</span>
        </button>
      </div>

      <!-- Applications List -->
      <div v-if="filteredApplications.length > 0" class="applications-list">
        <div
          v-for="app in filteredApplications"
          :key="app.id"
          class="application-card"
        >
          <div class="card-school-image">
            <img :src="app.schoolPhoto" :alt="app.schoolName" />
          </div>
          <div class="card-content">
            <div class="card-header">
              <h3 class="school-name">{{ app.schoolName }}</h3>
              <span class="status-badge" :class="'status-' + app.status.toLowerCase().replace(' ', '-')">
                {{ app.status }}
              </span>
            </div>
            <p class="school-location">📍 {{ app.schoolLocation }}</p>
            <div class="card-details">
              <div class="detail-item">
                <span class="detail-label">Submitted</span>
                <span class="detail-value">{{ app.submittedDate }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Intake</span>
                <span class="detail-value">{{ app.intake }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Programme</span>
                <span class="detail-value">{{ app.programme }}</span>
              </div>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn btn-outline" @click="viewDetails(app)">View Details</button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No applications found</h3>
        <p v-if="activeTab === 'all'">You haven't submitted any applications yet.</p>
        <p v-else>No applications with status "{{ activeTab }}".</p>
        <NuxtLink to="/schools" class="btn btn-primary">Browse Schools</NuxtLink>
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

const activeTab = ref('all')

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'under-review', label: 'Under Review' },
  { key: 'offer', label: 'Offer' },
  { key: 'rejected', label: 'Rejected' }
]

const mockApplications = [
  {
    id: 1,
    schoolName: "St. Mary's College",
    schoolLocation: 'London, United Kingdom',
    status: 'Under Review',
    submittedDate: '15 Mar 2024',
    intake: 'Sep 2024',
    programme: 'Year 10',
    schoolPhoto: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80'
  },
  {
    id: 2,
    schoolName: 'Greenwich Academy',
    schoolLocation: 'London, United Kingdom',
    status: 'Offer',
    submittedDate: '28 Feb 2024',
    intake: 'Sep 2024',
    programme: 'Year 12',
    schoolPhoto: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80'
  },
  {
    id: 3,
    schoolName: 'Kingsfield School',
    schoolLocation: 'Birmingham, United Kingdom',
    status: 'Pending',
    submittedDate: '20 Apr 2024',
    intake: 'Jan 2025',
    programme: 'Year 9',
    schoolPhoto: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&q=80'
  }
]

const statusMap = {
  'all': ['Pending', 'Under Review', 'Offer', 'Rejected'],
  'pending': ['Pending'],
  'under-review': ['Under Review'],
  'offer': ['Offer'],
  'rejected': ['Rejected']
}

const filteredApplications = computed(() => {
  const statuses = statusMap[activeTab.value] || []
  return mockApplications.filter(app => statuses.includes(app.status))
})

const tabCount = (key) => {
  const statuses = statusMap[key] || []
  return key === 'all' ? mockApplications.length : mockApplications.filter(a => statuses.includes(a.status)).length
}

const viewDetails = (app) => {
  alert(`Application Details:\n\nSchool: ${app.schoolName}\nStatus: ${app.status}\nSubmitted: ${app.submittedDate}\nIntake: ${app.intake}\nProgramme: ${app.programme}\n\nThis is a demo.`)
}
</script>

<style scoped>
.applications-page { min-height: 100vh; display: flex; flex-direction: column; }

.navbar { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.navbar-content { display: flex; align-items: center; justify-content: space-between; padding-top: 0.8rem; padding-bottom: 0.8rem; }
.logo { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; }
.logo-img { height: 50px; width: auto; border-radius: 4px; }
.nav-links { display: flex; list-style: none; gap: 2rem; margin: 0; padding: 0; }
.nav-links a { text-decoration: none; color: #374151; font-weight: 500; }
.nav-links a.active { color: #3B82F6; }
.nav-links .btn-primary { background: #3B82F6; color: white; padding: 0.5rem 1.25rem; border-radius: 0.5rem; }

.page-header { background: linear-gradient(135deg, #3B82F6 0%, #1e40af 100%); color: white; padding: 3rem 0; text-align: center; }
.page-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
.page-header p { font-size: 1.1rem; opacity: 0.9; }

.main-content { padding: 2rem 0; flex: 1; }

.tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; flex-wrap: wrap; border-bottom: 2px solid #e5e7eb; padding-bottom: 0; }
.tab-btn { background: none; border: none; padding: 0.75rem 1.25rem; font-size: 0.9rem; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
.tab-btn:hover { color: #3B82F6; }
.tab-btn.active { color: #3B82F6; border-bottom-color: #3B82F6; }
.tab-count { background: #f1f5f9; color: #64748b; font-size: 0.75rem; padding: 0.1rem 0.5rem; border-radius: 9999px; }
.tab-btn.active .tab-count { background: #dbeafe; color: #1e40af; }

.applications-list { display: flex; flex-direction: column; gap: 1.25rem; }

.application-card { background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; gap: 1.5rem; align-items: center; }
.card-school-image { width: 100px; height: 75px; border-radius: 0.5rem; overflow: hidden; flex-shrink: 0; }
.card-school-image img { width: 100%; height: 100%; object-fit: cover; }
.card-content { flex: 1; }
.card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.4rem; }
.school-name { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
.status-badge { font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: 600; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-under-review { background: #dbeafe; color: #1e40af; }
.status-offer { background: #d1fae5; color: #065f46; }
.status-rejected { background: #fee2e2; color: #991b1b; }

.school-location { font-size: 0.875rem; color: #64748b; margin-bottom: 0.75rem; }
.card-details { display: flex; gap: 2rem; }
.detail-item { display: flex; flex-direction: column; gap: 0.15rem; }
.detail-label { font-size: 0.75rem; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
.detail-value { font-size: 0.875rem; color: #374151; font-weight: 500; }

.card-actions { flex-shrink: 0; }
.btn-outline { background: white; color: #3B82F6; padding: 0.5rem 1.25rem; border: 1px solid #3B82F6; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { background: #eff6ff; }

.empty-state { text-align: center; padding: 4rem 2rem; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-state h3 { font-size: 1.25rem; color: #374151; margin-bottom: 0.5rem; }
.empty-state p { color: #64748b; margin-bottom: 1.5rem; }
.btn-primary { background: #3B82F6; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; display: inline-block; text-decoration: none; }
.btn-primary:hover { background: #1e40af; }

.footer { background: #1e293b; color: white; padding: 3rem 0 1rem; margin-top: auto; }
.footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
.footer h4 { margin-bottom: 1rem; }
.footer ul { list-style: none; padding: 0; }
.footer li { margin-bottom: 0.5rem; color: rgba(255,255,255,0.7); }
.footer a { color: rgba(255,255,255,0.7); text-decoration: none; }
.footer a:hover { color: white; }

@media (max-width: 768px) {
  .application-card { flex-direction: column; align-items: flex-start; }
  .card-details { flex-wrap: wrap; gap: 1rem; }
  .nav-links { gap: 0.75rem; }
}
</style>
