/**
 * src/features/classes/classSlice.js
 * Manages classList, selectedClass, filters. Thunks for CRUD and fetching form dependencies (Teachers).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as classService from './classService';
import { fetchTeachers } from '../teachers/teacherSlice';

const initialState = {
  classList: [],
  selectedClass: null,
  loading: false,
  error: null,
  filters: {
    search: '',
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

export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().classes;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
      };
      const res = await classService.getClasses(params);
      return res;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchClassById = createAsyncThunk(
  'classes/fetchClassById',
  async ({ id, populate = false }, { rejectWithValue }) => {
    try {
      return await classService.getClassById(id, { populate });
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/** Fetches Teachers (and optionally subjects) needed for Class form. Uses teachers slice. */
export const fetchClassFormDependencies = createAsyncThunk(
  'classes/fetchFormDependencies',
  async (_, { dispatch, getState }) => {
    const { teachers } = getState();
    if (!teachers.teacherList?.length) {
      await dispatch(fetchTeachers()).unwrap();
    }
    return {};
  }
);

export const createClassThunk = createAsyncThunk(
  'classes/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await classService.createClass(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateClassThunk = createAsyncThunk(
  'classes/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await classService.updateClass(id, payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteClassThunk = createAsyncThunk(
  'classes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await classService.deleteClass(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const classesSlice = createSlice({
  name: 'classes',
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
    clearSelectedClass(state) {
      state.selectedClass = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.classList = payload.data ?? payload.classes ?? (Array.isArray(payload) ? payload : []);
        const total = payload.totalCount ?? payload.total ?? state.classList.length;
        state.pagination.totalCount = total;
        state.pagination.totalPages = Math.ceil(total / state.pagination.limit) || 1;
      })
      .addCase(fetchClasses.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to fetch classes';
      })
      .addCase(fetchClassById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClassById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedClass = payload;
      })
      .addCase(fetchClassById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to fetch class';
      })
      .addCase(createClassThunk.fulfilled, (state, { payload }) => {
        state.classList = [payload, ...state.classList];
        state.pagination.totalCount += 1;
      })
      .addCase(createClassThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to create class';
      })
      .addCase(updateClassThunk.fulfilled, (state, { payload }) => {
        const idx = state.classList.findIndex((c) => c.id === payload.id);
        if (idx !== -1) state.classList[idx] = payload;
        if (state.selectedClass?.id === payload.id) state.selectedClass = payload;
      })
      .addCase(updateClassThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to update class';
      })
      .addCase(deleteClassThunk.fulfilled, (state, { payload }) => {
        state.classList = state.classList.filter((c) => c.id !== payload);
        if (state.selectedClass?.id === payload) state.selectedClass = null;
        state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
      })
      .addCase(deleteClassThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to delete class';
      });
  },
});

export const {
  setFilters,
  setPage,
  setLimit,
  clearFilters,
  clearSelectedClass,
  clearError,
} = classesSlice.actions;

export const selectAllClasses = (state) => state.classes.classList ?? [];

export default classesSlice.reducer;
