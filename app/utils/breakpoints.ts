import { breakpointsTailwind } from '@vueuse/core'

export const breakpoints = useBreakpoints(breakpointsTailwind)

export const isMobile = computed(() => breakpoints.smaller('lg').value)
