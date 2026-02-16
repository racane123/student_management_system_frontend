/**
 * src/features/students/studentService.js
 * Service layer: Axios-based CRUD for students.
 */

import { api } from '../../services/api';

const BASE = '/students';

/**
 * @typedef {Object} Student
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} gender
 * @property {string} dob
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 * @property {number} classId
 * @property {string} guardianName
 * @property {string} guardianPhone
 * @property {string} [profileImage]
 * @property {string} status
 * @property {string} createdAt
 */

/**
 * @param {Object} params
 * @param {string} [params.name]
 * @param {number|string} [params.classId]
 * @param {string} [params.status]
 * @param {string} [params.gender]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 */
export async function getStudents(params = {}) {
  const { data } = await api.get(BASE, { params });
  return data;
}

/**
 * @param {number} id
 * @returns {Promise<Student>}
 */
export async function getStudentById(id) {
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
}

/**
 * @param {Omit<Student, 'id'|'createdAt'>} payload
 * @returns {Promise<Student>}
 */
export async function createStudent(payload) {
  const { data } = await api.post(BASE, payload);
  return data;
}

/**
 * @param {number} id
 * @param {Partial<Student>} payload
 * @returns {Promise<Student>}
 */
export async function updateStudent(id, payload) {
  const { data } = await api.patch(`${BASE}/${id}`, payload);
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
