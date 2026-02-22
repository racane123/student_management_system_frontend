/**
 * src/features/reports/components/ResultReportTable.jsx
 * Exam performance with "Class Summary" header (Average, Pass/Fail counts).
 * Report aesthetic: clean white, bold totals, printable.
 */

import { useSelector } from 'react-redux';
import {
  selectResultReportRows,
  selectAcademicClassSummary,
} from '../reportSlice';
import ExportButton from './ExportButton';

const CSV_HEADERS = [
  'studentName',
  'examName',
  'marksObtained',
  'totalMarks',
  'percentage',
  'grade',
  'status',
];
const CSV_LABELS = {
  studentName: 'Student Name',
  examName: 'Exam',
  marksObtained: 'Marks Obtained',
  totalMarks: 'Total Marks',
  percentage: 'Percentage %',
  grade: 'Grade',
  status: 'Status',
};

export default function ResultReportTable() {
  const rows = useSelector(selectResultReportRows);
  const summary = useSelector(selectAcademicClassSummary);

  const exportData = rows.map((r) => {
    const student = r.student ?? {};
    const exam = r.exam ?? {};
    const totalMarks = r.totalMarks ?? exam.totalMarks ?? 100;
    const pct =
      r.percentage != null
        ? (typeof r.percentage === 'number' ? r.percentage.toFixed(1) : r.percentage)
        : totalMarks > 0
          ? (((r.marksObtained ?? 0) / totalMarks) * 100).toFixed(1)
          : '—';
    return {
      studentName: [student.firstName, student.lastName].filter(Boolean).join(' ') || student.name || `Student ${r.studentId}`,
      examName: exam.name ?? `Exam ${r.examId}`,
      marksObtained: r.marksObtained,
      totalMarks,
      percentage: pct,
      grade: r.grade ?? '—',
      status: r.status ?? '—',
    };
  });

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        <p className="text-sm">No result data for the selected filters. Enter results or adjust filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Class Summary header */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Class Average</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{summary.average}</p>
        </div>
        <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Total Students</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{summary.total}</p>
        </div>
        <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Passed</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{summary.passCount}</p>
        </div>
        <div className="rounded-lg border-2 border-red-200 bg-red-50/50 p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Failed</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{summary.failCount}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <ExportButton
          data={exportData}
          fileName={`academic_report_${new Date().toISOString().slice(0, 10)}`}
          headers={CSV_HEADERS}
          headerLabels={CSV_LABELS}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm print:shadow-none">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Student
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Exam
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                Marks
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                %
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Grade
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => {
              const student = r.student ?? {};
              const exam = r.exam ?? {};
              const totalMarks = r.totalMarks ?? exam.totalMarks ?? 100;
              const pct =
                r.percentage != null
                  ? typeof r.percentage === 'number'
                    ? r.percentage.toFixed(1)
                    : r.percentage
                  : totalMarks > 0
                    ? (((r.marksObtained ?? 0) / totalMarks) * 100).toFixed(1)
                    : '—';
              const studentName = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.name || `Student ${r.studentId}`;
              return (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{studentName}</td>
                  <td className="px-4 py-3 text-gray-700">{exam.name ?? `Exam ${r.examId}`}</td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {r.marksObtained} / {totalMarks}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">{pct}%</td>
                  <td className="px-4 py-3 text-center text-gray-700">{r.grade ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={
                        r.status === 'Passed'
                          ? 'font-semibold text-emerald-600'
                          : r.status === 'Failed'
                            ? 'font-semibold text-red-600'
                            : 'text-gray-500'
                      }
                    >
                      {r.status ?? '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
