/**
 * src/store/index.js
 * Redux store – students feature.
 */

import { configureStore } from '@reduxjs/toolkit';
import studentsReducer from '../features/students/studentSlice';
import teachersReducer from '../features/teachers/teacherSlice';
import classesReducer from '../features/classes/classSlice';
import subjectsReducer from '../features/subjects/subjectSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import examsReducer from '../features/exams/examSlice';
import resultsReducer from '../features/results/resultSlice';
import feesReducer from '../features/fees/feeSlice';
import reportsReducer from '../features/reports/reportSlice';

export const store = configureStore({
  reducer: {
    students: studentsReducer,
    teachers: teachersReducer,
    classes: classesReducer,
    subjects: subjectsReducer,
    attendance: attendanceReducer,
    exams: examsReducer,
    results: resultsReducer,
    fees: feesReducer,
    reports: reportsReducer,
  },
});

export default store;
