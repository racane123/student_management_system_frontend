/**
 * src/features/reports/pages/FinancialReport.jsx
 * Detailed revenue view with Fee Type and Class filters.
 * ReportSummaryCard for Total Collected, Overdue. Exportable table.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectFinancialReportRows, selectFinancialSummary } from '../reportSlice';
import { fetchFees } from '../../fees/feeSlice';
import ReportSummaryCard from '../components/ReportSummaryCard';
import ExportButton from '../components/ExportButton';
import { formatCurrency } from '../../fees/utils/currency';

const CSV_HEADERS = [
  'studentName',
  'feeType',
  'totalAmount',
  'paidAmount',
  'balance',
  'status',
  'dueDate',
];
const CSV_LABELS = {
  studentName: 'Student',
  feeType: 'Fee Type',
  totalAmount: 'Total',
  paidAmount: 'Paid',
  balance: 'Balance',
  status: 'Status',
  dueDate: 'Due Date',
};

export default function FinancialReport({ embedded = false }) {
  const dispatch = useDispatch();
  const rows = useSelector(selectFinancialReportRows);
  const summary = useSelector(selectFinancialSummary);

  useEffect(() => {
    if (!embedded) dispatch(fetchFees());
  }, [dispatch, embedded]);

  const exportData = rows.map((f) => {
    const student = f.student ?? {};
    const studentName = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.name || `Student ${f.studentId}`;
    const balance = f.balance ?? (f.totalAmount - f.paidAmount);
    return {
      studentName,
      feeType: f.feeType ?? '—',
      totalAmount: f.totalAmount,
      paidAmount: f.paidAmount,
      balance,
      status: f.status ?? '—',
      dueDate: f.dueDate ?? '—',
    };
  });

  if (!embedded) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Report</h1>
          <p className="mt-1 text-sm text-gray-500">Revenue and fee status by class and type.</p>
        </div>

        <ReportFilterForm showClass={true} showFeeType={true} />

        <div className="grid gap-4 sm:grid-cols-2">
          <ReportSummaryCard
            title="Total Collected"
            value={formatCurrency(summary.totalCollected)}
            variant="success"
          />
          <ReportSummaryCard
            title="Overdue"
            value={formatCurrency(summary.overdue)}
            variant="danger"
          />
        </div>

        <FinancialReportContent
          rows={rows}
          summary={summary}
          exportData={exportData}
        />
      </div>
    );
  }

  return (
    <FinancialReportContent
      rows={rows}
      summary={summary}
      exportData={exportData}
    />
  );
}

function FinancialReportContent({ rows, summary, exportData }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ReportSummaryCard
          title="Total Collected"
          value={formatCurrency(summary.totalCollected)}
          variant="success"
        />
        <ReportSummaryCard
          title="Overdue"
          value={formatCurrency(summary.overdue)}
          variant="danger"
        />
      </div>

      <div className="flex justify-end">
        <ExportButton
          data={exportData}
          fileName={`financial_report_${new Date().toISOString().slice(0, 10)}`}
          headers={CSV_HEADERS}
          headerLabels={CSV_LABELS}
        />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          <p className="text-sm">No fee data for the selected filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm print:shadow-none">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Fee Type
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Paid
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Balance
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((f) => {
                const student = f.student ?? {};
                const studentName = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.name || `Student ${f.studentId}`;
                const balance = f.balance ?? (f.totalAmount - f.paidAmount);
                return (
                  <tr key={f.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{studentName}</td>
                    <td className="px-4 py-3 text-gray-700">{f.feeType ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(f.totalAmount)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(f.paidAmount)}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(balance)}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          f.status === 'Paid'
                            ? 'text-emerald-600 font-medium'
                            : f.status === 'Overdue'
                              ? 'text-red-600 font-medium'
                              : 'text-amber-600 font-medium'
                        }
                      >
                        {f.status ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{f.dueDate ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
