/**
 * src/features/classes/pages/ClassFormPage.jsx
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchClassById, createClassThunk, updateClassThunk, clearSelectedClass, fetchClassFormDependencies } from '../classSlice';
import ClassForm from '../components/ClassForm';

export default function ClassFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedClass, loading } = useSelector((state) => state.classes);
  const isEdit = id && id !== 'new';

  useEffect(() => {
    dispatch(fetchClassFormDependencies());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchClassById({ id, populate: false }));
    }
    return () => dispatch(clearSelectedClass());
  }, [id, isEdit, dispatch]);

  const handleSubmit = async (payload) => {
    try {
      if (isEdit) {
        await dispatch(updateClassThunk({ id, payload })).unwrap();
        navigate(`/dashboard/classes/${id}`);
      } else {
        await dispatch(createClassThunk(payload)).unwrap();
        navigate('/dashboard/classes');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  if (isEdit && loading && !selectedClass) {
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
        {isEdit ? 'Edit class' : 'Add class'}
      </h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <ClassForm
          classEntity={isEdit ? selectedClass : undefined}
          onSubmit={handleSubmit}
          onCancel={() => navigate(isEdit ? `/dashboard/classes/${id}` : '/dashboard/classes')}
          submitLabel={isEdit ? 'Update' : 'Create'}
        />
      </div>
    </div>
  );
}
