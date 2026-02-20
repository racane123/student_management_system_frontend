/**
 * src/features/fees/components/FeeStatusBadge.jsx
 * Color-coded status: Paid=Green, Pending=Yellow, Overdue=Red.
 */

const STATUS_STYLES = {
  Paid: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20',
  Pending: 'bg-amber-100 text-amber-800 ring-1 ring-amber-600/20',
  Overdue: 'bg-red-100 text-red-800 ring-1 ring-red-600/20',
};

export default function FeeStatusBadge({ status, size = 'md' }) {
  const s = (status ?? 'Pending').toString();
  const style = STATUS_STYLES[s] ?? STATUS_STYLES.Pending;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center rounded-md font-medium ${style} ${sizeClass}`}
    >
      {s}
    </span>
  );
}
