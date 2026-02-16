/**
 * src/features/teachers/teacherService.js
 * Service layer: CRUD for teachers with relational array handling (subjects, classes).
 */

import { api } from '../../services/api';

const BASE = '/teachers';

/**
 * Normalize array field from API (null/undefined/empty → []).
 * @param {unknown} value
 * @returns {number[]}
 */
function toIdArray(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map((x) => Number(x)).filter((n) => !Number.isNaN(n));
  return [];
}

/**
 * @typedef {Object} Teacher
 * @property {number} id
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [qualification]
 * @property {number} [experience]
 * @property {string} [hireDate]
 * @property {string} [profileImage]
 * @property {string} [status]
 * @property {number[]} [subjects]
 * @property {number[]} [classes]
 * @property {string} [createdAt]
 */

/**
 * @param {Object} params
 * @param {string} [params.search] - ID or name
 * @param {number|string} [params.subjectId]
 * @param {string} [params.status]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 */
export async function getTeachers(params = {}) {
  const { data } = await api.get(BASE, { params });
  return data;
}

/**
 * @param {number} id
 * @returns {Promise<Teacher>}
 */
export async function getTeacherById(id) {
  const { data } = await api.get(`${BASE}/${id}`);
  // Ensure relational arrays are always arrays
  if (data) {
    data.subjects = toIdArray(data.subjects);
    data.classes = toIdArray(data.classes);
  }
  return data;
}

/**
 * Normalize payload: ensure subjects and classes are arrays of IDs for API.
 * @param {Object} payload
 */
function normalizePayload(payload) {
  const out = { ...payload };
  out.subjects = toIdArray(payload.subjects);
  out.classes = toIdArray(payload.classes);
  return out;
}

/**
 * @param {Omit<Teacher, 'id'|'createdAt'>} payload
 * @returns {Promise<Teacher>}
 */
export async function createTeacher(payload) {
  const { data } = await api.post(BASE, normalizePayload(payload));
  if (data) {
    data.subjects = toIdArray(data.subjects);
    data.classes = toIdArray(data.classes);
  }
  return data;
}

/**
 * @param {number} id
 * @param {Partial<Teacher>} payload
 * @returns {Promise<Teacher>}
 */
export async function updateTeacher(id, payload) {
  const { data } = await api.patch(`${BASE}/${id}`, normalizePayload(payload));
  if (data) {
    data.subjects = toIdArray(data.subjects);
    data.classes = toIdArray(data.classes);
  }
  return data;
}

/**
 * @param {number} id
 */
export async function deleteTeacher(id) {
  await api.delete(`${BASE}/${id}`);
}

export default {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
