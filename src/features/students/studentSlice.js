/**
 * src/features/students/studentSlice.js
 * Redux slice: studentList, loading, error, filters, pagination + async thunks.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as studentService from './studentService';

const initialState = {
  studentList: [],
  currentStudent: null,
  loading: false,
  error: null,
  filters: {
    name: '',
    classId: '',
    status: '',
    gender: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  },
};

export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().students;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.name && { name: filters.name }),
        ...(filters.classId && { classId: filters.classId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.gender && { gender: filters.gender }),
      };
      const res = await studentService.getStudents(params);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchStudentById = createAsyncThunk(
  'students/fetchStudentById',
  async (id, { rejectWithValue }) => {
    try {
      return await studentService.getStudentById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createStudentThunk = createAsyncThunk(
  'students/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await studentService.createStudent(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateStudentThunk = createAsyncThunk(
  'students/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await studentService.updateStudent(id, payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteStudentThunk = createAsyncThunk(
  'students/delete',
  async (id, { rejectWithValue }) => {
    try {
      await studentService.deleteStudent(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setFilters(state, { payload }) {
      state.filters = { ...state.filters, ...payload };
    },
    setPage(state, { payload }) {
      state.pagination.page = payload;
    },
    setLimit(state, { payload }) {
      state.pagination.limit = payload;
      state.pagination.page = 1;
    },
    clearFilters(state) {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    clearCurrentStudent(state) {
      state.currentStudent = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchStudents
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.studentList = payload.data ?? payload.students ?? (Array.isArray(payload) ? payload : []);
        const total = payload.totalCount ?? payload.total ?? state.studentList.length;
        state.pagination.totalCount = total;
        state.pagination.totalPages = Math.ceil(total / state.pagination.limit) || 1;
      })
      .addCase(fetchStudents.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to fetch students';
      })
      // fetchStudentById
      .addCase(fetchStudentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentStudent = payload;
      })
      .addCase(fetchStudentById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to fetch student';
      })
      // create
      .addCase(createStudentThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(createStudentThunk.fulfilled, (state, { payload }) => {
        state.studentList = [payload, ...state.studentList];
        state.pagination.totalCount += 1;
      })
      .addCase(createStudentThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to create student';
      })
      // update
      .addCase(updateStudentThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to update student';
      })
      .addCase(updateStudentThunk.fulfilled, (state, { payload }) => {
        const idx = state.studentList.findIndex((s) => s.id === payload.id);
        if (idx !== -1) state.studentList[idx] = payload;
        if (state.currentStudent?.id === payload.id) state.currentStudent = payload;
      })
      // delete
      .addCase(deleteStudentThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to delete student';
      })
      .addCase(deleteStudentThunk.fulfilled, (state, { payload }) => {
        state.studentList = state.studentList.filter((s) => s.id !== payload);
        if (state.currentStudent?.id === payload) state.currentStudent = null;
        state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
      });
  },
});

export const {
  setFilters,
  setPage,
  setLimit,
  clearFilters,
  clearCurrentStudent,
  clearError,
} = studentsSlice.actions;

export default studentsSlice.reducer;
