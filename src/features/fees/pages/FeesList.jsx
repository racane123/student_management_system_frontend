/**
 * src/features/fees/pages/FeesList.jsx
 * Table: Student, Fee Type, Total, Paid, Balance (bolded), Status.
 * Filters: Class, Fee Type.
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, X, Eye, Wallet, BarChart3 } from 'lucide-react';
import {
  fetchFees,
  setFilters,
  setPage,
  clearFilters,
  recordPaymentThunk,
  fetchRevenueSummary,
  selectDerivedRevenueSummary,
} from '../feeSlice';
import { fetchClasses } from '../../classes/classSlice';
import { fetchStudents } from '../../students/studentSlice';
import { selectAllClasses } from '../../classes/classSlice';
import FeeStatusBadge from '../components/FeeStatusBadge';
import FeeSummaryCard from '../components/FeeSummaryCard';
import PaymentForm from '../components/PaymentForm';
import { formatCurrency } from '../utils/currency';
import { FEE_TYPES } from '../constants';

export default function FeesList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { feeList, loading, error, filters, pagination } = useSelector((state) => state.fees);
  const classList = useSelector(selectAllClasses);

  const [paymentModal, setPaymentModal] = useState({ open: false, fee: null });
  const revenueSummary = useSelector(selectDerivedRevenueSummary);

  useEffect(() => {
    if (!classList.length) dispatch(fetchClasses());
  }, [dispatch, classList.length]);

  useEffect(() => {
    dispatch(fetchFees());
    dispatch(fetchRevenueSummary());
  }, [dispatch, filters.classId, filters.feeType, filters.status, pagination.page]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(setPage(1));
  };

  const hasActiveFilters = filters.classId || filters.feeType || filters.status;

  const handlePaymentRecorded = () => {
    setPaymentModal({ open: false, fee: null });
    dispatch(fetchFees());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fees</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/fees/summary')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <BarChart3 className="h-5 w-5" /> Revenue Summary
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/fees/assign')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <Plus className="h-5 w-5" /> Assign Fee
          </button>
        </div>
      </div>

      {/* Dashboard header: revenue summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <FeeSummaryCard variant="collected" amount={revenueSummary.totalCollected} />
        <FeeSummaryCard variant="pending" amount={revenueSummary.pending} />
        <FeeSummaryCard variant="overdue" amount={revenueSummary.overdue} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
          <select
            value={filters.classId}
            onChange={(e) => handleFilterChange('classId', e.target.value)}
            className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All classes</option>
            {classList.map((c) => {
              const label = [c.gradeLevel, c.section, c.className].filter(Boolean).join(' ') || `Class ${c.id}`;
              return (
                <option key={c.id} value={c.id}>{label}</option>
              );
            })}
          </select>
          <select
            value={filters.feeType}
            onChange={(e) => handleFilterChange('feeType', e.target.value)}
            className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All fee types</option>
            {FEE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
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
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Fee Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Paid</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Balance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {feeList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No fees found. Assign fees to get started.
                    </td>
                  </tr>
                ) : (
                  feeList.map((fee) => {
                    const student = fee.student ?? {};
                    const bal = fee.balance ?? (fee.totalAmount - fee.paidAmount);
                    const studentName = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.name || `Student ${fee.studentId}`;
                    return (
                      <tr key={fee.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{studentName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{fee.feeType ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(fee.totalAmount)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(fee.paidAmount)}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">{formatCurrency(bal)}</td>
                        <td className="px-4 py-3 text-center">
                          <FeeStatusBadge status={fee.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {bal > 0 && (
                              <button
                                type="button"
                                onClick={() => setPaymentModal({ open: true, fee })}
                                className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-emerald-600 hover:bg-emerald-50"
                              >
                                <Wallet className="h-4 w-4" /> Pay
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => navigate(`/dashboard/fees/${fee.id}`)}
                              className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" /> View
                            </button>
                          </div>
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

      {!loading && feeList.length > 0 && pagination.totalPages > 1 && (
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

      <PaymentForm
        fee={paymentModal.fee}
        open={paymentModal.open}
        onClose={() => setPaymentModal({ open: false, fee: null })}
        onSubmit={(payload) => {
          dispatch(recordPaymentThunk({ feeId: paymentModal.fee.id, payload })).then(() => {
            handlePaymentRecorded();
          });
        }}
      />
    </div>
  );
}
