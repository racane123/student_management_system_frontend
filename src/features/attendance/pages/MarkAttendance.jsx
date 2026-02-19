// src/features/attendance/pages/MarkAttendance.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ChevronRight,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  CalendarDays,
  School,
  ClipboardList,
  Send,
} from 'lucide-react';

import MarkAttendanceForm from '../components/MarkAttendanceForm';
import {
  setSelectedClass,
  setSelectedDate,
  checkAttendanceExists,
  markBulkAttendance,
  updateBulkAttendance,
  resetAttendanceState,
  selectSelectedClass,
  selectSelectedDate,
  selectSessionExists,
  selectExistingSessionId,
  selectIsSubmitting,
  selectIsSuccess,
  selectIsError,
  selectMessage,
} from '../attendanceSlice';

import { selectAllClasses, fetchClasses } from '../../classes/classSlice';
import { selectAllStudents, fetchStudents } from '../../students/studentSlice';

// ---------------------------------------------------------------------------
// STEP DEFINITIONS
// ---------------------------------------------------------------------------
const STEPS = [
  { id: 1, label: 'Select Class & Date', icon: School },
  { id: 2, label: 'Mark Attendance',     icon: ClipboardList },
  { id: 3, label: 'Confirm & Submit',    icon: Send },
];

// ---------------------------------------------------------------------------
// STEP INDICATOR
// ---------------------------------------------------------------------------
const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEPS.map((step, idx) => {
      const Icon = step.icon;
      const isDone = step.id < current;
      const isActive = step.id === current;
      return (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center
                          font-bold text-sm transition-all duration-300 border-2
                          ${isDone
                            ? 'bg-indigo-500 border-indigo-500 text-white'
                            : isActive
                            ? 'bg-white border-indigo-500 text-indigo-600 shadow-md shadow-indigo-100'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}
            >
              {isDone ? <CheckCircle2 size={18} /> : <Icon size={16} />}
            </div>
            <span
              className={`text-xs mt-1.5 font-medium hidden sm:block ${
                isActive ? 'text-indigo-600' : isDone ? 'text-slate-500' : 'text-slate-300'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`h-0.5 w-12 sm:w-20 mx-1 mt-[-14px] sm:mt-[-20px] transition-all duration-500 ${
                step.id < current ? 'bg-indigo-400' : 'bg-slate-200'
              }`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ---------------------------------------------------------------------------
// CONFIRMATION SUMMARY
// ---------------------------------------------------------------------------
const ConfirmSummary = ({ formState, students, className, date }) => {
  const counts = useMemo(() => {
    let present = 0, absent = 0, late = 0;
    formState.forEach(({ status }) => {
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
    });
    return { present, absent, late };
  }, [formState]);

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Class</span>
          <span className="font-semibold text-slate-800">{className}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Date</span>
          <span className="font-semibold text-slate-800">
            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Total Students</span>
          <span className="font-semibold text-slate-800">{students.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Present', count: counts.present, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Absent',  count: counts.absent,  color: 'text-rose-600',    bg: 'bg-rose-50 border-rose-200' },
          { label: 'Late',    count: counts.late,    color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`${bg} border rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Please review and confirm before submitting.
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------
const MarkAttendance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const classes     = useSelector(selectAllClasses);
  const allStudents = useSelector(selectAllStudents);
  const selectedClass    = useSelector(selectSelectedClass);
  const selectedDate     = useSelector(selectSelectedDate);
  const sessionExists    = useSelector(selectSessionExists);
  const existingSessionId = useSelector(selectExistingSessionId);
  const isSubmitting     = useSelector(selectIsSubmitting);
  const isSuccess        = useSelector(selectIsSuccess);
  const isError          = useSelector(selectIsError);
  const message          = useSelector(selectMessage);

  const [step, setStep] = useState(1);

  // form state: Map<studentId, { status, remarks }>
  const [formState, setFormState] = useState(new Map());

  // Students in selected class (support both id and classId types)
  const classStudents = useMemo(
    () => allStudents.filter((s) => String(s.classId ?? s.class) === String(selectedClass)),
    [allStudents, selectedClass]
  );

  const selectedClassName = useMemo(() => {
    const c = classes.find((cls) => String(cls.id ?? cls._id) === String(selectedClass));
    return c?.className || (c?.gradeLevel && c?.section ? `Grade ${c.gradeLevel}-${c.section}` : c?.name) || '';
  }, [classes, selectedClass]);

  // All students marked?
  const allMarked = useMemo(() => {
    if (classStudents.length === 0) return false;
    return classStudents.every((s) => {
      const sid = s.id ?? s._id;
      const r = formState.get(sid);
      return r && r.status;
    });
  }, [formState, classStudents]);

  // ----- Effects -----
  // Load classes and students on mount
  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchStudents());
  }, [dispatch]);

  // Check for existing session when class or date changes
  useEffect(() => {
    if (selectedClass && selectedDate) {
      dispatch(checkAttendanceExists({ classId: selectedClass, date: selectedDate }));
    }
  }, [selectedClass, selectedDate, dispatch]);

  // Init form state when students load or class changes
  useEffect(() => {
    const newMap = new Map();
    classStudents.forEach((s) => {
      newMap.set(s.id ?? s._id, { status: '', remarks: '' });
    });
    setFormState(newMap);
  }, [classStudents]);

  // Redirect on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        dispatch(resetAttendanceState());
        navigate('/dashboard/attendance');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, dispatch, navigate]);

  // ----- Handlers -----
  const handleClassChange = (e) => dispatch(setSelectedClass(e.target.value));
  const handleDateChange  = (e) => dispatch(setSelectedDate(e.target.value));

  const handleRecordChange = useCallback((studentId, field, value) => {
    setFormState((prev) => {
      const next = new Map(prev);
      next.set(studentId, { ...next.get(studentId), [field]: value });
      return next;
    });
  }, []);

  const handleMarkAll = useCallback((status) => {
    setFormState((prev) => {
      const next = new Map(prev);
      next.forEach((val, key) => next.set(key, { ...val, status }));
      return next;
    });
  }, []);

  const handleSubmit = () => {
    const records = Array.from(formState.entries()).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      remarks: data.remarks,
    }));

    if (sessionExists && existingSessionId) {
      dispatch(updateBulkAttendance({ sessionId: existingSessionId, payload: { records } }));
    } else {
      dispatch(markBulkAttendance({ classId: selectedClass, date: selectedDate, records }));
    }
  };

  const goToStep = (n) => setStep(n);

  // ----- Render -----
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/dashboard/attendance')}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mark Attendance</h1>
            <p className="text-sm text-slate-400">Bulk mark for an entire class</p>
          </div>
        </div>

        <StepIndicator current={step} />

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6">
            {/* ── STEP 1: Select Class & Date ── */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <School size={20} className="text-indigo-500" />
                  Select Class &amp; Date
                </h2>

                <div className="space-y-4">
                  {/* Class select */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Class
                    </label>
                    <select
                      value={selectedClass}
                      onChange={handleClassChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700
                                 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300
                                 focus:border-transparent appearance-none"
                    >
                      <option value="">— Choose a class —</option>
                      {classes.map((c) => {
                        const cid = c.id ?? c._id;
                        const label = c.className || (c.gradeLevel && c.section ? `Grade ${c.gradeLevel}-${c.section}` : c.name) || `Class ${cid}`;
                        return <option key={cid} value={cid}>{label}</option>;
                      })}
                    </select>
                  </div>

                  {/* Date picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Date
                    </label>
                    <div className="relative">
                      <CalendarDays
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-700
                                   bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300
                                   focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Class info */}
                  {selectedClass && (
                    <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <School size={18} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-indigo-700">{selectedClassName}</p>
                        <p className="text-xs text-indigo-500">
                          {classStudents.length} student{classStudents.length !== 1 ? 's' : ''} enrolled
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => goToStep(2)}
                  disabled={!selectedClass || !selectedDate || classStudents.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white
                             font-semibold rounded-xl hover:bg-indigo-600 disabled:opacity-40
                             disabled:cursor-not-allowed transition shadow-md shadow-indigo-200"
                >
                  Load Students
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* ── STEP 2: Mark Attendance ── */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList size={20} className="text-indigo-500" />
                  Mark Attendance
                </h2>

                <MarkAttendanceForm
                  formState={formState}
                  onRecordChange={handleRecordChange}
                  onMarkAll={handleMarkAll}
                />

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => goToStep(1)}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold
                               rounded-xl hover:bg-slate-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => goToStep(3)}
                    disabled={!allMarked}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-500
                               text-white font-semibold rounded-xl hover:bg-indigo-600
                               disabled:opacity-40 disabled:cursor-not-allowed transition
                               shadow-md shadow-indigo-200"
                  >
                    Review
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Confirm & Submit ── */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Send size={20} className="text-indigo-500" />
                  Confirm &amp; Submit
                </h2>

                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-10 text-emerald-600">
                    <CheckCircle2 size={48} className="mb-3" />
                    <p className="text-lg font-bold">{message}</p>
                    <p className="text-sm text-slate-400 mt-1">Redirecting…</p>
                  </div>
                ) : (
                  <>
                    <ConfirmSummary
                      formState={formState}
                      students={classStudents}
                      className={selectedClassName}
                      date={selectedDate}
                    />

                    {isError && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                        {message}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => goToStep(2)}
                        disabled={isSubmitting}
                        className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold
                                   rounded-xl hover:bg-slate-50 transition disabled:opacity-40"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !allMarked}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500
                                   text-white font-bold rounded-xl hover:bg-emerald-600 transition
                                   shadow-md shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Submitting…
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            {sessionExists ? 'Update Attendance' : 'Submit Attendance'}
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;