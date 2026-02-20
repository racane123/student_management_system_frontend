/**
 * src/features/exams/components/ExamForm.jsx
 * Dependent dropdowns: Class -> Subject (filter subjects where subject.classIds includes selectedClassId).
 * react-hook-form + Yup for schedule (Date, Start/End Time) and grading (Total/Passing Marks).
 */

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, Calendar, Clock } from 'lucide-react';
import { selectAllClasses } from '../../classes/classSlice';
import { selectIsDuplicateExam } from '../examSlice';
import { suggestExamStatus } from '../utils/examStatus';

const schema = yup.object({
  name: yup.string().trim().required('Exam name is required'),
  classId: yup.number().required('Class is required').nullable(),
  subjectId: yup.number().required('Subject is required').nullable(),
  examDate: yup.string().trim().required('Date is required'),
  startTime: yup.string().trim().required('Start time is required'),
  endTime: yup.string().trim().required('End time is required'),
  totalMarks: yup.number().min(1, 'Must be at least 1').required('Total marks is required'),
  passingMarks: yup
    .number()
    .min(0, 'Must be 0 or more')
    .required('Passing marks is required')
    .test('lte-total', 'Passing marks cannot exceed total marks', function (value) {
      const { totalMarks } = this.parent;
      if (totalMarks == null) return true;
      return value <= totalMarks;
    }),
  status: yup.string().required().oneOf(['Scheduled', 'Ongoing', 'Completed']),
});

const defaultValues = {
  name: '',
  classId: null,
  subjectId: null,
  examDate: '',
  startTime: '09:00',
  endTime: '11:00',
  totalMarks: 100,
  passingMarks: 40,
  status: 'Scheduled',
};

export default function ExamForm({ exam, onSubmit, onCancel, submitLabel = 'Save' }) {
  const classList = useSelector(selectAllClasses);
  const subjectList = useSelector((state) => state.subjects.subjectList ?? []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: exam
      ? {
          ...defaultValues,
          name: exam.name ?? '',
          classId: exam.classId ?? exam.class ?? null,
          subjectId: exam.subjectId ?? exam.subject ?? null,
          examDate: exam.examDate ?? '',
          startTime: exam.startTime ?? '09:00',
          endTime: exam.endTime ?? '11:00',
          totalMarks: exam.totalMarks ?? 100,
          passingMarks: exam.passingMarks ?? 40,
          status: exam.status ?? 'Scheduled',
        }
      : defaultValues,
    resolver: yupResolver(schema),
  });

  const selectedClassId = watch('classId');

  /** Filter subjects: only those assigned to the selected class (subject.classIds includes classId) */
  const filteredSubjects = useMemo(() => {
    const cid = selectedClassId != null ? Number(selectedClassId) : null;
    if (!cid) return [];
    return subjectList.filter(
      (s) => Array.isArray(s.classIds) && s.classIds.includes(cid)
    );
  }, [subjectList, selectedClassId]);

  const isDuplicate = useSelector(
    selectIsDuplicateExam(
      watch('classId'),
      watch('subjectId'),
      watch('name'),
      exam?.id
    )
  );

  const onFormSubmit = (data) => {
    if (isDuplicate) return;
    const payload = {
      name: data.name.trim(),
      classId: Number(data.classId),
      subjectId: Number(data.subjectId),
      examDate: data.examDate,
      startTime: data.startTime,
      endTime: data.endTime,
      totalMarks: Number(data.totalMarks),
      passingMarks: Number(data.passingMarks),
      status: data.status,
    };
    onSubmit(payload);
  };

  const getClassLabel = (c) => {
    if (!c) return '';
    return [c.gradeLevel, c.section, c.className].filter(Boolean).join(' ') || `Class ${c.id}`;
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Exam name *</label>
        <div className="relative">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            {...register('name')}
            className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. Mid-term Mathematics"
          />
        </div>
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
          <Controller
            name="classId"
            control={control}
            render={({ field }) => (
              <select
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  field.onChange(val);
                  setValue('subjectId', null);
                }}
                className="block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select class</option>
                {classList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getClassLabel(c)}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.classId && <p className="mt-1 text-sm text-red-600">{errors.classId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
          <Controller
            name="subjectId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                disabled={!selectedClassId}
                className="block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">{selectedClassId ? 'Select subject' : 'Select class first'}</option>
                {filteredSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name ?? s.code ?? `Subject ${s.id}`}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.subjectId && <p className="mt-1 text-sm text-red-600">{errors.subjectId.message}</p>}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-800">Schedule</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Controller
                name="examDate"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    {...field}
                    onChange={(e) => {
                      const val = e.target.value ?? '';
                      field.onChange(val);
                      if (val) setValue('status', suggestExamStatus(val));
                    }}
                    className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                )}
              />
            </div>
            {errors.examDate && <p className="mt-1 text-sm text-red-600">{errors.examDate.message}</p>}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start time *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  {...register('startTime')}
                  className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">End time *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  {...register('endTime')}
                  className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-800">Grading</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total marks *</label>
            <input
              type="number"
              min={1}
              {...register('totalMarks', { valueAsNumber: true })}
              className="block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.totalMarks && <p className="mt-1 text-sm text-red-600">{errors.totalMarks.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passing marks *</label>
            <input
              type="number"
              min={0}
              {...register('passingMarks', { valueAsNumber: true })}
              className="block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.passingMarks && <p className="mt-1 text-sm text-red-600">{errors.passingMarks.message}</p>}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
        <select
          {...register('status')}
          className="block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="Scheduled">Scheduled</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {isDuplicate && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          An exam with the same Class, Subject, and Name already exists. Please change one of these fields.
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || isDuplicate}
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
