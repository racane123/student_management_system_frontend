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
 * @param {Omit<Student, 'id'|'createdAt'> & { admissionNo: string }} payload
 * @returns {Promise<Student>}
 */
export async function createStudent(payload) {
  const body = {
    admission_no: payload.admissionNo,
    first_name: payload.firstName,
    last_name: payload.lastName,
    gender: payload.gender || null,
    date_of_birth: payload.dob || null,
    email: payload.email,
    phone: payload.phone,
    address: payload.address,
    class_id: payload.classId ?? null,
    guardian_name: payload.guardianName || null,
    guardian_phone: payload.guardianPhone || null,
    status: payload.status,
  };
  const { data } = await api.post(BASE, body);
  return data;
}

/**
 * @param {number} id
 * @param {Partial<Student> & { admissionNo?: string }} payload
 * @returns {Promise<Student>}
 */
export async function updateStudent(id, payload) {
  const body = {
    ...(payload.admissionNo != null && { admission_no: payload.admissionNo }),
    ...(payload.firstName != null && { first_name: payload.firstName }),
    ...(payload.lastName != null && { last_name: payload.lastName }),
    ...(payload.gender != null && { gender: payload.gender }),
    ...(payload.dob != null && { date_of_birth: payload.dob }),
    ...(payload.email != null && { email: payload.email }),
    ...(payload.phone != null && { phone: payload.phone }),
    ...(payload.address != null && { address: payload.address }),
    ...(payload.classId != null && { class_id: payload.classId }),
    ...(payload.guardianName != null && { guardian_name: payload.guardianName }),
    ...(payload.guardianPhone != null && { guardian_phone: payload.guardianPhone }),
    ...(payload.status != null && { status: payload.status }),
  };
  const { data } = await api.patch(`${BASE}/${id}`, body);
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
