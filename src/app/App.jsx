import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/guards/ProtectedRoute';
import DashboardLayout from '../layout/DashboardLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Fees from '../pages/Fees';
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
        <Route
          path="fees"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Fees />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
