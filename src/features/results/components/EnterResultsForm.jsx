/**
 * src/features/results/components/EnterResultsForm.jsx
 * Smart grade entry: Class -> Subject -> Exam workflow.
 * Real-time validation (marksObtained <= totalMarks) and auto-compute Percentage, Grade, Status.
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BookOpen, Loader2 } from 'lucide-react';
import { selectAllClasses, fetchClasses } from '../../classes/classSlice';
import {
  selectAllStudents,
  fetchStudents,
  setFilters as setStudentFilters,
  setLimit as setStudentLimit,
} from '../../students/studentSlice';
import { fetchSubjects } from '../../subjects/subjectSlice';
import {
  fetchExams,
  setFilters as setExamFilters,
  setPage as setExamPage,
} from '../../exams/examSlice';
import { fetchResultsByExam } from '../resultSlice';
import { calculateGrade } from '../utils/gradingConstants';
import GradeBadge from './GradeBadge';

export default function EnterResultsForm({
  selectedClassId,
  selectedSubjectId,
  selectedExamId,
  onClassChange,
  onSubjectChange,
  onExamChange,
  formState,
  onMarksChange,
  totalMarks,
  passingMarks,
  onReadyToSubmit,
}) {
  const dispatch = useDispatch();
  const classList = useSelector(selectAllClasses);
  const allStudents = useSelector(selectAllStudents);
  const subjectList = useSelector((state) => state.subjects.subjectList ?? []);
  const examList = useSelector((state) => state.exams.examList ?? []);
  const existingResultIds = useSelector((state) => state.results?.existingResultIds ?? []);

  const classStudents = useMemo(
    () =>
      allStudents.filter(
        (s) => String(s.classId ?? s.class) === String(selectedClassId)
      ),
    [allStudents, selectedClassId]
  );

  const filteredExams = useMemo(() => {
    if (!selectedClassId || !selectedSubjectId) return [];
    const cid = Number(selectedClassId);
    const sid = Number(selectedSubjectId);
    return examList.filter(
      (e) =>
        (e.classId ?? e.class) === cid && (e.subjectId ?? e.subject) === sid
    );
  }, [examList, selectedClassId, selectedSubjectId]);

  const filteredSubjects = useMemo(() => {
    const cid = Number(selectedClassId);
    if (!cid) return [];
    return subjectList.filter(
      (s) => Array.isArray(s.classIds) && s.classIds.includes(cid)
    );
  }, [subjectList, selectedClassId]);

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    if (selectedClassId) {
      dispatch(setStudentFilters({ classId: selectedClassId }));
      dispatch(setStudentLimit(500));
      dispatch(fetchStudents());
    }
  }, [dispatch, selectedClassId]);

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (selectedClassId) {
      dispatch(setExamFilters({ classId: selectedClassId }));
      dispatch(setExamPage(1));
      dispatch(fetchExams());
    }
  }, [dispatch, selectedClassId]);

  useEffect(() => {
    if (selectedExamId) {
      dispatch(fetchResultsByExam(selectedExamId));
    }
  }, [dispatch, selectedExamId]);

  const exam = useMemo(
    () => examList.find((e) => e.id === selectedExamId || e.id === Number(selectedExamId)),
    [examList, selectedExamId]
  );

  const resolvedTotalMarks = totalMarks ?? exam?.totalMarks ?? 100;
  const resolvedPassingMarks = passingMarks ?? exam?.passingMarks ?? 40;

  const hasOverflowError = useCallback(
    (studentId) => {
      const marks = formState?.get?.(studentId)?.marksObtained;
      if (marks == null || marks === '') return false;
      const num = Number(marks);
      return !Number.isNaN(num) && num > resolvedTotalMarks;
    },
    [formState, resolvedTotalMarks]
  );

  const computedForStudent = useCallback(
    (studentId) => {
      const marks = formState?.get?.(studentId)?.marksObtained;
      if (marks == null || marks === '') {
        return { percentage: '—', grade: '—', status: '—' };
      }
      const num = Number(marks);
      if (Number.isNaN(num)) return { percentage: '—', grade: '—', status: '—' };
      const r = calculateGrade(num, resolvedTotalMarks, resolvedPassingMarks);
      return {
        percentage: Number.isNaN(r.percentage) ? '—' : r.percentage.toFixed(1) + '%',
        grade: r.grade,
        status: r.status,
      };
    },
    [formState, resolvedTotalMarks, resolvedPassingMarks]
  );

  const allValid = useMemo(() => {
    if (!classStudents.length) return false;
    return classStudents.every((s) => {
      const sid = s.id ?? s._id;
      const marks = formState?.get?.(sid)?.marksObtained;
      if (marks == null || marks === '') return false;
      const num = Number(marks);
      return !Number.isNaN(num) && num >= 0 && num <= resolvedTotalMarks;
    });
  }, [classStudents, formState, resolvedTotalMarks]);

  const hasDuplicates = useMemo(() => {
    return classStudents.some((s) => {
      const sid = s.id ?? s._id;
      return existingResultIds.includes(`${sid}_${selectedExamId}`);
    });
  }, [classStudents, existingResultIds, selectedExamId]);

  useEffect(() => {
    onReadyToSubmit?.(allValid && !hasDuplicates);
  }, [allValid, hasDuplicates, onReadyToSubmit]);

  const getClassLabel = (c) =>
    [c?.gradeLevel, c?.section, c?.className].filter(Boolean).join(' ') || `Class ${c?.id}`;

  if (!selectedClassId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <BookOpen className="h-10 w-10 mb-3 opacity-50" />
        <p className="text-sm">Select Class → Subject → Exam to load students</p>
      </div>
    );
  }

  if (!selectedSubjectId || !selectedExamId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <BookOpen className="h-10 w-10 mb-3 opacity-50" />
        <p className="text-sm">Select Subject and Exam to enter marks</p>
      </div>
    );
  }

  if (classStudents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <p className="text-sm">No students found in this class</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasDuplicates && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Some students already have results for this exam. Editing existing results is not supported here.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left font-medium text-gray-700">#</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Student</th>
              <th className="px-3 py-2 text-center font-medium text-gray-700">
                Marks <span className="text-gray-400">/ {resolvedTotalMarks}</span>
              </th>
              <th className="px-3 py-2 text-center font-medium text-gray-700">%</th>
              <th className="px-3 py-2 text-center font-medium text-gray-700">Grade</th>
              <th className="px-3 py-2 text-center font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {classStudents.map((student, idx) => {
              const sid = student.id ?? student._id;
              const marks = formState?.get?.(sid)?.marksObtained ?? '';
              const overflow = hasOverflowError(sid);
              const { percentage, grade, status } = computedForStudent(sid);
              return (
                <tr key={sid} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      max={resolvedTotalMarks}
                      value={marks}
                      onChange={(e) => onMarksChange(sid, e.target.value)}
                      className={`w-20 rounded border px-2 py-1.5 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        overflow ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {overflow && (
                      <p className="mt-0.5 text-xs text-red-600">
                        Max {resolvedTotalMarks}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-700">{percentage}</td>
                  <td className="px-3 py-2 text-center">
                    <GradeBadge grade={grade} size="sm" />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={
                        status === 'Passed'
                          ? 'text-emerald-600 font-medium'
                          : status === 'Failed'
                            ? 'text-red-600 font-medium'
                            : 'text-gray-400'
                      }
                    >
                      {status}
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
