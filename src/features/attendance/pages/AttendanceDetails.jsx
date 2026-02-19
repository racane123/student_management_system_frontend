// src/features/attendance/pages/AttendanceDetails.jsx
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Loader2,
  CalendarDays,
} from 'lucide-react';

import {
  fetchAttendanceByDate,
  clearDayDetail,
  selectDayDetail,
  selectIsLoading,
  selectIsError,
  selectMessage,
} from '../attendanceSlice';
import { selectAllClasses } from '../../classes/classSlice';

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------
const STATUS_COLORS = {
  present: '#22c55e',  // emerald-500
  absent:  '#f43f5e',  // rose-500
  late:    '#f59e0b',  // amber-400
};

const STATUS_META = {
  present: { label: 'Present', Icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  absent:  { label: 'Absent',  Icon: XCircle,       bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200' },
  late:    { label: 'Late',    Icon: Clock,          bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200' },
};

// ---------------------------------------------------------------------------
// CUSTOM TOOLTIP
// ---------------------------------------------------------------------------
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const meta = STATUS_META[name.toLowerCase()];
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-lg text-sm">
      <p className="font-semibold text-slate-700">{meta?.label || name}</p>
      <p className="text-slate-500">{value} student{value !== 1 ? 's' : ''}</p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// CUSTOM LEGEND
// ---------------------------------------------------------------------------
const CustomLegend = ({ payload }) => (
  <div className="flex justify-center gap-4 mt-2">
    {payload.map((entry) => (
      <div key={entry.value} className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-xs text-slate-500 capitalize">{entry.value}</span>
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// STUDENT RECORD ROW
// ---------------------------------------------------------------------------
const StudentRow = ({ record, index }) => {
  const meta = STATUS_META[record.status] || STATUS_META.absent;
  const { Icon, bg, text, border } = meta;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${bg} ${border} transition`}>
      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 truncate">
          {record.student?.firstName} {record.student?.lastName}
        </p>
        {record.remarks && (
          <p className="text-xs text-slate-400 truncate">{record.remarks}</p>
        )}
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold ${text}`}>
        <Icon size={14} />
        <span className="capitalize">{record.status}</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------
const AttendanceDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id }   = useParams();
  const [searchParams] = useSearchParams();

  const classId = searchParams.get('classId');
  const date    = searchParams.get('date');

  const dayDetail = useSelector(selectDayDetail);
  const isLoading = useSelector(selectIsLoading);
  const isError   = useSelector(selectIsError);
  const message   = useSelector(selectMessage);
  const classes   = useSelector(selectAllClasses);

  const className = useMemo(() => {
    const c = classes.find((cls) => String(cls.id ?? cls._id) === String(classId));
    return c?.className || (c?.gradeLevel && c?.section ? `Grade ${c.gradeLevel}-${c.section}` : c?.name) || 'Unknown Class';
  }, [classes, classId]);

  useEffect(() => {
    if (classId && date) {
      dispatch(fetchAttendanceByDate({ classId, date }));
    }
    return () => dispatch(clearDayDetail());
  }, [classId, date, dispatch]);

  // ---------------------------------------------------------------------------
  // AGGREGATED STATS
  // ---------------------------------------------------------------------------
  const stats = useMemo(() => {
    if (!dayDetail?.records?.length) return null;
    const records = dayDetail.records;
    const total   = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent  = records.filter((r) => r.status === 'absent').length;
    const late    = records.filter((r) => r.status === 'late').length;

    // attendanceRate = (presentDays / totalDays) * 100
    // "Present" and "Late" count as attended
    const attendanceRate = parseFloat(((present + late) / total) * 100).toFixed(1);

    const pieData = [
      { name: 'present', value: present, color: STATUS_COLORS.present },
      { name: 'absent',  value: absent,  color: STATUS_COLORS.absent },
      { name: 'late',    value: late,    color: STATUS_COLORS.late },
    ].filter((d) => d.value > 0);

    return { total, present, absent, late, attendanceRate, pieData };
  }, [dayDetail]);

  // ---------------------------------------------------------------------------
  // GROUP RECORDS BY STATUS for listing
  // ---------------------------------------------------------------------------
  const groupedRecords = useMemo(() => {
    if (!dayDetail?.records) return {};
    return dayDetail.records.reduce((acc, r) => {
      if (!acc[r.status]) acc[r.status] = [];
      acc[r.status].push(r);
      return acc;
    }, {});
  }, [dayDetail]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={36} className="animate-spin" />
          <p className="text-sm">Loading session details…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center text-rose-500">
          <p className="font-semibold">{message || 'Failed to load session.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-sm text-slate-500 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Attendance Details</h1>
            <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
              <CalendarDays size={13} />
              {date ? format(parseISO(date), 'EEEE, MMMM d, yyyy') : '—'}
              &nbsp;·&nbsp;
              {className}
            </p>
          </div>
        </div>

        {!stats ? (
          <div className="py-20 text-center text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No records found for this session.</p>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total',   value: stats.total,           color: 'text-slate-700', bg: 'bg-white' },
                { label: 'Present', value: stats.present,         color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Absent',  value: stats.absent,          color: 'text-rose-600',    bg: 'bg-rose-50' },
                { label: 'Late',    value: stats.late,            color: 'text-amber-600',   bg: 'bg-amber-50' },
              ].map(({ label, value, color, bg }) => (
                <div
                  key={label}
                  className={`${bg} border border-slate-100 rounded-2xl p-4 text-center shadow-sm`}
                >
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-slate-400 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Attendance Rate Banner */}
            <div className={`
              flex items-center justify-between p-5 rounded-2xl border
              ${parseFloat(stats.attendanceRate) >= 75
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-rose-50 border-rose-200'
              }
            `}>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Attendance Rate
                </p>
                <p className={`text-4xl font-black mt-1 ${
                  parseFloat(stats.attendanceRate) >= 75 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {stats.attendanceRate}%
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  (Present + Late) / Total × 100
                </p>
              </div>
              <div className="w-24 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { value: parseFloat(stats.attendanceRate) },
                        { value: 100 - parseFloat(stats.attendanceRate) },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={40}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      <Cell fill={parseFloat(stats.attendanceRate) >= 75 ? '#22c55e' : '#f43f5e'} />
                      <Cell fill="#e2e8f0" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Pie Chart */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 mb-4">Status Distribution</h2>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={45}
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={3}
                      label={({ name, percent }) =>
                        `${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {stats.pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Record List grouped by status */}
            <div className="space-y-5">
              {['present', 'late', 'absent'].map((status) => {
                const group = groupedRecords[status];
                if (!group?.length) return null;
                const meta = STATUS_META[status];
                return (
                  <div key={status}>
                    <div className="flex items-center gap-2 mb-3">
                      <meta.Icon size={15} className={meta.text} />
                      <h3 className={`text-sm font-bold uppercase tracking-wider ${meta.text}`}>
                        {meta.label} ({group.length})
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {group.map((record, idx) => (
                        <StudentRow key={record._id || idx} record={record} index={idx} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceDetails;