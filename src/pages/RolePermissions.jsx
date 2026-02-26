import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function RolePermissions() {
  const [data, setData] = useState({ roles: [], allPermissions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/auth/role-permissions')
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Failed to load role permissions');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const permissionIdsByRole = data.roles.reduce((acc, role) => {
    acc[role.id] = new Set((role.permissions || []).map((p) => p.id));
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Role permissions</h1>
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Role permissions</h1>
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Role permissions</h1>
        <p className="mt-1 text-sm text-gray-600">
          View which permissions are assigned to each role. Changes require backend role_permissions updates.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-900">Role</th>
              {data.allPermissions.map((p) => (
                <th key={p.id} className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.roles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{role.name}</td>
                {data.allPermissions.map((p) => {
                  const has = permissionIdsByRole[role.id]?.has(p.id);
                  return (
                    <td key={p.id} className="px-4 py-3 text-gray-600">
                      {has ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
