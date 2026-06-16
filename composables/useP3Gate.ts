// useP3Gate — composable that exposes a reactive gate guarding Phase 4+ until P3 Offering is confirmed.
// Uses Nuxt auto-import for useP3Store (no explicit import needed).

export function useP3Gate(appRef: () => string) {
  const p3store = useP3Store()

  const isP3Confirmed = computed(() => p3store.isConfirmed(appRef()).value)

  function gateBlockReason(targetPhase: number): string | null {
    if (targetPhase <= 3) return null
    if (isP3Confirmed.value) return null
    return `🔒 Phase ${targetPhase} is locked until Phase 3 (Offering) is confirmed.`  // rev 3.0
  }

  return { isP3Confirmed, gateBlockReason }
}
