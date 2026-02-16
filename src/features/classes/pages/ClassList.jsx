/**
 * src/features/classes/pages/ClassList.jsx
 * Table with search by Grade/Section and filter by Status. Pagination.
 */

import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  fetchClasses,
  setFilters,
  setPage,
  clearFilters,
  deleteClassThunk,
  fetchClassFormDependencies,
} from '../classSlice';
import ClassTable from '../components/ClassTable';
import DeleteClassModal from '../components/DeleteClassModal';
import TableSkeleton from '../components/TableSkeleton';
import { STATUS_OPTIONS } from '../constants';

export default function ClassList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { classList, loading, error, filters, pagination } = useSelector((state) => state.classes);
  const studentList = useSelector((state) => state.students.studentList) ?? [];

  const [searchInput, setSearchInput] = useState(filters.search);
  const [deleteModal, setDeleteModal] = useState({ open: false, classEntity: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const studentCountByClassId = useMemo(() => {
    const map = {};
    studentList.forEach((s) => {
      const id = s.classId ?? s.class;
      if (id != null) {
        map[id] = (map[id] || 0) + 1;
      }
    });
    return map;
  }, [studentList]);

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch, filters.search, filters.status, pagination.page, pagination.limit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchInput.trim() }));
    dispatch(setPage(1));
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(setPage(1));
  };

  const hasActiveFilters = filters.search || filters.status;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        <button
          type="button"
          onClick={() => {
            dispatch(fetchClassFormDependencies());
            navigate('/dashboard/classes/new');
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" /> Add class
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
              placeholder="Search by grade or section..."
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
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
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <ClassTable
          classes={classList}
          studentCountByClassId={studentCountByClassId}
          onEdit={(c) => navigate(`/dashboard/classes/${c.id}/edit`)}
          onDelete={(c) => setDeleteModal({ open: true, classEntity: c })}
        />
      )}

      {!loading && classList.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-gray-600">
            Showing page {pagination.page} of {Math.max(1, pagination.totalPages)} ({pagination.totalCount} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch(setPage(pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="px-2 text-sm font-medium text-gray-700">{pagination.page}</span>
            <button
              type="button"
              onClick={() => dispatch(setPage(pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <DeleteClassModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, classEntity: null })}
        classEntity={deleteModal.classEntity}
        onConfirm={async () => {
          if (!deleteModal.classEntity) return;
          setDeleteLoading(true);
          try {
            await dispatch(deleteClassThunk(deleteModal.classEntity.id)).unwrap();
            setDeleteModal({ open: false, classEntity: null });
          } catch (err) {
            console.error(err);
          } finally {
            setDeleteLoading(false);
          }
        }}
        isDeleting={deleteLoading}
      />
    </div>
  );
}
