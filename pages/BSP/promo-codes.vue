<template>
  <div class="bsp-dashboard">
    <div class="dashboard-body">
      <!-- Sidebar Navigation -->
      <BspSidebar active="promo-codes" />

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Page Header -->
        <div class="page-header">
          <div class="page-title-area">
            <h1 class="page-title">🎟️ Promo Code Management</h1>
            <p class="page-subtitle">Create and manage discount codes for membership payments</p>
          </div>
          <div class="page-actions">
            <NuxtLink to="/BSP/settings/fees" class="link-back">← Back to Fee Settings</NuxtLink>
            <button class="btn btn-primary" @click="openCreateModal">+ New Promo Code</button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-icon summary-icon-green">🎟️</div>
            <div class="summary-info">
              <div class="summary-value">{{ activeCodes }}</div>
              <div class="summary-label">Active Codes</div>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon summary-icon-gray">😴</div>
            <div class="summary-info">
              <div class="summary-value">{{ inactiveCodes }}</div>
              <div class="summary-label">Inactive</div>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon summary-icon-blue">✅</div>
            <div class="summary-info">
              <div class="summary-value">{{ totalUses }}</div>
              <div class="summary-label">Total Uses</div>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon summary-icon-orange">⚠️</div>
            <div class="summary-info">
              <div class="summary-value">{{ expiringSoon }}</div>
              <div class="summary-label">Expiring Soon</div>
            </div>
          </div>
        </div>

        <!-- Promo Codes Table Card -->
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">All Promo Codes</h2>
            <div class="card-controls">
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Search by code..."
              />
              <select v-model="filterStatus" class="filter-select">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select v-model="filterType" class="filter-select">
                <option value="">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Applies To</th>
                  <th>Uses</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredPromos.length === 0">
                  <td colspan="8" class="empty-cell">No promo codes found</td>
                </tr>
                <tr v-for="promo in filteredPromos" :key="promo.id">
                  <td><span class="code-badge">{{ promo.code }}</span></td>
                  <td>
                    <span :class="['type-badge', 'type-' + promo.type]">
                      {{ promo.type === 'percentage' ? '% Percentage' : '£ Fixed' }}
                    </span>
                  </td>
                  <td>
                    <span class="value-text">
                      {{ promo.type === 'percentage' ? promo.value + '%' : '£' + promo.value }}
                      <span v-if="promo.maxDiscount" class="max-cap">(max £{{ promo.maxDiscount }})</span>
                    </span>
                  </td>
                  <td>
                    <span v-for="type in promo.appliesTo" :key="type" class="applies-tag">{{ type }}</span>
                  </td>
                  <td>
                    <span class="uses-count">{{ promo.uses }}</span>
                    <span class="uses-sep"> / </span>
                    <span class="uses-max">{{ promo.maxUses === 999 ? '∞' : promo.maxUses }}</span>
                  </td>
                  <td>
                    <span :class="getExpiryClass(promo.expires)">{{ formatExpiry(promo.expires) }}</span>
                  </td>
                  <td>
                    <span :class="['status-badge', 'status-' + promo.status]">{{ promo.status }}</span>
                  </td>
                  <td>
                    <button class="action-btn" @click="openEditModal(promo)" title="Edit">✏️</button>
                    <button class="action-btn" @click="toggleStatus(promo)" :title="promo.status === 'active' ? 'Deactivate' : 'Activate'">
                      {{ promo.status === 'active' ? '🔒' : '🔓' }}
                    </button>
                    <button class="action-btn action-btn-danger" @click="deletePromo(promo.id)" title="Delete">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <h3>{{ editingPromo ? 'Edit' : 'Create' }} Promo Code</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Code *</label>
            <input v-model="form.code" type="text" class="form-input" placeholder="e.g. SUMMER20" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Type *</label>
              <select v-model="form.type" class="form-select">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (£)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Value *</label>
              <input v-model.number="form.value" type="number" class="form-input" placeholder="20" />
            </div>
          </div>
          <div v-if="form.type === 'percentage'" class="form-group">
            <label>Max Discount (£)</label>
            <input v-model.number="form.maxDiscount" type="number" class="form-input" placeholder="100" />
          </div>
          <div class="form-group">
            <label>Applies To *</label>
            <div class="checkbox-group">
              <label v-for="type in ['School', 'Consultant', 'Personal']" :key="type" class="checkbox-label">
                <input v-model="form.appliesTo" type="checkbox" :value="type" />
                <span>{{ type }}</span>
              </label>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Uses Limit</label>
              <input v-model.number="form.maxUses" type="number" class="form-input" placeholder="0 = unlimited" />
            </div>
            <div class="form-group">
              <label>Expires</label>
              <input v-model="form.expires" type="date" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status" class="form-select">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div v-if="previewText" class="preview-box">{{ previewText }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" @click="savePromo">{{ editingPromo ? 'Update' : 'Create' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const searchQuery = ref('')
const filterStatus = ref('')
const filterType = ref('')
const showModal = ref(false)
const editingPromo = ref(null)

const form = reactive({
  code: '',
  type: 'percentage',
  value: null,
  maxDiscount: null,
  appliesTo: [],
  maxUses: 0,
  expires: '',
  status: 'active'
})

const promos = ref([
  { id: 1, code: 'SUMMER20', type: 'percentage', value: 20, maxDiscount: 100, appliesTo: ['School', 'Consultant', 'Personal'], uses: 12, maxUses: 100, expires: '2026-08-31', status: 'active' },
  { id: 2, code: 'CONSULT50', type: 'percentage', value: 100, maxDiscount: null, appliesTo: ['Consultant'], uses: 3, maxUses: 50, expires: '2026-12-31', status: 'active' },
  { id: 3, code: 'FLAT50', type: 'fixed', value: 50, maxDiscount: null, appliesTo: ['School'], uses: 7, maxUses: 999, expires: null, status: 'active' },
  { id: 4, code: 'SCHOOL15', type: 'percentage', value: 15, maxDiscount: 75, appliesTo: ['School', 'Consultant'], uses: 45, maxUses: 200, expires: '2026-06-30', status: 'active' },
  { id: 5, code: 'NEWYEAR10', type: 'percentage', value: 10, maxDiscount: null, appliesTo: ['School'], uses: 0, maxUses: 999, expires: '2026-01-31', status: 'inactive' }
])

const activeCodes = computed(() => promos.value.filter(p => p.status === 'active').length)
const inactiveCodes = computed(() => promos.value.filter(p => p.status === 'inactive').length)
const totalUses = computed(() => promos.value.reduce((sum, p) => sum + p.uses, 0))
const expiringSoon = computed(() => {
  const thirty = new Date()
  thirty.setDate(thirty.getDate() + 30)
  return promos.value.filter(p => p.expires && new Date(p.expires) <= thirty && p.status === 'active').length
})

const filteredPromos = computed(() => {
  return promos.value.filter(p => {
    const matchSearch = !searchQuery.value || p.code.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = !filterStatus.value || p.status === filterStatus.value
    const matchType = !filterType.value || p.type === filterType.value
    return matchSearch && matchStatus && matchType
  })
})

const previewText = computed(() => {
  if (!form.code || !form.value) return ''
  const type = form.type === 'percentage' ? `${form.value}%` : `£${form.value}`
  const max = form.maxDiscount ? ` (max £${form.maxDiscount})` : ''
  const applies = form.appliesTo.length ? form.appliesTo.join(', ') : 'all users'
  return `${form.code} — ${type}${max} for ${applies}`
})

function formatExpiry(date) {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getExpiryClass(date) {
  if (!date) return 'expiry-never'
  const now = new Date()
  const exp = new Date(date)
  const diff = (exp - now) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'expiry-expired'
  if (diff < 7) return 'expiry-critical'
  if (diff < 30) return 'expiry-warning'
  return 'expiry-ok'
}

function openCreateModal() {
  editingPromo.value = null
  Object.assign(form, { code: '', type: 'percentage', value: null, maxDiscount: null, appliesTo: [], maxUses: 0, expires: '', status: 'active' })
  showModal.value = true
}

function openEditModal(promo) {
  editingPromo.value = promo
  Object.assign(form, { ...promo })
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingPromo.value = null
}

function savePromo() {
  if (!form.code || !form.value || !form.appliesTo.length) return
  if (editingPromo.value) {
    const idx = promos.value.findIndex(p => p.id === editingPromo.value.id)
    if (idx !== -1) promos.value[idx] = { ...promos.value[idx], ...form }
  } else {
    promos.value.push({ id: Date.now(), ...form })
  }
  closeModal()
}

function toggleStatus(promo) {
  promo.status = promo.status === 'active' ? 'inactive' : 'active'
}

function deletePromo(id) {
  if (confirm('Delete this promo code?')) {
    promos.value = promos.value.filter(p => p.id !== id)
  }
}
</script>

<style scoped>
.bsp-dashboard { min-height: 100vh; background: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; }
.dashboard-body { display: flex; min-height: 100vh; }

/* Sidebar */

/* Main Content */
.main-content { flex: 1; min-height: 100vh; padding: 1.5rem 2rem; overflow-y: auto; min-width: 0; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #212E54; margin-bottom: 0.25rem; }
.page-subtitle { font-size: 0.9rem; color: #64748b; }
.page-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.link-back { color: #3b82f6; text-decoration: none; font-size: 0.875rem; font-weight: 500; }
.link-back:hover { text-decoration: underline; }

/* Summary Cards */
.summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.summary-card { background: white; padding: 1.25rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); display: flex; align-items: center; gap: 1rem; }
.summary-icon { font-size: 1.5rem; width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.summary-icon-green { background: #d1fae5; }
.summary-icon-gray { background: #f1f5f9; }
.summary-icon-blue { background: #dbeafe; }
.summary-icon-orange { background: #fed7aa; }
.summary-value { font-size: 1.5rem; font-weight: 700; color: #212E54; }
.summary-label { font-size: 0.85rem; color: #64748b; }

/* Content Card */
.content-card { background: white; border-radius: 10px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
.card-title { font-size: 1.1rem; font-weight: 600; color: #212E54; }
.card-controls { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
.search-input { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.85rem; width: 200px; }
.search-input:focus { outline: none; border-color: #3b82f6; }
.filter-select { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.85rem; background: white; cursor: pointer; }

/* Table */
.table-responsive { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.data-table th { text-align: left; padding: 0.75rem 0.5rem; border-bottom: 2px solid #e2e8f0; font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
.data-table td { padding: 0.875rem 0.5rem; border-bottom: 1px solid #f1f5f9; white-space: nowrap; vertical-align: middle; }
.data-table tbody tr:hover { background: #f8fafc; }
.empty-cell { text-align: center; padding: 2rem; color: #64748b; }

.code-badge { background: #f1f5f9; border-radius: 5px; color: #1e3a5f; font-family: monospace; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; padding: 3px 8px; }
.type-badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
.type-percentage { background: #eff6ff; color: #3b82f6; }
.type-fixed { background: #dcfce7; color: #166534; }
.applies-tag { background: #f1f5f9; border-radius: 3px; color: #475569; font-size: 0.75rem; padding: 2px 6px; margin-right: 4px; display: inline-block; }
.value-text { font-weight: 600; color: #1e293b; }
.max-cap { color: #94a3b8; font-size: 0.8rem; font-weight: 400; }
.uses-count { color: #1e3a5f; font-weight: 700; }
.uses-sep { color: #94a3b8; }
.uses-max { color: #94a3b8; font-size: 0.85rem; }

.expiry-expired { color: #dc2626; font-weight: 600; }
.expiry-critical { color: #ea580c; font-weight: 600; }
.expiry-warning { color: #d97706; }
.expiry-ok { color: #16a34a; }
.expiry-never { color: #94a3b8; }

.status-badge { padding: 0.2rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-active { background: #d1fae5; color: #047857; }
.status-inactive { background: #f1f5f9; color: #64748b; }

.action-btn { background: none; border: none; font-size: 1rem; cursor: pointer; padding: 0.35rem; border-radius: 4px; }
.action-btn:hover { background: #f1f5f9; }
.action-btn-danger:hover { background: #fee2e2; }

/* Buttons */
.btn { padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: none; transition: all 0.2s; }
.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }
.btn-secondary { background: #f1f5f9; color: #374151; border: 1px solid #e2e8f0; }
.btn-secondary:hover { background: #e2e8f0; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-box { background: white; border-radius: 12px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #e2e8f0; }
.modal-header h3 { font-size: 1.1rem; font-weight: 600; }
.modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
.modal-body { padding: 1.25rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.25rem; border-top: 1px solid #e2e8f0; }

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem; }
.form-input, .form-select { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem; }
.form-input:focus, .form-select:focus { outline: none; border-color: #3b82f6; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.checkbox-group { display: flex; flex-wrap: wrap; gap: 1rem; }
.checkbox-label { display: flex; align-items: center; gap: 0.35rem; font-size: 0.9rem; color: #334155; cursor: pointer; }
.preview-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; color: #0369a1; font-size: 0.85rem; padding: 0.75rem 1rem; margin-top: 0.5rem; }

@media (max-width: 768px) {
  
  .summary-cards { grid-template-columns: 1fr 1fr; }
  .page-header { flex-direction: column; }
  .card-header { flex-direction: column; align-items: stretch; }
  .card-controls { flex-direction: column; }
  .search-input { width: 100%; }
  .filter-select { width: 100%; }
  .form-row { grid-template-columns: 1fr; }
  .data-table th, .data-table td { white-space: normal; }
}
</style>
