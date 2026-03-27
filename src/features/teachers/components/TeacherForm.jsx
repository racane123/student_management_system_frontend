import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AssignSubjects from './AssignSubjects';
import AssignClasses from './AssignClasses';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().required('Email is required').email('Invalid email'),
  status: yup.string().required(),
});

function Avatar({ src, name }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : null;

  return (
    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center mx-auto">
      {src ? (
        <img src={src} alt="Profile" className="w-full h-full object-cover" />
      ) : initials ? (
        <span className="text-2xl font-bold text-indigo-500 select-none">{initials}</span>
      ) : (
        <svg className="w-9 h-9 text-indigo-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      )}
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
          {label}
          {required && <span className="text-indigo-400 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition';

function Section({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-4 pb-3 border-b border-gray-100 flex items-baseline gap-3">
        <h2 className="text-sm font-bold text-gray-800 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        ${active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function TeacherForm({ teacher, onSubmit, onCancel }) {
  const [imagePreviewUrl, setImagePreviewUrl] = useState(teacher?.profileImage || null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: teacher || { status: 'active' },
    resolver: yupResolver(schema),
  });

  const firstName = watch('firstName') || '';
  const lastName = watch('lastName') || '';
  const status = watch('status') || 'active';
  const email = watch('email') || '';
  const phone = watch('phone') || '';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setImagePreviewUrl(URL.createObjectURL(file));
  };

  return (
    /* Root: occupies the full viewport — no scrollbar on the outer shell */
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">

      {/* ── TOP BAR ── fixed height, full width */}
      <header className="shrink-0 bg-white border-b border-gray-100 z-10">
        <div className="w-full px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 -ml-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-800">
              {teacher ? 'Edit Teacher' : 'New Teacher'}
            </span>
            <StatusBadge active={status === 'active'} />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-1.5 text-sm font-medium text-gray-500 rounded-lg hover:bg-gray-100 transition"
            >
              Discard
            </button>
            <button
              type="submit"
              form="teacher-form"
              className="px-5 py-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Save changes
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY ── fills all remaining height, two panes side by side */}
      <form
        id="teacher-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_300px] w-full"
      >
        {/* LEFT — scrolls independently */}
        <div className="overflow-y-auto px-8 py-6 space-y-4 border-r border-gray-100">

          <Section title="Personal information" subtitle="· Basic identity details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" required error={errors.firstName?.message}>
                <input {...register('firstName')} placeholder="e.g. Maria" className={inputClass} />
              </Field>
              <Field label="Last name" required error={errors.lastName?.message}>
                <input {...register('lastName')} placeholder="e.g. Santos" className={inputClass} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email address" required error={errors.email?.message}>
                <input {...register('email')} type="email" placeholder="teacher@school.edu" className={inputClass} />
              </Field>
              <Field label="Phone number">
                <input {...register('phone')} type="tel" placeholder="+63 9XX XXX XXXX" className={inputClass} />
              </Field>
            </div>
          </Section>

          <Section title="Professional details" subtitle="· Employment and qualification info">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <Field label="Qualification">
                  <input {...register('qualification')} placeholder="e.g. BS Education" className={inputClass} />
                </Field>
              </div>
              <Field label="Years of experience">
                <input type="number" {...register('experience')} placeholder="0" min={0} className={inputClass} />
              </Field>
              <Field label="Hire date">
                <input type="date" {...register('hireDate')} className={inputClass} />
              </Field>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Field label="Status">
                <select {...register('status')} className={inputClass}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Assignments" subtitle="· Subjects and classes handled by this teacher">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Subjects">
                <Controller
                  name="subjects"
                  control={control}
                  render={({ field }) => <AssignSubjects {...field} />}
                />
              </Field>
              <Field label="Classes">
                <Controller
                  name="classes"
                  control={control}
                  render={({ field }) => <AssignClasses {...field} />}
                />
              </Field>
            </div>
          </Section>

        </div>

        {/* RIGHT — scrolls independently */}
        <div className="overflow-y-auto px-5 py-6 space-y-4 bg-gray-50">

          {/* Profile photo */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Profile photo</p>
            <div className="flex flex-col items-center text-center gap-3">
              <Avatar src={imagePreviewUrl} name={`${firstName} ${lastName}`.trim()} />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {(firstName || lastName) ? `${firstName} ${lastName}`.trim() : 'No name yet'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Teacher</p>
              </div>
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload photo
                </span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
              </label>
              <p className="text-[11px] text-gray-400">JPG, PNG or WEBP · max 2MB</p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Summary</p>
            <dl className="space-y-3 text-sm">
              {[
                { label: 'Status', value: status === 'active' ? 'Active' : 'Inactive' },
                { label: 'Email', value: email || '—' },
                { label: 'Phone', value: phone || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-gray-400 shrink-0">{label}</dt>
                  <dd className="text-gray-700 font-medium truncate text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

        </div>
      </form>
    </div>
  );
}