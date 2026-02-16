/**
 * src/features/classes/pages/ClassDetails.jsx
 * Hub view: Profile Card (Room, Schedule, Adviser), Student List sub-table, Subject-Teacher Grid.
 */

import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, MapPin, Calendar, User, Users, BookOpen } from 'lucide-react';
import { fetchClassById, clearSelectedClass } from '../classSlice';
import { SUBJECT_OPTIONS } from '../constants';

function getAdviserName(teacherId, teacherList) {
  if (teacherId == null) return '—';
  const t = (teacherList ?? []).find((x) => x.id === teacherId);
  return t ? [t.firstName, t.lastName].filter(Boolean).join(' ') : '—';
}

function getSubjectLabel(id) {
  return SUBJECT_OPTIONS.find((o) => o.value === id)?.label ?? `Subject ${id}`;
}

export default function ClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedClass, loading, error } = useSelector((state) => state.classes);
  const teacherList = useSelector((state) => state.teachers.teacherList) ?? [];
  const studentList = useSelector((state) => state.students.studentList) ?? [];

  useEffect(() => {
    if (id && id !== 'new') {
      dispatch(fetchClassById({ id, populate: true }));
    }
    return () => dispatch(clearSelectedClass());
  }, [id, dispatch]);

  const classStudents = useMemo(() => {
    const c = selectedClass;
    if (!c) return [];
    if (Array.isArray(c.students) && c.students.length > 0) return c.students;
    const cid = c.id;
    return studentList.filter((s) => (s.classId ?? s.class) === cid);
  }, [selectedClass, studentList]);

  const subjectTeacherRows = useMemo(() => {
    const c = selectedClass;
    if (!c) return [];
    const st = Array.isArray(c.subjectTeachers) ? c.subjectTeachers : [];
    const subjectIds = Array.isArray(c.subjectIds) ? c.subjectIds : [];
    const bySubject = {};
    st.forEach(({ subjectId, teacherId }) => {
      bySubject[subjectId] = teacherId;
    });
    return subjectIds.length > 0
      ? subjectIds.map((sid) => ({ subjectId: sid, teacherId: bySubject[sid] ?? null }))
      : st.length > 0
        ? st
        : subjectIds.map((sid) => ({ subjectId: sid, teacherId: c.teacherId ?? null }));
  }, [selectedClass]);

  if (loading && !selectedClass) {
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

  if (error && !selectedClass) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
        {error}
        <button
          type="button"
          onClick={() => navigate('/dashboard/classes')}
          className="mt-2 text-sm font-medium underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  if (!selectedClass) return null;

  const c = selectedClass;
  const displayName = c.className || (c.gradeLevel && c.section ? `Grade ${c.gradeLevel}-${c.section}` : `Class ${c.id}`);
  const adviserName = c.adviser
    ? [c.adviser.firstName, c.adviser.lastName].filter(Boolean).join(' ') || '—'
    : getAdviserName(c.teacherId, teacherList);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/classes')}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={() => navigate(`/dashboard/classes/${c.id}/edit`)}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          Edit
        </button>
      </div>

      {/* Profile Card: Room, Schedule, Adviser */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
        <p className="mt-1 text-sm text-gray-500">ID: {c.id}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Room</dt>
              <dd className="text-sm font-semibold text-gray-900">{c.room || '—'}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Schedule</dt>
              <dd className="text-sm font-semibold text-gray-900">{c.schedule || '—'}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Adviser</dt>
              <dd className="text-sm font-semibold text-gray-900">{adviserName}</dd>
            </div>
          </div>
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Student List: sub-table of students with this classId */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Users className="h-5 w-5 text-blue-600" /> Students ({classStudents.length})
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase text-gray-600">ID</th>
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase text-gray-600">Name</th>
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase text-gray-600">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-gray-500">
                      No students assigned to this class.
                    </td>
                  </tr>
                ) : (
                  classStudents.map((s) => (
                    <tr key={s.id}>
                      <td className="whitespace-nowrap py-2.5 px-3 text-sm text-gray-900">{s.id}</td>
                      <td className="whitespace-nowrap py-2.5 px-3 text-sm text-gray-900">
                        {[s.firstName, s.lastName].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td className="whitespace-nowrap py-2.5 px-3 text-sm text-gray-600">{s.email || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Subject-Teacher Grid */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <BookOpen className="h-5 w-5 text-blue-600" /> Subject – Teacher
          </h2>
          <div className="mt-4 space-y-2">
            {subjectTeacherRows.length === 0 ? (
              <p className="text-sm text-gray-500">No subjects assigned.</p>
            ) : (
              subjectTeacherRows.map(({ subjectId, teacherId }) => (
                <div
                  key={subjectId}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2"
                >
                  <span className="text-sm font-medium text-gray-900">{getSubjectLabel(subjectId)}</span>
                  <span className="text-sm text-gray-600">
                    {getAdviserName(teacherId, teacherList)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
