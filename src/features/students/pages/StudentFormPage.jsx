/**
 * src/features/students/pages/StudentFormPage.jsx
 * Create or Edit student – wraps StudentForm and Redux thunks.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchStudentById, createStudentThunk, updateStudentThunk, clearCurrentStudent } from '../studentSlice';
import StudentForm from '../components/StudentForm';

export default function StudentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentStudent, loading } = useSelector((state) => state.students);
  const isEdit = id && id !== 'new';

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchStudentById(id));
    }
    return () => dispatch(clearCurrentStudent());
  }, [id, isEdit, dispatch]);

  const handleSubmit = async (payload) => {
    const { profileImageFile, ...rest } = payload;
    try {
      if (isEdit) {
        await dispatch(updateStudentThunk({ id, payload: rest })).unwrap();
        navigate(`/dashboard/students/${id}`);
      } else {
        await dispatch(createStudentThunk(rest)).unwrap();
        navigate('/dashboard/students');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  if (isEdit && loading && !currentStudent) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200 animate-pulse" />
        <div className="h-96 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit student' : 'Add student'}
      </h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <StudentForm
          student={isEdit ? currentStudent : undefined}
          onSubmit={handleSubmit}
          onCancel={() => navigate(isEdit ? `/dashboard/students/${id}` : '/dashboard/students')}
          submitLabel={isEdit ? 'Update' : 'Create'}
        />
      </div>
    </div>
  );
}
