// formatters — Date/time formatting utilities
// Uses date-fns for consistent formatting

import { format, formatDistanceToNow } from 'date-fns'

/**
 * Format a Firestore timestamp to readable date string
 * @param {Object} timestamp - Firestore timestamp or Date
 * @returns {string} Formatted date (e.g. "Apr 25, 2026")
 */
export function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return format(date, 'MMM d, yyyy')
}

/**
 * Format a Firestore timestamp to readable date + time
 * @param {Object} timestamp - Firestore timestamp or Date
 * @returns {string} Formatted date-time (e.g. "Apr 25, 2026 at 3:00 PM")
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return format(date, "MMM d, yyyy 'at' h:mm a")
}

/**
 * Get relative time (e.g. "2 hours ago", "in 3 days")
 * @param {Object} timestamp - Firestore timestamp or Date
 * @returns {string} Relative time string
 */
export function timeAgo(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return formatDistanceToNow(date, { addSuffix: true })
}
