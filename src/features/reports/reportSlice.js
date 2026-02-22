/**
 * src/features/reports/reportSlice.js
 * The Aggregator: memoized selectors (reselect) for attendance, academic, and financial reports.
 * All calculations done on the frontend from raw slice data.
 */

import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';

const initialState = {
  filters: {
    startDate: '',
    endDate: '',
    classId: '',
    feeType: '',
    examId: '',
  },
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReportFilters(state, { payload }) {
      state.filters = { ...state.filters, ...payload };
    },
    clearReportFilters(state) {
      state.filters = initialState.filters;
    },
  },
});

export const { setReportFilters, clearReportFilters } = reportSlice.actions;

// ---------------------------------------------------------------------------
// Base selectors (from other slices)
// ---------------------------------------------------------------------------
const selectAttendanceSummaryRaw = (state) => state.attendance?.attendanceSummary ?? [];
const selectResultListRaw = (state) => state.results?.resultList ?? [];
const selectFeeListRaw = (state) => state.fees?.feeList ?? [];

export const selectReportFilters = (state) => state.reports?.filters ?? initialState.filters;

// ---------------------------------------------------------------------------
// Attendance: aggregate percentages per student (Present %, Absent %, Late %)
// ---------------------------------------------------------------------------
export const selectAttendanceReportRows = createSelector(
  [selectAttendanceSummaryRaw, selectReportFilters],
  (summary, filters) => {
    let rows = summary.map((row) => {
      const total = row.totalDays ?? 0;
      const present = row.presentDays ?? 0;
      const absent = row.absentDays ?? 0;
      const late = row.lateDays ?? 0;
      const presentPct = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;
      const absentPct = total > 0 ? parseFloat(((absent / total) * 100).toFixed(1)) : 0;
      const latePct = total > 0 ? parseFloat(((late / total) * 100).toFixed(1)) : 0;
      const rate = row.attendanceRate ?? (total > 0 ? (present + late) / total * 100 : 0);
      return {
        studentId: row.studentId,
        studentName: row.studentName ?? `Student ${row.studentId}`,
        totalDays: total,
        presentDays: present,
        absentDays: absent,
        lateDays: late,
        presentPct,
        absentPct,
        latePct,
        attendanceRate: typeof rate === 'number' ? parseFloat(rate.toFixed(1)) : rate,
      };
    });
    return rows;
  }
);

/** Class-wide attendance average (single number). */
export const selectAttendanceClassAverage = createSelector(
  [selectAttendanceReportRows],
  (rows) => {
    if (rows.length === 0) return 0;
    const sum = rows.reduce((acc, r) => acc + (r.attendanceRate ?? 0), 0);
    return parseFloat((sum / rows.length).toFixed(1));
  }
);

// ---------------------------------------------------------------------------
// Academic: class-wide averages and pass/fail counts from results
// ---------------------------------------------------------------------------
export const selectResultReportRows = createSelector(
  [selectResultListRaw, selectReportFilters],
  (resultList, filters) => {
    let list = [...resultList];
    if (filters.classId) {
      const cid = String(filters.classId);
      list = list.filter((r) => String(r.classId ?? r.exam?.classId ?? '') === cid);
    }
    if (filters.examId) {
      const eid = String(filters.examId);
      list = list.filter((r) => String(r.examId ?? r.exam ?? '') === eid);
    }
    return list;
  }
);

/** Class summary: average score, pass count, fail count. */
export const selectAcademicClassSummary = createSelector(
  [selectResultReportRows],
  (rows) => {
    if (rows.length === 0) {
      return { average: 0, passCount: 0, failCount: 0, total: 0 };
    }
    const totalMarks = rows[0]?.totalMarks ?? rows[0]?.exam?.totalMarks ?? 100;
    const passingMarks = rows[0]?.passingMarks ?? rows[0]?.exam?.passingMarks ?? 40;
    let sum = 0;
    let passCount = 0;
    rows.forEach((r) => {
      const marks = r.marksObtained ?? 0;
      sum += marks;
      if (marks >= passingMarks) passCount += 1;
    });
    return {
      average: parseFloat((sum / rows.length).toFixed(1)),
      passCount,
      failCount: rows.length - passCount,
      total: rows.length,
    };
  }
);

// ---------------------------------------------------------------------------
// Financial: total revenue vs pending debt from fees
// ---------------------------------------------------------------------------
export const selectFinancialReportRows = createSelector(
  [selectFeeListRaw, selectReportFilters],
  (feeList, filters) => {
    let list = [...feeList];
    if (filters.classId) {
      const cid = String(filters.classId);
      list = list.filter((f) => {
        const sid = f.studentId;
        const student = f.student;
        const studentClassId = student?.classId ?? student?.class;
        return String(studentClassId ?? '') === cid;
      });
    }
    if (filters.feeType) {
      list = list.filter((f) => (f.feeType ?? '') === filters.feeType);
    }
    return list;
  }
);

/** Total collected, pending, overdue (sums from filtered fee list). */
export const selectFinancialSummary = createSelector(
  [selectFinancialReportRows],
  (rows) => {
    let totalCollected = 0;
    let pending = 0;
    let overdue = 0;
    rows.forEach((f) => {
      const paid = f.paidAmount ?? 0;
      const bal = f.balance ?? (f.totalAmount - paid);
      totalCollected += paid;
      if (bal > 0) {
        const due = f.dueDate ? new Date(f.dueDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (due) {
          due.setHours(0, 0, 0, 0);
          if (today > due) overdue += bal;
          else pending += bal;
        } else {
          pending += bal;
        }
      }
    });
    return { totalCollected, pending, overdue };
  }
);

export default reportSlice.reducer;
