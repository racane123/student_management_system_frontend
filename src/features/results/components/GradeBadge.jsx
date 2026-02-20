/**
 * src/features/results/components/GradeBadge.jsx
 * Styled badge for grade display (A=Purple, B=Blue, C=Teal, D=Amber, F=Red).
 */

const GRADE_STYLES = {
  A: 'bg-purple-100 text-purple-800 ring-1 ring-purple-600/20',
  B: 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20',
  C: 'bg-teal-100 text-teal-800 ring-1 ring-teal-600/20',
  D: 'bg-amber-100 text-amber-800 ring-1 ring-amber-600/20',
  F: 'bg-red-100 text-red-800 ring-1 ring-red-600/20',
  '—': 'bg-gray-100 text-gray-600 ring-1 ring-gray-400/20',
};

export default function GradeBadge({ grade, size = 'md' }) {
  const g = (grade ?? '—').toString().toUpperCase();
  const style = GRADE_STYLES[g] ?? GRADE_STYLES['—'];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center rounded-md font-medium ${style} ${sizeClass}`}
    >
      {g}
    </span>
  );
}
