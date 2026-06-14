import { useP3Store } from './useP3Store'

export function useP3Gate(appRef: () => string) {
  const p3store = useP3Store()

  const isP3Confirmed = computed(() => p3store.isConfirmed(appRef()).value)

  function gateBlockReason(targetPhase: number): string | null {
    if (targetPhase <= 3) return null
    if (isP3Confirmed.value) return null
    return `🔒 Phase ${targetPhase} is locked until Phase 3 (Deposit Exchange) is confirmed.`
  }

  return { isP3Confirmed, gateBlockReason }
}