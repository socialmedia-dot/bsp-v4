<template>
  <div class="consultants-page">
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

    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <h1>👔 Consultant Directory</h1>
        <p>Connect with expert education consultants</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container main-content">
      <div class="content-wrapper">
        <!-- Sidebar Filters -->
        <aside class="filters-sidebar">
          <div class="filter-header">
            <h3>🔍 Filter Consultants</h3>
            <button class="btn-clear" @click="clearFilters">Clear All</button>
          </div>

          <!-- Search -->
          <div class="filter-group">
            <label>Search</label>
            <input v-model="searchQuery" type="text" placeholder="Consultant name..." class="filter-input" />
          </div>

          <!-- Country -->
          <div class="filter-group">
            <label>Country / City</label>
            <select v-model="selectedCountry" class="filter-select">
              <option value="">All Locations</option>
              <option value="Hong Kong">Hong Kong</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Singapore">Singapore</option>
              <option value="China">China</option>
            </select>
          </div>

          <!-- Specialization -->
          <div class="filter-group">
            <label>Specialization</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" value="UK Boarding Schools" v-model="selectedSpecs" /> UK Boarding Schools
              </label>
              <label class="checkbox-label">
                <input type="checkbox" value="University Admissions" v-model="selectedSpecs" /> University Admissions
              </label>
              <label class="checkbox-label">
                <input type="checkbox" value="Visa Assistance" v-model="selectedSpecs" /> Visa Assistance
              </label>
              <label class="checkbox-label">
                <input type="checkbox" value="Summer Programmes" v-model="selectedSpecs" /> Summer Programmes
              </label>
            </div>
          </div>
        </aside>

        <!-- Consultant Cards Grid -->
        <div class="consultants-grid-wrapper">
          <div class="results-bar">
            <span class="results-count">{{ filteredConsultants.length }} consultants found</span>
          </div>

          <div v-if="filteredConsultants.length > 0" class="consultants-grid">
            <NuxtLink
              v-for="consultant in filteredConsultants"
              :key="consultant.id"
              :to="`/consultant/${consultant.city}/${consultant.slug}`"
              class="consultant-card"
            >
              <div class="card-avatar">
                <div class="avatar-circle">{{ consultant.initials }}</div>
              </div>
              <div class="card-body">
                <h3 class="consultant-name">{{ consultant.name }}</h3>
                <p class="consultant-company">{{ consultant.company }}</p>
                <p class="consultant-location">📍 {{ consultant.city }}, {{ consultant.country }}</p>
                <div class="consultant-tags">
                  <span v-for="spec in consultant.specializations" :key="spec" class="tag">{{ spec }}</span>
                </div>
                <div class="consultant-bio">{{ consultant.bio }}</div>
              </div>
            </NuxtLink>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>No consultants match your filters</h3>
            <p>Try adjusting your search criteria</p>
            <button class="btn btn-primary" @click="clearFilters">Clear Filters</button>
          </div>
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

const searchQuery = ref('')
const selectedCountry = ref('')
const selectedSpecs = ref([])

const mockConsultants = [
  {
    id: 1,
    name: 'Sarah Chen',
    slug: 'sarah-chen',
    company: 'UK Education Partners',
    city: 'Hong Kong',
    country: 'Hong Kong',
    specializations: ['UK Boarding Schools', 'University Admissions', 'Visa Assistance'],
    bio: 'Over 10 years of experience placing students in top UK boarding schools and Russell Group universities.',
    initials: 'SC'
  },
  {
    id: 2,
    name: 'James Wong',
    slug: 'james-wong',
    company: 'Global Scholars Advisory',
    city: 'Singapore',
    country: 'Singapore',
    specializations: ['UK Boarding Schools', 'Summer Programmes'],
    bio: 'Former admissions officer at a top UK boarding school, now helping families navigate the application process.',
    initials: 'JW'
  },
  {
    id: 3,
    name: 'Emily Zhang',
    slug: 'emily-zhang',
    company: 'Bridge Education Consulting',
    city: 'Shanghai',
    country: 'China',
    specializations: ['University Admissions', 'Visa Assistance', 'Summer Programmes'],
    bio: 'Specialises in helping Chinese students gain admission to top UK universities including Oxford and Cambridge.',
    initials: 'EZ'
  },
  {
    id: 4,
    name: 'Michael Brown',
    slug: 'michael-brown',
    company: 'British Education Network',
    city: 'London',
    country: 'United Kingdom',
    specializations: ['UK Boarding Schools', 'University Admissions'],
    bio: 'Based in London with direct connections to over 100 UK schools. Fluent in English and Mandarin.',
    initials: 'MB'
  }
]

