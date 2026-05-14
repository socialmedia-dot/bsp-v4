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
            <NuxtLink to="/operations/discounts" class="nav-item active">
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

        <!-- Filters -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">All Promo Codes</h3>
            <div class="panel-actions">
              <input v-model="searchQuery" type="text" placeholder="Search by code or description..." class="search-input" />
              <select v-model="filterStatus" class="filter-select">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
              <select v-model="filterType" class="filter-select">
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>

          <div class="users-table" style="overflow-x: auto;">
            <div class="table-header promo-grid">
              <span>Code</span>
              <span>Description</span>
              <span>Type</span>
              <span>Value</span>
              <span>Applies To</span>
              <span>Uses</span>
              <span>Expires</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            <div v-for="code in filteredCodes" :key="code.id" class="table-row promo-grid">
              <span data-label="Code"><span class="code-badge">{{ code.code }}</span></span>
              <span data-label="Description" class="user-email">{{ code.description }}</span>
              <span data-label="Type"><span class="role-tag" :class="'type-' + code.type">{{ code.type === 'percentage' ? '% Percentage' : '£ Fixed' }}</span></span>
              <span data-label="Value" class="user-name">{{ code.type === 'percentage' ? code.value + '%' : '£' + code.value }}<span v-if="code.maxDiscount" class="max-cap"> (max £{{ code.maxDiscount }})</span></span>
              <span data-label="Applies To">
                <span v-for="t in code.appliesTo" :key="t" class="applies-tag">{{ t }}</span>
              </span>
              <span data-label="Uses"><span class="uses-count">{{ code.used }}</span><span class="uses-max"> / {{ code.maxUses === Infinity ? 'Unlimited' : code.maxUses }}</span></span>
              <span data-label="Expires" :class="'expiry-' + getExpiryClass(code.expires)">{{ formatDate(code.expires) }}</span>
              <span data-label="Status"><span class="status-badge" :class="'status-' + code.status">{{ code.status }}</span></span>
              <span data-label="Actions" class="action-cell">
                <button class="btn-action" @click="editCode(code)" title="Edit">✏️</button>
                <button class="btn-action" @click="toggleStatus(code)" :title="code.status === 'active' ? 'Deactivate' : 'Activate'">{{ code.status === 'active' ? '🔒' : '🔓' }}</button>
                <button class="btn-action btn-danger" @click="deleteCode(code.id)" title="Delete">🗑️</button>
              </span>
            </div>
            <div v-if="filteredCodes.length === 0" class="empty-state">
              <p>No promo codes found</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingId ? '✏️ Edit' : '🎟️ New' }} Promo Code</h2>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Code *</label>
            <input v-model="form.code" type="text" class="form-input" placeholder="e.g. SUMMER20" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <input v-model="form.description" type="text" class="form-input" placeholder="e.g. Summer launch – 20% off" />
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
              <input v-model.number="form.value" type="number" class="form-input" :placeholder="form.type === 'percentage' ? 'e.g. 20' : 'e.g. 50'" />
            </div>
          </div>
          <div class="form-group" v-if="form.type === 'percentage'">
            <label>Max Discount Cap (£)</label>
            <input v-model.number="form.maxDiscount" type="number" class="form-input" placeholder="Optional max amount" />
          </div>
          <div class="form-group">
            <label>Applies To *</label>
            <div class="checkbox-group">
              <label class="checkbox-label"><input type="checkbox" v-model="form.appliesTo" value="School" /> School</label>
              <label class="checkbox-label"><input type="checkbox" v-model="form.appliesTo" value="Consultant" /> Consultant</label>
              <label class="checkbox-label"><input type="checkbox" v-model="form.appliesTo" value="Personal" /> Personal</label>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Max Uses</label>
              <input v-model.number="form.maxUses" type="number" class="form-input" placeholder="Leave empty for unlimited" />
            </div>
            <div class="form-group">
              <label>Expires</label>
              <input v-model="form.expires" type="date" class="form-input" />
            </div>
          </div>
          <div class="preview-box" v-if="form.code">
            Preview: <span class="code-badge">{{ form.code }}</span> — {{ form.type === 'percentage' ? form.value + '% off' : '£' + form.value + ' off' }}
            {{ form.appliesTo.length > 0 ? 'for ' + form.appliesTo.join(', ') : '' }}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" @click="saveCode">{{ editingId ? 'Save Changes' : 'Create Code' }}</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal-box modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">🗑️ Delete Promo Code</h2>
          <button class="modal-close" @click="showDeleteConfirm = false">×</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>{{ codeToDelete?.code }}</strong>?</p>
          <p class="user-email">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteConfirm = false">Cancel</button>
          <button class="btn btn-danger" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { setMeta } = useSEO()
setMeta({
  title: 'Promo Codes — BSP Operations Portal',
  description: 'Manage discount codes for BSP membership payments',
  path: '/operations/discounts',
  type: 'website'
})

