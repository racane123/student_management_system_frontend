/**
 * src/features/reports/components/AttendanceReportTable.jsx
 * Student name with calculated Present / Absent / Late percentages.
 * Report aesthetic: clean white, minimal, printable.
 */

import { useSelector } from 'react-redux';
import {
  selectAttendanceReportRows,
  selectAttendanceClassAverage,
} from '../reportSlice';
import ExportButton from './ExportButton';

const CSV_HEADERS = [
  'studentName',
  'totalDays',
  'presentDays',
  'absentDays',
  'lateDays',
  'presentPct',
  'absentPct',
  'latePct',
  'attendanceRate',
];
const CSV_LABELS = {
  studentName: 'Student Name',
  totalDays: 'Total Days',
  presentDays: 'Present',
  absentDays: 'Absent',
  lateDays: 'Late',
  presentPct: 'Present %',
  absentPct: 'Absent %',
  latePct: 'Late %',
  attendanceRate: 'Attendance Rate %',
};

export default function AttendanceReportTable() {
  const rows = useSelector(selectAttendanceReportRows);
  const classAverage = useSelector(selectAttendanceClassAverage);

  const exportData = rows.map((r) => ({
    studentName: r.studentName,
    totalDays: r.totalDays,
    presentDays: r.presentDays,
    absentDays: r.absentDays,
    lateDays: r.lateDays,
    presentPct: r.presentPct,
    absentPct: r.absentPct,
    latePct: r.latePct,
    attendanceRate: r.attendanceRate,
  }));

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        <p className="text-sm">No attendance data for the selected period. Select a class and load attendance summary.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-gray-700">
          Class Average Attendance: <span className="text-gray-900">{classAverage}%</span>
        </p>
        <ExportButton
          data={exportData}
          fileName={`attendance_report_${new Date().toISOString().slice(0, 10)}`}
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
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Total Days
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Present %
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Absent %
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Late %
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Attendance Rate %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.studentId} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-900">{row.studentName}</td>
                <td className="px-4 py-3 text-center text-gray-700">{row.totalDays}</td>
                <td className="px-4 py-3 text-center text-emerald-600">{row.presentPct}%</td>
                <td className="px-4 py-3 text-center text-red-600">{row.absentPct}%</td>
                <td className="px-4 py-3 text-center text-amber-600">{row.latePct}%</td>
                <td className="px-4 py-3 text-center font-bold text-gray-900">{row.attendanceRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
