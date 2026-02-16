/**
 * Fees page – admin-only (wrapped by ProtectedRoute with allowedRoles: ['admin']).
 * Place in: src/pages/Fees.jsx
 */
export default function Fees() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Fees</h1>
      <p className="mt-2 text-gray-600">Admin-only section. Add fee CRUD here.</p>
    </div>
  );
}
