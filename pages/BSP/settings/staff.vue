<template>
  <div class="bsp-dashboard">
    <div class="dashboard-body">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">User Categories</div>
            <NuxtLink to="/BSP/users/personal" class="nav-item">
              <span class="nav-icon">👤</span>
              <span>Personal</span>
            </NuxtLink>
            <NuxtLink to="/BSP/users/school" class="nav-item">
              <span class="nav-icon">🏫</span>
              <span>School</span>
            </NuxtLink>
            <NuxtLink to="/BSP/users/consultant" class="nav-item">
              <span class="nav-icon">💼</span>
              <span>Consultant</span>
            </NuxtLink>
            <NuxtLink to="/BSP/users/bspstaff" class="nav-item">
              <span class="nav-icon">👔</span>
              <span>BSP Staff</span>
            </NuxtLink>
          </div>
          <div class="nav-section">
            <div class="nav-section-title">Management</div>
            <NuxtLink to="/BSP/dashboard" class="nav-item">
              <span class="nav-icon">📊</span>
              <span>Overview</span>
            </NuxtLink>
            <NuxtLink to="/BSP/new-account-applications" class="nav-item">
              <span class="nav-icon">📋</span>
              <span>New Account Applications</span>
            </NuxtLink>
            <NuxtLink to="/BSP/payments" class="nav-item">
              <span class="nav-icon">💳</span>
              <span>Payments</span>
            </NuxtLink>
          </div>
          <div class="nav-section">
            <div class="nav-section-title">Settings</div>
            <NuxtLink to="/BSP/settings/fees" class="nav-item">
              <span class="nav-icon">💰</span>
              <span>Annual Fee</span>
            </NuxtLink>
            <NuxtLink to="/BSP/settings/website" class="nav-item">
              <span class="nav-icon">🌐</span>
              <span>Website Settings</span>
            </NuxtLink>
            <NuxtLink to="/BSP/settings/staff" class="nav-item active">
              <span class="nav-icon">👔</span>
              <span>Staff</span>
            </NuxtLink>
          </div>
        </nav>
      </aside>
      <main class="main-content">
        <div class="page-header">
          <div class="page-title-area">
            <h1 class="page-title">👔 Staff Settings</h1>
            <p class="page-subtitle">Manage BSP staff accounts and permissions</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" @click="showAddStaff = true">+ Add Staff</button>
          </div>
        </div>
        <div class="settings-section">
          <div class="staff-table-wrapper">
            <table class="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in staffList" :key="member.id">
                  <td>
                    <div class="staff-cell">
                      <span class="staff-avatar">{{ member.name.charAt(0) }}</span>
                      <span class="staff-name">{{ member.name }}</span>
                    </div>
                  </td>
                  <td>{{ member.email }}</td>
                  <td><span class="role-badge" :class="'role-' + member.role">{{ member.role }}</span></td>
                  <td><span class="status-badge" :class="'status-' + member.status">{{ member.status }}</span></td>
                  <td class="text-muted">{{ member.lastLogin }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-action" @click="editStaff(member)" title="Edit">✏️</button>
                      <button class="btn-action btn-danger" @click="removeStaff(member.id)" title="Remove">🗑️</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="settings-section">
          <div class="section-header">
            <h2 class="section-title">Role Permissions</h2>
          </div>
          <div class="permissions-grid">
            <div v-for="role in roles" :key="role.name" class="permission-card">
              <div class="permission-header">
                <h3 class="permission-title">{{ role.name }}</h3>
                <span class="permission-count">{{ role.permissions.length }} permissions</span>
              </div>
              <ul class="permission-list">
                <li v-for="perm in role.permissions" :key="perm">{{ perm }}</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const staffList = ref([
  { id: 1, name: 'Eric Tong', email: 'eric@britishschoolportal.com', role: 'master', status: 'active', lastLogin: '2026-05-04 14:30' },
  { id: 2, name: 'Sarah Chen', email: 'sarah@britishschoolportal.com', role: 'manager', status: 'active', lastLogin: '2026-05-04 11:15' },
  { id: 3, name: 'James Wilson', email: 'james@britishschoolportal.com', role: 'staff', status: 'active', lastLogin: '2026-05-03 16:45' },
  { id: 4, name: 'Lisa Wong', email: 'lisa@britishschoolportal.com', role: 'staff', status: 'active', lastLogin: '2026-05-02 09:20' },
])

const roles = ref([
  { name: 'Master (Owner)', permissions: ['Full Access', 'Manage Staff', 'Financial Control', 'System Settings', 'User Management', 'Content Editing'] },
  { name: 'Manager', permissions: ['Manage Users', 'Approve Applications', 'View Payments', 'Edit Content', 'Export Reports'] },
  { name: 'Staff', permissions: ['Review Applications', 'View Users', 'Send Notifications', 'Reset Passwords'] },
])

const showAddStaff = ref(false)
const editStaff = (member: typeof staffList.value[0]) => { /* edit */ }
const removeStaff = (id: number) => {
  if (confirm('Remove this staff member?')) {
    staffList.value = staffList.value.filter(s => s.id !== id)
  }
}
</script>

<style scoped>
.bsp-dashboard { min-height: 100vh; background: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; }
.dashboard-body { display: flex; min-height: 100vh; }
.sidebar { width: 260px; background: white; border-right: 1px solid #e2e8f0; padding: 1.5rem 0; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
.nav-section { margin-bottom: 1.5rem; }
.nav-section-title { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; padding: 0 1.5rem; margin-bottom: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.5rem; color: #64748b; text-decoration: none; font-weight: 500; font-size: 0.9rem; transition: all 0.2s; border-left: 3px solid transparent; }
.nav-item:hover { background: #f1f5f9; color: #212E54; }
.nav-item.active { background: #eff6ff; color: #212E54; border-left-color: #3b82f6; font-weight: 600; }
.nav-icon { font-size: 1.1rem; }
.main-content { flex: 1; padding: 2rem; max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #212E54; margin-bottom: 0.25rem; }
.page-subtitle { font-size: 0.9rem; color: #64748b; }
.settings-section { background: white; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.section-header { margin-bottom: 1.25rem; }
.section-title { font-size: 1.1rem; font-weight: 600; color: #1e293b; }
.staff-table-wrapper { overflow-x: auto; }
.staff-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.staff-table th { text-align: left; padding: 0.875rem 1rem; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
.staff-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.staff-cell { display: flex; align-items: center; gap: 0.75rem; }
.staff-avatar { width: 32px; height: 32px; background: #212E54; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 600; }
.staff-name { font-weight: 600; }
.role-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.role-master { background: #fecaca; color: #991b1b; }
.role-manager { background: #dbeafe; color: #1e40af; }
.role-staff { background: #d1fae5; color: #047857; }
.status-badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.status-active { background: #d1fae5; color: #047857; }
.status-inactive { background: #f1f5f9; color: #64748b; }
.text-muted { color: #94a3b8; font-size: 0.85rem; }
.action-buttons { display: flex; gap: 0.35rem; }
.btn-action { background: none; border: none; font-size: 1rem; cursor: pointer; padding: 0.35rem; border-radius: 4px; }
.btn-action:hover { background: #f1f5f9; }
.btn-action.btn-danger:hover { background: #fee2e2; }
.btn { padding: 0.6rem 1.25rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }
.permissions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.permission-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
.permission-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.permission-title { font-size: 0.95rem; font-weight: 600; }
.permission-count { font-size: 0.75rem; color: #94a3b8; }
.permission-list { list-style: none; padding: 0; margin: 0; }
.permission-list li { padding: 0.35rem 0; font-size: 0.85rem; color: #475569; border-bottom: 1px solid #f1f5f9; }
.permission-list li:last-child { border-bottom: none; }
@media (max-width: 1024px) { .permissions-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) {
  .sidebar { display: none; }
  .main-content { padding: 1rem; }
  .permissions-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
}
</style>
