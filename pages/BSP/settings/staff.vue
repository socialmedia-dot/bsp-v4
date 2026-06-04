<template>
  <div class="bsp-dashboard">
    <div class="dashboard-body">
      <BspSidebar active="staff" />
      <main class="main-content">
        <div class="page-header">
          <div class="page-title-area">
            <h1 class="page-title">👔 Staff Settings</h1>
            <p class="page-subtitle">Manage BSP staff accounts and permissions</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary add-staff-btn" @click="showAddStaff = true">+ Add Staff</button>
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
            <button class="btn btn-secondary" @click="openEditPermissions">✏️ Edit Permissions</button>
            <button class="btn btn-secondary" @click="openAddRole">+ Add Role</button>
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

    <!-- Edit Permissions Modal -->
    <div v-if="showEditPermissions" class="modal-overlay" @click.self="closeEditPermissions">
      <div class="modal-box modal-lg">
        <div class="modal-header">
          <h3>✏️ Edit Role Permissions</h3>
          <button class="modal-close" @click="closeEditPermissions">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-note">Only admin (Master) can edit role permissions. Changes apply immediately.</p>
          <div class="edit-roles-grid">
            <div v-for="(role, idx) in editRoles" :key="role.name" class="edit-role-card">
              <div class="edit-role-header">
                <h4>{{ role.name }}</h4>
                <span class="edit-role-count">{{ role.permissions.filter(p => p.enabled).length }} / {{ role.permissions.length }}</span>
              </div>
              <div class="edit-permission-list">
                <label v-for="perm in role.permissions" :key="perm.key" class="edit-permission-item">
                  <input type="checkbox" v-model="perm.enabled" />
                  <span>{{ perm.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEditPermissions">Cancel</button>
          <button class="btn btn-primary" @click="savePermissions">Save Changes</button>
        </div>
      </div>
    </div>
    <!-- Add Role Modal -->
    <div v-if="showAddRole" class="modal-overlay" @click.self="closeRoleModal">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Add New Role</h3>
          <button class="modal-close" @click="closeRoleModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Role Name *</label>
            <input v-model="newRole.name" type="text" class="form-input" placeholder="e.g. Finance Admin" />
          </div>
          <div class="form-group">
            <label>Permissions</label>
            <div class="permissions-checklist">
              <label v-for="perm in allPermissionKeys" :key="perm" class="perm-checkbox">
                <input v-model="newRole.permissions" type="checkbox" :value="perm" />
                <span>{{ perm }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRoleModal">Cancel</button>
          <button class="btn btn-primary" @click="saveRole">Save Role</button>
        </div>
      </div>
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

const allPermissionKeys = [
  'Full Access',
  'Manage Staff',
  'Financial Control',
  'System Settings',
  'User Management',
  'Content Editing',
  'Manage Users',
  'Approve Applications',
  'View Payments',
  'Edit Content',
  'Export Reports',
  'Review Applications',
  'View Users',
  'Send Notifications',
  'Reset Passwords',
]

const roles = ref([
  { name: 'Master (Owner)', permissions: ['Full Access', 'Manage Staff', 'Financial Control', 'System Settings', 'User Management', 'Content Editing'] },
  { name: 'Manager', permissions: ['Manage Users', 'Approve Applications', 'View Payments', 'Edit Content', 'Export Reports'] },
  { name: 'Staff', permissions: ['Review Applications', 'View Users', 'Send Notifications', 'Reset Passwords'] },
])

const showAddStaff = ref(false)
const showEditPermissions = ref(false)
const editRoles = ref<{ name: string; permissions: { key: string; label: string; enabled: boolean }[] }[]>([])

// Add Role
const showAddRole = ref(false)
const newRole = reactive({ name: '', permissions: [] as string[] })

function openAddRole() {
  newRole.name = ''
  newRole.permissions = []
  showAddRole.value = true
}

function closeRoleModal() {
  showAddRole.value = false
}

function saveRole() {
  if (!newRole.name.trim()) {
    alert('Role name is required')
    return
  }
  if (roles.value.some(r => r.name.toLowerCase() === newRole.name.trim().toLowerCase())) {
    alert('A role with this name already exists')
    return
  }
  roles.value.push({ name: newRole.name.trim(), permissions: [...newRole.permissions] })
  closeRoleModal()
}

const editStaff = (member: typeof staffList.value[0]) => { /* edit */ }
const removeStaff = (id: number) => {
  if (confirm('Remove this staff member?')) {
    staffList.value = staffList.value.filter(s => s.id !== id)
  }
}

function openEditPermissions() {
  editRoles.value = roles.value.map(role => ({
    name: role.name,
    permissions: allPermissionKeys.map(key => ({
      key,
      label: key,
      enabled: role.permissions.includes(key),
    })),
  }))
  showEditPermissions.value = true
}

function closeEditPermissions() {
  showEditPermissions.value = false
  editRoles.value = []
}

function savePermissions() {
  roles.value = editRoles.value.map(role => ({
    name: role.name,
    permissions: role.permissions.filter(p => p.enabled).map(p => p.label),
  }))
  closeEditPermissions()
}
</script>

<style scoped>
/* No page-specific styles needed — uses global bsp-admin.css */
</style>
