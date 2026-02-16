/**
 * src/features/subjects/components/AssignClassesMultiSelect.jsx
 * Multi-select for classes, options from classes slice.
 */

import { useSelector } from 'react-redux';
import Select from 'react-select';

function classDisplayName(c) {
  return c.className || (c.gradeLevel && c.section ? `Grade ${c.gradeLevel}-${c.section}` : `Class ${c.id}`);
}

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

export default function AssignClassesMultiSelect({ value = [], onChange, placeholder = 'Select classes...', disabled }) {
  const classList = useSelector((state) => state.classes.classList) ?? [];
  const options = classList.map((c) => ({
    value: c.id,
    label: classDisplayName(c),
  }));
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
