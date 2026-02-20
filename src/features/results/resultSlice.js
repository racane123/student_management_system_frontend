/**
 * src/features/results/resultSlice.js
 * Manages resultList. Logic-heavy thunk/helper for Grade (A-F) and Status (Passed/Failed).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as resultService from './resultService';
import { calculateGrade } from './utils/gradingConstants';

const initialState = {
  resultList: [],
  currentResult: null,
  loading: false,
  error: null,
  filters: {
    classId: '',
    subjectId: '',
    examId: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  },
  existingResultIds: [], // ['studentId_examId'] for duplicate check
  isSubmitting: false,
  submitSuccess: false,
};

function getErrorMessage(err) {
  const msg = err.response?.data?.message || err.message;
  if (typeof msg === 'string') return msg;
  if (err.response?.data?.errors) {
    return Object.values(err.response.data.errors).flat().join(', ');
  }
  return 'Request failed';
}

/**
 * Augment each result with computed percentage, grade, status.
 * Uses totalMarks and passingMarks from exam (passed as param or from result.exam).
 */
export function augmentResultWithGrade(result, totalMarks, passingMarks) {
  const marks = result.marksObtained ?? 0;
  const total = totalMarks ?? 100;
  const passing = passingMarks ?? 40;
  const computed = calculateGrade(marks, total, passing);
  return {
    ...result,
    percentage: result.percentage ?? computed.percentage,
    grade: result.grade ?? computed.grade,
    status: result.status ?? computed.status,
    gradeColor: computed.color,
  };
}

export const fetchResults = createAsyncThunk(
  'results/fetchResults',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().results;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.classId && { classId: filters.classId }),
        ...(filters.subjectId && { subjectId: filters.subjectId }),
        ...(filters.examId && { examId: filters.examId }),
      };
      const res = await resultService.getResults(params);
      return res;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchResultById = createAsyncThunk(
  'results/fetchResultById',
  async (id, { rejectWithValue }) => {
    try {
      return await resultService.getResultById(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Fetch existing results for an exam (for duplicate check).
 */
export const fetchResultsByExam = createAsyncThunk(
  'results/fetchByExam',
  async (examId, { rejectWithValue }) => {
    try {
      const res = await resultService.getResultsByExam(examId);
      const list = res.data ?? res.results ?? (Array.isArray(res) ? res : []);
      return list;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Bulk enter results for an exam.
 * Payload: { examId, records: [{ studentId, marksObtained }] }
 */
export const enterResultsThunk = createAsyncThunk(
  'results/enterResults',
  async (payload, { rejectWithValue }) => {
    try {
      return await resultService.enterResults(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateResultThunk = createAsyncThunk(
  'results/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await resultService.updateResult(id, payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteResultThunk = createAsyncThunk(
  'results/delete',
  async (id, { rejectWithValue }) => {
    try {
      await resultService.deleteResult(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const resultsSlice = createSlice({
  name: 'results',
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
    clearCurrentResult(state) {
      state.currentResult = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    resetSubmitState(state) {
      state.isSubmitting = false;
      state.submitSuccess = false;
    },
    setExistingResultIds(state, { payload }) {
      state.existingResultIds = Array.isArray(payload) ? payload : [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResults.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.resultList =
          payload.data ?? payload.results ?? (Array.isArray(payload) ? payload : []);
        const total =
          payload.totalCount ?? payload.total ?? state.resultList.length;
        state.pagination.totalCount = total;
        state.pagination.totalPages =
          Math.ceil(total / state.pagination.limit) || 1;
      })
      .addCase(fetchResults.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to fetch results';
      })
      .addCase(fetchResultById.fulfilled, (state, { payload }) => {
        state.currentResult = payload;
      })
      .addCase(fetchResultById.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to fetch result';
      })
      .addCase(fetchResultsByExam.fulfilled, (state, { payload }) => {
        const ids = [];
        (payload ?? []).forEach((r) => {
          const sid = r.studentId ?? r.student;
          const eid = r.examId ?? r.exam;
          if (sid != null && eid != null) ids.push(`${sid}_${eid}`);
        });
        state.existingResultIds = ids;
      })
      .addCase(enterResultsThunk.pending, (state) => {
        state.isSubmitting = true;
        state.submitSuccess = false;
        state.error = null;
      })
      .addCase(enterResultsThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        state.submitSuccess = true;
        const list = payload.data ?? payload.results ?? (Array.isArray(payload) ? payload : []);
        list.forEach((r) => {
          const sid = r.studentId ?? r.student;
          const eid = r.examId ?? r.exam;
          if (sid != null && eid != null) {
            const key = `${sid}_${eid}`;
            if (!state.existingResultIds.includes(key)) {
              state.existingResultIds.push(key);
            }
          }
        });
        state.resultList = [...(state.resultList ?? []), ...list];
      })
      .addCase(enterResultsThunk.rejected, (state, { payload }) => {
        state.isSubmitting = false;
        state.error = payload ?? 'Failed to save results';
      })
      .addCase(updateResultThunk.fulfilled, (state, { payload }) => {
        const idx = state.resultList.findIndex((r) => r.id === payload.id);
        if (idx !== -1) state.resultList[idx] = payload;
        if (state.currentResult?.id === payload.id) state.currentResult = payload;
      })
      .addCase(deleteResultThunk.fulfilled, (state, { payload }) => {
        state.resultList = state.resultList.filter((r) => r.id !== payload);
        if (state.currentResult?.id === payload) state.currentResult = null;
        state.pagination.totalCount = Math.max(
          0,
          state.pagination.totalCount - 1
        );
      });
  },
});

export const {
  setFilters,
  setPage,
  clearFilters,
  clearCurrentResult,
  clearError,
  resetSubmitState,
  setExistingResultIds,
} = resultsSlice.actions;

/** Returns true if a result for studentId + examId already exists. */
export const selectResultExists = (studentId, examId) => (state) => {
  const ids = state.results?.existingResultIds ?? [];
  return ids.includes(`${studentId}_${examId}`);
};

export const selectAllResults = (state) => state.results?.resultList ?? [];

/** Aggregate: Average Score and Pass Rate for a list of results. */
export const selectAggregateStats = (results, totalMarks, passingMarks) => {
  if (!results?.length) return { averageScore: 0, passRate: 0 };
  const sum = results.reduce((acc, r) => acc + (r.marksObtained ?? 0), 0);
  const passCount = results.filter(
    (r) => (r.marksObtained ?? 0) >= (passingMarks ?? 0)
  ).length;
  return {
    averageScore: sum / results.length,
    passRate: (passCount / results.length) * 100,
  };
};

export default resultsSlice.reducer;
