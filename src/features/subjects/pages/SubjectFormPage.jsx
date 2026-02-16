/**
 * src/features/subjects/pages/SubjectFormPage.jsx
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchSubjectById, createSubjectThunk, updateSubjectThunk, clearSelectedSubject } from '../subjectSlice';
import { fetchTeachers } from '../../teachers/teacherSlice';
import { fetchClasses } from '../../classes/classSlice';
import SubjectForm from '../components/SubjectForm';

export default function SubjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedSubject, loading } = useSelector((state) => state.subjects);
  const isEdit = id && id !== 'new';

  useEffect(() => {
    dispatch(fetchTeachers());
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchSubjectById({ id, populate: false }));
    }
    return () => dispatch(clearSelectedSubject());
  }, [id, isEdit, dispatch]);

  const handleSubmit = async (payload) => {
    try {
      if (isEdit) {
        await dispatch(updateSubjectThunk({ id, payload })).unwrap();
        navigate(`/dashboard/subjects/${id}`);
      } else {
        await dispatch(createSubjectThunk(payload)).unwrap();
        navigate('/dashboard/subjects');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  if (isEdit && loading && !selectedSubject) {
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
        {isEdit ? 'Edit subject' : 'Add subject'}
      </h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <SubjectForm
          subject={isEdit ? selectedSubject : undefined}
          onSubmit={handleSubmit}
          onCancel={() => navigate(isEdit ? `/dashboard/subjects/${id}` : '/dashboard/subjects')}
          submitLabel={isEdit ? 'Update' : 'Create'}
        />
      </div>
    </div>
  );
}
