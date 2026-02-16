/**
 * src/store/index.js
 * Redux store – students feature.
 */

import { configureStore } from '@reduxjs/toolkit';
import studentsReducer from '../features/students/studentSlice';

export const store = configureStore({
  reducer: {
    students: studentsReducer,
  },
});

export default store;
