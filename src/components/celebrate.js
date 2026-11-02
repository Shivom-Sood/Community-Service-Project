import confetti from 'canvas-confetti'

const COLORS = ['#2563eb', '#60a5fa', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']

/** Small burst from an element (e.g. the button just clicked). */
export function burst(element) {
  const rect = element?.getBoundingClientRect()
  const origin = rect
    ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight }
    : { x: 0.5, y: 0.6 }
  confetti({ particleCount: 40, spread: 60, startVelocity: 28, scalar: 0.8, ticks: 120, origin, colors: COLORS, disableForReducedMotion: true })
}

/** Big two-sided celebration for finishing something. */
export function celebrate() {
  const shared = { particleCount: 70, spread: 70, startVelocity: 50, ticks: 200, colors: COLORS, disableForReducedMotion: true }
  confetti({ ...shared, angle: 60, origin: { x: 0, y: 0.75 } })
  confetti({ ...shared, angle: 120, origin: { x: 1, y: 0.75 } })
}
