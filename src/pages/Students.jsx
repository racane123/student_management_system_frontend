/**
 * Students page – uses DataTable + useStudent hook.
 * Place in: src/pages/Students.jsx
 */
import { useEffect } from 'react';
import DataTable from '../components/common/DataTable';
import { useStudent } from '../hooks/useStudent';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'grade', label: 'Grade' },
];

export default function Students() {
  const { students, loading, error, fetchStudents, deleteStudent } = useStudent();

  useEffect(() => {
    fetchStudents().catch(() => {});
  }, [fetchStudents]);

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Students</h1>
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      <DataTable
        columns={columns}
        data={students}
        emptyMessage="No students. Backend may not be running."
        actions={(row) => (
          <button
            type="button"
            onClick={() => deleteStudent(row.id)}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
        )}
      />
    </div>
  );
}
