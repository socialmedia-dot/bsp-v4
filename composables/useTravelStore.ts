// useTravelStore — P5 Travel Arrangements cross-portal sync (per docs §24)
// Storage key: bsp:travel:${appId}. Each side writes its own part; the other
// side reads as display-only. Mirrors useP3Store pattern.

import { ref, computed } from 'vue'

const STORAGE_PREFIX = 'bsp:travel:'

// Reactive cache so both school and student pages see updates within the
// same session (without reloading localStorage every time).
const cache = ref({})

function key(appId) {
  return `${STORAGE_PREFIX}${appId}`
}

function emptyPlan() {
  return {
    studentPart: {
      flightNumber: '',
      arrivalAirport: '',
      arrivalDate: '',
      arrivalTime: '',
      transferMode: '',
      taxiCompany: '',
      taxiDriverName: '',
      taxiDriverPhone: '',
      taxiBookingRef: '',
      familyContactName: '',
      familyContactPhone: '',
      publicTransportRoute: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      notes: '',
      submittedAt: null,
      submittedBy: 'student',
    },
    schoolPart: {
      pickupDriverName: '',
      pickupVehicle: '',
      pickupDriverPhone: '',
      pickupTime: '',
      pickupPoint: '',
      notes: '',
      submittedAt: null,
      submittedBy: 'school',
    },
    status: 'pending',  // 'pending' | 'student_submitted' | 'school_submitted' | 'both_submitted' | 'travel_arranged'
  }
}

function loadFromStorage(appId) {
  if (typeof window === 'undefined') return emptyPlan()
  try {
    const raw = localStorage.getItem(key(appId))
    if (!raw) return emptyPlan()
    const parsed = JSON.parse(raw)
    // Back-fill any missing fields (graceful schema evolution).
    return {
      ...emptyPlan(),
      ...parsed,
      studentPart: { ...emptyPlan().studentPart, ...(parsed.studentPart || {}) },
      schoolPart: { ...emptyPlan().schoolPart, ...(parsed.schoolPart || {}) },
    }
  } catch (e) {
    console.error('[useTravelStore] load failed', e)
    return emptyPlan()
  }
}

function saveToStorage(appId, plan) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key(appId), JSON.stringify(plan))
  } catch (e) {
    console.error('[useTravelStore] save failed', e)
  }
}

export function useTravelStore() {
  function getPlan(appId) {
    if (!cache.value[appId]) {
      cache.value[appId] = loadFromStorage(appId)
    }
    return cache.value[appId]
  }

  function refresh(appId) {
    cache.value[appId] = loadFromStorage(appId)
    return cache.value[appId]
  }

  function saveStudentPart(appId, partial) {
    const plan = getPlan(appId)
    plan.studentPart = {
      ...plan.studentPart,
      ...partial,
      submittedAt: new Date().toISOString(),
      submittedBy: 'student',
    }
    plan.status = computeStatus(plan)
    saveToStorage(appId, plan)
    return plan
  }

  function saveSchoolPart(appId, partial) {
    const plan = getPlan(appId)
    plan.schoolPart = {
      ...plan.schoolPart,
      ...partial,
      submittedAt: new Date().toISOString(),
      submittedBy: 'school',
    }
    plan.status = computeStatus(plan)
    saveToStorage(appId, plan)
    return plan
  }

  function markTravelArranged(appId) {
    const plan = getPlan(appId)
    plan.status = 'travel_arranged'
    saveToStorage(appId, plan)
    return plan
  }

  // True if at least the minimum required fields for either part are present.
  function hasMinimumViableData(plan) {
    const sp = plan.studentPart
    const sc = plan.schoolPart
    const studentOk = !!(sp.flightNumber && sp.arrivalDate && sp.arrivalTime)
    const schoolOk = !!(sc.pickupDriverName && sc.pickupVehicle && sc.pickupDriverPhone)
    return studentOk || schoolOk
  }

  function computeStatus(plan) {
    if (plan.status === 'travel_arranged') return 'travel_arranged'
    const studentDone = !!(plan.studentPart.submittedAt)
    const schoolDone = !!(plan.schoolPart.submittedAt)
    if (studentDone && schoolDone) return 'both_submitted'
    if (studentDone) return 'student_submitted'
    if (schoolDone) return 'school_submitted'
    return 'pending'
  }

  return {
    getPlan,
    refresh,
    saveStudentPart,
    saveSchoolPart,
    markTravelArranged,
    hasMinimumViableData,
  }
}