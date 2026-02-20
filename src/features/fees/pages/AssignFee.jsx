/**
 * src/features/fees/pages/AssignFee.jsx
 * Assign fee (individual or whole class) with AssignFeeForm.
 */

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AssignFeeForm from '../components/AssignFeeForm';
import { assignFeeThunk } from '../feeSlice';
import { fetchClasses } from '../../classes/classSlice';
import { fetchStudents, setLimit as setStudentLimit } from '../../students/studentSlice';
import { useEffect } from 'react';

export default function AssignFee() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(setStudentLimit(500));
    dispatch(fetchStudents());
  }, [dispatch]);

  const handleSubmit = async (payload) => {
    try {
      await dispatch(assignFeeThunk(payload)).unwrap();
      navigate('/dashboard/fees');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard/fees')}
          className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assign Fee</h1>
          <p className="text-sm text-gray-500">Assign to individual student or whole class</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <AssignFeeForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard/fees')}
        />
      </div>
    </div>
  );
}
