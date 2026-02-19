// src/features/attendance/components/AttendanceReportTable.jsx
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Download,
} from 'lucide-react';
import { selectAttendanceSummary, selectIsLoading } from '../attendanceSlice';

// ---------------------------------------------------------------------------
// RATE HELPERS
// ---------------------------------------------------------------------------

/**
 * Classify attendance rate into a tier.
 * Returns: { label, badgeClass, barClass, icon }
 */
const classifyRate = (rate) => {
  if (rate >= 90)
    return {
      label: 'Excellent',
      badgeClass: 'bg-emerald-100 text-emerald-700',
      barClass: 'bg-emerald-500',
      Icon: TrendingUp,
    };
  if (rate >= 75)
    return {
      label: 'Good',
      badgeClass: 'bg-blue-100 text-blue-700',
      barClass: 'bg-blue-500',
      Icon: Minus,
    };
  if (rate >= 60)
    return {
      label: 'At Risk',
      badgeClass: 'bg-amber-100 text-amber-700',
      barClass: 'bg-amber-400',
      Icon: TrendingDown,
    };
  return {
    label: 'Critical',
    badgeClass: 'bg-rose-100 text-rose-700',
    barClass: 'bg-rose-500',
    Icon: TrendingDown,
  };
};

// ---------------------------------------------------------------------------
// MINI PROGRESS BAR
// ---------------------------------------------------------------------------
const RateBar = ({ rate, barClass }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${barClass}`}
        style={{ width: `${Math.min(rate, 100)}%` }}
      />
    </div>
    <span className="text-xs text-slate-400 w-8 text-right">{rate}%</span>
  </div>
);

// ---------------------------------------------------------------------------
// SORT HOOK
// ---------------------------------------------------------------------------
const useSortedData = (data) => {
  const [sortConfig, setSortConfig] = useState({ key: 'attendanceRate', dir: 'desc' });

  const sorted = useMemo(() => {
    const arr = [...data];
    arr.sort((a, b) => {
      const aVal = a[sortConfig.key] ?? 0;
      const bVal = b[sortConfig.key] ?? 0;
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [data, sortConfig]);

  const toggleSort = (key) =>
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'desc' }
    );

  return { sorted, sortConfig, toggleSort };
};

// ---------------------------------------------------------------------------
// SORT HEADER CELL
// ---------------------------------------------------------------------------
const SortTh = ({ label, sortKey, sortConfig, onSort, className = '' }) => {
  const isActive = sortConfig.key === sortKey;
  const Icon = isActive
    ? sortConfig.dir === 'asc'
      ? ChevronUp
      : ChevronDown
    : ChevronsUpDown;

  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest
                  text-slate-500 cursor-pointer select-none hover:text-slate-700 transition ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <Icon size={12} className={isActive ? 'text-indigo-500' : 'text-slate-300'} />
      </div>
    </th>
  );
};

// ---------------------------------------------------------------------------
// EXPORT TO CSV
// ---------------------------------------------------------------------------
const exportCSV = (data) => {
  const headers = ['Student Name', 'Total Days', 'Present', 'Absent', 'Late', 'Rate (%)'];
  const rows = data.map((r) => [
    r.studentName,
    r.totalDays,
    r.presentDays,
    r.absentDays,
    r.lateDays,
    r.attendanceRate,
  ]);
  const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance_report_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
const AttendanceReportTable = ({ dateRange }) => {
  const summary = useSelector(selectAttendanceSummary);
  const isLoading = useSelector(selectIsLoading);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      summary.filter((s) =>
        s.studentName?.toLowerCase().includes(search.toLowerCase())
      ),
    [summary, search]
  );

  const { sorted, sortConfig, toggleSort } = useSortedData(filtered);

  // Class-level aggregates
  const classStats = useMemo(() => {
    if (summary.length === 0) return null;
    const avg =
      summary.reduce((acc, s) => acc + s.attendanceRate, 0) / summary.length;
    return {
      avg: avg.toFixed(1),
      below75: summary.filter((s) => s.attendanceRate < 75).length,
      below60: summary.filter((s) => s.attendanceRate < 60).length,
    };
  }, [summary]);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (summary.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p className="text-sm">No attendance data available for this period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Class-level summary chips */}
      {classStats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Class Average', value: `${classStats.avg}%`, color: 'text-indigo-600' },
            { label: 'Below 75%', value: classStats.below75, color: 'text-amber-600' },
            { label: 'Below 60%', value: classStats.below60, color: 'text-rose-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-slate-100 rounded-xl p-4 text-center shadow-sm">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200
                       rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300
                       placeholder:text-slate-300"
          />
        </div>
        <button
          onClick={() => exportCSV(sorted)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600
                     bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <SortTh label="Student" sortKey="studentName" sortConfig={sortConfig} onSort={toggleSort} />
              <SortTh label="Total Days" sortKey="totalDays" sortConfig={sortConfig} onSort={toggleSort} className="text-center" />
              <SortTh label="Present" sortKey="presentDays" sortConfig={sortConfig} onSort={toggleSort} className="text-center" />
              <SortTh label="Absent" sortKey="absentDays" sortConfig={sortConfig} onSort={toggleSort} className="text-center" />
              <SortTh label="Late" sortKey="lateDays" sortConfig={sortConfig} onSort={toggleSort} className="text-center" />
              <SortTh label="Rate" sortKey="attendanceRate" sortConfig={sortConfig} onSort={toggleSort} />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((row) => {
              const { label, badgeClass, barClass, Icon } = classifyRate(row.attendanceRate);
              return (
                <tr key={row.studentId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500
                                      flex items-center justify-center text-white text-xs font-bold">
                        {row.studentName?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-slate-700">{row.studentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">{row.totalDays}</td>
                  <td className="px-4 py-3 text-center font-semibold text-emerald-600">{row.presentDays}</td>
                  <td className="px-4 py-3 text-center font-semibold text-rose-500">{row.absentDays}</td>
                  <td className="px-4 py-3 text-center font-semibold text-amber-500">{row.lateDays}</td>
                  <td className="px-4 py-3 w-40">
                    <RateBar rate={row.attendanceRate} barClass={barClass} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                      <Icon size={11} />
                      {label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {sorted.map((row) => {
          const { label, badgeClass, barClass } = classifyRate(row.attendanceRate);
          return (
            <div key={row.studentId} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500
                                  flex items-center justify-center text-white text-xs font-bold">
                    {row.studentName?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <span className="font-semibold text-slate-700">{row.studentName}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
                  {label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                {[
                  { label: 'Total', value: row.totalDays, color: 'text-slate-600' },
                  { label: 'Present', value: row.presentDays, color: 'text-emerald-600' },
                  { label: 'Absent', value: row.absentDays, color: 'text-rose-500' },
                  { label: 'Late', value: row.lateDays, color: 'text-amber-500' },
                ].map(({ label: l, value, color }) => (
                  <div key={l}>
                    <p className={`font-bold text-base ${color}`}>{value}</p>
                    <p className="text-slate-400">{l}</p>
                  </div>
                ))}
              </div>
              <RateBar rate={row.attendanceRate} barClass={barClass} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceReportTable;