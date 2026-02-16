/**
 * src/features/students/components/StudentStatusBadge.jsx
 * Dynamic status badge (Active / Inactive).
 */

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-slate-100 text-slate-700 ring-1 ring-slate-400/30',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 ring-1 ring-amber-500/30',
  },
  suspended: {
    label: 'Suspended',
    className: 'bg-red-100 text-red-800 ring-1 ring-red-500/20',
  },
};

export default function StudentStatusBadge({ status, className = '' }) {
  const key = (status || '').toLowerCase();
  const config = statusConfig[key] || statusConfig.inactive;
  const label = config.label ?? (key || '—');

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium shadow-sm ${config.className} ${className}`.trim()}
    >
      {label}
    </span>
  );
}
