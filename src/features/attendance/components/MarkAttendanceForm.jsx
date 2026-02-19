// src/features/attendance/components/MarkAttendanceForm.jsx
import React, { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  Loader2,
  Users,
} from 'lucide-react';

// Student slice selectors (assumed to exist)
import { selectAllStudents } from '../../students/studentSlice';
import {
  selectSelectedClass,
  selectSelectedDate,
  selectSessionExists,
  selectExistingSessionId,
  selectIsCheckingExists,
} from '../attendanceSlice';

// ---------------------------------------------------------------------------
// STATUS CONFIG
// ---------------------------------------------------------------------------
const STATUS_OPTIONS = [
  {
    value: 'present',
    label: 'Present',
    icon: CheckCircle2,
    active: 'bg-emerald-500 text-white shadow-emerald-200 shadow-md',
    hover: 'hover:bg-emerald-50 hover:text-emerald-600',
    ring: 'ring-emerald-400',
  },
  {
    value: 'absent',
    label: 'Absent',
    icon: XCircle,
    active: 'bg-rose-500 text-white shadow-rose-200 shadow-md',
    hover: 'hover:bg-rose-50 hover:text-rose-600',
    ring: 'ring-rose-400',
  },
  {
    value: 'late',
    label: 'Late',
    icon: Clock,
    active: 'bg-amber-400 text-white shadow-amber-200 shadow-md',
    hover: 'hover:bg-amber-50 hover:text-amber-600',
    ring: 'ring-amber-400',
  },
];

// ---------------------------------------------------------------------------
// SUB-COMPONENTS
// ---------------------------------------------------------------------------

/** Single student row */
const StudentRow = React.memo(({ student, record, onChange }) => {
  const { status, remarks } = record;
  const sid = student.id ?? student._id;

  const handleStatusChange = useCallback(
    (val) => onChange(sid, 'status', val),
    [onChange, sid]
  );

  const handleRemarksChange = useCallback(
    (e) => onChange(sid, 'remarks', e.target.value),
    [onChange, sid]
  );

  return (
    <div
      className={`
        group bg-white rounded-xl border transition-all duration-200
        ${status ? 'border-slate-200' : 'border-amber-300 bg-amber-50/30'}
        hover:shadow-md hover:border-slate-300
      `}
    >
      {/* Mobile-friendly stacked layout */}
      <div className="p-4">
        {/* Student info row */}
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {student.firstName?.[0]}{student.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 truncate">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-xs text-slate-400">ID: {student.studentId ?? student.id ?? student._id}</p>
          </div>
          {!status && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              Pending
            </span>
          )}
        </div>

        {/* Status toggles */}
        <div className="flex gap-2 mb-3">
          {STATUS_OPTIONS.map(({ value, label, icon: Icon, active, hover, ring }) => {
            const isActive = status === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleStatusChange(value)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg
                  text-sm font-medium border transition-all duration-150 select-none
                  ${isActive
                    ? `${active} border-transparent ring-2 ${ring}`
                    : `bg-slate-50 text-slate-500 border-slate-200 ${hover}`
                  }
                `}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Remarks */}
        <div className="relative">
          <MessageSquare
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={remarks}
            onChange={handleRemarksChange}
            placeholder="Remarks (optional)"
            maxLength={120}
            className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent
                       placeholder:text-slate-300 text-slate-700 transition"
          />
        </div>
      </div>
    </div>
  );
});
StudentRow.displayName = 'StudentRow';

// ---------------------------------------------------------------------------
// QUICK-MARK TOOLBAR
// ---------------------------------------------------------------------------
const QuickMarkBar = ({ onMarkAll }) => (
  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
    <span className="text-xs font-medium text-slate-500 mr-1">Mark all as:</span>
    {STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
      <button
        key={value}
        type="button"
        onClick={() => onMarkAll(value)}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600
                   bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
      >
        <Icon size={12} />
        {label}
      </button>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
/**
 * MarkAttendanceForm
 *
 * Props:
 *   - formState: Map<studentId, { status, remarks }> — managed by parent page
 *   - onRecordChange: (studentId, field, value) => void
 *   - onMarkAll: (status) => void
 */
const MarkAttendanceForm = ({ formState, onRecordChange, onMarkAll }) => {
  const allStudents = useSelector(selectAllStudents);
  const selectedClass = useSelector(selectSelectedClass);
  const selectedDate = useSelector(selectSelectedDate);
  const sessionExists = useSelector(selectSessionExists);
  const existingSessionId = useSelector(selectExistingSessionId);
  const isCheckingExists = useSelector(selectIsCheckingExists);

  // Filter students by selected class (support id/classId)
  const classStudents = useMemo(
    () => allStudents.filter((s) => String(s.classId ?? s.class) === String(selectedClass)),
    [allStudents, selectedClass]
  );

  // Completion stats
  const markedCount = useMemo(
    () => [...(formState?.values() || [])].filter((r) => r.status).length,
    [formState]
  );
  const totalCount = classStudents.length;
  const allMarked = markedCount === totalCount && totalCount > 0;
  const completionPct = totalCount > 0 ? Math.round((markedCount / totalCount) * 100) : 0;

  if (!selectedClass) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Users size={40} className="mb-3 opacity-40" />
        <p className="text-sm font-medium">Select a class to load students</p>
      </div>
    );
  }

  if (classStudents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Users size={40} className="mb-3 opacity-40" />
        <p className="text-sm font-medium">No students found in this class</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Session warning */}
      {isCheckingExists && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
          <Loader2 size={15} className="animate-spin" />
          Checking if attendance already exists…
        </div>
      )}

      {sessionExists && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-sm font-medium">
          <AlertCircle size={16} />
          Attendance already marked for this class on{' '}
          {format(new Date(selectedDate), 'MMM d, yyyy')}.
          You are in <span className="font-bold ml-1">Edit Mode</span>.
        </div>
      )}

      {/* Date header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Date</p>
          <p className="text-lg font-bold text-slate-800">
            {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Progress</p>
          <p className="text-lg font-bold text-slate-800">
            {markedCount}
            <span className="text-slate-400 font-normal text-sm"> / {totalCount}</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            allMarked ? 'bg-emerald-500' : 'bg-indigo-400'
          }`}
          style={{ width: `${completionPct}%` }}
        />
      </div>

      {/* Quick mark */}
      <QuickMarkBar onMarkAll={onMarkAll} />

      {/* Student rows */}
      <div className="space-y-3">
        {classStudents.map((student) => {
          const sid = student.id ?? student._id;
          const record = formState?.get(sid) || { status: '', remarks: '' };
          return (
            <StudentRow
              key={sid}
              student={student}
              record={record}
              onChange={onRecordChange}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MarkAttendanceForm;