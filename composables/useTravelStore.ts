// useTravelStore — P5 Travel Arrangements cross-portal sync (per docs §24, rev 3.4)
// Storage key: bsp:travel:${appId}. Rev 3.4 restructure: two sections by topic
// (flight + transportation), both jointly editable by school and student.
// Rev 3.3 (studentPart + schoolPart) is migrated to the new shape on first load.

import { ref, computed } from 'vue'

const STORAGE_PREFIX = 'bsp:travel:'

// Reactive cache so both school and student pages see updates within the
// same session (without reloading localStorage every time).
const cache = ref({})

function key(appId) {
  return `${STORAGE_PREFIX}${appId}`
}

function emptyFlight() {
  return {
    flightNumber: '',
    arrivalAirport: '',
    arrivalDate: '',
    arrivalTime: '',
    notes: '',         // free-text, jointly editable
    lastEditedBy: '',  // 'student' | 'school' | ''
    lastEditedAt: null,
  }
}

function emptyTransportation() {
  return {
    mode: '',         // '' | 'taxi' | 'train' | 'parents'
    eta: '',          // datetime-local string
    // taxi
    taxiCompany: '',
    driverName: '',
    driverPhone: '',
    vehicle: '',
    bookingRef: '',
    // train
    trainRoute: '',
    // parents
    parentName: '',
    parentPhone: '',
    // shared
    notes: '',        // free-text, jointly editable
    lastEditedBy: '',
    lastEditedAt: null,
  }
}

function emptyPlan() {
  return {
    flight: emptyFlight(),
    transportation: emptyTransportation(),
    status: 'pending',  // 'pending' | 'in_progress' | 'travel_arranged'
  }
}

// Rev 3.3 → rev 3.4 migration. If the stored plan still uses the old
// studentPart / schoolPart shape, copy values across and drop the legacy keys.
function migrateLegacyPlan(parsed) {
  if (parsed && parsed.studentPart && !parsed.flight) {
    const sp = parsed.studentPart || {}
    const sc = parsed.schoolPart || {}
    const modeMap = {
      'self-taxi': 'taxi',
      'school-pickup': 'taxi',
      'family': 'parents',
      'public': 'train',
    }
    return {
      flight: {
        ...emptyFlight(),
        flightNumber: sp.flightNumber || '',
        arrivalAirport: sp.arrivalAirport || '',
        arrivalDate: sp.arrivalDate || '',
        arrivalTime: sp.arrivalTime || '',
        notes: sp.notes || '',
        lastEditedBy: sp.submittedBy || '',
        lastEditedAt: sp.submittedAt || null,
      },
      transportation: {
        ...emptyTransportation(),
        mode: modeMap[sp.transferMode] || '',
        eta: sc.pickupTime || '',
        // taxi sub-fields from student-arranged side
        taxiCompany: sp.taxiCompany || '',
        driverName: sp.taxiDriverName || sc.pickupDriverName || '',
        driverPhone: sp.taxiDriverPhone || sc.pickupDriverPhone || '',
        vehicle: sc.pickupVehicle || '',
        bookingRef: sp.taxiBookingRef || '',
        // train
        trainRoute: sp.publicTransportRoute || '',
        // parents
        parentName: sp.familyContactName || '',
        parentPhone: sp.familyContactPhone || '',
        // shared
        notes: sc.notes || '',
        lastEditedBy: sc.submittedBy || sp.submittedBy || '',
        lastEditedAt: sc.submittedAt || sp.submittedAt || null,
      },
      status: parsed.status === 'travel_arranged' ? 'travel_arranged' : 'in_progress',
    }
  }
  return parsed
}

function loadFromStorage(appId) {
  if (typeof window === 'undefined') return emptyPlan()
  try {
    const raw = localStorage.getItem(key(appId))
    if (!raw) return emptyPlan()
    const parsed = JSON.parse(raw)
    const migrated = migrateLegacyPlan(parsed)
    // Back-fill any missing fields (graceful schema evolution).
    return {
      ...emptyPlan(),
      ...migrated,
      flight: { ...emptyFlight(), ...(migrated.flight || {}) },
      transportation: { ...emptyTransportation(), ...(migrated.transportation || {}) },
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

function stamp(section, by) {
  section.lastEditedBy = by
  section.lastEditedAt = new Date().toISOString()
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

  // Save the ✈️ Flight section. Caller passes partial flight fields.
  // `by` is 'student' or 'school' — used only for the audit stamp.
  function saveFlight(appId, partial, by = 'student') {
    const plan = getPlan(appId)
    plan.flight = { ...plan.flight, ...partial }
    stamp(plan.flight, by)
    plan.status = computeStatus(plan)
    saveToStorage(appId, plan)
    return plan
  }

  // Save the 🚗 Transportation section. Caller passes partial transportation fields.
  function saveTransportation(appId, partial, by = 'student') {
    const plan = getPlan(appId)
    plan.transportation = { ...plan.transportation, ...partial }
    stamp(plan.transportation, by)
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

  // Per §24.4 — required for "Mark Travel Arranged":
  //   transportation.mode filled AND transportation.eta filled.
  // Flight fields are NOT required (even when shown).
  function hasMinimumViableData(plan) {
    const t = plan.transportation
    return !!(t.mode && t.eta)
  }

  // Per §24.1 — flight is optional. Returns true if at least one flight field is filled.
  function hasFlightData(plan) {
    const f = plan.flight
    return !!(f.flightNumber || f.arrivalAirport || f.arrivalDate || f.arrivalTime || f.notes)
  }

  function computeStatus(plan) {
    if (plan.status === 'travel_arranged') return 'travel_arranged'
    if (hasMinimumViableData(plan)) return 'in_progress'
    return 'pending'
  }

  // rev 3.0.2 — added for student Restart flow (mirror useP3Store.clearForApp)
  // See docs §4.6 — clears travel state for one application.
  function clearForApp(appId: string) {
    delete cache.value[appId]
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem(key(appId)) } catch (e) { /* ignore */ }
    }
  }

  return {
    getPlan,
    refresh,
    saveFlight,
    saveTransportation,
    markTravelArranged,
    hasMinimumViableData,
    hasFlightData,
    clearForApp,
  }
}
