import { GraduationCap, Users, School, Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mapStatsOverview } from '../utils/statsOverview';
import RevenueChart from '../components/charts/RevenueChart';

const sampleRaw = {
  totalStudents: 420,
  totalTeachers: 32,
  totalClasses: 18,
  totalRevenue: 1250000,
  pendingFees: 85000,
  monthlyRevenue: 180000,
};

const sampleRevenueData = [
  { month: 'Jan', revenue: 140000 },
  { month: 'Feb', revenue: 155000 },
  { month: 'Mar', revenue: 168000 },
  { month: 'Apr', revenue: 172000 },
  { month: 'May', revenue: 180000 },
  { month: 'Jun', revenue: 175000 },
];

const statIcons = {
  'Total Students': GraduationCap,
  'Teachers': Users,
  'Classes': School,
  'Revenue (MTD)': TrendingUp,
  'Total Revenue': Wallet,
  'Pending Fees': AlertCircle,
};

export default function Dashboard() {
  const { user } = useAuth();
  const stats = mapStatsOverview(sampleRaw);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__welcome">
            Welcome back, {user?.name ?? 'User'}.
          </p>
        </div>
      </header>

      <section className="dashboard__stats">
        {stats.map((s) => {
          const Icon = statIcons[s.label];
          return (
            <div key={s.label} className="stat-card">
              <div className="stat-card__icon-wrap">
                {Icon && <Icon size={22} strokeWidth={2} className="stat-card__icon" />}
              </div>
              <div className="stat-card__body">
                <p className="stat-card__label">{s.label}</p>
                <p className="stat-card__value">{s.value}</p>
                {s.subLabel && <p className="stat-card__sublabel">{s.subLabel}</p>}
              </div>
            </div>
          );
        })}
      </section>

      <section className="dashboard__chart">
        <RevenueChart data={sampleRevenueData} title="Revenue Overview (PHP)" height="340px" />
      </section>
    </div>
  );
}
