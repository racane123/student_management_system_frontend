// src/features/attendance/attendanceSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import attendanceService from './attendanceService';

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
const todayISO = () => format(new Date(), 'yyyy-MM-dd');

/**
 * Pure aggregation: given an array of attendance records for one student,
 * compute the rate.
 *   attendanceRate = (presentDays / totalDays) * 100
 * "Present" counts both Present and Late statuses as attended days.
 */
export const computeAttendanceRate = (records = []) => {
  const totalDays = records.length;
  if (totalDays === 0) return 0;
  const presentDays = records.filter(
    (r) => r.status === 'present' || r.status === 'late'
  ).length;
  return parseFloat(((presentDays / totalDays) * 100).toFixed(1));
};

// ---------------------------------------------------------------------------
// ASYNC THUNKS
// ---------------------------------------------------------------------------

/** Fetch all attendance records for a class (with optional date/range filter). */
export const fetchAttendanceByClass = createAsyncThunk(
  'attendance/fetchByClass',
  async ({ classId, params }, thunkAPI) => {
    try {
      return await attendanceService.getAttendanceByClass(classId, params);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Check if a class/date combination already has attendance marked. */
export const checkAttendanceExists = createAsyncThunk(
  'attendance/checkExists',
  async ({ classId, date }, thunkAPI) => {
    try {
      return await attendanceService.checkAttendanceExists(classId, date);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Submit bulk attendance for a class on a date. */
export const markBulkAttendance = createAsyncThunk(
  'attendance/markBulk',
  async (payload, thunkAPI) => {
    try {
      // payload: { classId, date, records: [{ studentId, status, remarks }] }
      return await attendanceService.markBulkAttendance(payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Update an existing session (corrections). */
export const updateBulkAttendance = createAsyncThunk(
  'attendance/updateBulk',
  async ({ sessionId, payload }, thunkAPI) => {
    try {
      return await attendanceService.updateBulkAttendance(sessionId, payload);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Fetch per-student summary with computed attendance rates. */
export const fetchAttendanceSummary = createAsyncThunk(
  'attendance/fetchSummary',
  async ({ classId, params }, thunkAPI) => {
    try {
      const res = await attendanceService.getStudentAttendanceSummary(classId, params);
      const data = Array.isArray(res) ? res : res?.data ?? res?.students ?? [];
      // Augment each row with computed client-side rate as a safety net
      return data.map((row) => ({
        ...row,
        attendanceRate:
          row.attendanceRate ??
          computeAttendanceRate(
            Array.from({ length: row.totalDays }, (_, i) =>
              i < row.presentDays ? { status: 'present' } : { status: 'absent' }
            )
          ),
      }));
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/** Fetch a single day detail for the pie chart view. */
export const fetchAttendanceByDate = createAsyncThunk(
  'attendance/fetchByDate',
  async ({ classId, date }, thunkAPI) => {
    try {
      return await attendanceService.getAttendanceByDate(classId, date);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ---------------------------------------------------------------------------
// SLICE
// ---------------------------------------------------------------------------
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    // List view
    attendanceList: [],       // [{ _id, classId, date, records: [...] }]
    
    // Filters
    selectedClass: '',
    selectedDate: todayISO(),
    
    // Duplicate guard
    sessionExists: false,
    existingSessionId: null,
    
    // Report
    attendanceSummary: [],    // [{ studentId, studentName, totalDays, presentDays, attendanceRate, ... }]
    
    // Detail (single day pie chart)
    dayDetail: null,
    
    // UI state
    isLoading: false,
    isCheckingExists: false,
    isSubmitting: false,
    isSuccess: false,
    isError: false,
    message: '',
  },
  reducers: {
    setSelectedClass(state, action) {
      state.selectedClass = action.payload;
      // Reset duplicate guard whenever class changes
      state.sessionExists = false;
      state.existingSessionId = null;
    },
    setSelectedDate(state, action) {
      state.selectedDate = action.payload;
      state.sessionExists = false;
      state.existingSessionId = null;
    },
    resetAttendanceState(state) {
      state.isLoading = false;
      state.isSubmitting = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearDayDetail(state) {
      state.dayDetail = null;
    },
  },
  extraReducers: (builder) => {
    // ---- fetchAttendanceByClass ----
    builder
      .addCase(fetchAttendanceByClass.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchAttendanceByClass.fulfilled, (state, action) => {
        state.isLoading = false;
        const p = action.payload;
        state.attendanceList = Array.isArray(p) ? p : p?.data ?? p?.sessions ?? [];
      })
      .addCase(fetchAttendanceByClass.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });

    // ---- checkAttendanceExists ----
    builder
      .addCase(checkAttendanceExists.pending, (state) => {
        state.isCheckingExists = true;
      })
      .addCase(checkAttendanceExists.fulfilled, (state, action) => {
        state.isCheckingExists = false;
        state.sessionExists = action.payload.exists;
        state.existingSessionId = action.payload.sessionId || null;
      })
      .addCase(checkAttendanceExists.rejected, (state) => {
        state.isCheckingExists = false;
        state.sessionExists = false;
      });

    // ---- markBulkAttendance ----
    builder
      .addCase(markBulkAttendance.pending, (state) => {
        state.isSubmitting = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(markBulkAttendance.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.isSuccess = true;
        // Prepend new session to list
        state.attendanceList.unshift(action.payload);
        // Mark as existing to prevent duplicate resubmit
        state.sessionExists = true;
        state.existingSessionId = action.payload?.id ?? action.payload?._id;
        state.message = 'Attendance marked successfully.';
      })
      .addCase(markBulkAttendance.rejected, (state, action) => {
        state.isSubmitting = false;
        state.isError = true;
        state.message = action.payload;
      });

    // ---- updateBulkAttendance ----
    builder
      .addCase(updateBulkAttendance.pending, (state) => {
        state.isSubmitting = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(updateBulkAttendance.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.isSuccess = true;
        // Replace updated session in list
        const payloadId = action.payload?.id ?? action.payload?._id;
        const idx = state.attendanceList.findIndex(
          (s) => (s.id ?? s._id) === payloadId
        );
        if (idx !== -1) state.attendanceList[idx] = action.payload;
        state.message = 'Attendance updated successfully.';
      })
      .addCase(updateBulkAttendance.rejected, (state, action) => {
        state.isSubmitting = false;
        state.isError = true;
        state.message = action.payload;
      });

    // ---- fetchAttendanceSummary ----
    builder
      .addCase(fetchAttendanceSummary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAttendanceSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attendanceSummary = action.payload;
      })
      .addCase(fetchAttendanceSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });

    // ---- fetchAttendanceByDate ----
    builder
      .addCase(fetchAttendanceByDate.pending, (state) => {
        state.isLoading = true;
        state.dayDetail = null;
      })
      .addCase(fetchAttendanceByDate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dayDetail = action.payload;
      })
      .addCase(fetchAttendanceByDate.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const {
  setSelectedClass,
  setSelectedDate,
  resetAttendanceState,
  clearDayDetail,
} = attendanceSlice.actions;

// ---------------------------------------------------------------------------
// SELECTORS
// ---------------------------------------------------------------------------
export const selectAttendanceList = (state) => state.attendance.attendanceList;
export const selectSelectedClass = (state) => state.attendance.selectedClass;
export const selectSelectedDate = (state) => state.attendance.selectedDate;
export const selectSessionExists = (state) => state.attendance.sessionExists;
export const selectExistingSessionId = (state) => state.attendance.existingSessionId;
export const selectAttendanceSummary = (state) => state.attendance.attendanceSummary;
export const selectDayDetail = (state) => state.attendance.dayDetail;
export const selectIsLoading = (state) => state.attendance.isLoading;
export const selectIsSubmitting = (state) => state.attendance.isSubmitting;
export const selectIsSuccess = (state) => state.attendance.isSuccess;
export const selectIsError = (state) => state.attendance.isError;
export const selectMessage = (state) => state.attendance.message;
export const selectIsCheckingExists = (state) => state.attendance.isCheckingExists;

export default attendanceSlice.reducer;