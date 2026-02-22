/**
 * src/features/reports/pages/ReportCenter.jsx
 * Executive dashboard: tabs for Attendance, Academic, Financial.
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipboardList, GraduationCap, Wallet } from 'lucide-react';
import { fetchClasses } from '../../classes/classSlice';
import { fetchAttendanceSummary } from '../../attendance/attendanceSlice';
import { fetchResults } from '../../results/resultSlice';
import { fetchFees } from '../../fees/feeSlice';
import { selectReportFilters } from '../reportSlice';
import ReportFilterForm from '../components/ReportFilterForm';
import AttendanceReportTable from '../components/AttendanceReportTable';
import ResultReportTable from '../components/ResultReportTable';
import FinancialReport from './FinancialReport';

const TABS = [
  { id: 'attendance', label: 'Attendance', icon: ClipboardList },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'financial', label: 'Financial', icon: Wallet },
];

export default function ReportCenter() {
  const dispatch = useDispatch();
  const filters = useSelector(selectReportFilters);
  const [activeTab, setActiveTab] = useState('attendance');

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    if (filters.classId && activeTab === 'attendance') {
      dispatch(
        fetchAttendanceSummary({
          classId: filters.classId,
          params: {
            ...(filters.startDate && { startDate: filters.startDate }),
            ...(filters.endDate && { endDate: filters.endDate }),
          },
        })
      );
    }
  }, [dispatch, filters.classId, filters.startDate, filters.endDate, activeTab]);

  useEffect(() => {
    if (activeTab === 'academic') {
      dispatch(fetchResults());
    }
  }, [dispatch, activeTab]);

  useEffect(() => {
    if (activeTab === 'financial') {
      dispatch(fetchFees());
    }
  }, [dispatch, activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report Center</h1>
        <p className="mt-1 text-sm text-gray-500">
          Cross-module summary views. Use filters and export to CSV.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1" aria-label="Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium print:border print:border-gray-300 ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Global filters: DateRange + Class (and context-specific in FinancialReport) */}
      <ReportFilterForm
        showClass={true}
        showFeeType={activeTab === 'financial'}
        showExam={activeTab === 'academic'}
      />

      {/* Tab content */}
      <div className="min-h-[320px] rounded-xl border border-gray-200 bg-white p-6 shadow-sm print:shadow-none">
        {activeTab === 'attendance' && <AttendanceReportTable />}
        {activeTab === 'academic' && <ResultReportTable />}
        {activeTab === 'financial' && <FinancialReport embedded />}
      </div>
    </div>
  );
}
