/**
 * src/features/reports/utils/exportToCSV.js
 * CSV export with clean headers matching table columns.
 * Uses Blob API for download (no json2csv dependency).
 */

/**
 * Escape a CSV cell (wrap in quotes if contains comma, quote, or newline).
 * @param {*} value
 * @returns {string}
 */
function escapeCell(value) {
  if (value == null) return '';
  const s = String(value).trim();
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Export an array of objects to CSV and trigger download.
 * Headers are taken from the first object's keys, or from the headers option.
 *
 * @param {Array<Object>} data - Array of row objects
 * @param {string} fileName - Download filename (e.g. "attendance_report.csv")
 * @param {Object} [opts]
 * @param {string[]} [opts.headers] - Column keys in order (default: Object.keys(data[0]))
 * @param {Record<string, string>} [opts.headerLabels] - Map key -> display label for header row
 */
export function exportToCSV(data, fileName, opts = {}) {
  if (!Array.isArray(data) || data.length === 0) {
    const headers = opts.headers || [];
    const headerLabels = opts.headerLabels || {};
    const labelRow = headers.map((h) => escapeCell(headerLabels[h] || h)).join(',');
    const blob = new Blob([labelRow + '\n'], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const keys = opts.headers || Object.keys(data[0]);
  const headerLabels = opts.headerLabels || {};
  const headerRow = keys.map((k) => escapeCell(headerLabels[k] || k)).join(',');

  const rows = data.map((row) =>
    keys.map((k) => escapeCell(row[k])).join(',')
  );

  const csvContent = [headerRow, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
