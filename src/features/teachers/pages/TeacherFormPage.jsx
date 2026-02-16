/**
 * src/features/teachers/pages/TeacherFormPage.jsx
 * Create or Edit teacher – wraps TeacherForm and Redux thunks.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchTeacherById, createTeacherThunk, updateTeacherThunk, clearCurrentTeacher } from '../teacherSlice';
import TeacherForm from '../components/TeacherForm';

export default function TeacherFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTeacher, loading } = useSelector((state) => state.teachers);
  const isEdit = id && id !== 'new';

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchTeacherById(id));
    }
    return () => dispatch(clearCurrentTeacher());
  }, [id, isEdit, dispatch]);

  const handleSubmit = async (payload) => {
    const { profileImageFile, ...rest } = payload;
    rest.subjects = Array.isArray(rest.subjects) ? rest.subjects : [];
    rest.classes = Array.isArray(rest.classes) ? rest.classes : [];
    try {
      if (isEdit) {
        await dispatch(updateTeacherThunk({ id, payload: rest })).unwrap();
        navigate(`/dashboard/teachers/${id}`);
      } else {
        await dispatch(createTeacherThunk(rest)).unwrap();
        navigate('/dashboard/teachers');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  if (isEdit && loading && !currentTeacher) {
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
        {isEdit ? 'Edit teacher' : 'Add teacher'}
      </h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <TeacherForm
          teacher={isEdit ? currentTeacher : undefined}
          onSubmit={handleSubmit}
          onCancel={() => navigate(isEdit ? `/dashboard/teachers/${id}` : '/dashboard/teachers')}
          submitLabel={isEdit ? 'Update' : 'Create'}
        />
      </div>
    </div>
  );
}
