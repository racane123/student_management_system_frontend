/**
 * src/features/teachers/teacherSlice.js
 * RTK slice: teacherList, filters (subject, status), pagination; thunks with relational error handling.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as teacherService from './teacherService';

const initialState = {
  teacherList: [],
  currentTeacher: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    subjectId: '',
    status: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  },
};

/** Extract message from API error (relational or validation). */
function getErrorMessage(err) {
  const msg = err.response?.data?.message || err.message;
  if (typeof msg === 'string') return msg;
  if (err.response?.data?.errors) {
    return Object.values(err.response.data.errors).flat().join(', ');
  }
  return 'Request failed';
}

export const fetchTeachers = createAsyncThunk(
  'teachers/fetchTeachers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().teachers;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.subjectId && { subjectId: filters.subjectId }),
        ...(filters.status && { status: filters.status }),
      };
      const res = await teacherService.getTeachers(params);
      return res;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchTeacherById = createAsyncThunk(
  'teachers/fetchTeacherById',
  async (id, { rejectWithValue }) => {
    try {
      return await teacherService.getTeacherById(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createTeacherThunk = createAsyncThunk(
  'teachers/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await teacherService.createTeacher(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateTeacherThunk = createAsyncThunk(
  'teachers/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await teacherService.updateTeacher(id, payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteTeacherThunk = createAsyncThunk(
  'teachers/delete',
  async (id, { rejectWithValue }) => {
    try {
      await teacherService.deleteTeacher(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const teachersSlice = createSlice({
  name: 'teachers',
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
    clearCurrentTeacher(state) {
      state.currentTeacher = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.teacherList = payload.data ?? payload.teachers ?? (Array.isArray(payload) ? payload : []);
        const total = payload.totalCount ?? payload.total ?? state.teacherList.length;
        state.pagination.totalCount = total;
        state.pagination.totalPages = Math.ceil(total / state.pagination.limit) || 1;
      })
      .addCase(fetchTeachers.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to fetch teachers';
      })
      .addCase(fetchTeacherById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentTeacher = payload;
      })
      .addCase(fetchTeacherById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to fetch teacher';
      })
      .addCase(createTeacherThunk.fulfilled, (state, { payload }) => {
        state.teacherList = [payload, ...state.teacherList];
        state.pagination.totalCount += 1;
      })
      .addCase(createTeacherThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to create teacher';
      })
      .addCase(updateTeacherThunk.fulfilled, (state, { payload }) => {
        const idx = state.teacherList.findIndex((t) => t.id === payload.id);
        if (idx !== -1) state.teacherList[idx] = payload;
        if (state.currentTeacher?.id === payload.id) state.currentTeacher = payload;
      })
      .addCase(updateTeacherThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to update teacher';
      })
      .addCase(deleteTeacherThunk.fulfilled, (state, { payload }) => {
        state.teacherList = state.teacherList.filter((t) => t.id !== payload);
        if (state.currentTeacher?.id === payload) state.currentTeacher = null;
        state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
      })
      .addCase(deleteTeacherThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to delete teacher';
      });
  },
});

export const {
  setFilters,
  setPage,
  setLimit,
  clearFilters,
  clearCurrentTeacher,
  clearError,
} = teachersSlice.actions;

export default teachersSlice.reducer;
