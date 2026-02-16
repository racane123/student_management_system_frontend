/**
 * src/features/classes/components/AssignTeacherSelect.jsx
 * Single-select dropdown mapping teacherList (from Teachers state) to options.
 */

import { useSelector } from 'react-redux';

export default function AssignTeacherSelect({ value, onChange, placeholder = 'Select adviser...', disabled }) {
  const teacherList = useSelector((state) => state.teachers.teacherList) ?? [];
  const options = teacherList.map((t) => ({
    value: t.id,
    label: [t.firstName, t.lastName].filter(Boolean).join(' ') || `Teacher ${t.id}`,
  }));

  const selected = options.find((o) => o.value === value);

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      disabled={disabled}
      className="block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
