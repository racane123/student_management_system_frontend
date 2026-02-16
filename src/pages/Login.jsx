/**
 * Placeholder login – for demo only. Replace with real auth + api call.
 * Place in: src/pages/Login.jsx
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [role, setRole] = useState('admin');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const from = state?.from?.pathname || '/dashboard';

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ id: 1, name: 'Demo User', role }, 'demo-jwt-token');
    navigate(from, { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-md"
      >
        <h1 className="mb-4 text-xl font-semibold text-gray-800">Login (demo)</h1>
        <label className="mb-2 block text-sm text-gray-600">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-gray-700"
        >
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
        </select>
        <button
          type="submit"
          className="w-full rounded bg-primary py-2 font-medium text-white hover:bg-primary-dark"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
