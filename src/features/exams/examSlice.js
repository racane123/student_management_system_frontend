/**
 * src/features/exams/examSlice.js
 * examList, filters, duplicate check selector (same Class + Subject + Name) before POST.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as examService from './examService';

const initialState = {
  examList: [],
  currentExam: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    classId: '',
    date: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  },
};

function getErrorMessage(err) {
  const msg = err.response?.data?.message || err.message;
  if (typeof msg === 'string') return msg;
  if (err.response?.data?.errors) {
    return Object.values(err.response.data.errors).flat().join(', ');
  }
  return 'Request failed';
}

export const fetchExams = createAsyncThunk(
  'exams/fetchExams',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().exams;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.classId && { classId: filters.classId }),
        ...(filters.date && { date: filters.date }),
      };
      const res = await examService.getExams(params);
      return res;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchExamById = createAsyncThunk(
  'exams/fetchExamById',
  async (id, { rejectWithValue }) => {
    try {
      return await examService.getExamById(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createExamThunk = createAsyncThunk(
  'exams/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await examService.createExam(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateExamThunk = createAsyncThunk(
  'exams/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await examService.updateExam(id, payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteExamThunk = createAsyncThunk(
  'exams/delete',
  async (id, { rejectWithValue }) => {
    try {
      await examService.deleteExam(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const examsSlice = createSlice({
  name: 'exams',
  initialState,
  reducers: {
    setFilters(state, { payload }) {
      state.filters = { ...state.filters, ...payload };
    },
    setPage(state, { payload }) {
      state.pagination.page = payload;
    },
    clearFilters(state) {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    clearCurrentExam(state) {
      state.currentExam = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.examList = payload.data ?? payload.exams ?? (Array.isArray(payload) ? payload : []);
        const total = payload.totalCount ?? payload.total ?? state.examList.length;
        state.pagination.totalCount = total;
        state.pagination.totalPages = Math.ceil(total / state.pagination.limit) || 1;
      })
      .addCase(fetchExams.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to fetch exams';
      })
      .addCase(fetchExamById.fulfilled, (state, { payload }) => {
        state.currentExam = payload;
      })
      .addCase(fetchExamById.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to fetch exam';
      })
      .addCase(createExamThunk.fulfilled, (state, { payload }) => {
        state.examList = [payload, ...state.examList];
        state.pagination.totalCount += 1;
      })
      .addCase(createExamThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to create exam';
      })
      .addCase(updateExamThunk.fulfilled, (state, { payload }) => {
        const idx = state.examList.findIndex((e) => e.id === payload.id);
        if (idx !== -1) state.examList[idx] = payload;
        if (state.currentExam?.id === payload.id) state.currentExam = payload;
      })
      .addCase(deleteExamThunk.fulfilled, (state, { payload }) => {
        state.examList = state.examList.filter((e) => e.id !== payload);
        if (state.currentExam?.id === payload) state.currentExam = null;
        state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
      });
  },
});

export const {
  setFilters,
  setPage,
  clearFilters,
  clearCurrentExam,
  clearError,
} = examsSlice.actions;

/**
 * Duplicate check: same Class + Subject + Name.
 * Returns true if a duplicate exists (excluding optional excludeId).
 */
export const selectIsDuplicateExam = (classId, subjectId, name, excludeId) => (state) => {
  const list = state.exams?.examList ?? [];
  const c = Number(classId);
  const s = Number(subjectId);
  const n = (name ?? '').toString().trim().toLowerCase();
  if (!c || !s || !n) return false;
  return list.some(
    (e) =>
      (e.classId ?? e.class) === c &&
      (e.subjectId ?? e.subject) === s &&
      (e.name ?? '').toString().trim().toLowerCase() === n &&
      (excludeId == null || e.id !== excludeId)
  );
};

export default examsSlice.reducer;
