/**
 * src/features/fees/pages/RevenueSummary.jsx
 * Dashboard with FeeSummaryCard: Total Collected, Pending, Overdue.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchFees, fetchRevenueSummary } from '../feeSlice';
import { selectRevenueSummary, selectDerivedRevenueSummary } from '../feeSlice';
import FeeSummaryCard from '../components/FeeSummaryCard';

export default function RevenueSummary() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const apiSummary = useSelector(selectRevenueSummary);
  const derivedSummary = useSelector(selectDerivedRevenueSummary);

  useEffect(() => {
    dispatch(fetchFees());
    dispatch(fetchRevenueSummary());
  }, [dispatch]);

  const totalCollected = apiSummary.totalCollected > 0 ? apiSummary.totalCollected : derivedSummary.totalCollected;
  const pending = apiSummary.pending > 0 ? apiSummary.pending : derivedSummary.pending;
  const overdue = apiSummary.overdue > 0 ? apiSummary.overdue : derivedSummary.overdue;

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
          <h1 className="text-2xl font-bold text-gray-900">Revenue Summary</h1>
          <p className="text-sm text-gray-500">Financial overview of fee collections</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FeeSummaryCard variant="collected" amount={totalCollected} />
        <FeeSummaryCard variant="pending" amount={pending} />
        <FeeSummaryCard variant="overdue" amount={overdue} />
      </div>
    </div>
  );
}
