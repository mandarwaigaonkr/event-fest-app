// exportData — SheetJS Excel/CSV export utilities
// Phase 7: Export registrations and attendance data

import * as XLSX from 'xlsx'

/**
 * Export data array to Excel file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Output filename (without extension)
 */
export function exportToExcel(data, filename) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}
