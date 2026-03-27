/**
 * src/features/classes/classService.js
 * CRUD for classes. getClassById can optionally populate student and teacher details.
 */

import { api } from '../../services/api';

const BASE = '/classes';

function toApiClass(cls) {
  if (!cls) return null;
  return {
    id: cls.id,
    gradeLevel: cls.gradeLevel ?? cls.grade_level,
    section: cls.section,
    className: cls.className ?? cls.class_name,
    room: cls.room ?? null,
    schedule: cls.schedule ?? null,
    teacherId: cls.teacherId ?? cls.teacher_id ?? cls.adviser_id ?? null,
    adviser: cls.adviser ?? null,
    subjectIds: cls.subjectIds ?? cls.subject_ids ?? [],
    subjectTeachers: cls.subjectTeachers ?? cls.subject_teachers ?? [],
    students: cls.students ?? [],
    studentCount: cls.studentCount ?? cls.student_count ?? 0,
    academicYear: cls.academicYear ?? cls.academic_year,
    status: cls.status ?? 'active',
    createdAt: cls.createdAt ?? cls.created_at,
    updatedAt: cls.updatedAt ?? cls.updated_at,
  };
}

function getDefaultAcademicYear() {
  const year = new Date().getFullYear();
  return `${year}-${year + 1}`;
}

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
  if (Array.isArray(data)) {
    return { data: data.map(toApiClass), totalCount: data.length };
  }
  return {
    ...data,
    data: Array.isArray(data.data) ? data.data.map(toApiClass) : [],
  };
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
  return toApiClass(data);
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
  const snakePayload = {
    grade_level: payload.gradeLevel,
    section: payload.section,
    class_name: payload.className,
    academic_year: payload.academicYear || getDefaultAcademicYear(),
    adviser_id: payload.teacherId ?? null,
    subject_ids: Array.isArray(payload.subjectIds) ? payload.subjectIds : [],
    status: payload.status || 'active',
  };
  const { data } = await api.post(BASE, snakePayload);
  return toApiClass(data);
}

/**
 * @param {number} id
 * @param {Partial<ClassEntity>} payload
 */
export async function updateClass(id, payload) {
  const snakePayload = {};
  if (payload.gradeLevel !== undefined) snakePayload.grade_level = payload.gradeLevel;
  if (payload.section !== undefined) snakePayload.section = payload.section;
  if (payload.className !== undefined) snakePayload.class_name = payload.className;
  if (payload.academicYear !== undefined) snakePayload.academic_year = payload.academicYear;
  if (payload.teacherId !== undefined) snakePayload.adviser_id = payload.teacherId;
  if (Array.isArray(payload.subjectIds)) snakePayload.subject_ids = payload.subjectIds;
  if (payload.status !== undefined) snakePayload.status = payload.status;

  const { data } = await api.patch(`${BASE}/${id}`, snakePayload);
  return toApiClass(data);
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
