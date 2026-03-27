/**
 * src/features/students/studentService.js
 * CRUD for students. getStudentById can optionally populate class details.
 */

import { api } from '../../services/api.js';

const BASE = '/students';

/**
 * @typedef {Object} StudentEntity
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 * @property {number} classId
 * @property {string} status
 * @property {string} dob
 * @property {string} [createdAt]
 */

/**
 * @param {Object} params
 * @param {string} [params.search] - name/email search
 * @param {number} [params.classId]
 * @param {string} [params.status]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 */
export async function getStudents(params = {}) {
  const backendParams = {
    ...params,
    search: params.name || params.search,
    class_id: params.classId,
    status: params.status,
    gender: params.gender,
    page: params.page,
    limit: params.limit,
  };
  const { data } = await api.get(BASE, { params: backendParams });
  return data;
}

/**
 * Optionally populate class details.
 * @param {number} id
 * @param {Object} [opts]
 * @param {boolean} [opts.populate] - if true, request class
 * @returns {Promise<StudentEntity & { class?: Object }>}
 */
export async function getStudentById(id, opts = {}) {
  const params = opts.populate ? { populate: 'class' } : {};
  const { data } = await api.get(`${BASE}/${id}`, { params });
  return data;
}

/**
 * @param {Object} payload - StudentEntity fields
 */
export async function createStudent(payload) {
  const snakePayload = {
    admission_no: payload.admissionNo,
    first_name: payload.firstName,
    last_name: payload.lastName,
    gender: payload.gender || null,
    date_of_birth: payload.dob,
    email: payload.email || null,
    phone: payload.phone || null,
    address: payload.address || null,
    class_id: payload.classId ? parseInt(payload.classId, 10) : null,
    guardian_name: payload.guardianName || null,
    guardian_phone: payload.guardianPhone || null,
    profile_image: payload.profileImage || null,
    status: payload.status || 'active',
  };
  const { data } = await api.post(BASE, snakePayload);
  return data;
}

/**
 * @param {number} id
 * @param {Partial<StudentEntity>} payload
 */
export async function updateStudent(id, payload) {
  const snakePayload = {
    first_name: payload.firstName,
    last_name: payload.lastName,
    gender: payload.gender || null,
    date_of_birth: payload.dob,
    email: payload.email || null,
    phone: payload.phone || null,
    address: payload.address || null,
    class_id: payload.classId ? parseInt(payload.classId, 10) : null,
    guardian_name: payload.guardianName || null,
    guardian_phone: payload.guardianPhone || null,
    profile_image: payload.profileImage || null,
    status: payload.status || 'active',
    admission_no: payload.admissionNo, // if changing
  };
  const { data } = await api.patch(`${BASE}/${id}`, snakePayload);
  return data;
}

/**
 * @param {number} id
 */
export async function deleteStudent(id) {
  await api.delete(`${BASE}/${id}`);
}

export default {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
