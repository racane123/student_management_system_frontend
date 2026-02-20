/**
 * src/features/results/pages/EnterResults.jsx
 * Enter Results workflow: Select Class -> Subject -> Exam -> Enter marks -> Submit bulk.
 */

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, School, BookOpen, Send, CheckCircle2, Loader2 } from 'lucide-react';
import EnterResultsForm from '../components/EnterResultsForm';
import { enterResultsThunk, resetSubmitState } from '../resultSlice';
import { selectAllClasses, fetchClasses } from '../../classes/classSlice';
import { fetchSubjects } from '../../subjects/subjectSlice';
import { setFilters as setExamFilters, setPage as setExamPage, fetchExams } from '../../exams/examSlice';
import { selectAllStudents } from '../../students/studentSlice';

export default function EnterResults() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const classList = useSelector(selectAllClasses);
  const allStudents = useSelector(selectAllStudents);
  const { isSubmitting, submitSuccess, error } = useSelector((state) => state.results);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [formState, setFormState] = useState(new Map());
  const [readyToSubmit, setReadyToSubmit] = useState(false);

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchSubjects());
  }, [dispatch]);

  const classStudents = allStudents.filter(
    (s) => String(s.classId ?? s.class) === String(selectedClassId)
  );

  const subjectList = useSelector((state) => state.subjects.subjectList ?? []);
  const examList = useSelector((state) => state.exams.examList ?? []);
  const filteredSubjects = subjectList.filter(
    (s) => Array.isArray(s.classIds) && s.classIds.includes(Number(selectedClassId))
  );
  const filteredExams = examList.filter(
    (e) =>
      (e.classId ?? e.class) === Number(selectedClassId) &&
      (e.subjectId ?? e.subject) === Number(selectedSubjectId)
  );

  useEffect(() => {
    setFormState((prev) => {
      const next = new Map();
      classStudents.forEach((s) => {
        const sid = s.id ?? s._id;
        next.set(sid, { marksObtained: prev.get(sid)?.marksObtained ?? '' });
      });
      return next;
    });
  }, [classStudents]);

  useEffect(() => {
    setFormState(new Map());
  }, [selectedExamId]);

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    setSelectedSubjectId('');
    setSelectedExamId('');
  };
  const handleSubjectChange = (e) => {
    setSelectedSubjectId(e.target.value);
    setSelectedExamId('');
  };
  const handleExamChange = (e) => setSelectedExamId(e.target.value);

  const handleMarksChange = useCallback((studentId, value) => {
    setFormState((prev) => {
      const next = new Map(prev);
      next.set(studentId, { ...next.get(studentId), marksObtained: value });
      return next;
    });
  }, []);

  const handleSubmit = () => {
    const records = Array.from(formState.entries())
      .filter(([, v]) => v.marksObtained !== '' && v.marksObtained != null)
      .map(([studentId, v]) => ({
        studentId: Number(studentId),
        marksObtained: Number(v.marksObtained),
      }));
    if (records.length === 0) return;
    dispatch(enterResultsThunk({ examId: Number(selectedExamId), records }));
  };

  useEffect(() => {
    if (submitSuccess) {
      dispatch(resetSubmitState());
      navigate('/dashboard/results');
    }
  }, [submitSuccess, dispatch, navigate]);

  const getClassLabel = (c) =>
    [c?.gradeLevel, c?.section, c?.className].filter(Boolean).join(' ') || `Class ${c?.id}`;

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enter Results</h1>
          <p className="text-sm text-gray-500">Bulk grade entry for an exam</p>
        </div>
      </div>

      {/* Workflow: Class -> Subject -> Exam */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <School className="h-5 w-5 text-blue-600" />
          Select Exam
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClassId}
              onChange={handleClassChange}
              className="block w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">— Select class —</option>
              {classList.map((c) => (
                <option key={c.id} value={c.id}>
                  {getClassLabel(c)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={handleSubjectChange}
              disabled={!selectedClassId}
              className="block w-full rounded-lg border border-gray-300 py-2 px-3 disabled:bg-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{selectedClassId ? '— Select subject —' : 'Select class first'}</option>
              {filteredSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name ?? s.code ?? `Subject ${s.id}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
            <select
              value={selectedExamId}
              onChange={handleExamChange}
              disabled={!selectedSubjectId}
              className="block w-full rounded-lg border border-gray-300 py-2 px-3 disabled:bg-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{selectedSubjectId ? '— Select exam —' : 'Select subject first'}</option>
              {filteredExams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name ?? `Exam ${e.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grade entry table */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Enter Marks
        </h2>

        {submitSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-emerald-600">
            <CheckCircle2 className="h-12 w-12 mb-3" />
            <p className="text-lg font-semibold">Results saved successfully</p>
            <p className="text-sm text-gray-500 mt-1">Redirecting…</p>
          </div>
        ) : (
          <>
            <EnterResultsForm
              selectedClassId={selectedClassId}
              selectedSubjectId={selectedSubjectId}
              selectedExamId={selectedExamId}
              formState={formState}
              onMarksChange={handleMarksChange}
              onReadyToSubmit={setReadyToSubmit}
            />

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            )}

            {selectedClassId && selectedSubjectId && selectedExamId && (
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!readyToSubmit || isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Results
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
