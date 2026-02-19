// src/features/attendance/pages/AttendanceList.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  Search,
  Plus,
  CalendarDays,
  School,
  ChevronRight,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart2,
} from 'lucide-react';

import {
  fetchAttendanceByClass,
  setSelectedClass,
  setSelectedDate,
  selectAttendanceList,
  selectSelectedClass,
  selectSelectedDate,
  selectIsLoading,
} from '../attendanceSlice';
import AttendanceReportTable from '../components/AttendanceReportTable';
import { fetchAttendanceSummary } from '../attendanceSlice';
import { selectAllClasses, fetchClasses } from '../../classes/classSlice';

// ---------------------------------------------------------------------------
// STAT CHIP
// ---------------------------------------------------------------------------
const StatChip = ({ icon: Icon, count, label, color }) => (
  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
    <Icon size={12} />
    {count} {label}
  </div>
);

// ---------------------------------------------------------------------------
// SESSION CARD (single day's attendance record)
// ---------------------------------------------------------------------------
const SessionCard = ({ session, onClick }) => {
  const present = session.records?.filter((r) => r.status === 'present').length || 0;
  const absent  = session.records?.filter((r) => r.status === 'absent').length  || 0;
  const late    = session.records?.filter((r) => r.status === 'late').length    || 0;
  const total   = session.records?.length || 0;
  const rate    = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  const rateColor =
    rate >= 90 ? 'text-emerald-600' :
    rate >= 75 ? 'text-blue-600' :
    rate >= 60 ? 'text-amber-600' : 'text-rose-600';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-slate-100 rounded-xl p-4 shadow-sm
                 hover:shadow-md hover:border-indigo-200 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <CalendarDays size={20} className="text-indigo-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">
              {format(parseISO(session.date), 'EEEE, MMM d, yyyy')}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{total} students</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${rateColor}`}>{rate}%</span>
          <ChevronRight
            size={16}
            className="text-slate-300 group-hover:text-indigo-400 transition"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <StatChip icon={CheckCircle2} count={present} label="Present" color="bg-emerald-50 text-emerald-600" />
        <StatChip icon={XCircle}     count={absent}  label="Absent"  color="bg-rose-50 text-rose-600" />
        <StatChip icon={Clock}       count={late}    label="Late"    color="bg-amber-50 text-amber-600" />
      </div>
    </button>
  );
};

// ---------------------------------------------------------------------------
// TABS
// ---------------------------------------------------------------------------
const TABS = [
  { id: 'sessions', label: 'Session Log', icon: CalendarDays },
  { id: 'report',   label: 'Report',      icon: BarChart2 },
];

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------
const AttendanceList = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const classes         = useSelector(selectAllClasses);
  const attendanceList  = useSelector(selectAttendanceList);
  const selectedClass   = useSelector(selectSelectedClass);
  const selectedDate    = useSelector(selectSelectedDate);
  const isLoading       = useSelector(selectIsLoading);

  const [activeTab, setActiveTab]       = useState('sessions');
  const [searchQuery, setSearchQuery]   = useState('');
  const [reportRange, setReportRange]   = useState({
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    endDate:   format(new Date(), 'yyyy-MM-dd'),
  });

  // Load classes on mount
  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  // Fetch sessions on class change
  useEffect(() => {
    if (selectedClass) {
      dispatch(fetchAttendanceByClass({ classId: selectedClass, params: {} }));
    }
  }, [selectedClass, dispatch]);

  // Fetch summary when switching to report tab
  useEffect(() => {
    if (activeTab === 'report' && selectedClass) {
      dispatch(fetchAttendanceSummary({
        classId: selectedClass,
        params: reportRange,
      }));
    }
  }, [activeTab, selectedClass, reportRange, dispatch]);

  const handleClassChange = useCallback(
    (e) => dispatch(setSelectedClass(e.target.value)),
    [dispatch]
  );

  // Filter sessions by date search
  const filteredSessions = useMemo(() => {
    return attendanceList.filter((s) => {
      const matchesDate = !searchQuery || s.date?.includes(searchQuery);
      return matchesDate;
    });
  }, [attendanceList, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage and review class attendance</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/attendance/mark')}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white font-semibold
                       rounded-xl hover:bg-indigo-600 transition shadow-md shadow-indigo-200 text-sm"
          >
            <Plus size={17} />
            Mark Attendance
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {/* Class selector */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Class
              </label>
              <div className="relative">
                <School size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedClass}
                  onChange={handleClassChange}
                  className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl
                             bg-slate-50 text-slate-700 focus:outline-none focus:ring-2
                             focus:ring-indigo-300 appearance-none"
                >
                  <option value="">All Classes</option>
                  {classes.map((c) => {
                    const cid = c.id ?? c._id;
                    const label = c.className || (c.gradeLevel && c.section ? `Grade ${c.gradeLevel}-${c.section}` : c.name) || `Class ${cid}`;
                    return <option key={cid} value={cid}>{label}</option>;
                  })}
                </select>
              </div>
            </div>

            {/* Date search (sessions tab only) */}
            {activeTab === 'sessions' && (
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Search by Date
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl
                               bg-slate-50 text-slate-700 focus:outline-none focus:ring-2
                               focus:ring-indigo-300 placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}

            {/* Date range for report tab */}
            {activeTab === 'report' && (
              <>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={reportRange.startDate}
                    onChange={(e) =>
                      setReportRange((p) => ({ ...p, startDate: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl
                               bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={reportRange.endDate}
                    onChange={(e) =>
                      setReportRange((p) => ({ ...p, endDate: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl
                               bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all
                          ${activeTab === id
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                          }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'sessions' && (
          <>
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 bg-slate-100 rounded-xl" />
                ))}
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="py-20 text-center">
                <Users size={40} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-400 text-sm">
                  {selectedClass
                    ? 'No attendance sessions found. Mark attendance to get started.'
                    : 'Select a class to view attendance sessions.'}
                </p>
                {selectedClass && (
                  <button
                    onClick={() => navigate('/dashboard/attendance/mark')}
                    className="mt-4 px-5 py-2 bg-indigo-500 text-white text-sm font-semibold
                               rounded-xl hover:bg-indigo-600 transition"
                  >
                    Mark Attendance
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((session) => (
                  <SessionCard
                    key={session.id ?? session._id}
                    session={session}
                    onClick={() =>
                      navigate(`/dashboard/attendance/${session.id ?? session._id}?classId=${selectedClass}&date=${session.date}`)
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'report' && (
          <AttendanceReportTable dateRange={reportRange} />
        )}
      </div>
    </div>
  );
};

export default AttendanceList;