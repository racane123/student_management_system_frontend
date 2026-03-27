/**
 * src/features/enrollments/enrollmentService.js
 * CRUD for enrollments.
 */

import { api } from '../../services/api.js';

const BASE = '/enrollments';

/**
 * @typedef {Object} EnrollmentEntity
 * @property {number} id
 * @property {number} studentId
 * @property {number} classId
 * @property {string} enrollmentDate
 * @property {string} status
 * @property {number} [feeId]
 */

/**
 * @param {Object} params
 * @param {number} [params.studentId]
 * @param {number} [params.classId]
 */
export async function getEnrollments(params = {}) {
  const { data } = await api.get(BASE, { params });
  return data;
}

/**
 * @param {number} id
 */
export async function getEnrollmentById(id) {
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
}

/**
 * @param {Object} payload
 */
export async function createEnrollment(payload) {
  const { data } = await api.post(BASE, payload);
  return data;
}

/**
 * @param {number} id
 * @param {Object} payload
 */
export async function updateEnrollment(id, payload) {
  const { data } = await api.patch(`${BASE}/${id}`, payload);
  return data;
}

/**
 * @param {number} id
 */
export async function deleteEnrollment(id) {
  await api.delete(`${BASE}/${id}`);
}

export default {
  getEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
};
