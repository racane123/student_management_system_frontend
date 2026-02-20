/**
 * src/features/fees/components/PaymentForm.jsx
 * Modal/form to enter payment. Validation: payment must not exceed balance.
 */

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function PaymentForm({ fee, open, onClose, onSubmit }) {
  const balance = fee?.balance ?? (fee?.totalAmount - fee?.paidAmount) ?? 0;

  const schema = yup.object({
    amount: yup
      .number()
      .min(0.01, 'Amount must be greater than 0')
      .max(balance, `Amount cannot exceed balance (${formatCurrency(balance)})`)
      .required('Amount is required'),
    paymentDate: yup.string().trim().required('Payment date is required'),
    remarks: yup.string().trim().max(200),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      amount: '',
      paymentDate: new Date().toISOString().slice(0, 10),
      remarks: '',
    },
    resolver: yupResolver(schema),
  });

  const onFormSubmit = (data) => {
    onSubmit({
      amount: Number(data.amount),
      paymentDate: data.paymentDate,
      remarks: data.remarks || undefined,
    });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {fee && (
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
            <p className="text-sm text-gray-600">
              Fee: {fee.feeType} • Balance:{' '}
              <span className="font-bold text-gray-900">{formatCurrency(balance)}</span>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₱) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={balance}
              {...register('amount', { valueAsNumber: true })}
              className="block w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              {...register('paymentDate')}
              className="block w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.paymentDate && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <input
              type="text"
              {...register('remarks')}
              maxLength={200}
              className="block w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || balance <= 0}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording…' : 'Record Payment'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
