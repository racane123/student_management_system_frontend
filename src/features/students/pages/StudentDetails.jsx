/**
 * src/features/students/pages/StudentDetails.jsx
 * Professional profile view: Profile Card, Academic Summary, Financial Summary.
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Mail, Phone, MapPin, User, Calendar, Users, BookOpen, Percent, Wallet } from 'lucide-react';
import { fetchStudentById, clearCurrentStudent } from '../studentSlice';
import StudentStatusBadge from '../components/StudentStatusBadge';

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentStudent, loading, error } = useSelector((state) => state.students);

  useEffect(() => {
    if (id && id !== 'new') {
      dispatch(fetchStudentById(id));
    }
    return () => dispatch(clearCurrentStudent());
  }, [id, dispatch]);

  if (loading && !currentStudent) {
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

  if (error && !currentStudent) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
        {error}
        <button
          type="button"
          onClick={() => navigate('/dashboard/students')}
          className="mt-2 text-sm font-medium underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  if (!currentStudent) {
    return null;
  }

  const s = currentStudent;
  const fullName = [s.firstName, s.lastName].filter(Boolean).join(' ') || '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/students')}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={() => navigate(`/dashboard/students/${s.id}/edit`)}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          Edit
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200 ring-4 ring-white shadow-lg">
              {s.profileImage ? (
                <img src={s.profileImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-500">
                  {(s.firstName?.[0] || '') + (s.lastName?.[0] || '')}
                </span>
              )}
            </div>
            <h1 className="mt-4 text-xl font-bold text-gray-900">{fullName}</h1>
            <StudentStatusBadge status={s.status} className="mt-2" />
          </div>
          <dl className="mt-6 space-y-3 border-t border-gray-100 pt-6">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-xs font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{s.email || '—'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-xs font-medium text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900">{s.phone || '—'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-xs font-medium text-gray-500">Address</dt>
                <dd className="text-sm text-gray-900">{s.address || '—'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-xs font-medium text-gray-500">Date of birth</dt>
                <dd className="text-sm text-gray-900">
                  {s.dob ? new Date(s.dob).toLocaleDateString() : '—'}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-xs font-medium text-gray-500">Gender</dt>
                <dd className="text-sm text-gray-900 capitalize">{s.gender || '—'}</dd>
              </div>
            </div>
          </dl>
        </section>

        <div className="space-y-6 lg:col-span-2">
          {/* Academic Summary */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <BookOpen className="h-5 w-5 text-blue-600" /> Academic Summary
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Class</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {s.classId ? `Class ${s.classId}` : '—'}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <Percent className="h-3.5 w-3.5" /> Attendance
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">— %</p>
                <p className="text-xs text-gray-500">Connect attendance module for data</p>
              </div>
            </div>
          </section>

          {/* Financial Summary */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Wallet className="h-5 w-5 text-blue-600" /> Financial Summary
            </h2>
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Fees status</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">—</p>
              <p className="text-xs text-gray-500">Connect fees module for data</p>
            </div>
          </section>

          {/* Guardian */}
          {(s.guardianName || s.guardianPhone) && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Users className="h-5 w-5 text-blue-600" /> Guardian
              </h2>
              <dl className="mt-4 space-y-2">
                <div>
                  <dt className="text-xs text-gray-500">Name</dt>
                  <dd className="text-sm font-medium text-gray-900">{s.guardianName || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Phone</dt>
                  <dd className="text-sm font-medium text-gray-900">{s.guardianPhone || '—'}</dd>
                </div>
              </dl>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
