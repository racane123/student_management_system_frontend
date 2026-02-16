/**
 * src/features/teachers/components/TeacherForm.jsx
 * High-fidelity form: react-hook-form, multi-select (Subjects, Classes), Qualification, Experience, Hire Date, profile image preview.
 */

import { useRef, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Mail, Phone, GraduationCap, Briefcase, Calendar } from 'lucide-react';
import AssignSubjects from './AssignSubjects';
import AssignClasses from './AssignClasses';

const schema = yup.object({
  firstName: yup.string().required('First name is required').trim(),
  lastName: yup.string().required('Last name is required').trim(),
  email: yup.string().required('Email is required').email('Invalid email'),
  phone: yup.string().trim().nullable(),
  qualification: yup.string().trim().nullable(),
  experience: yup
    .number()
    .nullable()
    .transform((v) => (v === '' || v === undefined ? null : v))
    .min(0, 'Must be 0 or more')
    .max(50, 'Must be 50 or less')
    .integer('Must be a whole number'),
  hireDate: yup.string().nullable().transform((v) => (v === '' ? null : v)),
  status: yup.string().required('Status is required').oneOf(['active', 'inactive']),
  subjects: yup.array().of(yup.number().required()).default([]),
  classes: yup.array().of(yup.number().required()).default([]),
});

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  qualification: '',
  experience: null,
  hireDate: null,
  status: 'active',
  subjects: [],
  classes: [],
};

export default function TeacherForm({ teacher, onSubmit, onCancel, submitLabel = 'Save' }) {
  const fileInputRef = useRef(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(teacher?.profileImage || null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: teacher
      ? {
          ...defaultValues,
          firstName: teacher.firstName ?? '',
          lastName: teacher.lastName ?? '',
          email: teacher.email ?? '',
          phone: teacher.phone ?? '',
          qualification: teacher.qualification ?? '',
          experience: teacher.experience ?? null,
          hireDate: teacher.hireDate?.slice(0, 10) ?? null,
          status: teacher.status ?? 'active',
          subjects: Array.isArray(teacher.subjects) ? teacher.subjects : [],
          classes: Array.isArray(teacher.classes) ? teacher.classes : [],
        }
      : defaultValues,
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('profileImageFile', file, { shouldValidate: true });
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const onFormSubmit = (data) => {
    const payload = { ...data };
    if (data.profileImageFile) payload.profileImageFile = data.profileImageFile;
    payload.subjects = Array.isArray(data.subjects) ? data.subjects : [];
    payload.classes = Array.isArray(data.classes) ? data.classes : [];
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Profile image */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-shrink-0">
          <div className="h-24 w-24 rounded-xl bg-gray-100 ring-2 ring-gray-200 overflow-hidden flex items-center justify-center text-gray-400">
            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <User className="h-12 w-12" />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile photo</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              {...register('firstName')}
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Maria"
            />
          </div>
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              {...register('lastName')}
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Santos"
            />
          </div>
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            {...register('email')}
            className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="maria.santos@school.edu"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            {...register('phone')}
            className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="09171234567"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            {...register('qualification')}
            className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. B.Ed, M.A. in Education"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              min={0}
              max={50}
              {...register('experience', { valueAsNumber: true })}
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="5"
            />
          </div>
          {errors.experience && (
            <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hire date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              {...register('hireDate')}
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
        <select
          {...register('status')}
          className="block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Relational: Subjects */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned subjects</label>
        <Controller
          name="subjects"
          control={control}
          render={({ field }) => (
            <AssignSubjects
              value={field.value}
              onChange={field.onChange}
              placeholder="Select subjects..."
            />
          )}
        />
      </div>

      {/* Relational: Classes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned classes</label>
        <Controller
          name="classes"
          control={control}
          render={({ field }) => (
            <AssignClasses
              value={field.value}
              onChange={field.onChange}
              placeholder="Select classes..."
            />
          )}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
