/**
 * src/features/students/components/TableSkeleton.jsx
 * Loading skeleton for the students table.
 */

export default function TableSkeleton({ rows = 5 }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/5">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/80">
          <tr>
            {['Student', 'Name', 'Email', 'Class', 'Status', 'Joined', ''].map((h) => (
              <th key={h} className="py-3.5 px-3 text-left text-xs font-semibold uppercase text-gray-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td className="py-3 pl-4"><div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" /></td>
              <td className="py-3"><div className="h-4 w-32 rounded bg-gray-200 animate-pulse" /></td>
              <td className="py-3"><div className="h-4 w-40 rounded bg-gray-200 animate-pulse" /></td>
              <td className="py-3"><div className="h-4 w-16 rounded bg-gray-200 animate-pulse" /></td>
              <td className="py-3"><div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" /></td>
              <td className="py-3"><div className="h-4 w-20 rounded bg-gray-200 animate-pulse" /></td>
              <td className="py-3 pr-4"><div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse ml-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
