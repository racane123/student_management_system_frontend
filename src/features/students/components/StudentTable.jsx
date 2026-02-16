/**
 * src/features/students/components/StudentTable.jsx
 * Professional Tailwind table: avatars, status badges, sorting (Name, Date), actions menu.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Eye, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import StudentStatusBadge from './StudentStatusBadge';

const SORT_KEYS = {
  name: (a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
  date: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
};

export default function StudentTable({
  students,
  onEdit,
  onDelete,
  sortKey = 'name',
  sortDir = 'asc',
  onSortChange,
}) {
  const navigate = useNavigate();
  const [localSort, setLocalSort] = useState({ key: sortKey, dir: sortDir });

  const key = onSortChange ? sortKey : localSort.key;
  const dir = onSortChange ? sortDir : localSort.dir;

  const handleSort = (newKey) => {
    const nextDir =
      newKey === key ? (dir === 'asc' ? 'desc' : 'asc') : 'asc';
    if (onSortChange) {
      onSortChange(newKey, nextDir);
    } else {
      setLocalSort({ key: newKey, dir: nextDir });
    }
  };

  const sorted = [...(students || [])].sort((a, b) => {
    const fn = SORT_KEYS[key] || SORT_KEYS.name;
    const result = fn(a, b);
    return dir === 'asc' ? result : -result;
  });

  const SortIcon = ({ column }) =>
    key === column ? (dir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : null;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/5">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/80">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Student
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              <button
                type="button"
                onClick={() => handleSort('name')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                Name
                <SortIcon column="name" />
              </button>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Email
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Class
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Status
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              <button
                type="button"
                onClick={() => handleSort('date')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                Joined
                <SortIcon column="date" />
              </button>
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                No students found.
              </td>
            </tr>
          ) : (
            sorted.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="whitespace-nowrap py-3 pl-4 pr-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 ring-2 ring-white shadow">
                      {student.profileImage ? (
                        <img
                          src={student.profileImage}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600">
                          {(student.firstName?.[0] || '') + (student.lastName?.[0] || '')}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-gray-900">
                  {student.firstName} {student.lastName}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600">
                  {student.email || '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600">
                  {student.classId ? `Class ${student.classId}` : '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <StudentStatusBadge status={student.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                  {student.createdAt
                    ? new Date(student.createdAt).toLocaleDateString()
                    : '—'}
                </td>
                <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-right">
                  <Menu as="div" className="relative inline-block text-left">
                    <MenuButton className="flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <MoreVertical className="h-5 w-5" />
                    </MenuButton>
                    <MenuItems
                      transition
                      className="absolute right-0 z-10 mt-1 w-44 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-gray-900/5 focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                    >
                      <MenuItem>
                        {({ focus }) => (
                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/students/${student.id}`)}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${focus ? 'bg-gray-50' : ''} text-gray-700`}
                          >
                            <Eye className="h-4 w-4" /> View
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ focus }) => (
                          <button
                            type="button"
                            onClick={() => onEdit?.(student)}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${focus ? 'bg-gray-50' : ''} text-gray-700`}
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ focus }) => (
                          <button
                            type="button"
                            onClick={() => onDelete?.(student)}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${focus ? 'bg-red-50' : ''} text-red-700`}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        )}
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
