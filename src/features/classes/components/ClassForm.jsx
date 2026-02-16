/**
 * src/features/classes/components/ClassForm.jsx
 * Smart form: auto-generated className from gradeLevel + section; AssignTeacherSelect; AssignSubjectsMultiSelect.
 */

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect } from 'react';
import { BookOpen, MapPin, Calendar } from 'lucide-react';
import AssignTeacherSelect from './AssignTeacherSelect';
import AssignSubjectsMultiSelect from './AssignSubjectsMultiSelect';

// --- Auto-generation: className from gradeLevel and section (e.g. "Grade 10-A") ---
export function getGeneratedClassName(gradeLevel, section) {
  const g = (gradeLevel ?? '').toString().trim();
  const s = (section ?? '').toString().trim();
  if (!g && !s) return '';
  if (!g) return s || '';
  if (!s) return `Grade ${g}`;
  return `Grade ${g}-${s}`;
}

const schema = yup.object({
  gradeLevel: yup.string().trim().required('Grade level is required'),
  section: yup.string().trim().required('Section is required'),
  className: yup.string().trim(),
  room: yup.string().trim().nullable(),
  schedule: yup.string().trim().nullable(),
  teacherId: yup.number().nullable().transform((v) => (v === '' || v === undefined ? null : v)),
  subjectIds: yup.array().of(yup.number().required()).default([]),
  status: yup.string().required('Status is required').oneOf(['active', 'inactive']),
});

const defaultValues = {
  gradeLevel: '',
  section: '',
  className: '',
  room: '',
  schedule: '',
  teacherId: null,
  subjectIds: [],
  status: 'active',
};

export default function ClassForm({ classEntity, onSubmit, onCancel, submitLabel = 'Save' }) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: classEntity
      ? {
          ...defaultValues,
          gradeLevel: classEntity.gradeLevel ?? '',
          section: classEntity.section ?? '',
          className: classEntity.className ?? getGeneratedClassName(classEntity.gradeLevel, classEntity.section),
          room: classEntity.room ?? '',
          schedule: classEntity.schedule ?? '',
          teacherId: classEntity.teacherId ?? null,
          subjectIds: Array.isArray(classEntity.subjectIds) ? classEntity.subjectIds : [],
          status: classEntity.status ?? 'active',
        }
      : defaultValues,
    resolver: yupResolver(schema),
  });

  const gradeLevel = watch('gradeLevel');
  const section = watch('section');

  // Real-time auto-update of className when gradeLevel or section changes
  useEffect(() => {
    const generated = getGeneratedClassName(gradeLevel, section);
    setValue('className', generated, { shouldValidate: true });
  }, [gradeLevel, section, setValue]);

  const onFormSubmit = (data) => {
    const payload = { ...data };
    payload.className = getGeneratedClassName(payload.gradeLevel, payload.section) || payload.className;
    payload.subjectIds = Array.isArray(payload.subjectIds) ? payload.subjectIds : [];
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grade level *</label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              {...register('gradeLevel')}
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. 10"
            />
          </div>
          {errors.gradeLevel && (
            <p className="mt-1 text-sm text-red-600">{errors.gradeLevel.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
          <input
            {...register('section')}
            className="block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. A"
          />
          {errors.section && (
            <p className="mt-1 text-sm text-red-600">{errors.section.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Class name (auto)</label>
        <input
          {...register('className')}
          readOnly
          className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 px-3 text-gray-700 shadow-sm"
          placeholder="Filled from Grade + Section"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              {...register('room')}
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Room 101"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              {...register('schedule')}
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Mon-Wed 8AM"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Adviser (teacher)</label>
        <Controller
          name="teacherId"
          control={control}
          render={({ field }) => (
            <AssignTeacherSelect
              value={field.value}
              onChange={field.onChange}
              placeholder="Select adviser..."
            />
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subjects</label>
        <Controller
          name="subjectIds"
          control={control}
          render={({ field }) => (
            <AssignSubjectsMultiSelect
              value={field.value}
              onChange={field.onChange}
              placeholder="Select subjects..."
            />
          )}
        />
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
