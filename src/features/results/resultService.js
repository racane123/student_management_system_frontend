/**
 * src/features/results/resultService.js
 * CRUD for results. enterResults handles bulk submissions.
 */

import { api } from '../../services/api';

const BASE = '/results';

/**
 * @typedef {Object} Result
 * @property {number} id
 * @property {number} studentId
 * @property {number} examId
 * @property {number} marksObtained
 * @property {number} [percentage]
 * @property {string} [grade]
 * @property {string} [status] Passed | Failed
 */

/**
 * @param {Object} params
 * @param {number|string} [params.classId]
 * @param {number|string} [params.subjectId]
 * @param {number|string} [params.examId]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 */
export async function getResults(params = {}) {
  const { data } = await api.get(BASE, { params });
  return data;
}

/**
 * @param {number} id
 */
export async function getResultById(id) {
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
}

/**
 * Check if results exist for studentId + examId (duplicate prevention).
 * @param {number} studentId
 * @param {number} examId
 */
export async function checkResultExists(studentId, examId) {
  const { data } = await api.get(`${BASE}/exists`, {
    params: { studentId, examId },
  });
  return data;
}

/**
 * Bulk enter results for an exam. Maps through students and submits in one API call.
 * @param {Object} payload
 * @param {number} payload.examId
 * @param {Array<{ studentId: number, marksObtained: number }>} payload.records
 */
export async function enterResults(payload) {
  const { data } = await api.post(`${BASE}/bulk`, payload);
  return data;
}

/**
 * @param {number} id
 * @param {Partial<Result>} payload
 */
export async function updateResult(id, payload) {
  const { data } = await api.patch(`${BASE}/${id}`, payload);
  return data;
}

/**
 * @param {number} id
 */
export async function deleteResult(id) {
  await api.delete(`${BASE}/${id}`);
}

/**
 * Get results for a specific exam (e.g. for duplicate check or listing).
 * @param {number} examId
 */
export async function getResultsByExam(examId) {
  const { data } = await api.get(BASE, { params: { examId, limit: 1000 } });
  return data;
}

export default {
  getResults,
  getResultById,
  checkResultExists,
  enterResults,
  updateResult,
  deleteResult,
  getResultsByExam,
};
