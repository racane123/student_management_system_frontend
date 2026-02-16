/**
 * MILESTONE 3: Generic CRUD Engine – DataTable
 * Reusable table: columns + data; optional actions per row.
 * Place in: src/components/common/DataTable.jsx
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {Array<{ key: string, label: string, render?: (value: any, row: object) => React.ReactNode }>} props.columns
 * @param {Array<object>} props.data
 * @param {string} [props.emptyMessage]
 * @param {(row: object) => React.ReactNode} [props.actions] - optional action cell per row
 * @param {string} [props.tableClassName]
 */
export default function DataTable({
  columns,
  data,
  emptyMessage = 'No data',
  actions,
  tableClassName = '',
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className={`min-w-full divide-y divide-gray-200 ${tableClassName}`}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {!data?.length ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-4 py-8 text-center text-sm text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id ?? rowIndex} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
