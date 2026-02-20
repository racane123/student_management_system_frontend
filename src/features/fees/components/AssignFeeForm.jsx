/**
 * src/features/fees/components/AssignFeeForm.jsx
 * Toggle: Individual Student vs Whole Class. Fields: Fee Type, Amount, Due Date.
 */

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Users, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectAllClasses } from '../../classes/classSlice';
import { selectAllStudents } from '../../students/studentSlice';
import { FEE_TYPES } from '../constants';

const schema = yup.object({
  mode: yup.string().oneOf(['individual', 'bulk']).required(),
  studentId: yup.number().nullable().when('mode', {
    is: 'individual',
    then: (s) => s.required('Student is required'),
  }),
  classId: yup.number().nullable().when('mode', {
    is: 'bulk',
    then: (s) => s.required('Class is required'),
  }),
  feeType: yup.string().oneOf(['Tuition', 'Lab', 'Misc']).required('Fee type is required'),
  amount: yup.number().min(0.01, 'Amount must be greater than 0').required('Amount is required'),
  dueDate: yup.string().trim().required('Due date is required'),
});

export default function AssignFeeForm({ onSubmit, onCancel }) {
  const classList = useSelector(selectAllClasses);
  const allStudents = useSelector(selectAllStudents);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      mode: 'individual',
      studentId: null,
      classId: null,
      feeType: 'Tuition',
      amount: '',
      dueDate: '',
    },
    resolver: yupResolver(schema),
  });

  const mode = watch('mode');

  const getClassLabel = (c) =>
    [c?.gradeLevel, c?.section, c?.className].filter(Boolean).join(' ') || `Class ${c?.id}`;

  const onFormSubmit = (data) => {
    const payload = {
      mode: data.mode,
      feeType: data.feeType,
      amount: Number(data.amount),
      dueDate: data.dueDate,
      ...(data.mode === 'individual' && { studentId: Number(data.studentId) }),
      ...(data.mode === 'bulk' && { classId: Number(data.classId) }),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Mode toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Mode</label>
        <div className="flex rounded-lg border border-gray-300 p-1 bg-gray-50">
          <label
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 transition ${
              mode === 'individual' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <input
              type="radio"
              value="individual"
              {...register('mode')}
              className="sr-only"
            />
            <User className="h-4 w-4" />
            <span
              className={`text-sm font-medium ${
                mode === 'individual' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              Individual Student
            </span>
          </label>
          <label
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 transition ${
              mode === 'bulk' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <input type="radio" value="bulk" {...register('mode')} className="sr-only" />
            <Users className="h-4 w-4" />
            <span
              className={`text-sm font-medium ${
                mode === 'bulk' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              Whole Class
            </span>
          </label>
        </div>
      </div>

      {/* Student / Class select */}
      {mode === 'individual' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
          <select
            {...register('studentId', { valueAsNumber: true })}
            className="block w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">— Select student —</option>
            {allStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName} (ID: {s.id})
              </option>
            ))}
          </select>
          {errors.studentId && (
            <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
          <select
            {...register('classId', { valueAsNumber: true })}
            className="block w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">— Select class —</option>
            {classList.map((c) => (
              <option key={c.id} value={c.id}>
                {getClassLabel(c)}
              </option>
            ))}
          </select>
          {errors.classId && (
            <p className="mt-1 text-sm text-red-600">{errors.classId.message}</p>
          )}
        </div>
      )}

      {/* Fee type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type *</label>
        <select
          {...register('feeType')}
          className="block w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {FEE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {errors.feeType && (
          <p className="mt-1 text-sm text-red-600">{errors.feeType.message}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₱) *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register('amount', { valueAsNumber: true })}
          className="block w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="0.00"
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      {/* Due date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
        <input
          type="date"
          {...register('dueDate')}
          className="block w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {errors.dueDate && (
          <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-60"
        >
          {isSubmitting ? 'Assigning…' : 'Assign Fee'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
