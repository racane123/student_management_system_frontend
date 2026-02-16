/**
 * src/features/subjects/subjectService.js
 * CRUD for subjects. Get requests support populated data or ID arrays for teachers and classes.
 */

import { api } from '../../services/api';

const BASE = '/subjects';

/**
 * @typedef {Object} Subject
 * @property {number} id
 * @property {string} [code]
 * @property {string} [name]
 * @property {string} [description]
 * @property {number[]} [teacherIds]
 * @property {number[]} [classIds]
 * @property {string} [status]
 * @property {string} [createdAt]
 */

function toIdArray(val) {
  if (val == null) return [];
  if (Array.isArray(val)) return val.map((x) => Number(x)).filter((n) => !Number.isNaN(n));
  return [];
}

/**
 * @param {Object} params
 * @param {string} [params.search] - name or code
 * @param {number|string} [params.teacherId]
 * @param {string} [params.status]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 */
export async function getSubjects(params = {}) {
  const { data } = await api.get(BASE, { params });
  return data;
}

/**
 * @param {number} id
 * @param {Object} [opts]
 * @param {boolean} [opts.populate] - request teachers and classes as populated objects
 */
export async function getSubjectById(id, opts = {}) {
  const query = opts.populate ? { populate: 'teachers,classes' } : {};
  const { data } = await api.get(`${BASE}/${id}`, { params: query });
  if (data) {
    data.teacherIds = toIdArray(data.teacherIds ?? data.teachers?.map((t) => t.id));
    data.classIds = toIdArray(data.classIds ?? data.classes?.map((c) => c.id));
  }
  return data;
}

/**
 * @param {Object} payload
 */
export async function createSubject(payload) {
  const { data } = await api.post(BASE, {
    ...payload,
    teacherIds: toIdArray(payload.teacherIds),
    classIds: toIdArray(payload.classIds),
  });
  return data;
}

/**
 * @param {number} id
 * @param {Partial<Subject>} payload
 */
export async function updateSubject(id, payload) {
  const { data } = await api.patch(`${BASE}/${id}`, {
    ...payload,
    teacherIds: payload.teacherIds != null ? toIdArray(payload.teacherIds) : undefined,
    classIds: payload.classIds != null ? toIdArray(payload.classIds) : undefined,
  });
  return data;
}

/**
 * @param {number} id
 */
export async function deleteSubject(id) {
  await api.delete(`${BASE}/${id}`);
}

export default {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};