const currentRole = ref<'manager' | 'staff'>('manager')
const permissions: Record<string, string[]> = {
  manager: ['applications', 'approveApplications', 'users', 'manageUsers', 'payments', 'reports', 'notifications'],
  staff: ['applications', 'reviewApplications', 'users', 'viewUsers', 'notifications', 'resetPasswords'],
}
const can = (permission: string): boolean => {
  return permissions[currentRole.value]?.includes(permission) || false
}

interface PromoCode {
  id: number
  code: string
  description: string
  type: 'percentage' | 'fixed'
  value: number
  maxDiscount?: number
  appliesTo: string[]
  used: number
  maxUses: number
  expires: string
  status: 'active' | 'inactive' | 'expired'
}

const promoCodes = ref<PromoCode[]>([
  { id: 1, code: 'SUMMER20', description: 'Summer launch – 20% off all memberships', type: 'percentage', value: 20, maxDiscount: 100, appliesTo: ['School', 'Consultant', 'Personal'], used: 12, maxUses: 100, expires: '2026-08-31', status: 'active' },
  { id: 2, code: 'FREE2026', description: '100% off — partner promotion', type: 'percentage', value: 100, appliesTo: ['Consultant'], used: 3, maxUses: 50, expires: '2026-12-31', status: 'active' },
  { id: 3, code: 'FLAT50', description: '£50 off annual fee', type: 'fixed', value: 50, appliesTo: ['School'], used: 7, maxUses: Infinity, expires: '', status: 'active' },
  { id: 4, code: 'EARLYBIRD', description: 'Early bird – 15% off', type: 'percentage', value: 15, maxDiscount: 75, appliesTo: ['School', 'Consultant'], used: 45, maxUses: 200, expires: '2026-06-30', status: 'active' },
  { id: 5, code: 'EXPIRED10', description: 'Expired code (test)', type: 'percentage', value: 10, appliesTo: ['School'], used: 0, maxUses: Infinity, expires: '2026-01-31', status: 'inactive' },
])

const searchQuery = ref('')
const filterStatus = ref('all')
const filterType = ref('all')

const activeCodes = computed(() => promoCodes.value.filter(c => c.status === 'active').length)
const inactiveCodes = computed(() => promoCodes.value.filter(c => c.status !== 'active').length)
const totalUses = computed(() => promoCodes.value.reduce((sum, c) => sum + c.used, 0))
const expiringSoon = computed(() => {
  const soon = new Date(); soon.setDate(soon.getDate() + 14)
  return promoCodes.value.filter(c => {
    if (!c.expires || c.status !== 'active') return false
    const d = new Date(c.expires)
    return d <= soon && d >= new Date()
  }).length
})

const filteredCodes = computed(() => {
  let result = promoCodes.value
  if (filterStatus.value !== 'all') {
    result = result.filter(c => c.status === filterStatus.value)
  }
  if (filterType.value !== 'all') {
    result = result.filter(c => c.type === filterType.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
  }
  return result
})

const getExpiryClass = (expires: string): string => {
  if (!expires) return 'none'
  const d = new Date(expires)
  const now = new Date()
  const days = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'expired'
  if (days <= 7) return 'critical'
  if (days <= 30) return 'warning'
  return 'ok'
}

const formatDate = (date: string): string => {
  if (!date) return 'Never'
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const showModal = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ code: '', description: '', type: 'percentage' as 'percentage' | 'fixed', value: 0, maxDiscount: undefined as number | undefined, appliesTo: [] as string[], maxUses: undefined as number | undefined, expires: '' })

const openCreateModal = () => {
  editingId.value = null
  form.value = { code: '', description: '', type: 'percentage', value: 0, maxDiscount: undefined, appliesTo: [], maxUses: undefined, expires: '' }
  showModal.value = true
}

const editCode = (code: PromoCode) => {
  editingId.value = code.id
  form.value = { code: code.code, description: code.description, type: code.type, value: code.value, maxDiscount: code.maxDiscount, appliesTo: [...code.appliesTo], maxUses: code.maxUses === Infinity ? undefined : code.maxUses, expires: code.expires }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
}

const saveCode = () => {
  if (!form.value.code || form.value.value <= 0 || form.value.appliesTo.length === 0) {
    alert('Please fill in all required fields')
    return
  }
  if (editingId.value) {
    const c = promoCodes.value.find(x => x.id === editingId.value)
    if (c) {
      Object.assign(c, { ...form.value, maxUses: form.value.maxUses || Infinity })
    }
  } else {
    promoCodes.value.push({
      id: Date.now(),
      code: form.value.code.toUpperCase(),
      description: form.value.description,
      type: form.value.type,
      value: form.value.value,
      maxDiscount: form.value.maxDiscount,
      appliesTo: form.value.appliesTo,
      used: 0,
      maxUses: form.value.maxUses || Infinity,
      expires: form.value.expires,
      status: 'active'
    })
  }
  closeModal()
}

