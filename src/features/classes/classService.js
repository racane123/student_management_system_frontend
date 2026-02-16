/**
 * src/features/classes/classService.js
 * CRUD for classes. getClassById can optionally populate student and teacher details.
 */

import { api } from '../../services/api';

const BASE = '/classes';

/**
 * @typedef {Object} ClassEntity
 * @property {number} id
 * @property {string} [gradeLevel]
 * @property {string} [section]
 * @property {string} [className]
 * @property {string} [room]
 * @property {string} [schedule]
 * @property {number} [teacherId]
 * @property {number[]} [subjectIds]
 * @property {Array<{subjectId: number, teacherId: number}>} [subjectTeachers]
 * @property {string} [status]
 * @property {string} [createdAt]
 */

/**
 * @param {Object} params
 * @param {string} [params.search] - grade/section search
 * @param {string} [params.status]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 */
export async function getClasses(params = {}) {
  const { data } = await api.get(BASE, { params });
  return data;
}

/**
 * Optionally populate students and adviser (teacher) details.
 * @param {number} id
 * @param {Object} [opts]
 * @param {boolean} [opts.populate] - if true, request students + adviser
 * @returns {Promise<ClassEntity & { students?: Array, adviser?: Object }>}
 */
export async function getClassById(id, opts = {}) {
  const params = opts.populate ? { populate: 'students,adviser' } : {};
  const { data } = await api.get(`${BASE}/${id}`, { params });
  return data;
}

/**
 * @param {Object} payload
 * @param {string} [payload.gradeLevel]
 * @param {string} [payload.section]
 * @param {string} [payload.className]
 * @param {string} [payload.room]
 * @param {string} [payload.schedule]
 * @param {number} [payload.teacherId]
 * @param {number[]} [payload.subjectIds]
 * @param {Array<{subjectId: number, teacherId: number}>} [payload.subjectTeachers]
 * @param {string} [payload.status]
 */
export async function createClass(payload) {
  const { data } = await api.post(BASE, payload);
  return data;
}

/**
 * @param {number} id
 * @param {Partial<ClassEntity>} payload
 */
export async function updateClass(id, payload) {
  const { data } = await api.patch(`${BASE}/${id}`, payload);
  return data;
}

/**
 * @param {number} id
 */
export async function deleteClass(id) {
  await api.delete(`${BASE}/${id}`);
}

export default {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
};
