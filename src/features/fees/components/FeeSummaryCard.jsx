/**
 * src/features/fees/components/FeeSummaryCard.jsx
 * Dashboard card for Total Collected, Pending, Overdue amounts.
 */

import { formatCurrency } from '../utils/currency';

const VARIANTS = {
  collected: {
    label: 'Total Collected',
    bg: 'bg-emerald-50 border-emerald-200',
    value: 'text-emerald-700',
    icon: '💰',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50 border-amber-200',
    value: 'text-amber-700',
    icon: '⏳',
  },
  overdue: {
    label: 'Overdue',
    bg: 'bg-red-50 border-red-200',
    value: 'text-red-700',
    icon: '⚠️',
  },
};

export default function FeeSummaryCard({ variant, amount }) {
  const v = VARIANTS[variant] ?? VARIANTS.pending;
  return (
    <div
      className={`rounded-xl border p-4 ${v.bg}`}
    >
      <p className="text-xs font-medium uppercase text-gray-500">{v.label}</p>
      <p className={`mt-1 text-2xl font-bold ${v.value}`}>
        {formatCurrency(amount ?? 0)}
      </p>
    </div>
  );
}
