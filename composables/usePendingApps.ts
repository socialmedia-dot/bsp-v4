// composables/usePendingApps.ts
// Manages pending applications in localStorage
// Flow: register → pending_payment → pending_verification → approved/rejected

export interface PendingApplication {
  id: string
  name: string
  email: string
  password?: string
  type: 'School' | 'Consultant' | 'Business' | 'Personal'
  company?: string
  role?: string
  schoolName?: string
  schoolRole?: string
  documentName?: string // uploaded file name
  plan: string
  amountPaid: number
  paidAmount?: number
  paymentMethod?: string
  paymentStatus: 'pending_payment' | 'pending_verification' | 'approved' | 'rejected'
  submittedDate: string
  paidDate?: string
  approvedDate?: string
  rejectedDate?: string
  approvedBy?: string
  rejectedBy?: string
  rejectionReason?: string
}

const STORAGE_KEY = 'bsp_pending_applications'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

function getApps(): PendingApplication[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveApps(apps: PendingApplication[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps))
}

export function usePendingApps() {
  // Get all applications
  const getAll = (): PendingApplication[] => getApps()

  // Get pending verification (paid, awaiting approval)
  const getPendingVerification = (): PendingApplication[] =>
    getApps().filter(a => a.paymentStatus === 'pending_verification')

  // Get approved
  const getApproved = (): PendingApplication[] =>
    getApps().filter(a => a.paymentStatus === 'approved')

  // Get rejected
  const getRejected = (): PendingApplication[] =>
    getApps().filter(a => a.paymentStatus === 'rejected')

  // Get pending payment
  const getPendingPayment = (): PendingApplication[] =>
    getApps().filter(a => a.paymentStatus === 'pending_payment')

  // Add new application (called after registration)
  const addApplication = (data: Omit<PendingApplication, 'id' | 'submittedDate' | 'paymentStatus'>): PendingApplication => {
    const apps = getApps()
    const newApp: PendingApplication = {
      ...data,
      id: generateId(),
      submittedDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'pending_payment'
    }
    apps.push(newApp)
    saveApps(apps)
    return newApp
  }

  // Update payment status after successful payment
  const confirmPayment = (id: string, paymentMethod: string, amountPaid: number): void => {
    const apps = getApps()
    const app = apps.find(a => a.id === id)
    if (app) {
      app.paymentMethod = paymentMethod
      app.amountPaid = amountPaid
      app.paidAmount = amountPaid
      app.paymentStatus = 'pending_verification'
      app.paidDate = new Date().toISOString().split('T')[0]
      saveApps(apps)
    }
  }

  // Approve application
  const approveApplication = (id: string, approver: string): void => {
    const apps = getApps()
    const app = apps.find(a => a.id === id)
    if (app) {
      app.paymentStatus = 'approved'
      app.approvedDate = new Date().toISOString().split('T')[0]
      app.approvedBy = approver
      saveApps(apps)
    }
  }

  // Reject application
  const rejectApplication = (id: string, rejecter: string, reason: string): void => {
    const apps = getApps()
    const app = apps.find(a => a.id === id)
    if (app) {
      app.paymentStatus = 'rejected'
      app.rejectedDate = new Date().toISOString().split('T')[0]
      app.rejectedBy = rejecter
      app.rejectionReason = reason
      saveApps(apps)
    }
  }

  // Get application by ID
  const getById = (id: string): PendingApplication | undefined =>
    getApps().find(a => a.id === id)

  // Get latest pending payment application (for payment page)
  const getLatestForPayment = (): PendingApplication | undefined => {
    const pending = getApps()
      .filter(a => a.paymentStatus === 'pending_payment')
      .sort((a, b) => b.id.localeCompare(a.id))
    return pending[0]
  }

  // Count pending verification (for badge)
  const pendingCount = computed(() => getPendingVerification().length)

  return {
    getAll,
    getPendingVerification,
    getApproved,
    getRejected,
    getPendingPayment,
    addApplication,
    confirmPayment,
    approveApplication,
    rejectApplication,
    getById,
    getLatestForPayment,
    pendingCount
  }
}
