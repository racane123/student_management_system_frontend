/**
 * src/features/exams/examService.js
 * CRUD for exams.
 */

import { api } from '../../services/api';

const BASE = '/exams';

/**
 * @typedef {Object} Exam
 * @property {number} id
 * @property {string} name
 * @property {number} classId
 * @property {number} subjectId
 * @property {string} examDate
 * @property {string} startTime
 * @property {string} endTime
 * @property {number} totalMarks
 * @property {number} passingMarks
 * @property {string} status
 * @property {string} [createdAt]
 */

/**
 * @param {Object} params
 * @param {string} [params.search]
 * @param {number|string} [params.classId]
 * @param {string} [params.date]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 */
export async function getExams(params = {}) {
  const { data } = await api.get(BASE, { params });
  return data;
}

/**
 * @param {number} id
 */
export async function getExamById(id) {
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
}

/**
 * @param {Object} payload
 */
export async function createExam(payload) {
  const { data } = await api.post(BASE, payload);
  return data;
}

/**
 * @param {number} id
 * @param {Partial<Exam>} payload
 */
export async function updateExam(id, payload) {
  const { data } = await api.patch(`${BASE}/${id}`, payload);
  return data;
}

/**
 * @param {number} id
 */
export async function deleteExam(id) {
  await api.delete(`${BASE}/${id}`);
}

export default {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
};
