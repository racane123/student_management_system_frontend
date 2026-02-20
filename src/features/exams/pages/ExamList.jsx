/**
 * src/features/exams/pages/ExamList.jsx
 * Table with search and filters (Class, Date).
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  fetchExams,
  setFilters,
  setPage,
  clearFilters,
  deleteExamThunk,
} from '../examSlice';
import { fetchClasses } from '../../classes/classSlice';
import { fetchSubjects } from '../../subjects/subjectSlice';
import ExamTable from '../components/ExamTable';
import DeleteExamModal from '../components/DeleteExamModal';
import ExamTableSkeleton from '../components/ExamTableSkeleton';
import { selectAllClasses } from '../../classes/classSlice';

export default function ExamList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { examList, loading, error, filters, pagination } = useSelector((state) => state.exams);
  const classList = useSelector(selectAllClasses);

  const [searchInput, setSearchInput] = useState(filters.search);
  const [deleteModal, setDeleteModal] = useState({ open: false, exam: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!classList.length) dispatch(fetchClasses());
  }, [dispatch, classList.length]);

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchExams());
  }, [dispatch, filters.search, filters.classId, filters.date, pagination.page, pagination.limit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchInput.trim() }));
    dispatch(setPage(1));
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(setPage(1));
  };

  const hasActiveFilters = filters.search || filters.classId || filters.date;

  const handleEdit = (exam) => {
    navigate(`/dashboard/exams/${exam.id}/edit`);
  };

  const handleDelete = (exam) => {
    setDeleteModal({ open: true, exam });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.exam) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteExamThunk(deleteModal.exam.id)).unwrap();
      setDeleteModal({ open: false, exam: null });
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getClassLabel = (c) => {
    if (!c) return '';
    return [c.gradeLevel, c.section, c.className].filter(Boolean).join(' ') || `Class ${c.id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
        <button
          type="button"
          onClick={() => navigate('/dashboard/exams/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" /> Add exam
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by exam name..."
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.classId}
            onChange={(e) => handleFilterChange('classId', e.target.value)}
            className="rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All classes</option>
            {classList.map((c) => (
              <option key={c.id} value={c.id}>
                {getClassLabel(c)}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500"
            >
              Search
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  dispatch(clearFilters());
                  setSearchInput('');
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4" /> Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <ExamTableSkeleton rows={8} />
      ) : (
        <ExamTable
          exams={examList}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {!loading && examList.length > 0 && pagination.totalPages > 1 && (
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

      <DeleteExamModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, exam: null })}
        exam={deleteModal.exam}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteLoading}
      />
    </div>
  );
}
