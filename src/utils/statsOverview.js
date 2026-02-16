/**
 * MILESTONE 4: Dashboard – Stats Overview data mapping
 * Maps raw API/state data into a consistent shape for dashboard stat cards.
 * Place in: src/utils/statsOverview.js
 */

/**
 * @typedef {Object} StatCard
 * @property {string} label
 * @property {string|number} value
 * @property {string} [subLabel]
 * @property {string} [trend] - e.g. 'up' | 'down' | 'neutral'
 */

/**
 * Maps dashboard raw data into an array of stat cards for the overview section.
 *
 * @param {Object} raw - Raw data from API or state
 * @param {number} [raw.totalStudents]
 * @param {number} [raw.totalTeachers]
 * @param {number} [raw.totalClasses]
 * @param {number} [raw.totalRevenue]
 * @param {number} [raw.pendingFees]
 * @param {number} [raw.monthlyRevenue]
 * @returns {StatCard[]}
 */
export function mapStatsOverview(raw = {}) {
  const {
    totalStudents = 0,
    totalTeachers = 0,
    totalClasses = 0,
    totalRevenue = 0,
    pendingFees = 0,
    monthlyRevenue = 0,
  } = raw;

  return [
    { label: 'Total Students', value: totalStudents, subLabel: 'Enrolled' },
    { label: 'Teachers', value: totalTeachers, subLabel: 'Active' },
    { label: 'Classes', value: totalClasses, subLabel: 'Sections' },
    { label: 'Revenue (MTD)', value: formatCurrency(monthlyRevenue), trend: monthlyRevenue >= 0 ? 'up' : 'down' },
    { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
    { label: 'Pending Fees', value: formatCurrency(pendingFees), trend: pendingFees > 0 ? 'down' : 'neutral' },
  ].filter(Boolean);
}

function formatCurrency(num) {
  if (typeof num !== 'number' || Number.isNaN(num)) return '0';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(num);
}

export default mapStatsOverview;
