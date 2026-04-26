// src/utils/constants.js
// Shared constants used across multiple components

export const GRADIENT_FALLBACKS = [
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-teal-500 to-emerald-600',
  'from-amber-500 to-orange-600',
  'from-blue-500 to-indigo-600',
]

export function getGradient(eventId) {
  const idx = eventId?.charCodeAt(0) % GRADIENT_FALLBACKS.length || 0
  return GRADIENT_FALLBACKS[idx]
}
