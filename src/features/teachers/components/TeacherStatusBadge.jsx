/**
 * src/features/teachers/components/TeacherStatusBadge.jsx
 * Active (Green) / Inactive (Red) only.
 */

export default function TeacherStatusBadge({ status, className = '' }) {
  const isActive = (status || '').toLowerCase() === 'active';

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium shadow-sm ring-1 ${
        isActive
          ? 'bg-emerald-100 text-emerald-800 ring-emerald-600/20'
          : 'bg-red-100 text-red-800 ring-red-500/20'
      } ${className}`.trim()}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
