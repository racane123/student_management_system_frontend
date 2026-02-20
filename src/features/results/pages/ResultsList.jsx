/**
 * src/features/results/pages/ResultsList.jsx
 * Table with nested filters: Class / Subject / Exam.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, X, Eye, BarChart3 } from 'lucide-react';
import {
  fetchResults,
  setFilters,
  setPage,
  clearFilters,
  selectAllResults,
} from '../resultSlice';
import { fetchClasses } from '../../classes/classSlice';
import { fetchSubjects } from '../../subjects/subjectSlice';
import { fetchExams } from '../../exams/examSlice';
import { selectAllClasses } from '../../classes/classSlice';
import GradeBadge from '../components/GradeBadge';

export default function ResultsList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { resultList, loading, error, filters, pagination } = useSelector((state) => state.results);
  const classList = useSelector(selectAllClasses);
  const subjectList = useSelector((state) => state.subjects.subjectList ?? []);
  const examList = useSelector((state) => state.exams.examList ?? []);

  useEffect(() => {
    if (!classList.length) dispatch(fetchClasses());
  }, [dispatch, classList.length]);
  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);
  useEffect(() => {
    dispatch(fetchExams());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchResults());
  }, [dispatch, filters.classId, filters.subjectId, filters.examId, pagination.page]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(setPage(1));
  };

  const hasActiveFilters = filters.classId || filters.subjectId || filters.examId;

  const getClassLabel = (c) =>
    c ? [c.gradeLevel, c.section, c.className].filter(Boolean).join(' ') || `Class ${c.id}` : '';
  const getSubjectName = (s) => s?.name ?? s?.code ?? `Subject ${s?.id}` ?? '';
  const getExamName = (e) => e?.name ?? `Exam ${e?.id}` ?? '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/results/summary')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <BarChart3 className="h-5 w-5" /> Summary
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/results/enter')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <Plus className="h-5 w-5" /> Enter Results
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
          <select
            value={filters.classId}
            onChange={(e) => handleFilterChange('classId', e.target.value)}
            className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All classes</option>
            {classList.map((c) => (
              <option key={c.id} value={c.id}>
                {getClassLabel(c)}
              </option>
            ))}
          </select>
          <select
            value={filters.subjectId}
            onChange={(e) => handleFilterChange('subjectId', e.target.value)}
            className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All subjects</option>
            {subjectList.map((s) => (
              <option key={s.id} value={s.id}>
                {getSubjectName(s)}
              </option>
            ))}
          </select>
          <select
            value={filters.examId}
            onChange={(e) => handleFilterChange('examId', e.target.value)}
            className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All exams</option>
            {examList.map((e) => (
              <option key={e.id} value={e.id}>
                {getExamName(e)}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => dispatch(clearFilters())}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4" /> Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Exam</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Marks</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">%</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Grade</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {resultList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No results found. Use filters or enter results.
                    </td>
                  </tr>
                ) : (
                  resultList.map((r) => {
                    const student = r.student ?? {};
                    const exam = r.exam ?? {};
                    const pct =
                      r.percentage != null
                        ? typeof r.percentage === 'number'
                          ? r.percentage.toFixed(1)
                          : r.percentage
                        : '—';
                    return (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName} {student.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {exam.name ?? `Exam ${r.examId}`}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700">
                          {r.marksObtained} / {r.totalMarks ?? exam.totalMarks ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700">{pct}%</td>
                        <td className="px-4 py-3 text-center">
                          <GradeBadge grade={r.grade} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={
                              r.status === 'Passed'
                                ? 'text-emerald-600 font-medium'
                                : r.status === 'Failed'
                                  ? 'text-red-600 font-medium'
                                  : 'text-gray-400'
                            }
                          >
                            {r.status ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/results/${r.id}`)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && resultList.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => dispatch(setPage(pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              type="button"
              onClick={() => dispatch(setPage(pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
