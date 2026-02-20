/**
 * src/features/exams/pages/ExamDetails.jsx
 * Detailed view: exam parameters + Performance Placeholder (Total Students, Pass/Fail counts).
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, BookOpen, Calendar, Clock, BarChart3 } from 'lucide-react';
import { fetchExamById, clearCurrentExam } from '../examSlice';
import { fetchClasses } from '../../classes/classSlice';
import { fetchSubjects } from '../../subjects/subjectSlice';
function getClassLabel(c) {
  if (!c) return '—';
  return [c.gradeLevel, c.section, c.className].filter(Boolean).join(' ') || `Class ${c.id}`;
}

function getSubjectName(s) {
  return s?.name ?? s?.code ?? '—';
}

function StatusBadge({ status }) {
  const s = (status ?? '').toString();
  const styles = {
    Scheduled: 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20',
    Ongoing: 'bg-amber-100 text-amber-800 ring-1 ring-amber-600/20',
    Completed: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20',
  };
  const cls = styles[s] ?? 'bg-gray-100 text-gray-700 ring-1 ring-gray-400/20';
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-sm font-medium ${cls}`}>
      {s || '—'}
    </span>
  );
}

export default function ExamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentExam, loading, error } = useSelector((state) => state.exams);
  const classList = useSelector((state) => state.classes.classList) ?? [];
  const subjectList = useSelector((state) => state.subjects.subjectList) ?? [];

  const cls = classList.find((c) => c.id === (currentExam?.classId ?? currentExam?.class));
  const subj = subjectList.find((s) => s.id === (currentExam?.subjectId ?? currentExam?.subject));

  useEffect(() => {
    if (id && id !== 'new') {
      dispatch(fetchExamById(id));
    }
    return () => dispatch(clearCurrentExam());
  }, [id, dispatch]);

  useEffect(() => {
    if (!classList.length) dispatch(fetchClasses());
    if (!subjectList.length) dispatch(fetchSubjects());
  }, [dispatch, classList.length, subjectList.length]);

  if (loading && !currentExam) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-gray-200 animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-64 rounded-xl bg-gray-100 animate-pulse lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error && !currentExam) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
        {error}
        <button
          type="button"
          onClick={() => navigate('/dashboard/exams')}
          className="mt-2 block text-sm font-medium underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  if (!currentExam) return null;

  const exam = currentExam;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/exams')}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={() => navigate(`/dashboard/exams/${exam.id}/edit`)}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          Edit
        </button>
      </div>

      {/* Exam parameters */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <BookOpen className="h-7 w-7 text-blue-600" />
          {exam.name ?? '—'}
        </h1>
        <p className="mt-1 font-mono text-sm text-gray-500">ID: {exam.id}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge status={exam.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Class / Subject</h3>
            <p className="mt-1 text-gray-900">
              {getClassLabel(cls) || `Class ${exam.classId ?? exam.class}`} / {getSubjectName(subj) || `Subject ${exam.subjectId ?? exam.subject}`}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Schedule</h3>
            <p className="mt-1 flex items-center gap-2 text-gray-900">
              <Calendar className="h-4 w-4 text-gray-500" />
              {exam.examDate ?? '—'}
            </p>
            <p className="mt-1 flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 text-gray-500" />
              {exam.startTime ?? '—'} – {exam.endTime ?? '—'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Grading</h3>
            <p className="mt-1 text-gray-900">
              Total: {exam.totalMarks ?? '—'} | Passing: {exam.passingMarks ?? '—'}
            </p>
          </div>
        </div>
      </section>

      {/* Performance Placeholder – to be populated by Results module */}
      <section className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Performance (Placeholder)
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Total Students, Pass/Fail counts will be populated by the Results module.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">—</p>
            <p className="text-xs font-medium uppercase text-gray-500">Total Students</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">—</p>
            <p className="text-xs font-medium uppercase text-gray-500">Passed</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-red-600">—</p>
            <p className="text-xs font-medium uppercase text-gray-500">Failed</p>
          </div>
        </div>
      </section>
    </div>
  );
}
