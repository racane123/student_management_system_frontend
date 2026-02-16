/**
 * src/features/students/pages/StudentList.jsx
 * Main list: Search, filters (Class, Gender, Status), Pagination, Loading skeleton.
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  fetchStudents,
  setFilters,
  setPage,
  clearFilters,
  deleteStudentThunk,
} from '../studentSlice';
import StudentTable from '../components/StudentTable';
import DeleteStudentModal from '../components/DeleteStudentModal';
import TableSkeleton from '../components/TableSkeleton';
import { STATUS_OPTIONS, GENDER_OPTIONS } from '../constants';

const CLASS_OPTIONS = [{ value: '', label: 'All classes' }, ...Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: `Class ${i + 1}` }))];

export default function StudentList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    studentList,
    loading,
    error,
    filters,
    pagination,
  } = useSelector((state) => state.students);

  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [searchInput, setSearchInput] = useState(filters.name);
  const [deleteModal, setDeleteModal] = useState({ open: false, student: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch, filters.name, filters.classId, filters.status, filters.gender, pagination.page, pagination.limit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ name: searchInput.trim() }));
    dispatch(setPage(1));
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(setPage(1));
  };

  const handleSortChange = (key, dir) => {
    setSortKey(key);
    setSortDir(dir);
  };

  const handleEdit = (student) => {
    navigate(`/dashboard/students/${student.id}/edit`);
  };

  const handleDeleteClick = (student) => {
    setDeleteModal({ open: true, student });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.student) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteStudentThunk(deleteModal.student.id)).unwrap();
      setDeleteModal({ open: false, student: null });
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasActiveFilters = filters.name || filters.classId || filters.status || filters.gender;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <button
          type="button"
          onClick={() => navigate('/dashboard/students/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" /> Add student
        </button>
      </div>

      {/* Search & filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name..."
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.classId}
            onChange={(e) => handleFilterChange('classId', e.target.value)}
            className="rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {CLASS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            className="rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
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
        <StudentTable
          students={studentList}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={handleSortChange}
        />
      )}

      {/* Pagination */}
      {!loading && studentList.length > 0 && (
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
            <span className="px-2 text-sm font-medium text-gray-700">
              {pagination.page}
            </span>
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

      <DeleteStudentModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, student: null })}
        student={deleteModal.student}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteLoading}
      />
    </div>
  );
}
