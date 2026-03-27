/**
 * src/features/teachers/teacherService.js
 * CRUD for teachers. getTeacherById can optionally populate assigned classes/subjects.
 */

import { api } from '../../services/api.js';

const BASE = '/teachers';

/**
 * @typedef {Object} TeacherEntity
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {string} [qualification]
 * @property {number[]} [subjectIds]
 * @property {number[]} [classIds]
 * @property {string} status
 */

/**
 * @param {Object} params
 * @param {string} [params.search]
 * @param {string} [params.status]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 */
export async function getTeachers(params = {}) {
  const { data } = await api.get(BASE, { params });
  return data;
}

/**
 * Optionally populate subjects/classes.
 * @param {number} id
 * @param {Object} [opts]
 * @param {boolean} [opts.populate] 
 */
export async function getTeacherById(id, opts = {}) {
  const params = opts.populate ? { populate: 'subjects,classes' } : {};
  const { data } = await api.get(`${BASE}/${id}`, { params });
  return data;
}

/**
 * @param {Object} payload - TeacherEntity fields
 */
export async function createTeacher(payload) {
  const snakePayload = {
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email || null,
    status: payload.status || 'active',
    subjects: Array.isArray(payload.subjects) ? payload.subjects : [],
    classes: Array.isArray(payload.classes) ? payload.classes : [],
  };
  const { data } = await api.post(BASE, snakePayload);
  return data;
}

/**
 * @param {number} id
 * @param {Partial<TeacherEntity>} payload
 */
export async function updateTeacher(id, payload) {
  const snakePayload = {};
  if (payload.firstName !== undefined) snakePayload.first_name = payload.firstName;
  if (payload.lastName !== undefined) snakePayload.last_name = payload.lastName;
  if (payload.email !== undefined) snakePayload.email = payload.email || null;
  if (payload.status !== undefined) snakePayload.status = payload.status;
  if (Array.isArray(payload.subjects)) snakePayload.subjects = payload.subjects;
  if (Array.isArray(payload.classes)) snakePayload.classes = payload.classes;

  const { data } = await api.patch(`${BASE}/${id}`, snakePayload);
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
