/**
 * src/features/subjects/subjectSlice.js
 * subjectList, selectedSubject, filters (Assigned Teacher, Status).
 * Enrolled students calculated from classes slice + students in those classes.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as subjectService from './subjectService';

const initialState = {
  subjectList: [],
  selectedSubject: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    teacherId: '',
    status: '',
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

export const fetchSubjects = createAsyncThunk(
  'subjects/fetchSubjects',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().subjects;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.teacherId && { teacherId: filters.teacherId }),
        ...(filters.status && { status: filters.status }),
      };
      const res = await subjectService.getSubjects(params);
      return res;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchSubjectById = createAsyncThunk(
  'subjects/fetchSubjectById',
  async ({ id, populate = false }, { rejectWithValue }) => {
    try {
      return await subjectService.getSubjectById(id, { populate });
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createSubjectThunk = createAsyncThunk(
  'subjects/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await subjectService.createSubject(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateSubjectThunk = createAsyncThunk(
  'subjects/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await subjectService.updateSubject(id, payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteSubjectThunk = createAsyncThunk(
  'subjects/delete',
  async (id, { rejectWithValue }) => {
    try {
      await subjectService.deleteSubject(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const subjectsSlice = createSlice({
  name: 'subjects',
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
    clearSelectedSubject(state) {
      state.selectedSubject = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.subjectList = payload.data ?? payload.subjects ?? (Array.isArray(payload) ? payload : []);
        const total = payload.totalCount ?? payload.total ?? state.subjectList.length;
        state.pagination.totalCount = total;
        state.pagination.totalPages = Math.ceil(total / state.pagination.limit) || 1;
      })
      .addCase(fetchSubjects.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to fetch subjects';
      })
      .addCase(fetchSubjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjectById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedSubject = payload;
      })
      .addCase(fetchSubjectById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to fetch subject';
      })
      .addCase(createSubjectThunk.fulfilled, (state, { payload }) => {
        state.subjectList = [payload, ...state.subjectList];
        state.pagination.totalCount += 1;
      })
      .addCase(createSubjectThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to create subject';
      })
      .addCase(updateSubjectThunk.fulfilled, (state, { payload }) => {
        const idx = state.subjectList.findIndex((s) => s.id === payload.id);
        if (idx !== -1) state.subjectList[idx] = payload;
        if (state.selectedSubject?.id === payload.id) state.selectedSubject = payload;
      })
      .addCase(updateSubjectThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to update subject';
      })
      .addCase(deleteSubjectThunk.fulfilled, (state, { payload }) => {
        state.subjectList = state.subjectList.filter((s) => s.id !== payload);
        if (state.selectedSubject?.id === payload) state.selectedSubject = null;
        state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
      })
      .addCase(deleteSubjectThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to delete subject';
      });
  },
});

export const {
  setFilters,
  setPage,
  setLimit,
  clearFilters,
  clearSelectedSubject,
  clearError,
} = subjectsSlice.actions;

// --- Selectors: join subject data with teachers/classes on the fly ---

/** Enrolled students = count of students whose classId is in this subject's classIds */
export function selectEnrolledCountForSubject(subject, state) {
  const classIds = Array.isArray(subject?.classIds) ? subject.classIds : [];
  if (classIds.length === 0) return 0;
  const students = state.students?.studentList ?? [];
  return students.filter((s) => classIds.includes(s.classId ?? s.class)).length;
}

/** For a list of subjects, return map subjectId -> enrolled count */
export function selectEnrolledCountBySubjectId(state) {
  const subjects = state.subjects?.subjectList ?? [];
  const students = state.students?.studentList ?? [];
  const map = {};
  subjects.forEach((sub) => {
    const classIds = Array.isArray(sub.classIds) ? sub.classIds : [];
    map[sub.id] = students.filter((s) => classIds.includes(s.classId ?? s.class)).length;
  });
  return map;
}

export default subjectsSlice.reducer;