const toggleStatus = (code: PromoCode) => {
  code.status = code.status === 'active' ? 'inactive' : 'active'
}

const showDeleteConfirm = ref(false)
const codeToDelete = ref<PromoCode | null>(null)

const deleteCode = (id: number) => {
  codeToDelete.value = promoCodes.value.find(c => c.id === id) || null
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (codeToDelete.value) {
    promoCodes.value = promoCodes.value.filter(c => c.id !== codeToDelete.value!.id)
  }
  showDeleteConfirm.value = false
  codeToDelete.value = null
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

.main-content { flex: 1; padding: 1.5rem 2rem; overflow-y: auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #212E54; margin-bottom: 0.25rem; }
.page-subtitle { font-size: 0.9rem; color: #64748b; }

.summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.summary-card { background: white; padding: 1.25rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); display: flex; flex-direction: column; }
.summary-label { font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; }
.summary-value { font-size: 1.5rem; font-weight: 700; color: #212E54; }
.summary-value.pending { color: #f59e0b; }

.panel { background: white; border-radius: 10px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; gap: 0.75rem; }
.panel-title { font-size: 1rem; font-weight: 600; color: #1e293b; }
.panel-actions { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
.search-input { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.85rem; width: 220px; }
.search-input:focus { outline: none; border-color: #3b82f6; }
.filter-select { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.85rem; background: white; cursor: pointer; }

.users-table { display: flex; flex-direction: column; overflow-x: auto; }
.promo-grid {
  display: grid;
  grid-template-columns: minmax(100px, 1fr) 2.5fr minmax(110px, 1fr) minmax(140px, 1fr) 1.5fr minmax(100px, 1fr) minmax(120px, 1fr) minmax(100px, 1fr) minmax(130px, 1fr);
  gap: 1rem;
  align-items: center;
}
.table-header { background: #f8fafc; border-radius: 6px; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
.table-row { padding: 0.875rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; }
.table-row:last-child { border-bottom: none; }
.user-cell { display: flex; align-items: center; gap: 0.75rem; font-weight: 500; }
.user-avatar { font-size: 1.25rem; }
.user-name { font-weight: 600; }
.user-email { color: #64748b; font-size: 0.85rem; }
.max-cap { color: #94a3b8; font-size: 0.8rem; font-weight: 400; }

.code-badge { background: #f1f5f9; border-radius: 5px; color: #1e3a5f; font-family: monospace; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; padding: 3px 8px; }
.role-tag { background: #eff6ff; color: #3b82f6; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.role-tag.type-fixed { background: #dcfce7; color: #166534; }
.applies-tag { background: #f1f5f9; border-radius: 3px; color: #475569; font-size: 0.75rem; padding: 2px 6px; margin-right: 4px; }
.uses-count { color: #1e3a5f; font-weight: 700; }
.uses-max { color: #94a3b8; font-size: 0.8rem; }

.expiry-expired { color: #dc2626; font-weight: 600; }
.expiry-critical { color: #ea580c; font-weight: 600; }
.expiry-warning { color: #d97706; }
.expiry-ok { color: #16a34a; }
.expiry-none { color: #94a3b8; }

.status-badge { padding: 0.2rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-active { background: #d1fae5; color: #047857; }
.status-inactive { background: #f1f5f9; color: #64748b; }
.status-expired { background: #fee2e2; color: #b91c1c; }

.action-cell { display: flex; gap: 0.35rem; }
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
.modal-sm { max-width: 380px; }
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
  .summary-card { padding: 1rem; flex-direction: row; align-items: center; justify-content: space-between; }
  .summary-label { margin-bottom: 0; font-size: 0.85rem; }
  .summary-value { font-size: 1.25rem; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .page-header .btn { width: 100%; }
  .panel-header { flex-direction: column; align-items: stretch; gap: 0.75rem; }
  .panel-actions { flex-direction: column; align-items: stretch; gap: 0.5rem; }
  .search-input { width: 100%; }
  .filter-select { width: 100%; }
  .form-row { grid-template-columns: 1fr; }

  /* Mobile card table */
  .users-table { overflow-x: visible; }
  .table-header { display: none; }
  .promo-grid,
  .table-row {
    display: grid !important;
    grid-template-columns: 1fr !important;
    min-width: auto !important;
    background: white;
    border-radius: 10px;
    padding: 1rem;
    margin-bottom: 0.75rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    gap: 0.5rem !important;
  }
  .table-row > span {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 0;
  }
  .table-row > span::before {
    content: attr(data-label);
    font-weight: 600;
    color: #64748b;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    min-width: 80px;
    flex-shrink: 0;
  }
  .table-row > span[data-label="Actions"]::before { display: none; }
  .table-row > span[data-label="Actions"] { justify-content: flex-end; border-top: 1px solid #f1f5f9; padding-top: 0.5rem; margin-top: 0.25rem; }
}
</style>