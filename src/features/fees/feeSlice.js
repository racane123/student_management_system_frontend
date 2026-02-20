/**
 * src/features/fees/feeSlice.js
 * Financial ledger: feeList, revenueSummary.
 * Updates paidAmount, balance, status when payment is recorded.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as feeService from './feeService';
import { updateFeeStatus } from './utils/feeStatus';

const initialState = {
  feeList: [],
  currentFee: null,
  revenueSummary: {
    totalCollected: 0,
    pending: 0,
    overdue: 0,
  },
  loading: false,
  error: null,
  filters: {
    classId: '',
    feeType: '',
    status: '',
  },
  pagination: {
    page: 1,
    limit: 20,
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

/**
 * Compute status from balance and dueDate (for client-side augmentation).
 */
export function computeFeeStatus(fee) {
  const balance = fee.balance ?? (fee.totalAmount - fee.paidAmount);
  return fee.status ?? updateFeeStatus(balance, fee.dueDate);
}

export const fetchFees = createAsyncThunk(
  'fees/fetchFees',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().fees;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.classId && { classId: filters.classId }),
        ...(filters.feeType && { feeType: filters.feeType }),
        ...(filters.status && { status: filters.status }),
      };
      const res = await feeService.getFees(params);
      return res;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchFeeById = createAsyncThunk(
  'fees/fetchFeeById',
  async (id, { rejectWithValue }) => {
    try {
      return await feeService.getFeeById(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchRevenueSummary = createAsyncThunk(
  'fees/fetchRevenueSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await feeService.getRevenueSummary();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const assignFeeThunk = createAsyncThunk(
  'fees/assign',
  async (payload, { rejectWithValue }) => {
    try {
      return await feeService.assignFee(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

/**
 * Record payment. Server returns updated fee with new paidAmount, balance, status.
 */
export const recordPaymentThunk = createAsyncThunk(
  'fees/recordPayment',
  async ({ feeId, payload }, { rejectWithValue }) => {
    try {
      return await feeService.recordPayment(feeId, payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const feesSlice = createSlice({
  name: 'fees',
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
    clearCurrentFee(state) {
      state.currentFee = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFees.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.feeList =
          payload.data ?? payload.fees ?? (Array.isArray(payload) ? payload : []);
        state.feeList = state.feeList.map((f) => ({
          ...f,
          status: computeFeeStatus(f),
        }));
        const total =
          payload.totalCount ?? payload.total ?? state.feeList.length;
        state.pagination.totalCount = total;
        state.pagination.totalPages =
          Math.ceil(total / state.pagination.limit) || 1;
      })
      .addCase(fetchFees.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to fetch fees';
      })
      .addCase(fetchFeeById.fulfilled, (state, { payload }) => {
        state.currentFee = {
          ...payload,
          status: computeFeeStatus(payload),
        };
      })
      .addCase(fetchFeeById.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to fetch fee';
      })
      .addCase(fetchRevenueSummary.fulfilled, (state, { payload }) => {
        state.revenueSummary = {
          totalCollected: payload.totalCollected ?? 0,
          pending: payload.pending ?? 0,
          overdue: payload.overdue ?? 0,
        };
      })
      .addCase(assignFeeThunk.fulfilled, (state, { payload }) => {
        const list = Array.isArray(payload) ? payload : payload.data ?? [payload];
        list.forEach((f) => {
          const augmented = { ...f, status: computeFeeStatus(f) };
          if (!state.feeList.some((x) => x.id === augmented.id)) {
            state.feeList.unshift(augmented);
          }
        });
        state.pagination.totalCount += list.length;
      })
      .addCase(assignFeeThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to assign fee';
      })
      .addCase(recordPaymentThunk.fulfilled, (state, { payload }) => {
        const updated = {
          ...payload,
          status: computeFeeStatus(payload),
        };
        const idx = state.feeList.findIndex((f) => f.id === updated.id);
        if (idx !== -1) state.feeList[idx] = updated;
        if (state.currentFee?.id === updated.id) state.currentFee = updated;
      })
      .addCase(recordPaymentThunk.rejected, (state, { payload }) => {
        state.error = payload ?? 'Failed to record payment';
      });
  },
});

export const {
  setFilters,
  setPage,
  clearFilters,
  clearCurrentFee,
  clearError,
} = feesSlice.actions;

export const selectAllFees = (state) => state.fees?.feeList ?? [];
export const selectRevenueSummary = (state) =>
  state.fees?.revenueSummary ?? initialState.revenueSummary;

/**
 * Derive revenue summary from feeList if API not available.
 */
export const selectDerivedRevenueSummary = (state) => {
  const list = state.fees?.feeList ?? [];
  let totalCollected = 0;
  let pending = 0;
  let overdue = 0;
  list.forEach((f) => {
    const paid = f.paidAmount ?? 0;
    const bal = f.balance ?? (f.totalAmount - paid);
    totalCollected += paid;
    if (bal > 0) {
      const st = computeFeeStatus(f);
      if (st === 'Overdue') overdue += bal;
      else pending += bal;
    }
  });
  return { totalCollected, pending, overdue };
};

export default feesSlice.reducer;