const filteredConsultants = computed(() => {
  let result = [...mockConsultants]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    )
  }

  if (selectedCountry.value) {
    result = result.filter(c => c.country === selectedCountry.value || c.city === selectedCountry.value)
  }

  if (selectedSpecs.value.length > 0) {
    result = result.filter(c =>
      selectedSpecs.value.some(spec => c.specializations.includes(spec))
    )
  }

  return result
})

const clearFilters = () => {
  searchQuery.value = ''
  selectedCountry.value = ''
  selectedSpecs.value = []
}
</script>

<style scoped>
.consultants-page { min-height: 100vh; display: flex; flex-direction: column; }

.navbar { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.navbar-content { display: flex; align-items: center; justify-content: space-between; padding-top: 0.8rem; padding-bottom: 0.8rem; }
.logo { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; }
.logo-img { height: 50px; width: auto; border-radius: 4px; }
.nav-links { display: flex; list-style: none; gap: 2rem; margin: 0; padding: 0; }
.nav-links a { text-decoration: none; color: #374151; font-weight: 500; }
.nav-links .btn-primary { background: #3B82F6; color: white; padding: 0.5rem 1.25rem; border-radius: 0.5rem; }

.page-header { background: linear-gradient(135deg, #3B82F6 0%, #7c3aed 100%); color: white; padding: 3rem 0; text-align: center; }
.page-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
.page-header p { font-size: 1.1rem; opacity: 0.9; }

.main-content { padding: 2rem 0; flex: 1; }
.content-wrapper { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }

.filters-sidebar { background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); height: fit-content; position: sticky; top: 80px; }
.filter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.filter-header h3 { font-size: 1rem; color: #1e293b; }
.btn-clear { background: none; border: none; color: #3B82F6; font-size: 0.875rem; cursor: pointer; }
.btn-clear:hover { text-decoration: underline; }

.filter-group { margin-bottom: 1.5rem; }
.filter-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
.filter-input, .filter-select { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; }
.filter-input:focus, .filter-select:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.checkbox-group { display: flex; flex-direction: column; gap: 0.5rem; }
.checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #374151; cursor: pointer; }

.results-bar { margin-bottom: 1.5rem; }
.results-count { font-size: 0.95rem; color: #64748b; font-weight: 500; }

.consultants-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }

.consultant-card { background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-decoration: none; color: inherit; display: block; transition: transform 0.2s, box-shadow 0.2s; }
.consultant-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }

.card-avatar { margin-bottom: 1rem; }
.avatar-circle { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #3B82F6, #7c3aed); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; }

.consultant-name { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 0.2rem; }
.consultant-company { font-size: 0.875rem; color: #3B82F6; font-weight: 600; margin-bottom: 0.4rem; }
.consultant-location { font-size: 0.875rem; color: #64748b; margin-bottom: 0.75rem; }
.consultant-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
.tag { background: #f1f5f9; color: #475569; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 0.375rem; }
.consultant-bio { font-size: 0.875rem; color: #64748b; line-height: 1.5; }

.empty-state { text-align: center; padding: 4rem 2rem; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-state h3 { font-size: 1.25rem; color: #374151; margin-bottom: 0.5rem; }
.empty-state p { color: #64748b; margin-bottom: 1.5rem; }
.btn-primary { background: #3B82F6; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; display: inline-block; }
.btn-primary:hover { background: #1e40af; }

.footer { background: #1e293b; color: white; padding: 3rem 0 1rem; margin-top: auto; }
.footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
.footer h4 { margin-bottom: 1rem; }
.footer ul { list-style: none; padding: 0; }
.footer li { margin-bottom: 0.5rem; color: rgba(255,255,255,0.7); }
.footer a { color: rgba(255,255,255,0.7); text-decoration: none; }
.footer a:hover { color: white; }

@media (max-width: 768px) {
  .content-wrapper { grid-template-columns: 1fr; }
  .filters-sidebar { position: static; }
  .nav-links { gap: 1rem; }
}
</style>
