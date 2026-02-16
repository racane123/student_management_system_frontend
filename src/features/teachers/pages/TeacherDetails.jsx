/**
 * src/features/teachers/pages/TeacherDetails.jsx
 * Teaching Profile dashboard: Bio/ID/Contact, Assigned Subjects (tags), Assigned Classes table, Teaching Summary (mock stats).
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Mail, Phone, User, BookOpen, Layers, GraduationCap, Briefcase } from 'lucide-react';
import { fetchTeacherById, clearCurrentTeacher } from '../teacherSlice';
import TeacherStatusBadge from '../components/TeacherStatusBadge';
import { SUBJECT_OPTIONS, CLASS_OPTIONS, getClassDisplay } from '../constants';

export default function TeacherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTeacher, loading, error } = useSelector((state) => state.teachers);

  useEffect(() => {
    if (id && id !== 'new') {
      dispatch(fetchTeacherById(id));
    }
    return () => dispatch(clearCurrentTeacher());
  }, [id, dispatch]);

  if (loading && !currentTeacher) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-gray-200 animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-64 rounded-xl bg-gray-100 animate-pulse lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error && !currentTeacher) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
        {error}
        <button
          type="button"
          onClick={() => navigate('/dashboard/teachers')}
          className="mt-2 text-sm font-medium underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  if (!currentTeacher) return null;

  const t = currentTeacher;
  const fullName = [t.firstName, t.lastName].filter(Boolean).join(' ') || '—';
  const subjectIds = Array.isArray(t.subjects) ? t.subjects : [];
  const classIds = Array.isArray(t.classes) ? t.classes : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/teachers')}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={() => navigate(`/dashboard/teachers/${t.id}/edit`)}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          Edit
        </button>
      </div>

      {/* Header: Bio, ID, Contact */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-gray-200 ring-4 ring-white shadow-lg overflow-hidden flex items-center justify-center text-gray-500 text-2xl font-bold">
              {t.profileImage ? (
                <img src={t.profileImage} alt="" className="h-full w-full object-cover" />
              ) : (
                (t.firstName?.[0] || '') + (t.lastName?.[0] || '')
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
              <TeacherStatusBadge status={t.status} />
              <span className="text-sm text-gray-500">ID: {t.id}</span>
            </div>
            {t.qualification && (
              <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <GraduationCap className="h-4 w-4" /> {t.qualification}
              </p>
            )}
            {t.experience != null && (
              <p className="mt-0.5 flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="h-4 w-4" /> {t.experience} years experience
              </p>
            )}
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{t.email || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{t.phone || '—'}</span>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Assigned Subjects Card: Grid of tags */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5 lg:col-span-1">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <BookOpen className="h-5 w-5 text-blue-600" /> Assigned subjects
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {subjectIds.length === 0 ? (
              <p className="text-sm text-gray-500">No subjects assigned.</p>
            ) : (
              subjectIds.map((sid) => {
                const label = SUBJECT_OPTIONS.find((o) => o.value === sid)?.label ?? `Subject ${sid}`;
                return (
                  <span
                    key={sid}
                    className="inline-flex rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-blue-600/20"
                  >
                    {label}
                  </span>
                );
              })
            )}
          </div>
        </section>

        {/* Assigned Classes Table: Class, Section, Grade */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Layers className="h-5 w-5 text-blue-600" /> Assigned classes
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase text-gray-600">Class</th>
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase text-gray-600">Section</th>
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase text-gray-600">Grade level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {classIds.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm text-gray-500">
                      No classes assigned.
                    </td>
                  </tr>
                ) : (
                  classIds.map((cid) => {
                    const d = getClassDisplay(cid);
                    return (
                      <tr key={cid}>
                        <td className="whitespace-nowrap py-2.5 px-3 text-sm text-gray-900">{d.class}</td>
                        <td className="whitespace-nowrap py-2.5 px-3 text-sm text-gray-600">{d.section}</td>
                        <td className="whitespace-nowrap py-2.5 px-3 text-sm text-gray-600">{d.grade}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Teaching Summary: Mock stats */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <h2 className="text-lg font-semibold text-gray-900">Teaching summary</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Classes handled</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{classIds.length}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Total students (mock)</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{classIds.length * 25}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
