/**
 * src/features/fees/pages/FeeDetails.jsx
 * Invoice-style view with payment history for a specific fee record.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Wallet, FileText } from 'lucide-react';
import { fetchFeeById, clearCurrentFee, recordPaymentThunk } from '../feeSlice';
import FeeStatusBadge from '../components/FeeStatusBadge';
import PaymentForm from '../components/PaymentForm';
import { formatCurrency } from '../utils/currency';

export default function FeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentFee, loading, error } = useSelector((state) => state.fees);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchFeeById(id));
    return () => dispatch(clearCurrentFee());
  }, [id, dispatch]);

  const handlePaymentRecorded = () => {
    setPaymentModalOpen(false);
    dispatch(fetchFeeById(id));
  };

  if (loading && !currentFee) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-gray-200 animate-pulse" />
        <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (error && !currentFee) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
        {error}
        <button
          type="button"
          onClick={() => navigate('/dashboard/fees')}
          className="mt-2 block text-sm font-medium underline"
        >
          Back to fees
        </button>
      </div>
    );
  }

  if (!currentFee) return null;

  const fee = currentFee;
  const student = fee.student ?? {};
  const studentName = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.name || `Student ${fee.studentId}`;
  const balance = fee.balance ?? (fee.totalAmount - fee.paidAmount);
  const paymentHistory = fee.paymentHistory ?? fee.payments ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard/fees')}
          className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Fee Invoice</h1>
          <p className="text-sm text-gray-500">ID: {fee.id}</p>
        </div>
        {balance > 0 && (
          <button
            type="button"
            onClick={() => setPaymentModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
          >
            <Wallet className="h-5 w-5" /> Record Payment
          </button>
        )}
      </div>

      {/* Invoice card */}
      <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-lg">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-white" />
            <h2 className="text-lg font-bold text-white">Fee Invoice</h2>
          </div>
          <p className="mt-1 text-sm text-slate-300">
            {fee.feeType} • Due: {fee.dueDate ?? '—'}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Bill to */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-500">Bill To</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">{studentName}</p>
            <p className="text-sm text-gray-600">Student ID: {fee.studentId ?? '—'}</p>
          </div>

          {/* Amounts */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Total Amount</p>
                <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(fee.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Paid</p>
                <p className="mt-1 text-xl font-bold text-emerald-600">{formatCurrency(fee.paidAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Balance</p>
                <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(balance)}</p>
              </div>
            </div>
            <div className="mt-3">
              <FeeStatusBadge status={fee.status} size="md" />
            </div>
          </div>

          {/* Payment history */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Payment History</h3>
            {paymentHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No payments recorded yet.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                      <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paymentHistory.map((p, idx) => (
                      <tr key={p.id ?? idx}>
                        <td className="px-4 py-2 text-sm text-gray-700">{p.paymentDate ?? p.date ?? '—'}</td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-emerald-600">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">{p.remarks ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <PaymentForm
        fee={fee}
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={(payload) => {
          dispatch(recordPaymentThunk({ feeId: fee.id, payload })).then(() => {
            handlePaymentRecorded();
          });
        }}
      />
    </div>
  );
}
