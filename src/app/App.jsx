import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/guards/ProtectedRoute';
import DashboardLayout from '../layout/DashboardLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import FeesList from '../features/fees/pages/FeesList';
import AssignFee from '../features/fees/pages/AssignFee';
import RevenueSummary from '../features/fees/pages/RevenueSummary';
import FeeDetails from '../features/fees/pages/FeeDetails';
import StudentList from '../features/students/pages/StudentList';
import StudentDetails from '../features/students/pages/StudentDetails';
import StudentFormPage from '../features/students/pages/StudentFormPage';
import TeacherList from '../features/teachers/pages/TeacherList';
import TeacherDetails from '../features/teachers/pages/TeacherDetails';
import TeacherFormPage from '../features/teachers/pages/TeacherFormPage';
import ClassList from '../features/classes/pages/ClassList';
import ClassDetails from '../features/classes/pages/ClassDetails';
import ClassFormPage from '../features/classes/pages/ClassFormPage';
import SubjectList from '../features/subjects/pages/SubjectList';
import SubjectDetails from '../features/subjects/pages/SubjectDetails';
import SubjectFormPage from '../features/subjects/pages/SubjectFormPage';
import AttendanceList from '../features/attendance/pages/AttendanceList';
import MarkAttendance from '../features/attendance/pages/MarkAttendance';
import AttendanceDetails from '../features/attendance/pages/AttendanceDetails';
import ExamList from '../features/exams/pages/ExamList';
import ExamDetails from '../features/exams/pages/ExamDetails';
import ExamFormPage from '../features/exams/pages/ExamFormPage';
import ResultsList from '../features/results/pages/ResultsList';
import EnterResults from '../features/results/pages/EnterResults';
import ResultSummary from '../features/results/pages/ResultSummary';
import ResultDetails from '../features/results/pages/ResultDetails';
import ReportCenter from '../features/reports/pages/ReportCenter';
import FinancialReport from '../features/reports/pages/FinancialReport';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<StudentList />} />
        <Route path="students/new" element={<StudentFormPage />} />
        <Route path="students/:id" element={<StudentDetails />} />
        <Route path="students/:id/edit" element={<StudentFormPage />} />
        <Route path="teachers" element={<TeacherList />} />
        <Route path="teachers/new" element={<TeacherFormPage />} />
        <Route path="teachers/:id" element={<TeacherDetails />} />
        <Route path="teachers/:id/edit" element={<TeacherFormPage />} />
        <Route path="classes" element={<ClassList />} />
        <Route path="classes/new" element={<ClassFormPage />} />
        <Route path="classes/:id" element={<ClassDetails />} />
        <Route path="classes/:id/edit" element={<ClassFormPage />} />
        <Route path="subjects" element={<SubjectList />} />
        <Route path="subjects/new" element={<SubjectFormPage />} />
        <Route path="subjects/:id" element={<SubjectDetails />} />
        <Route path="subjects/:id/edit" element={<SubjectFormPage />} />
        <Route path="attendance" element={<AttendanceList />} />
        <Route path="attendance/mark" element={<MarkAttendance />} />
        <Route path="attendance/:id" element={<AttendanceDetails />} />
        <Route path="exams" element={<ExamList />} />
        <Route path="exams/new" element={<ExamFormPage />} />
        <Route path="exams/:id" element={<ExamDetails />} />
        <Route path="exams/:id/edit" element={<ExamFormPage />} />
        <Route path="results" element={<ResultsList />} />
        <Route path="results/enter" element={<EnterResults />} />
        <Route path="results/summary" element={<ResultSummary />} />
        <Route path="results/:id" element={<ResultDetails />} />
        <Route
          path="fees"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <FeesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="fees/assign"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AssignFee />
            </ProtectedRoute>
          }
        />
        <Route
          path="fees/summary"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RevenueSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="fees/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <FeeDetails />
            </ProtectedRoute>
          }
        />
        <Route path="reports" element={<ReportCenter />} />
        <Route path="reports/financial" element={<FinancialReport />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
