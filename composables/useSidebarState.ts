export const useSidebarState = () => {
  const isOpen = useState('bsp-sidebar-open', () => false)
  const toggle = () => isOpen.value = !isOpen.value
  const close = () => isOpen.value = false
  return { isOpen, toggle, close }
}
