/**
 * src/features/subjects/pages/SubjectDetails.jsx
 * Curriculum Card (Name, Code, Description); Teaching Staff Grid; Class Enrollment List with total students.
 */

import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, BookOpen, Users, Layers } from 'lucide-react';
import { fetchSubjectById, clearSelectedSubject, selectEnrolledCountForSubject } from '../subjectSlice';
import { fetchClasses } from '../../classes/classSlice';

function getTeacherName(t) {
  return [t.firstName, t.lastName].filter(Boolean).join(' ') || `Teacher ${t.id}`;
}

function classDisplayName(c) {
  return c.className || (c.gradeLevel && c.section ? `Grade ${c.gradeLevel}-${c.section}` : `Class ${c.id}`);
}

export default function SubjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedSubject, loading, error } = useSelector((state) => state.subjects);
  const teacherList = useSelector((state) => state.teachers.teacherList) ?? [];
  const classList = useSelector((state) => state.classes.classList) ?? [];
  const studentList = useSelector((state) => state.students.studentList) ?? [];

  const enrolledTotal = useSelector((state) =>
    selectEnrolledCountForSubject(selectedSubject, state)
  );

  const assignedTeachers = useMemo(() => {
    const ids = Array.isArray(selectedSubject?.teacherIds) ? selectedSubject.teacherIds : [];
    if (selectedSubject?.teachers?.length) return selectedSubject.teachers;
    return ids.map((tid) => teacherList.find((t) => t.id === tid)).filter(Boolean);
  }, [selectedSubject, teacherList]);

  const assignedClassesWithCount = useMemo(() => {
    const ids = Array.isArray(selectedSubject?.classIds) ? selectedSubject.classIds : [];
    return ids.map((cid) => {
      const cls = selectedSubject?.classes?.find((c) => c.id === cid) ?? classList.find((c) => c.id === cid);
      const studentCount = cls
        ? studentList.filter((s) => (s.classId ?? s.class) === cid).length
        : 0;
      return { classId: cid, class: cls, studentCount };
    }).filter((row) => row.class != null || row.classId != null);
  }, [selectedSubject, classList, studentList]);

  const totalEnrolledFromList = useMemo(
    () => assignedClassesWithCount.reduce((sum, r) => sum + (r.studentCount || 0), 0),
    [assignedClassesWithCount]
  );

  useEffect(() => {
    if (id && id !== 'new') {
      dispatch(fetchSubjectById({ id, populate: true }));
    }
    return () => dispatch(clearSelectedSubject());
  }, [id, dispatch]);

  useEffect(() => {
    if (!classList.length) dispatch(fetchClasses());
  }, [dispatch, classList.length]);

  if (loading && !selectedSubject) {
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

  if (error && !selectedSubject) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
        {error}
        <button
          type="button"
          onClick={() => navigate('/dashboard/subjects')}
          className="mt-2 text-sm font-medium underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  if (!selectedSubject) return null;

  const sub = selectedSubject;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/subjects')}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={() => navigate(`/dashboard/subjects/${sub.id}/edit`)}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          Edit
        </button>
      </div>

      {/* Curriculum Card: Name, Code, Description */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <h1 className="text-2xl font-bold text-gray-900">{sub.name || '—'}</h1>
        <p className="mt-1 font-mono text-sm text-gray-600">{sub.code || '—'}</p>
        {sub.description && (
          <p className="mt-4 text-sm text-gray-700">{sub.description}</p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Teaching Staff Grid: assigned teachers with ID and profile */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5 lg:col-span-1">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Users className="h-5 w-5 text-violet-600" /> Teaching staff
          </h2>
          <ul className="mt-4 space-y-2">
            {assignedTeachers.length === 0 ? (
              <li className="text-sm text-gray-500">No teachers assigned.</li>
            ) : (
              assignedTeachers.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 bg-violet-50/50 px-3 py-2"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
                    {(t.firstName?.[0] || '') + (t.lastName?.[0] || '')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{getTeacherName(t)}</p>
                    <p className="text-xs text-gray-500">ID: {t.id}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Class Enrollment List: classes offering this subject + total students */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Layers className="h-5 w-5 text-blue-600" /> Class enrollment
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Total enrolled (this subject): <strong>{enrolledTotal !== undefined ? enrolledTotal : totalEnrolledFromList}</strong> students
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase text-gray-600">Class</th>
                  <th className="py-2.5 px-3 text-right text-xs font-semibold uppercase text-gray-600">Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {assignedClassesWithCount.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-sm text-gray-500">
                      No classes offering this subject.
                    </td>
                  </tr>
                ) : (
                  assignedClassesWithCount.map(({ classId, class: cls, studentCount }) => (
                    <tr key={classId}>
                      <td className="whitespace-nowrap py-2.5 px-3 text-sm text-gray-900">
                        {cls ? classDisplayName(cls) : `Class ${classId}`}
                      </td>
                      <td className="whitespace-nowrap py-2.5 px-3 text-right text-sm text-gray-600">
                        {studentCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
