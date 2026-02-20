/**
 * src/features/results/pages/ResultSummary.jsx
 * Performance analytics: Pass vs Fail Pie Chart, Grade Distribution Bar Chart (Recharts).
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchResults } from '../resultSlice';
import { fetchClasses } from '../../classes/classSlice';
import { fetchSubjects } from '../../subjects/subjectSlice';
import { fetchExams } from '../../exams/examSlice';
import { selectAllClasses } from '../../classes/classSlice';
import { selectAggregateStats } from '../resultSlice';

const COLORS = {
  Passed: '#10b981',
  Failed: '#ef4444',
  A: '#7c3aed',
  B: '#3b82f6',
  C: '#14b8a6',
  D: '#f59e0b',
  F: '#ef4444',
};

export default function ResultSummary() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { resultList, loading } = useSelector((state) => state.results);
  const classList = useSelector(selectAllClasses);
  const subjectList = useSelector((state) => state.subjects.subjectList ?? []);
  const examList = useSelector((state) => state.exams.examList ?? []);

  useEffect(() => {
    if (!classList.length) dispatch(fetchClasses());
    dispatch(fetchSubjects());
    dispatch(fetchExams());
  }, [dispatch, classList.length]);

  useEffect(() => {
    dispatch(fetchResults());
  }, [dispatch]);

  const passFailData = [
    { name: 'Passed', value: resultList.filter((r) => r.status === 'Passed').length, fill: COLORS.Passed },
    { name: 'Failed', value: resultList.filter((r) => r.status === 'Failed').length, fill: COLORS.Failed },
  ].filter((d) => d.value > 0);

  const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  resultList.forEach((r) => {
    const g = (r.grade ?? '—').toUpperCase();
    if (gradeCounts.hasOwnProperty(g)) gradeCounts[g]++;
  });
  const gradeData = ['A', 'B', 'C', 'D', 'F'].map((g) => ({
    grade: g,
    count: gradeCounts[g] ?? 0,
    fill: COLORS[g] ?? '#6b7280',
  }));

  const { averageScore, passRate } = selectAggregateStats(
    resultList,
    resultList[0]?.totalMarks ?? 100,
    resultList[0]?.passingMarks ?? 40
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard/results')}
          className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Result Summary</h1>
          <p className="text-sm text-gray-500">Pass/Fail and grade distribution analytics</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-gray-500">Total Results</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{resultList.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-gray-500">Average Score</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{averageScore.toFixed(1)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-gray-500">Pass Rate</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{passRate.toFixed(1)}%</p>
        </div>
      </div>

      {loading ? (
        <div className="h-80 rounded-xl bg-gray-100 animate-pulse" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pass vs Fail Pie Chart */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Pass vs Fail</h3>
            {passFailData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {passFailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, 'Count']}
                    contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-400">
                No data to display. Enter results and apply filters.
              </div>
            )}
          </div>

          {/* Grade Distribution Bar Chart */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Grade Distribution</h3>
            {gradeData.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={gradeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="grade" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip
                    formatter={(value) => [value, 'Count']}
                    contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-400">
                No grade data available.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
