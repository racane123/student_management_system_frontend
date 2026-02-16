# Foundation Logic – Implementation Notes

## Week 1: Auth & Axios

| File | Location | Purpose |
|------|----------|---------|
| `api.js` | `src/services/api.js` | Axios instance, JWT request interceptor, 401 response handler. Set `VITE_API_URL` in `.env` for API base URL. |
| `AuthContext.jsx` | `src/context/AuthContext.jsx` | `AuthProvider`, `useAuth()`, login/logout; registers 401 handler with api. |
| `ProtectedRoute.jsx` | `src/components/guards/ProtectedRoute.jsx` | Wraps routes; redirects unauthenticated to `fallbackPath`; use `allowedRoles={['admin']}` for role guard (e.g. Fees). |

**Usage:** Wrap app in `AuthProvider` in `main.jsx`. Wrap dashboard (and admin-only routes) with `ProtectedRoute`. Call `setUnauthorizedHandler(logout)` from `AuthProvider` so 401 logs user out.

---

## Week 2: CRUD Engine

| File | Location | Purpose |
|------|----------|---------|
| `DataTable.jsx` | `src/components/common/DataTable.jsx` | Generic table: `columns` (key, label, optional `render`), `data`, optional `actions(row)`, `emptyMessage`. |
| `useStudent.js` | `src/hooks/useStudent.js` | Sample hook: `fetchStudents`, `createStudent`, `deleteStudent`; uses `api` from services. Adjust endpoint to match backend (e.g. `/api/students`). |

**Usage:** Use `DataTable` on any list page. Clone `useStudent` to create `useTeacher`, `useClass`, etc.

---

## Week 3–4: Dashboard & Charts

| File | Location | Purpose |
|------|----------|---------|
| `statsOverview.js` | `src/utils/statsOverview.js` | `mapStatsOverview(raw)` → array of `{ label, value, subLabel?, trend? }` for stat cards. Extend `raw` shape as needed. |
| `RevenueChart.jsx` | `src/components/charts/RevenueChart.jsx` | Recharts area chart; props: `data` (`{ month, revenue }[]`), `title`, `height`. |

**Usage:** Fetch dashboard stats from API, pass to `mapStatsOverview()`, render cards. Pass revenue array to `RevenueChart`.

---

## Dependencies Added

- `axios`, `recharts`, `lucide-react`, `react-hook-form`
- `tailwindcss`, `postcss`, `autoprefixer` (Tailwind for new components)

Run: `npm install`

---

## Route & Role Example

- **Students:** any authenticated user.
- **Fees:** `ProtectedRoute` with `allowedRoles={['admin']}` so only admins see it.
- **Login:** at `/login`; after login, redirect to `state.from` or `/dashboard`.
