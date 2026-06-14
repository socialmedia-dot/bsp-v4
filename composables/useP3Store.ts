import { ref, computed, watch } from 'vue'

export interface P3BankInfo {
  accountName: string
  accountNumber: string
  sortCode: string
  amount: number
  currency: string
  deadline: string
  reference?: string
}

export interface P3AuditEntry {
  at: string
  by: string
  byRole: 'school' | 'student' | 'consultant'
  action: string
  from?: string
  to?: string
}

export interface P3Deposit {
  id: string
  applicationRef: string
  status: 'sent_to_student' | 'proof_uploaded' | 'confirmed'
  createdAt: string
  bankInfo: P3BankInfo
  schoolFileName?: string
  schoolFileData?: string  // base64 data URL
  sentAt?: string
  proofFileName?: string
  proofFileData?: string
  proofUploadedAt?: string
  confirmedAt?: string
  confirmedBy?: string
  auditLog: P3AuditEntry[]
}

const STORAGE_KEY = 'bsp-v4-deposits'
const deposits = ref<P3Deposit[]>([])

function load() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) deposits.value = JSON.parse(raw)
  } catch (e) { console.error('[useP3Store] load failed', e) }
}

function save() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deposits.value))
  } catch (e) { console.error('[useP3Store] save failed', e) }
}

function genId() {
  return `p3-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function audit(deposit: P3Deposit, entry: Omit<P3AuditEntry, 'at'>) {
  deposit.auditLog.push({ ...entry, at: new Date().toISOString() })
}

export function useP3Store() {
  if (typeof window !== 'undefined' && deposits.value.length === 0) load()

  watch(deposits, () => save(), { deep: true })

  const getByApp = (appRef: string) => computed(() =>
    deposits.value.filter(d => d.applicationRef === appRef)
  )

  const getLatest = (appRef: string) => computed(() => {
    const list = deposits.value.filter(d => d.applicationRef === appRef)
    return list.length ? list[list.length - 1] : null
  })

  const isConfirmed = (appRef: string) => computed(() => {
    const list = deposits.value.filter(d => d.applicationRef === appRef)
    return list.some(d => d.status === 'confirmed')
  })

  const hasAnyRecord = (appRef: string) => computed(() =>
    deposits.value.some(d => d.applicationRef === appRef)
  )

  function sendDepositForm(
    appRef: string,
    bankInfo: P3BankInfo,
    file?: { name: string; dataUrl: string },
    by: string = 'school-admin'
  ) {
    const existing = deposits.value.find(d => d.applicationRef === appRef && d.status !== 'confirmed')
    if (existing) {
      // Revise existing record
      const prevStatus = existing.status
      existing.bankInfo = bankInfo
      existing.schoolFileName = file?.name
      existing.schoolFileData = file?.dataUrl
      existing.status = 'sent_to_student'
      delete existing.proofFileName
      delete existing.proofFileData
      delete existing.proofUploadedAt
      existing.sentAt = new Date().toISOString()
      audit(existing, { by, byRole: 'school', action: 'revise-deposit-form', from: prevStatus, to: 'sent_to_student' })
      return existing
    }

    const record: P3Deposit = {
      id: genId(),
      applicationRef: appRef,
      status: 'sent_to_student',
      createdAt: new Date().toISOString(),
      bankInfo,
      schoolFileName: file?.name,
      schoolFileData: file?.dataUrl,
      sentAt: new Date().toISOString(),
      auditLog: []
    }
    audit(record, { by, byRole: 'school', action: 'send-deposit-form', to: 'sent_to_student' })
    deposits.value.push(record)
    return record
  }

  function uploadDepositProof(
    appRef: string,
    file: { name: string; dataUrl: string },
    by: string = 'student'
  ) {
    const record = deposits.value.find(d => d.applicationRef === appRef)
    if (!record) throw new Error('Waiting for school to send deposit form')
    if (record.status === 'confirmed') throw new Error('Already confirmed, contact school to revise')

    const prevStatus = record.status
    record.proofFileName = file.name
    record.proofFileData = file.dataUrl
    record.proofUploadedAt = new Date().toISOString()
    record.status = 'proof_uploaded'
    audit(record, { by, byRole: 'student', action: 'upload-proof', from: prevStatus, to: 'proof_uploaded' })
    return record
  }

  function confirmDeposit(appRef: string, by: string = 'school-admin') {
    const record = deposits.value.find(d => d.applicationRef === appRef && d.status === 'proof_uploaded')
    if (!record) throw new Error('No proof uploaded yet')
    record.status = 'confirmed'
    record.confirmedAt = new Date().toISOString()
    record.confirmedBy = by
    audit(record, { by, byRole: 'school', action: 'confirm-deposit', from: 'proof_uploaded', to: 'confirmed' })
    return record
  }

  function reviseDepositForm(
    appRef: string,
    bankInfo: P3BankInfo,
    file?: { name: string; dataUrl: string },
    by: string = 'school-admin'
  ) {
    return sendDepositForm(appRef, bankInfo, file, by)
  }

  function clearForApp(appRef: string) {
    deposits.value = deposits.value.filter(d => d.applicationRef !== appRef)
  }

  function clearAll() {
    deposits.value = []
  }

  return {
    deposits,
    getByApp,
    getLatest,
    isConfirmed,
    hasAnyRecord,
    sendDepositForm,
    uploadDepositProof,
    confirmDeposit,
    reviseDepositForm,
    clearForApp,
    clearAll
  }
}