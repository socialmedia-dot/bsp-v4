<template>
  <div class="container" style="margin-top: 2rem;">
    <div style="text-align: center; margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">🔍 Search UK Schools</h1>
      <p style="color: #64748b; margin-bottom: 0;">Find the perfect school for your child</p>
    </div>

    <!-- Search Form -->
    <div class="search-box" style="margin-bottom: 2rem;">
      <form class="search-form" @submit.prevent="performSearch">
        <div class="form-group">
          <label>School Name</label>
          <input v-model="filters.search" type="text" placeholder="e.g. Eton College..." />
        </div>
        <div class="form-group">
          <label>Location</label>
          <select v-model="filters.location">
            <option value="">All Regions</option>
            <option value="london">London</option>
            <option value="south-east">South East</option>
            <option value="south-west">South West</option>
            <option value="midlands">Midlands</option>
            <option value="north">Northern England</option>
            <option value="scotland">Scotland</option>
            <option value="wales">Wales</option>
          </select>
        </div>
        <div class="form-group">
          <label>Gender</label>
          <select v-model="filters.gender">
            <option value="">All</option>
            <option value="boys">Boys Only</option>
            <option value="girls">Girls Only</option>
            <option value="co-ed">Co-educational</option>
          </select>
        </div>
        <div class="form-group">
          <label>Boarding Type</label>
          <select v-model="filters.boardType">
            <option value="">All Types</option>
            <option value="full">Full Boarding</option>
            <option value="weekly">Weekly Boarding</option>
            <option value="day">Day School</option>
            <option value="flexi">Flexi Boarding</option>
          </select>
        </div>
        <div class="form-group" style="justify-content: flex-end;">
          <button type="submit" class="btn btn-primary" style="width: 100%;">Search Schools</button>
        </div>
      </form>
    </div>

    <!-- Results -->
    <div v-if="searched">
      <h2 style="margin-bottom: 1rem;">Search Results</h2>
      <p style="color: #64748b; margin-bottom: 1.5rem;">{{ schools.length }} schools found</p>
      
      <div class="school-grid">
        <div v-for="school in schools" :key="school.id" class="school-card">
          <h3>{{ school.name }}</h3>
          <p style="color: #64748b; font-size: 0.9rem;">📍 {{ school.location }}</p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
            <span style="background: #e0f2fe; color: #0369a1; padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">{{ school.type }}</span>
            <span style="background: #f0fdf4; color: #15803d; padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">{{ school.gender }}</span>
          </div>
          <p style="margin-top: 0.75rem; font-size: 0.85rem;">{{ school.description }}</p>
          <NuxtLink :to="`/school/${school.slug}`" class="btn btn-secondary" style="margin-top: 0.75rem; display: inline-block;">View Details →</NuxtLink>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else style="text-align: center; padding: 3rem;">
      <p style="font-size: 3rem; margin: 0 0 1rem;">🔍</p>
      <p style="color: #64748b;">Enter search criteria above to find UK schools</p>
    </div>
  </div>
</template>

<script setup>
const { setMeta } = useSEO()
setMeta({
  title: 'Search UK Schools',
  description: 'Search and compare UK independent schools by location, gender, boarding type, and more. Find the best fit for your child.',
  path: '/search',
  type: 'website'
})

const filters = ref({
  search: '',
  location: '',
  gender: '',
  boardType: ''
})

const searched = ref(false)
const schools = ref([])

const performSearch = () => {
  searched.value = true
  schools.value = [
    {
      id: 1,
      name: 'Westminster School',
      slug: 'westminster-school',
      location: 'London',
      type: 'Full Boarding',
      gender: 'Boys & Girls',
      description: 'One of the oldest and most prestigious schools in the UK, located in the heart of London.'
    },
    {
      id: 2,
      name: 'Eton College',
      slug: 'eton-college',
      location: 'Berkshire',
      type: 'Full Boarding',
      gender: 'Boys Only',
      description: 'World-famous boarding school founded in 1440, located near Windsor Castle.'
    },
    {
      id: 3,
      name: 'Cheltenham College',
      slug: 'cheltenham-college',
      location: 'Gloucestershire',
      type: 'Full Boarding',
      gender: 'Boys & Girls',
      description: 'Historic co-educational boarding school in the beautiful Cotswolds region.'
    }
  ]
}
</script>

<style scoped>
.search-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.school-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.school-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.school-card:hover {
  border-color: var(--bsp-primary, #212E54);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.school-card h3 {
  margin: 0 0 0.25rem;
  color: #1e293b;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (max-width: 768px) {
  .search-form {
    grid-template-columns: 1fr;
  }
}
</style>
