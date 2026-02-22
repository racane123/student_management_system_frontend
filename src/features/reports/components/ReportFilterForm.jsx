/**
 * src/features/reports/components/ReportFilterForm.jsx
 * Global DateRange and cross-module filters (Class, Fee Type, Exam).
 */

import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { setReportFilters, clearReportFilters, selectReportFilters } from '../reportSlice';
import { selectAllClasses } from '../../classes/classSlice';
import { selectAllResults } from '../../results/resultSlice';

export default function ReportFilterForm({ showClass = true, showFeeType = false, showExam = false }) {
  const dispatch = useDispatch();
  const filters = useSelector(selectReportFilters);
  const classList = useSelector(selectAllClasses);
  const resultList = useSelector(selectAllResults);

  const examOptions = [...new Set(resultList.map((r) => r.examId ?? r.exam).filter(Boolean))].map((id) => ({
    id,
    name: resultList.find((r) => (r.examId ?? r.exam) === id)?.exam?.name ?? `Exam ${id}`,
  }));

  const getClassLabel = (c) =>
    [c?.gradeLevel, c?.section, c?.className].filter(Boolean).join(' ') || `Class ${c?.id}`;

  const hasActive = filters.startDate || filters.endDate || filters.classId || filters.feeType || filters.examId;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm print:border print:shadow-none">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => dispatch(setReportFilters({ startDate: e.target.value }))}
            className="rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => dispatch(setReportFilters({ endDate: e.target.value }))}
            className="rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {showClass && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Class</label>
            <select
              value={filters.classId}
              onChange={(e) => dispatch(setReportFilters({ classId: e.target.value }))}
              className="rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All classes</option>
              {classList.map((c) => (
                <option key={c.id} value={c.id}>{getClassLabel(c)}</option>
              ))}
            </select>
          </div>
        )}
        {showFeeType && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fee Type</label>
            <select
              value={filters.feeType}
              onChange={(e) => dispatch(setReportFilters({ feeType: e.target.value }))}
              className="rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All types</option>
              <option value="Tuition">Tuition</option>
              <option value="Lab">Lab</option>
              <option value="Misc">Misc</option>
            </select>
          </div>
        )}
        {showExam && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Exam</label>
            <select
              value={filters.examId}
              onChange={(e) => dispatch(setReportFilters({ examId: e.target.value }))}
              className="rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All exams</option>
              {examOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        )}
        {hasActive && (
          <button
            type="button"
            onClick={() => dispatch(clearReportFilters())}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
