<template>
  <div class="bsp-dashboard">
    <div class="dashboard-body">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">Role</div>
            <div class="role-switcher">
              <button
                v-for="r in ['manager', 'staff']"
                :key="r"
                :class="['role-btn', { active: currentRole === r }]"
                @click="currentRole = r"
              >
                {{ r === 'manager' ? 'Manager' : 'Staff' }}
              </button>
            </div>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Operations</div>
            <NuxtLink to="/operations/dashboard" class="nav-item">
              <span class="nav-icon">📊</span>
              <span>Overview</span>
            </NuxtLink>
          </div>

          <div v-if="can('applications')" class="nav-section">
            <div class="nav-section-title">Applications</div>
            <NuxtLink to="/operations/applications" class="nav-item">
              <span class="nav-icon">📋</span>
              <span>New Account Applications</span>
            </NuxtLink>
          </div>

          <div v-if="can('users')" class="nav-section">
            <div class="nav-section-title">User Directory</div>
            <NuxtLink to="/operations/users" class="nav-item">
              <span class="nav-icon">👥</span>
              <span>All Users</span>
            </NuxtLink>
          </div>

          <div v-if="can('payments')" class="nav-section">
            <div class="nav-section-title">Finance</div>
            <NuxtLink to="/operations/payments" class="nav-item">
              <span class="nav-icon">💳</span>
              <span>Payments</span>
            </NuxtLink>
            <NuxtLink to="/operations/promotions" class="nav-item active">
              <span class="nav-icon">🎟️</span>
              <span>Promo Codes</span>
            </NuxtLink>
            <NuxtLink v-if="can('reports')" to="/operations/reports" class="nav-item">
              <span class="nav-icon">📈</span>
              <span>Reports</span>
            </NuxtLink>
          </div>

          <div v-if="can('notifications') || can('resetPasswords')" class="nav-section">
            <div class="nav-section-title">Support Tools</div>
            <NuxtLink v-if="can('notifications')" to="/operations/notifications" class="nav-item">
              <span class="nav-icon">📢</span>
              <span>Send Notifications</span>
            </NuxtLink>
            <NuxtLink v-if="can('resetPasswords')" to="/operations/reset-passwords" class="nav-item">
              <span class="nav-icon">🔑</span>
              <span>Password Resets</span>
            </NuxtLink>
          </div>
        </nav>
      </aside>

      <main class="main-content">
        <div class="page-header">
          <div class="page-title-area">
            <h1 class="page-title">🎟️ Promo Code Management</h1>
            <p class="page-subtitle">Create and manage discount codes for membership payments</p>
          </div>
          <button class="btn btn-primary" @click="openCreateModal">+ New Promo Code</button>
        </div>

        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card">
            <span class="summary-label">Active Codes</span>
            <span class="summary-value">{{ activeCodes }}</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Inactive</span>
            <span class="summary-value">{{ inactiveCodes }}</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Total Uses</span>
            <span class="summary-value">{{ totalUses }}</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Expiring Soon</span>
            <span class="summary-value" :class="{ pending: expiringSoon > 0 }">{{ expiringSoon }}</span>
          </div>
        </div>

        <!-- Filters & Search -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-actions">
              <input
                v-model="search"
                type="text"
                class="search-input"
                placeholder="Search by code or description..."
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

          <!-- Table -->
          <div class="table-wrapper">
            <div class="table-header-row">
              <div class="th">Code</div>
              <div class="th">Type</div>
              <div class="th">Value</div>
              <div class="th">Applies To</div>
              <div class="th">Uses</div>
              <div class="th">Expires</div>
              <div class="th">Status</div>
              <div class="th">Actions</div>
            </div>
            <div v-if="filteredPromos.length === 0" class="empty-state">
              No promo codes found
            </div>
            <div v-for="promo in filteredPromos" :key="promo.id" class="table-row">
              <div class="td">
                <span class="code-badge">{{ promo.code }}</span>
              </div>
              <div class="td">
                <span :class="['role-tag', promo.type === 'percentage' ? '' : 'type-fixed']">
                  {{ promo.type === 'percentage' ? '% Percentage' : '£ Fixed' }}
                </span>
              </div>
              <div class="td">
                <span class="value-text">
                  {{ promo.type === 'percentage' ? promo.value + '%' : '£' + promo.value }}
                  <span v-if="promo.maxDiscount" class="max-cap"> (max £{{ promo.maxDiscount }})</span>
                </span>
              </div>
              <div class="td">
                <span v-for="type in promo.appliesTo" :key="type" class="applies-tag">{{ type }}</span>
              </div>
              <div class="td">
                <span class="uses-count">{{ promo.uses }}</span>
                <span class="uses-max"> / {{ promo.maxUses === 999 ? 'Unlimited' : promo.maxUses }}</span>
              </div>
              <div class="td">
                <span :class="getExpiryClass(promo.expires)">{{ formatExpiry(promo.expires) }}</span>
              </div>
              <div class="td">
                <span :class="['status-badge', 'status-' + promo.status]">{{ promo.status }}</span>
              </div>
              <div class="td action-cell">
                <button class="btn-action" title="Edit" @click="openEditModal(promo)">✏️</button>
                <button class="btn-action" title="Toggle Status" @click="toggleStatus(promo)">🔒</button>
                <button class="btn-action btn-danger" title="Delete" @click="deletePromo(promo.id)">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingPromo ? 'Edit' : 'Create' }} Promo Code</h2>
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
                {{ type }}
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
const { $router } = useNuxtApp()
const search = ref('')
const filterStatus = ref('')
const filterType = ref('')
const showModal = ref(false)
const editingPromo = ref(null)
const currentRole = ref('manager')

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
    const matchSearch = !search.value || p.code.toLowerCase().includes(search.value.toLowerCase())
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

function can(perm) {
  return currentRole.value === 'manager'
}

function formatExpiry(date) {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getExpiryClass(date) {
  if (!date) return 'expiry-none'
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
:root { --bsp-primary: #212E54; --bsp-secondary: #3b82f6; --bsp-accent: #C1AA78; --bsp-dark: #1e293b; --bsp-light: #f8fafc; --bsp-success: #10b981; --bsp-danger: #ef4444; }
* { margin: 0; padding: 0; box-sizing: border-box; }
.bsp-dashboard { min-height: 100vh; background: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; }
.dashboard-body { display: flex; min-height: 100vh; }

.sidebar { width: 260px; background: white; border-right: 1px solid #e2e8f0; padding: 1.5rem 0; flex-shrink: 0; position: sticky; top: 0; height: 100vh; max-height: 100vh; overflow-y: auto; }
.nav-section { margin-bottom: 1.5rem; }
.nav-section-title { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; padding: 0 1.5rem; margin-bottom: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.5rem; color: #64748b; text-decoration: none; font-weight: 500; font-size: 0.9rem; transition: all 0.2s; border-left: 3px solid transparent; }
.nav-item:hover { background: #f1f5f9; color: #212E54; }
.nav-item.active { background: #eff6ff; color: #212E54; border-left-color: #3b82f6; font-weight: 600; }
.nav-icon { font-size: 1.1rem; }

.role-switcher { display: flex; gap: 0.5rem; padding: 0 1.5rem; margin-bottom: 0.5rem; }
.role-btn { flex: 1; padding: 0.5rem; border: 1px solid #e2e8f0; background: white; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; color: #64748b; transition: all 0.2s; }
.role-btn:hover { border-color: #3b82f6; color: #212E54; }
.role-btn.active { background: #212E54; color: white; border-color: #212E54; }

.main-content { flex: 1; padding: 1.5rem 2rem; overflow-y: auto; min-width: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #212E54; margin-bottom: 0.25rem; }
.page-subtitle { font-size: 0.9rem; color: #64748b; }

.summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.summary-card { background: white; padding: 1.25rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); display: flex; flex-direction: column; }
.summary-label { font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; }
.summary-value { font-size: 1.5rem; font-weight: 700; color: #212E54; }
.summary-value.pending { color: #f59e0b; }

.panel { background: white; border-radius: 10px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
.panel-actions { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
.search-input { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.85rem; width: 220px; min-width: 0; }
.search-input:focus { outline: none; border-color: #3b82f6; }
.filter-select { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.85rem; background: white; cursor: pointer; min-width: 0; }

.table-wrapper { overflow-x: auto; }
.table-header-row { display: flex; background: #f8fafc; border-radius: 6px; padding: 0.75rem 1rem; gap: 0.5rem; margin-bottom: 0.5rem; }
.table-row { display: flex; padding: 0.875rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; gap: 0.5rem; align-items: center; }
.table-row:last-child { border-bottom: none; }
.th { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; flex: 1; min-width: 80px; }
.th:first-child { min-width: 100px; }
.td { flex: 1; min-width: 80px; display: flex; align-items: center; }
.td:first-child { min-width: 100px; }

.code-badge { background: #f1f5f9; border-radius: 5px; color: #1e3a5f; font-family: monospace; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; padding: 3px 8px; white-space: nowrap; }
.role-tag { background: #eff6ff; color: #3b82f6; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
.role-tag.type-fixed { background: #dcfce7; color: #166534; }
.applies-tag { background: #f1f5f9; border-radius: 3px; color: #475569; font-size: 0.75rem; padding: 2px 6px; margin-right: 4px; white-space: nowrap; }
.value-text { font-weight: 600; color: #1e293b; }
.max-cap { color: #94a3b8; font-size: 0.8rem; font-weight: 400; }
.uses-count { color: #1e3a5f; font-weight: 700; }
.uses-max { color: #94a3b8; font-size: 0.8rem; }

.expiry-expired { color: #dc2626; font-weight: 600; }
.expiry-critical { color: #ea580c; font-weight: 600; }
.expiry-warning { color: #d97706; }
.expiry-ok { color: #16a34a; }
.expiry-none { color: #94a3b8; }

.status-badge { padding: 0.2rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; white-space: nowrap; }
.status-active { background: #d1fae5; color: #047857; }
.status-inactive { background: #f1f5f9; color: #64748b; }

.action-cell { gap: 0.25rem; }
.btn-action { background: none; border: none; font-size: 1rem; cursor: pointer; padding: 0.35rem; border-radius: 4px; }
.btn-action:hover { background: #f1f5f9; }
.btn-action.btn-danger:hover { background: #fee2e2; }
.empty-state { text-align: center; padding: 2rem; color: #64748b; }

.btn { padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: none; transition: all 0.2s; }
.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }
.btn-secondary { background: #f1f5f9; color: #374151; border: 1px solid #e2e8f0; }
.btn-secondary:hover { background: #e2e8f0; }
.btn-danger { background: #dc2626; color: white; }
.btn-danger:hover { background: #b91c1c; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-box { background: white; border-radius: 12px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #e2e8f0; }
.modal-title { font-size: 1.1rem; font-weight: 600; }
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
.preview-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; color: #0369a1; font-size: 0.85rem; padding: 0.75rem 1rem; }

@media (max-width: 768px) {
  .sidebar { display: none; }
  .summary-cards { grid-template-columns: 1fr; gap: 0.75rem; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .page-header .btn { width: 100%; }
  .panel-header { flex-direction: column; align-items: stretch; gap: 0.75rem; }
  .panel-actions { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
  .filter-select { width: 100%; }
  .form-row { grid-template-columns: 1fr; }
  .table-header-row { display: none; }
  .table-row { flex-direction: column; gap: 0.5rem; background: white; border-radius: 10px; padding: 1rem; margin-bottom: 0.75rem; border: 1px solid #e2e8f0; }
  .td { width: 100%; }
  .td::before { content: attr(data-label); font-weight: 600; color: #64748b; font-size: 0.7rem; text-transform: uppercase; margin-right: 0.5rem; }
}
</style>
