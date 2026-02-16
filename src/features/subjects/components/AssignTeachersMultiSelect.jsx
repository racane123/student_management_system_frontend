/**
 * src/features/subjects/components/AssignTeachersMultiSelect.jsx
 * Multi-select for teachers, options from teachers slice.
 */

import { useSelector } from 'react-redux';
import Select from 'react-select';

const teacherListToOptions = (list) =>
  (list ?? []).map((t) => ({
    value: t.id,
    label: [t.firstName, t.lastName].filter(Boolean).join(' ') || `Teacher ${t.id}`,
  }));

const customStyles = {
  control: (base) => ({
    ...base,
    minHeight: 42,
    borderRadius: '0.5rem',
    borderColor: '#d1d5db',
    '&:hover': { borderColor: '#9ca3af' },
  }),
  menu: (base) => ({ ...base, borderRadius: '0.5rem', zIndex: 50 }),
};

export default function AssignTeachersMultiSelect({ value = [], onChange, placeholder = 'Select teachers...', disabled }) {
  const teacherList = useSelector((state) => state.teachers.teacherList) ?? [];
  const options = teacherListToOptions(teacherList);
  const selectedIds = Array.isArray(value) ? value : [];
  const selectedOptions = options.filter((o) => selectedIds.includes(o.value));

  const handleChange = (selectedList) => {
    onChange((selectedList || []).map((o) => o.value));
  };

  return (
    <Select
      isMulti
      options={options}
      value={selectedOptions}
      onChange={handleChange}
      placeholder={placeholder}
      isDisabled={disabled}
      styles={customStyles}
      classNamePrefix="react-select"
      classNames={{
        control: () => '!border-gray-300 !shadow-sm focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500',
      }}
    />
  );
}
