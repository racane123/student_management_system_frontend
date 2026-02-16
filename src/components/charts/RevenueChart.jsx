/**
 * MILESTONE 4: Dashboard – Revenue chart (Recharts)
 * Expects data: Array<{ month: string, revenue: number }>
 * Place in: src/components/charts/RevenueChart.jsx
 */

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * @param {Object} props
 * @param {Array<{ month: string, revenue: number }>} props.data
 * @param {string} [props.title]
 * @param {string} [props.height]
 */
export default function RevenueChart({ data = [], title = 'Revenue Overview', height = '320px' }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
          <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" tickFormatter={(v) => `₱${v.toLocaleString()}`} />
          <Tooltip
            formatter={(value) => [`₱${Number(value).toLocaleString('en-PH')}`, 'Revenue']}
            contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
