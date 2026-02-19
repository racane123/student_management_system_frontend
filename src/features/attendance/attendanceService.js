import { api } from '../../services/api';

const BASE = '/attendance';

/**
 * @param {string} classId
 * @param {object} params - {startDate, endDate, status}
 */
const getAttendanceByClass = async (classId, params = {}) => {
  const { data } = await api.get(`${BASE}/class/${classId}`, { params });
  return data;
};


/**
 * 
 * 
 * @param {object} payload - {classId, date, records: [{studentId, status, remarks}]}
 */

const markBulkAttendance = async (payload) => {
  const { data } = await api.post(`${BASE}/bulk`, payload);
  return data;
};


/**
 * 
 * @param {string} attendanceSessionId
 * @param {object} payload - {records: [{studentId, status, remarks}]}
 */


const updateBulkAttendance = async (attendanceSessionId, payload) => {
  const { data } = await api.put(`${BASE}/bulk/${attendanceSessionId}`, payload);
  return data;
};

/**
 * 
 * 
 * @param {string} classId
 * @param {object} params - {startDate, endDate}
 * 
 */


const getStudentAttendanceSummary = async (classId, params = {}) => {
  const { data } = await api.get(`${BASE}/summary/${classId}`, { params });
  return data;
};

/**
 * 
 * @param {string} classId
 * @param {object} date - ISO date string (YYYY-MM-DD)
 * 
 */

const checkAttendanceExists = async (classId, date) => {
  const { data } = await api.get(`${BASE}/exists`, { params: { classId, date } });
  return data;
};

/**
 * 
 * @param {string} classId
 * @param {string} date
 * 
 */

const getAttendanceByDate = async (classId, date) => {
  const { data } = await api.get(`${BASE}/date/${classId}`, { params: { classId, date } });
  return data;
};

const attendanceService = {
  getAttendanceByClass,
    markBulkAttendance,
    updateBulkAttendance,
    getStudentAttendanceSummary,
    checkAttendanceExists,
    getAttendanceByDate
}

export default attendanceService;