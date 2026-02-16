import {
  LayoutDashboard,
  GraduationCap,
  Users,
  School,
  BookMarked,
  ClipboardList,
  BookOpen,
  BarChart3,
  Wallet,
  FileText,
  UserCog,
} from 'lucide-react';

export const sidebarItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Students', path: '/dashboard/students', icon: GraduationCap },
  { label: 'Teachers', path: '/dashboard/teachers', icon: Users },
  { label: 'Classes', path: '/dashboard/classes', icon: School },
  { label: 'Subjects', path: '/dashboard/subjects', icon: BookMarked },
  { label: 'Attendance', path: '/dashboard/attendance', icon: ClipboardList },
  { label: 'Exams', path: '/dashboard/exams', icon: BookOpen },
  { label: 'Results', path: '/dashboard/results', icon: BarChart3 },
  { label: 'Fees', path: '/dashboard/fees', icon: Wallet },
  { label: 'Reports', path: '/dashboard/reports', icon: FileText },
  { label: 'Users', path: '/dashboard/users', icon: UserCog },
];
