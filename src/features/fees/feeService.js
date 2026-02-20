/**
 * src/features/fees/feeService.js
 * Financial ledger: assignFee (single + bulk class-wide), recordPayment.
 */

import { api } from '../../services/api';

const BASE = '/fees';

/**
 * @typedef {Object} Fee
 * @property {number} id
 * @property {number} studentId
 * @property {string} feeType - Tuition | Lab | Misc
 * @property {number} totalAmount
 * @property {number} paidAmount
 * @property {number} balance
 * @property {string} status - Paid | Pending | Overdue
 * @property {string} dueDate - ISO date
 * @property {Array} paymentHistory
 */

/**
 * Assign a fee to a single student or whole class (bulk).
 * @param {Object} payload
 * @param {'individual'|'bulk'} payload.mode
 * @param {number} [payload.studentId] - Required for individual
 * @param {number} [payload.classId] - Required for bulk
 * @param {string} payload.feeType - Tuition | Lab | Misc
 * @param {number} payload.amount
 * @param {string} payload.dueDate - ISO date
 */
export async function assignFee(payload) {
  if (payload.mode === 'bulk') {
    const { data } = await api.post(`${BASE}/bulk`, payload);
    return data;
  }
  const { data } = await api.post(BASE, {
    studentId: payload.studentId,
    feeType: payload.feeType,
    totalAmount: payload.amount,
    dueDate: payload.dueDate,
  });
  return data;
}

/**
 * Record a payment against a fee.
 * @param {number} feeId
 * @param {Object} payload - { amount, paymentDate?, remarks? }
 */
export async function recordPayment(feeId, payload) {
  const { data } = await api.post(`${BASE}/${feeId}/payments`, payload);
  return data;
}

/**
 * @param {Object} params - classId, feeType, status, page, limit
 */
export async function getFees(params = {}) {
  const { data } = await api.get(BASE, { params });
  return data;
}

/**
 * @param {number} id
 */
export async function getFeeById(id) {
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
}

/**
 * Fetch revenue summary (total collected, pending, overdue).
 */
export async function getRevenueSummary() {
  const { data } = await api.get(`${BASE}/revenue-summary`);
  return data;
}

export default {
  assignFee,
  recordPayment,
  getFees,
  getFeeById,
  getRevenueSummary,
};
