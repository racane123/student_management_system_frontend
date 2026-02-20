/**
 * src/features/fees/utils/feeStatus.js
 * Status automation: Paid, Pending, Overdue based on balance and due date.
 */

/**
 * Update fee status based on balance and due date.
 * - Paid: balance <= 0
 * - Overdue: balance > 0 and today > dueDate
 * - Pending: balance > 0 and today <= dueDate
 *
 * @param {number} balance - Remaining amount owed
 * @param {string} dueDate - ISO date string (YYYY-MM-DD)
 * @returns {'Paid'|'Pending'|'Overdue'}
 */
export function updateFeeStatus(balance, dueDate) {
  const b = Number(balance);
  if (Number.isNaN(b) || b <= 0) return 'Paid';

  if (!dueDate) return 'Pending';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return today > due ? 'Overdue' : 'Pending';
}
