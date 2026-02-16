/**
 * src/features/teachers/components/AssignSubjects.jsx
 * Modular multi-select for assigning subjects (react-select).
 */

import Select from 'react-select';
import { SUBJECT_OPTIONS } from '../constants';

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

/**
 * @param {Object} props
 * @param {number[]} props.value - selected subject IDs
 * @param {function(number[]): void} props.onChange
 * @param {string} [props.placeholder]
 * @param {boolean} [props.disabled]
 */
export default function AssignSubjects({ value = [], onChange, placeholder = 'Select subjects...', disabled }) {
  const selected = Array.isArray(value) ? value : [];
  const options = SUBJECT_OPTIONS.map((o) => ({ value: o.value, label: o.label }));
  const selectedOptions = options.filter((o) => selected.includes(o.value));

  const handleChange = (selectedList) => {
    const ids = (selectedList || []).map((o) => o.value);
    onChange(ids);
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
