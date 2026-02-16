/**
 * src/features/teachers/constants.js
 * Options for subjects and classes (IDs + labels for react-select and filters).
 */

export const SUBJECT_OPTIONS = [
  { value: 1, label: 'Mathematics' },
  { value: 2, label: 'Science' },
  { value: 3, label: 'English' },
  { value: 4, label: 'Filipino' },
  { value: 5, label: 'Social Studies' },
  { value: 6, label: 'Physical Education' },
  { value: 7, label: 'Arts' },
  { value: 8, label: 'Music' },
  { value: 9, label: 'Computer' },
  { value: 10, label: 'Religion' },
];

export const CLASS_OPTIONS = [
  { value: 1, label: 'Class 1 - Section A' },
  { value: 2, label: 'Class 1 - Section B' },
  { value: 3, label: 'Class 2 - Section A' },
  { value: 4, label: 'Class 2 - Section B' },
  { value: 5, label: 'Class 3 - Section A' },
  { value: 6, label: 'Class 3 - Section B' },
  { value: 7, label: 'Class 4 - Section A' },
  { value: 8, label: 'Class 4 - Section B' },
  { value: 9, label: 'Class 5 - Section A' },
  { value: 10, label: 'Class 5 - Section B' },
];

/** For TeacherDetails: class ID → section/grade display (mock). */
export const getClassDisplay = (classId) => {
  const c = CLASS_OPTIONS.find((o) => o.value === classId);
  if (c) {
    const [name, section] = c.label.split(' - ');
    const grade = name.replace('Class ', '');
    return { class: name, section: section || '—', grade };
  }
  return { class: `Class ${classId}`, section: '—', grade: '—' };
};

export const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
