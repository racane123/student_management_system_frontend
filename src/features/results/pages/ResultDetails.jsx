/**
 * src/features/results/pages/ResultDetails.jsx
 * Student Report Card style view for individual result.
 */

import { useEffect } from 'react';
import { fetchClasses } from '../../classes/classSlice';
import { fetchExams } from '../../exams/examSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Award, BookOpen, User } from 'lucide-react';
import { fetchResultById, clearCurrentResult } from '../resultSlice';
import GradeBadge from '../components/GradeBadge';

export default function ResultDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentResult, loading, error } = useSelector((state) => state.results);
  const examList = useSelector((state) => state.exams.examList ?? []);
  const classList = useSelector((state) => state.classes.classList ?? []);

  useEffect(() => {
    if (id) dispatch(fetchResultById(id));
    return () => dispatch(clearCurrentResult());
  }, [id, dispatch]);

  useEffect(() => {
    if (!classList.length) dispatch(fetchClasses());
    dispatch(fetchExams());
  }, [dispatch, classList.length]);

  if (loading && !currentResult) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-gray-200 animate-pulse" />
        <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (error && !currentResult) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
        {error}
        <button
          type="button"
          onClick={() => navigate('/dashboard/results')}
          className="mt-2 block text-sm font-medium underline"
        >
          Back to results
        </button>
      </div>
    );
  }

  if (!currentResult) return null;

  const r = currentResult;
  const student = r.student ?? {};
  const exam = r.exam ?? examList.find((e) => e.id === r.examId) ?? {};
  const cls = classList.find((c) => c.id === (exam.classId ?? exam.class));
  const studentName = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.name || 'Student';
  const totalMarks = r.totalMarks ?? exam.totalMarks ?? 100;
  const passingMarks = r.passingMarks ?? exam.passingMarks ?? 40;
  const percentage =
    r.percentage != null
      ? typeof r.percentage === 'number'
        ? r.percentage.toFixed(1)
        : r.percentage
      : totalMarks > 0
        ? ((r.marksObtained / totalMarks) * 100).toFixed(1)
        : '—';

  const getClassLabel = (c) =>
    c ? [c.gradeLevel, c.section, c.className].filter(Boolean).join(' ') || `Class ${c.id}` : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard/results')}
          className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Result Details</h1>
      </div>

      {/* Report Card style card */}
      <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Academic Report Card</h2>
          <p className="text-sm text-blue-100">
            {exam.name ?? `Exam ${r.examId}`} • {exam.examDate ?? '—'}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Student info */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
              <User className="h-7 w-7 text-indigo-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{studentName}</p>
              <p className="text-sm text-gray-500">
                {getClassLabel(cls)} • ID: {student.id ?? student.studentId ?? r.studentId ?? '—'}
              </p>
            </div>
          </div>

          {/* Performance */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">Marks Obtained</p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {r.marksObtained} <span className="text-gray-400">/ {totalMarks}</span>
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">Percentage</p>
              <p className="mt-1 text-xl font-bold text-blue-600">{percentage}%</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">Grade</p>
              <p className="mt-2">
                <GradeBadge grade={r.grade} size="md" />
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">Status</p>
              <p
                className={`mt-1 text-xl font-bold ${
                  r.status === 'Passed' ? 'text-emerald-600' : r.status === 'Failed' ? 'text-red-600' : 'text-gray-700'
                }`}
              >
                {r.status ?? '—'}
              </p>
            </div>
          </div>

          {/* Exam details */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <BookOpen className="h-4 w-4" /> Exam Details
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {exam.name ?? '—'} • Date: {exam.examDate ?? '—'} • Passing Marks: {passingMarks}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
