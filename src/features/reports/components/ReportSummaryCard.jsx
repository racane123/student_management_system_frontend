export default function ReportSummaryCard({ title, value, subtext, variant = 'default' }) {
  const variants = {
    default: 'border-gray-200 bg-white text-gray-900',
    success: 'border-emerald-200 bg-emerald-50/50 text-emerald-800',
    warning: 'border-amber-200 bg-amber-50/50 text-amber-800',
    danger: 'border-red-200 bg-red-50/50 text-red-800',
  };
  const v = variants[variant] ?? variants.default;

  return (
    <div
      className={`rounded-lg border-2 p-4 shadow-sm print:shadow-none ${v}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {subtext && (
        <p className="mt-0.5 text-sm text-gray-500">{subtext}</p>
      )}
    </div>
  );
}
