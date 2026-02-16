/**
 * src/store/index.js
 * Redux store – students feature.
 */

import { configureStore } from '@reduxjs/toolkit';
import studentsReducer from '../features/students/studentSlice';
import teachersReducer from '../features/teachers/teacherSlice';
import classesReducer from '../features/classes/classSlice';
import subjectsReducer from '../features/subjects/subjectSlice';

export const store = configureStore({
  reducer: {
    students: studentsReducer,
    teachers: teachersReducer,
    classes: classesReducer,
    subjects: subjectsReducer,
  },
});

export default store;
