<template>
  <div class="bsp-dashboard">
    <div class="dashboard-body">
      <!-- Left Sidebar Navigation -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <!-- Role Switcher (Demo) -->
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

          <div class="nav-section">
            <div class="nav-section-title">Applications</div>
            <NuxtLink to="/operations/applications" class="nav-item active">
              <span class="nav-icon">📋</span>
              <span>New Account Applications</span>
              <span v-if="pendingCount > 0" class="nav-badge">{{ pendingCount }}</span>
            </NuxtLink>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">User Directory</div>
            <NuxtLink to="/operations/users" class="nav-item">
              <span class="nav-icon">👤</span>
              <span>All Users</span>
            </NuxtLink>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Finance</div>
            <NuxtLink to="/operations/payments" class="nav-item">
              <span class="nav-icon">💳</span>
              <span>Payments</span>
            </NuxtLink>
            <NuxtLink to="/operations/reports" class="nav-item">
              <span class="nav-icon">📈</span>
              <span>Reports</span>
            </NuxtLink>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Support Tools</div>
            <NuxtLink to="/operations/notifications" class="nav-item">
              <span class="nav-icon">📢</span>
              <span>Send Notifications</span>
            </NuxtLink>
          </div>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Page Header -->
        <div class="page-header">
          <div class="page-title-area">
            <h1 class="page-title">📋 New Account Applications</h1>
            <p class="page-subtitle">Review and approve new paid applications</p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar">
          <button class="tab-btn" :class="{ active: activeTab === 'pending_verification' }" @click="activeTab = 'pending_verification'">
            ⏳ Pending Verification <span class="tab-count verification">{{ pendingApps.length }}</span>
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'approved' }" @click="activeTab = 'approved'">
            ✅ Approved <span class="tab-count approved">{{ approvedApps.length }}</span>
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'rejected' }" @click="activeTab = 'rejected'">
            ❌ Rejected <span class="tab-count rejected">{{ rejectedApps.length }}</span>
          </button>
        </div>

        <!-- Filters (for approved/rejected tabs) -->
        <div class="filter-bar" v-if="activeTab !== 'pending_verification'">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Search by name, email, or company..."
            />
          </div>
        </div>

        <!-- Pending Verification Table -->
        <div class="users-table-wrapper" v-if="activeTab === 'pending_verification'">
          <table class="users-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Type</th>
                <th>Company / School</th>
                <th>Plan</th>
                <th>Paid</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in pendingApps" :key="app.id" class="user-row">
                <td>
                  <div class="user-info-cell">
                    <div class="user-details">
                      <span class="consultant-name">{{ app.name }}</span>
                      <span class="user-email">{{ app.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="type-badge" :class="'type-' + app.type.toLowerCase()">{{ app.type }}</span>
                </td>
                <td>{{ app.company || app.schoolName || '—' }}</td>
                <td>{{ app.plan }}</td>
                <td><span style="color: var(--bsp-success); font-weight: 600;">£{{ app.amountPaid || 0 }}</span></td>
                <td>{{ app.submittedDate }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-action btn-view" @click="viewDetail(app)" title="View Details">👁️</button>
                    <button class="btn-action btn-approve" @click="openApproveModal(app)" title="Approve">✅</button>
                    <button class="btn-action btn-reject" @click="openRejectModal(app)" title="Reject">❌</button>
                  </div>
                </td>
              </tr>
              <tr v-if="pendingApps.length === 0">
                <td colspan="7" class="empty-state">
                  <div class="empty-content">
                    <span class="empty-icon">⏳</span>
                    <p>No pending verifications — all caught up!</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Approved Table -->
        <div class="users-table-wrapper" v-if="activeTab === 'approved'">
          <table class="users-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Type</th>
                <th>Company / School</th>
                <th>Plan</th>
                <th>Paid</th>
                <th>Approved Date</th>
                <th>Approved By</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in filteredApproved" :key="app.id" class="user-row">
                <td>
                  <div class="user-info-cell">
                    <div class="user-details">
                      <span class="consultant-name">{{ app.name }}</span>
                      <span class="user-email">{{ app.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="type-badge" :class="'type-' + app.type.toLowerCase()">{{ app.type }}</span>
                </td>
                <td>{{ app.company || app.schoolName || '—' }}</td>
                <td>{{ app.plan }}</td>
                <td><span style="color: var(--bsp-success); font-weight: 600;">£{{ app.amountPaid || 0 }}</span></td>
                <td>{{ app.approvedDate || '—' }}</td>
                <td>{{ app.approvedBy || '—' }}</td>
              </tr>
              <tr v-if="filteredApproved.length === 0">
                <td colspan="7" class="empty-state">
                  <div class="empty-content">
                    <span class="empty-icon">✅</span>
                    <p>No approved applications</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Rejected Table -->
        <div class="users-table-wrapper" v-if="activeTab === 'rejected'">
          <table class="users-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Type</th>
                <th>Company / School</th>
                <th>Plan</th>
                <th>Paid</th>
                <th>Rejected Date</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in filteredRejected" :key="app.id" class="user-row deleted-row">
                <td>
                  <div class="user-info-cell">
                    <div class="user-details">
                      <span class="consultant-name">{{ app.name }}</span>
                      <span class="user-email">{{ app.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="type-badge" :class="'type-' + app.type.toLowerCase()">{{ app.type }}</span>
                </td>
                <td>{{ app.company || app.schoolName || '—' }}</td>
                <td>{{ app.plan }}</td>
                <td><span style="color: #94a3b8;">£{{ app.amountPaid || 0 }}</span></td>
                <td>{{ app.rejectedDate || '—' }}</td>
                <td>
                  <span class="rejection-reason" @click="showRejectReason(app)" title="Click to view">{{ app.rejectionReason ? app.rejectionReason.substring(0, 30) + '...' : '—' }}</span>
                </td>
              </tr>
              <tr v-if="filteredRejected.length === 0">
                <td colspan="7" class="empty-state">
                  <div class="empty-content">
                    <span class="empty-icon">❌</span>
                    <p>No rejected applications</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- Application Detail Panel -->
    <div v-if="showPanel" class="detail-panel-overlay" @click.self="closePanel">
      <div class="detail-panel">
        <div class="panel-header">
          <h2 class="panel-title">Application Details</h2>
          <button class="panel-close" @click="closePanel">×</button>
        </div>
        <div v-if="selectedApp" class="panel-body">
          <div class="panel-section">
            <h3 class="section-title">Applicant Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Full Name</span>
                <span class="info-value">{{ selectedApp.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ selectedApp.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Account Type</span>
                <span class="info-value">
                  <span class="type-badge" :class="'type-' + selectedApp.type.toLowerCase()">{{ selectedApp.type }}</span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Plan</span>
                <span class="info-value">{{ selectedApp.plan }}</span>
              </div>
              <div v-if="selectedApp.company || selectedApp.schoolName" class="info-item full-width">
                <span class="info-label">{{ selectedApp.type === 'School' ? 'School Name' : 'Company' }}</span>
                <span class="info-value">{{ selectedApp.company || selectedApp.schoolName }}</span>
              </div>
              <div v-if="selectedApp.role || selectedApp.schoolRole" class="info-item full-width">
                <span class="info-label">Role</span>
                <span class="info-value">{{ selectedApp.role || selectedApp.schoolRole }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">Submitted Date</span>
                <span class="info-value">{{ selectedApp.submittedDate }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">Payment Status</span>
                <span class="info-value">
                  <span class="status-badge" :class="'status-' + selectedApp.paymentStatus">
                    {{ selectedApp.paymentStatus.replace('_', ' ') }}
                  </span>
                </span>
              </div>
              <div v-if="selectedApp.amountPaid > 0" class="info-item">
                <span class="info-label">Amount Paid</span>
                <span class="info-value" style="color: var(--bsp-success); font-weight: 600;">£{{ selectedApp.amountPaid }}</span>
              </div>
              <div v-if="selectedApp.paymentMethod" class="info-item">
                <span class="info-label">Payment Method</span>
                <span class="info-value">{{ selectedApp.paymentMethod }}</span>
              </div>
              <div v-if="selectedApp.documentName" class="info-item full-width">
                <span class="info-label">Uploaded Document</span>
                <span class="info-value">📎 {{ selectedApp.documentName }}</span>
              </div>
            </div>
          </div>
          <div v-if="selectedApp.paymentStatus === 'pending_verification'" class="panel-actions">
            <button class="btn btn-primary" @click="openApproveModal(selectedApp)">✅ Approve Application</button>
            <button class="btn btn-danger" @click="openRejectModal(selectedApp)">❌ Reject Application</button>
          </div>
          <div v-if="selectedApp.paymentStatus === 'approved'" class="panel-actions">
            <p style="color: var(--bsp-success); font-weight: 600;">✅ Approved on {{ selectedApp.approvedDate }} by {{ selectedApp.approvedBy }}</p>
          </div>
          <div v-if="selectedApp.paymentStatus === 'rejected'" class="panel-actions">
            <p style="color: #ef4444; font-weight: 600;">❌ Rejected on {{ selectedApp.rejectedDate }}</p>
            <p style="color: #64748b; font-size: 0.85rem;">Reason: {{ selectedApp.rejectionReason }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Confirmation Modal -->
    <div v-if="rejectModal" class="modal-overlay" @click.self="closeRejectModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">Reject Application</h2>
          <button class="modal-close" @click="closeRejectModal">×</button>
        </div>
        <div class="modal-body">
          <div class="delete-warning reject-warning">
            <span class="warning-icon">⚠️</span>
            <p>You are about to reject the application from <strong>{{ rejectTarget?.name }}</strong>.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Reason for Rejection <span class="required">*</span></label>
            <textarea v-model="rejectForm.reason" class="form-textarea" rows="3" placeholder="Enter reason for rejection..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRejectModal">Cancel</button>
          <button class="btn btn-danger" @click="confirmReject" :disabled="!rejectForm.reason.trim()">Reject Application</button>
        </div>
      </div>
    </div>

    <!-- Approve Confirmation Modal -->
    <div v-if="approveModal" class="modal-overlay" @click.self="closeApproveModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">Approve Application</h2>
          <button class="modal-close" @click="closeApproveModal">×</button>
        </div>
        <div class="modal-body">
          <div class="delete-warning approve-warning">
            <span class="warning-icon">✅</span>
            <p>You are about to approve the application from <strong>{{ approveTarget?.name }}</strong>.</p>
            <p style="font-size: 0.85rem; color: #64748b; margin-top: 0.5rem;">This will activate their account and send an email notification.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeApproveModal">Cancel</button>
          <button class="btn btn-primary" @click="confirmApprove">✅ Confirm Approve</button>
        </div>
      </div>
    </div>

    <!-- Rejection Reason Toast -->
    <div v-if="showReasonToast" class="toast-overlay" @click.self="closeReasonToast">
      <div class="toast-box">
        <div class="toast-header">
          <h3>Rejection Reason</h3>
          <button @click="closeReasonToast">×</button>
        </div>
        <div class="toast-body">
          <p>{{ reasonApp?.rejectionReason }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { setMeta } = useSEO()
setMeta({
  title: 'New Account Applications — BSP Operations',
  description: 'Review and approve new account applications',
  path: '/operations/applications',
  type: 'website'
})

const { getPendingVerification, getApproved, getRejected, approveApplication, rejectApplication, pendingCount } = usePendingApps()

const activeTab = ref('pending_verification')
const searchQuery = ref('')
const currentRole = ref('manager')
const showPanel = ref(false)
const selectedApp = ref<any>(null)
const rejectModal = ref(false)
const rejectTarget = ref<any>(null)
const rejectForm = ref({ reason: '' })
const approveModal = ref(false)
const approveTarget = ref<any>(null)
const showReasonToast = ref(false)
const reasonApp = ref<any>(null)

const pendingApps = computed(() => getPendingVerification())
const approvedApps = computed(() => getApproved())
const rejectedApps = computed(() => getRejected())

const filteredApproved = computed(() => {
  if (!searchQuery.value) return approvedApps.value
  const q = searchQuery.value.toLowerCase()
  return approvedApps.value.filter(a =>
    a.name.toLowerCase().includes(q) ||
    a.email.toLowerCase().includes(q) ||
    (a.company || '').toLowerCase().includes(q)
  )
})

const filteredRejected = computed(() => {
  if (!searchQuery.value) return rejectedApps.value
  const q = searchQuery.value.toLowerCase()
  return rejectedApps.value.filter(a =>
    a.name.toLowerCase().includes(q) ||
    a.email.toLowerCase().includes(q) ||
    (a.company || '').toLowerCase().includes(q)
  )
})

const viewDetail = (app: any) => {
  selectedApp.value = app
  showPanel.value = true
}

const closePanel = () => {
  showPanel.value = false
  selectedApp.value = null
}

const openRejectModal = (app: any) => {
  rejectTarget.value = app
  rejectForm.value.reason = ''
  rejectModal.value = true
  showPanel.value = false
}

const closeRejectModal = () => {
  rejectModal.value = false
  rejectTarget.value = null
}

const confirmReject = () => {
  if (!rejectTarget.value || !rejectForm.value.reason.trim()) return
  rejectApplication(rejectTarget.value.id, currentRole.value === 'manager' ? 'Manager' : 'Staff', rejectForm.value.reason.trim())
  closeRejectModal()
}

const openApproveModal = (app: any) => {
  approveTarget.value = app
  approveModal.value = true
  showPanel.value = false
}

const closeApproveModal = () => {
  approveModal.value = false
  approveTarget.value = null
}

const confirmApprove = () => {
  if (!approveTarget.value) return
  approveApplication(approveTarget.value.id, currentRole.value === 'manager' ? 'Manager' : 'Staff')
  closeApproveModal()
}

const showRejectReason = (app: any) => {
  reasonApp.value = app
  showReasonToast.value = true
}

const closeReasonToast = () => {
  showReasonToast.value = false
  reasonApp.value = null
}
</script>

<style scoped>
.bsp-dashboard { min-height: 100vh; background: #f0f4f8; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
.dashboard-body { display: flex; min-height: 100vh; }
.sidebar { width: 260px; background: white; border-right: 1px solid #e2e8f0; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
.sidebar-nav { padding: 1.5rem 1rem; }
.nav-section { margin-bottom: 1.5rem; }
.nav-section-title { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; padding-left: 0.75rem; }
.nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.75rem; border-radius: 8px; color: #475569; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: all 0.15s; cursor: pointer; }
.nav-item:hover { background: #f1f5f9; color: #1e3a5f; }
.nav-item.active { background: #1e3a5f; color: white; }
.nav-icon { font-size: 1rem; }
.nav-badge { margin-left: auto; background: #ef4444; color: white; font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: 20px; }
.nav-count { margin-left: auto; color: #94a3b8; font-size: 0.8rem; }
.role-switcher { display: flex; gap: 0.5rem; padding: 0 0.75rem; }
.role-btn { flex: 1; padding: 0.4rem; border: 1px solid #e2e8f0; border-radius: 6px; background: white; font-size: 0.75rem; font-weight: 600; cursor: pointer; color: #64748b; transition: all 0.15s; }
.role-btn.active { background: #1e3a5f; color: white; border-color: #1e3a5f; }
.main-content { flex: 1; padding: 2rem; overflow: auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #1e3a5f; margin: 0; }
.page-subtitle { color: #64748b; font-size: 0.875rem; margin: 0.25rem 0 0; }
.tab-bar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.tab-btn { padding: 0.6rem 1.2rem; border: 1px solid #e2e8f0; border-radius: 8px; background: white; font-size: 0.85rem; font-weight: 600; cursor: pointer; color: #64748b; transition: all 0.15s; }
.tab-btn.active { background: #1e3a5f; color: white; border-color: #1e3a5f; }
.tab-count { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; margin-left: 0.4rem; }
.tab-count.verification { background: #fef3c7; color: #92400e; }
.tab-count.approved { background: #dcfce7; color: #166534; }
.tab-count.rejected { background: #fee2e2; color: #991b1b; }
.tab-btn.active .tab-count.verification { background: #fde68a; color: #92400e; }
.tab-btn.active .tab-count.approved { background: #86efac; color: #166534; }
.tab-btn.active .tab-count.rejected { background: #fca5a5; color: #991b1b; }
.filter-bar { display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center; }
.search-box { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.5rem 0.75rem; flex: 1; max-width: 400px; }
.search-icon { color: #94a3b8; font-size: 0.9rem; }
.search-input { border: none; outline: none; font-size: 0.875rem; flex: 1; background: transparent; }
.users-table-wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.users-table { width: 100%; border-collapse: collapse; }
.users-table th { background: #f8fafc; padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em; border-bottom: 1px solid #e2e8f0; }
.users-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; color: #334155; vertical-align: middle; }
.user-row:hover { background: #f8fafc; }
.deleted-row { opacity: 0.7; }
.user-info-cell { display: flex; align-items: center; gap: 0.75rem; }
.user-details { display: flex; flex-direction: column; gap: 0.15rem; }
.consultant-name { font-weight: 600; color: #1e293b; }
.user-email { font-size: 0.8rem; color: #94a3b8; }
.type-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.type-badge.type-school { background: #dbeafe; color: #1d4ed8; }
.type-badge.type-consultant { background: #fce7f3; color: #9d174d; }
.type-badge.type-business { background: #fef3c7; color: #92400e; }
.type-badge.type-personal { background: #d1fae5; color: #065f46; }
.action-buttons { display: flex; gap: 0.5rem; align-items: center; }
.btn-action { width: 32px; height: 32px; border: 1px solid #e2e8f0; border-radius: 6px; background: white; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.btn-action:hover { background: #f1f5f9; }
.btn-approve:hover { background: #dcfce7; border-color: #86efac; }
.btn-reject:hover { background: #fee2e2; border-color: #fca5a5; }
.empty-state { text-align: center; padding: 3rem; }
.empty-content { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.empty-icon { font-size: 2.5rem; }
.empty-content p { color: #94a3b8; font-size: 0.9rem; margin: 0; }
.rejection-reason { color: #ef4444; cursor: pointer; font-size: 0.8rem; }
.rejection-reason:hover { text-decoration: underline; }
.detail-panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; justify-content: flex-end; }
.detail-panel { width: 420px; background: white; height: 100vh; overflow-y: auto; box-shadow: -4px 0 20px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc; position: sticky; top: 0; }
.panel-title { font-size: 1rem; font-weight: 700; color: #1e3a5f; margin: 0; }
.panel-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; padding: 0; line-height: 1; }
.panel-close:hover { color: #1e3a5f; }
.panel-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
.panel-section { margin-bottom: 1.5rem; }
.section-title { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.info-item { display: flex; flex-direction: column; gap: 0.2rem; }
.info-item.full-width { grid-column: 1 / -1; }
.info-label { font-size: 0.75rem; color: #94a3b8; }
.info-value { font-size: 0.875rem; font-weight: 600; color: #1e3a5f; }
.panel-actions { display: flex; flex-direction: column; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-box { background: white; border-radius: 16px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
.modal-title { font-size: 1rem; font-weight: 700; color: #1e3a5f; margin: 0; }
.modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; padding: 0; line-height: 1; }
.modal-close:hover { color: #1e3a5f; }
.modal-body { padding: 1.5rem; }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem; }
.delete-warning { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1rem; border-radius: 10px; margin-bottom: 1rem; gap: 0.5rem; }
.reject-warning { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
.approve-warning { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
.warning-icon { font-size: 2rem; }
.delete-warning p { margin: 0; font-size: 0.9rem; }
.form-group { margin-top: 0.75rem; }
.form-label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
.form-label .required { color: #ef4444; }
.form-textarea { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; resize: vertical; font-family: inherit; box-sizing: border-box; }
.form-textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.btn { padding: 0.6rem 1.2rem; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.btn-primary { background: #1e3a5f; color: white; }
.btn-primary:hover { background: #2d4a6f; }
.btn-secondary { background: #f1f5f9; color: #475569; }
.btn-secondary:hover { background: #e2e8f0; }
.btn-danger { background: #ef4444; color: white; }
.btn-danger:hover { background: #dc2626; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
.toast-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.toast-box { background: white; border-radius: 12px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.toast-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid #e2e8f0; }
.toast-header h3 { margin: 0; font-size: 0.9rem; font-weight: 700; color: #1e3a5f; }
.toast-header button { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: #94a3b8; }
.toast-body { padding: 1.25rem; }
.toast-body p { margin: 0; color: #475569; font-size: 0.875rem; line-height: 1.6; }
</style>
