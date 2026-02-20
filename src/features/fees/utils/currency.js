/**
 * src/features/fees/utils/currency.js
 * Currency formatting for amounts (₱ / PHP).
 */

const CURRENCY_SYMBOL = '₱';

/**
 * Format amount as currency.
 * @param {number} amount
 * @param {Object} [opts] - Intl.NumberFormat options
 * @returns {string}
 */
export function formatCurrency(amount, opts = {}) {
  const num = Number(amount);
  if (Number.isNaN(num)) return `${CURRENCY_SYMBOL}0.00`;
  return `${CURRENCY_SYMBOL}${num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...opts,
  })}`;
}

export { CURRENCY_SYMBOL };
