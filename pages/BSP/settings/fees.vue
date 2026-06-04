<template>
  <div class="bsp-dashboard">
    <div class="dashboard-body">
      <!-- Left Sidebar Navigation -->
      <BspSidebar active="fees" />

      <!-- Main Content Area -->
      <main class="main-content">
        <div class="page-header">
          <div class="page-title-area">
            <h1 class="page-title">💰 Annual Fee Settings</h1>
            <p class="page-subtitle">Manage membership fees for all user types</p>
            <NuxtLink to="/BSP/promo-codes" class="link-action">🎟️ Manage Promo Codes</NuxtLink>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" @click="openAddTier">+ Add New Price Version</button>
          </div>
        </div>

        <!-- Current Fee Tiers -->
        <div class="settings-section">
          <div class="section-header">
            <h2 class="section-title">Current Fee Tiers</h2>
          </div>
          <p class="section-desc">Prices shown below are active now. Each change creates a new version — old prices are kept in history for records.</p>

          <div class="fees-table-wrapper">
            <table class="fees-table">
              <thead>
                <tr>
                  <th>User Type</th>
                  <th>Annual Fee</th>
                  <th>Currency</th>
                  <th>Valid From</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tier in currentTiers" :key="tier.id">
                  <td>
                    <div class="type-cell">
                      <span class="type-badge" :class="'type-' + tier.userType">{{ tier.userType }}</span>
                      <span class="tier-name">{{ tier.name }}</span>
                    </div>
                  </td>
                  <td><span class="fee-amount">{{ tier.amount === 0 ? 'Free' : '£' + tier.amount }}</span></td>
                  <td>{{ tier.currency }}</td>
                  <td class="text-muted">{{ tier.validFrom || '—' }}</td>
                  <td>
                    <span class="status-pill" :class="tier.active ? 'active' : 'paused'">{{ tier.active ? 'Active' : 'Paused' }}</span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-action" @click="openEditTier(tier)" title="Edit / New Version">✏️</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="currentTiers.length === 0">
                  <td colspan="6" class="empty-state">
                    <div class="empty-content">
                      <span class="empty-icon">💰</span>
                      <p>No active fee tiers found</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pricing History -->
        <div class="settings-section">
          <div class="section-header">
            <h2 class="section-title">📜 Pricing History</h2>
          </div>
          <p class="section-desc">Past prices are kept for audit and reference. Invoices always record the price at the time of billing.</p>

          <div class="fees-table-wrapper">
            <table class="fees-table history-table">
              <thead>
                <tr>
                  <th>User Type</th>
                  <th>Annual Fee</th>
                  <th>Valid From</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tier in historyTiers" :key="tier.id">
                  <td>
                    <div class="type-cell">
                      <span class="type-badge" :class="'type-' + tier.userType">{{ tier.userType }}</span>
                      <span class="tier-name">{{ tier.name }}</span>
                    </div>
                  </td>
                  <td><span class="fee-amount">{{ tier.amount === 0 ? 'Free' : '£' + tier.amount }}</span></td>
                  <td class="text-muted">{{ tier.validFrom || '—' }}</td>
                  <td class="text-muted">{{ tier.validUntil || '—' }}</td>
                  <td>
                    <span class="status-pill expired">Expired</span>
                  </td>
                </tr>
                <tr v-if="historyTiers.length === 0">
                  <td colspan="5" class="empty-state">
                    <div class="empty-content">
                      <span class="empty-icon">📜</span>
                      <p>No pricing history yet</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Billing Cycle -->
        <div class="settings-section">
          <div class="section-header">
            <h2 class="section-title">Billing Cycle</h2>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Renewal Date (Annual)</label>
              <input type="text" v-model="billingSettings.renewalDate" class="form-input" readonly />
              <span class="form-hint">All memberships renew on this date each year</span>
            </div>
            <div class="form-group">
              <label class="form-label">Grace Period (days)</label>
              <input type="number" v-model="billingSettings.gracePeriod" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Reminder Before Due (days)</label>
              <input type="number" v-model="billingSettings.reminderDays" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Late Fee (%)</label>
              <input type="number" step="0.1" v-model="billingSettings.lateFeePercent" class="form-input" />
            </div>
          </div>
        </div>

        <!-- Mid-Term Join Settings -->
        <div class="settings-section">
          <div class="section-header">
            <h2 class="section-title">Mid-Term Join Settings</h2>
            <span class="section-hint">Users joining between renewal cycles</span>
          </div>
          <div class="form-grid">
            <div class="form-group full-width">
              <label class="form-label">Billing Rule for Mid-Term Joiners</label>
              <select v-model="billingSettings.midTermPolicy" class="form-input">
                <option value="pro_rata">Pro-rata (charge remaining months until next renewal)</option>
                <option value="full_year">Full Year (charge full annual fee, valid until next renewal)</option>
                <option value="fixed_period">Fixed Period (minimum months charged)</option>
              </select>
            </div>
            <div v-if="billingSettings.midTermPolicy === 'fixed_period'" class="form-group">
              <label class="form-label">Minimum Charge (months)</label>
              <input type="number" min="1" max="12" v-model="billingSettings.minMonths" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Cut-off Month (no pro-rata after this)</label>
              <select v-model="billingSettings.cutOffMonth" class="form-input">
                <option v-for="m in 12" :key="m" :value="m">{{ monthNames[m-1] }}</option>
              </select>
              <span class="form-hint">After this month, charge full year to next renewal</span>
            </div>
          </div>

          <!-- Example Calculation -->
          <div class="calc-preview">
            <h3 class="calc-title">Example Calculation (using current active prices)</h3>
            <div class="calc-row">
              <span class="calc-label">School joins in March ({{ currentPriceFor('school') === 0 ? 'Free' : '£' + currentPriceFor('school') }}/year):</span>
              <span class="calc-value">{{ midTermExample.march }}</span>
            </div>
            <div class="calc-row">
              <span class="calc-label">Consultant joins in August ({{ currentPriceFor('consultant') === 0 ? 'Free' : '£' + currentPriceFor('consultant') }}/year):</span>
              <span class="calc-value">{{ midTermExample.august }}</span>
            </div>
            <div class="calc-row">
              <span class="calc-label">Personal joins in September ({{ currentPriceFor('personal') === 0 ? 'Free' : '£' + currentPriceFor('personal') }}/year):</span>
              <span class="calc-value">{{ midTermExample.september }}</span>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="settings-footer">
          <button class="btn btn-primary" @click="saveSettings">💾 Save Changes</button>
        </div>
      </main>
    </div>

    <!-- Add / Edit Tier Modal -->
    <div v-if="showTierModal" class="modal-overlay" @click.self="closeTierModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditing ? '✏️ Edit Fee Tier' : '+ Add New Price Version' }}</h2>
          <button class="modal-close" @click="closeTierModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">User Type</label>
            <select v-model="tierForm.userType" class="form-input" :disabled="isEditing">
              <option value="school">School</option>
              <option value="consultant">Consultant</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tier Name</label>
            <input type="text" v-model="tierForm.name" class="form-input" placeholder="e.g. School Membership" />
          </div>
          <div class="form-group">
            <label class="form-label">Annual Fee (£)</label>
            <input type="number" v-model.number="tierForm.amount" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Valid From</label>
            <input type="date" v-model="tierForm.validFrom" class="form-input" />
            <span class="form-hint">When this price becomes effective</span>
          </div>

          <!-- Active / Pause toggle (edit only) -->
          <div v-if="isEditing" class="form-group">
            <label class="form-label">Status</label>
            <div class="versioning-options" style="flex-direction: row; gap: 0.75rem;">
              <label class="versioning-option" style="flex: 1;">
                <input type="radio" v-model="tierForm.active" :value="true" />
                <div class="option-content">
                  <strong>Active</strong>
                  <span>Users can register and be charged</span>
                </div>
              </label>
              <label class="versioning-option" style="flex: 1;">
                <input type="radio" v-model="tierForm.active" :value="false" />
                <div class="option-content">
                  <strong>Paused</strong>
                  <span>Temporarily stop new registrations</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Versioning option when editing active tier -->
          <div v-if="isEditing && editingTier && !editingTier.validUntil" class="form-group versioning-box">
            <label class="form-label">🔄 Price Change Mode</label>
            <div class="versioning-options">
              <label class="versioning-option">
                <input type="radio" v-model="tierForm.changeMode" value="version" />
                <div class="option-content">
                  <strong>Create new version</strong>
                  <span>Archive old price ({{ editingTier.amount }}) and set new price from Valid From date. Recommended for actual price increases.</span>
                </div>
              </label>
              <label class="versioning-option">
                <input type="radio" v-model="tierForm.changeMode" value="edit" />
                <div class="option-content">
                  <strong>Edit in-place</strong>
                  <span>Just correct this tier (name, date, or amount). No history kept. Use for corrections only.</span>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeTierModal">Cancel</button>
          <button class="btn btn-primary" @click="saveTier">{{ isEditing ? 'Save Changes' : 'Add Price Version' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FeeTier {
  id: number
  userType: 'school' | 'consultant' | 'personal'
  name: string
  amount: number
  currency: string
  validFrom: string | null
  validUntil: string | null
  active: boolean
  updatedAt: string
}

// All fee tier versions (current + historical)
const feeTiers = ref<FeeTier[]>([
  { id: 1, userType: 'school', name: 'School Membership', amount: 279, currency: 'GBP', validFrom: '2023-10-01', validUntil: '2025-09-30', active: false, updatedAt: '2023-09-01' },
  { id: 2, userType: 'consultant', name: 'Consultant Membership', amount: 179, currency: 'GBP', validFrom: '2023-10-01', validUntil: '2025-09-30', active: false, updatedAt: '2023-09-01' },
  { id: 3, userType: 'personal', name: 'Personal Membership', amount: 89, currency: 'GBP', validFrom: '2023-10-01', validUntil: '2025-09-30', active: false, updatedAt: '2023-09-01' },
  { id: 4, userType: 'school', name: 'School Membership', amount: 299, currency: 'GBP', validFrom: '2025-10-01', validUntil: null, active: true, updatedAt: '2025-04-15' },
  { id: 5, userType: 'consultant', name: 'Consultant Membership', amount: 199, currency: 'GBP', validFrom: '2025-10-01', validUntil: null, active: true, updatedAt: '2025-04-15' },
  { id: 6, userType: 'personal', name: 'Personal Membership', amount: 0, currency: 'GBP', validFrom: '2025-10-01', validUntil: null, active: true, updatedAt: '2025-04-15' },
])

// Currently active tiers (validUntil === null)
const currentTiers = computed(() => {
  return feeTiers.value
    .filter(t => t.validUntil === null)
    .sort((a, b) => {
      const order = { school: 1, consultant: 2, personal: 3 }
      return order[a.userType] - order[b.userType]
    })
})

// Historical / expired tiers
const historyTiers = computed(() => {
  return feeTiers.value
    .filter(t => t.validUntil !== null)
    .sort((a, b) => new Date(b.validUntil!).getTime() - new Date(a.validUntil!).getTime())
})

// Helper: get current active price for a user type
const currentPriceFor = (userType: string): number => {
  const tier = feeTiers.value.find(t => t.userType === userType && t.validUntil === null)
  return tier?.amount ?? 0
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const billingSettings = ref({
  renewalDate: '01 October',
  gracePeriod: 30,
  reminderDays: 7,
  lateFeePercent: 5.0,
  midTermPolicy: 'pro_rata',
  minMonths: 3,
  cutOffMonth: 7, // July
})

// Mid-term join example calculations (uses current active prices)
const midTermExample = computed(() => {
  const policy = billingSettings.value.midTermPolicy
  const cutOff = billingSettings.value.cutOffMonth
  const minMonths = billingSettings.value.minMonths || 1

  const calc = (amount: number, joinMonth: number) => {
    const monthsToOct = joinMonth <= 10 ? (10 - joinMonth) : (10 + 12 - joinMonth)
    const nextRenewalYear = joinMonth <= 10 ? new Date().getFullYear() : new Date().getFullYear() + 1

    if (policy === 'full_year') {
      return `£${amount} full year → expires 01 Oct ${nextRenewalYear}`
    }
    if (policy === 'fixed_period') {
      const chargeMonths = Math.max(monthsToOct, minMonths)
      const charge = Math.round((amount / 12) * chargeMonths)
      return `£${charge} (${chargeMonths} months min) → expires 01 Oct ${nextRenewalYear}`
    }
    // pro_rata
    if (joinMonth > cutOff) {
      return `£${amount} full year (after cut-off) → expires 01 Oct ${nextRenewalYear + 1}`
    }
    const charge = Math.round((amount / 12) * monthsToOct)
    return `£${charge} (${monthsToOct} months pro-rata) → expires 01 Oct ${nextRenewalYear}`
  }

  return {
    march: calc(currentPriceFor('school'), 3),
    august: calc(currentPriceFor('consultant'), 8),
    september: calc(currentPriceFor('personal'), 9),
  }
})

// Modal state
const showTierModal = ref(false)
const isEditing = ref(false)
const editingTier = ref<FeeTier | null>(null)

const tierForm = ref({
  id: 0,
  userType: 'school' as 'school' | 'consultant' | 'personal',
  name: '',
  amount: 0,
  validFrom: new Date().toISOString().split('T')[0],
  changeMode: 'version' as 'version' | 'edit',
  active: true,
})

const openAddTier = () => {
  isEditing.value = false
  editingTier.value = null
  tierForm.value = {
    id: 0,
    userType: 'school',
    name: '',
    amount: 0,
    validFrom: new Date().toISOString().split('T')[0],
    changeMode: 'version',
    active: true,
  }
  showTierModal.value = true
}

const openEditTier = (tier: FeeTier) => {
  isEditing.value = true
  editingTier.value = tier
  tierForm.value = {
    id: tier.id,
    userType: tier.userType,
    name: tier.name,
    amount: tier.amount,
    validFrom: tier.validFrom || new Date().toISOString().split('T')[0],
    changeMode: 'version',
    active: tier.active,
  }
  showTierModal.value = true
}

const closeTierModal = () => {
  showTierModal.value = false
  isEditing.value = false
  editingTier.value = null
}

const saveTier = () => {
  if (!tierForm.value.name || tierForm.value.amount <= 0) {
    alert('Please enter a name and valid amount')
    return
  }

  if (isEditing.value && editingTier.value) {
    const idx = feeTiers.value.findIndex(t => t.id === editingTier.value!.id)
    if (idx === -1) return

    if (tierForm.value.changeMode === 'version' && !editingTier.value.validUntil) {
      // Create new version: archive old, create new
      const today = new Date().toISOString().split('T')[0]
      feeTiers.value[idx] = {
        ...editingTier.value,
        validUntil: today,
        active: false,
        updatedAt: today,
      }
      const newId = Math.max(...feeTiers.value.map(t => t.id)) + 1
      feeTiers.value.push({
        id: newId,
        userType: tierForm.value.userType,
        name: tierForm.value.name,
        amount: tierForm.value.amount,
        currency: 'GBP',
        validFrom: tierForm.value.validFrom,
        validUntil: null,
        active: tierForm.value.active,
        updatedAt: today,
      })
    } else {
      // Edit in-place
      feeTiers.value[idx] = {
        ...editingTier.value,
        name: tierForm.value.name,
        amount: tierForm.value.amount,
        userType: tierForm.value.userType,
        validFrom: tierForm.value.validFrom,
        active: tierForm.value.active,
        updatedAt: new Date().toISOString().split('T')[0],
      }
    }
  } else {
    // Add new tier
    const newId = feeTiers.value.length > 0 ? Math.max(...feeTiers.value.map(t => t.id)) + 1 : 1
    feeTiers.value.push({
      id: newId,
      userType: tierForm.value.userType,
      name: tierForm.value.name,
      amount: tierForm.value.amount,
      currency: 'GBP',
      validFrom: tierForm.value.validFrom,
      validUntil: null,
      active: tierForm.value.active,
      updatedAt: new Date().toISOString().split('T')[0],
    })
  }

  closeTierModal()
}

const saveSettings = () => {
  alert('Settings saved!')
}
</script>

<style scoped>
/* Fees-specific styles only — layout/base styles moved to global bsp-admin.css */

/* Section */
.section-desc { margin-top: -0.25rem; }

/* Fees Table */
.history-table td { padding: 0.875rem 1rem; }
.tier-name { font-weight: 600; color: var(--bsp-dark, #1e293b); }
.fee-amount { font-size: 1.1rem; font-weight: 700; color: var(--bsp-primary, #212E54); }

/* Toggle Buttons */
.btn-toggle { padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
.btn-pause { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
.btn-pause:hover { background: #fecaca; }
.btn-resume { background: #d1fae5; color: #047857; border-color: #a7f3d0; }
.btn-resume:hover { background: #a7f3d0; }

/* Versioning Box */
.versioning-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
.versioning-options { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem; }
.versioning-option { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; border-radius: 6px; border: 1px solid #e2e8f0; background: white; cursor: pointer; transition: all 0.2s; }
.versioning-option:hover { border-color: #cbd5e1; }
.versioning-option input { margin-top: 0.15rem; }
.option-content { display: flex; flex-direction: column; gap: 0.15rem; }
.option-content strong { font-size: 0.85rem; color: var(--bsp-dark, #1e293b); }
.option-content span { font-size: 0.8rem; color: #64748b; }

/* Calculation Preview */
.calc-preview { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.25rem; margin-top: 1rem; }
.calc-title { font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.75rem; }
.calc-row { display: flex; justify-content: space-between; padding: 0.4rem 0; font-size: 0.85rem; border-bottom: 1px solid #f1f5f9; }
.calc-row:last-child { border-bottom: none; }
.calc-label { color: #64748b; }
.calc-value { font-weight: 600; color: var(--bsp-primary, #212E54); }

/* Modal overrides (fees uses slightly different modal sizing) */
.modal-overlay { background: rgba(0,0,0,0.45); z-index: 1000; }
.modal-box { max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.modal-footer { padding: 1rem 1.5rem; background: #f8fafc; }
</style>
