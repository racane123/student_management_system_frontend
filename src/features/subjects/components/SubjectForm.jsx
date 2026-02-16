/**
 * src/features/subjects/components/SubjectForm.jsx
 * Auto-generate Code from name (e.g. Mathematics -> SUB-MATH-01); AssignTeachersMultiSelect; AssignClassesMultiSelect.
 */

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect, useMemo } from 'react';
import { BookOpen, FileText } from 'lucide-react';
import { generateSubjectCode } from '../utils/generateSubjectCode';
import AssignTeachersMultiSelect from './AssignTeachersMultiSelect';
import AssignClassesMultiSelect from './AssignClassesMultiSelect';

const schema = yup.object({
  name: yup.string().trim().required('Name is required'),
  code: yup.string().trim().required('Code is required'),
  description: yup.string().trim().nullable(),
  teacherIds: yup.array().of(yup.number().required()).default([]),
  classIds: yup.array().of(yup.number().required()).default([]),
  status: yup.string().required('Status is required').oneOf(['active', 'inactive']),
});

const defaultValues = {
  name: '',
  code: '',
  description: '',
  teacherIds: [],
  classIds: [],
  status: 'active',
};

export default function SubjectForm({ subject, onSubmit, onCancel, submitLabel = 'Save' }) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: subject
      ? {
          ...defaultValues,
          name: subject.name ?? '',
          code: subject.code ?? '',
          description: subject.description ?? '',
          teacherIds: Array.isArray(subject.teacherIds) ? subject.teacherIds : [],
          classIds: Array.isArray(subject.classIds) ? subject.classIds : [],
          status: subject.status ?? 'active',
        }
      : defaultValues,
    resolver: yupResolver(schema),
  });

  const name = watch('name');

  // Auto-generate code when name changes (suggest SUB-XXX-01)
  useEffect(() => {
    const trimmed = (name ?? '').toString().trim();
    if (!trimmed) return;
    const suggested = generateSubjectCode(trimmed, 1);
    if (suggested) {
      setValue('code', suggested, { shouldValidate: true });
    }
  }, [name, setValue]);

  const onFormSubmit = (data) => {
    const payload = { ...data };
    payload.teacherIds = Array.isArray(payload.teacherIds) ? payload.teacherIds : [];
    payload.classIds = Array.isArray(payload.classIds) ? payload.classIds : [];
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <div className="relative">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            {...register('name')}
            className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. Mathematics"
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Code (auto-suggested) *</label>
        <input
          {...register('code')}
          className="block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="e.g. SUB-MATH-01"
        />
        {errors.code && (
          <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <textarea
            {...register('description')}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Brief description of the subject"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned teachers</label>
        <Controller
          name="teacherIds"
          control={control}
          render={({ field }) => (
            <AssignTeachersMultiSelect
              value={field.value}
              onChange={field.onChange}
              placeholder="Select teachers..."
            />
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned classes</label>
        <Controller
          name="classIds"
          control={control}
          render={({ field }) => (
            <AssignClassesMultiSelect
              value={field.value}
              onChange={field.onChange}
              placeholder="Select classes..."
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
