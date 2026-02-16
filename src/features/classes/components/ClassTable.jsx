/**
 * src/features/classes/components/ClassTable.jsx
 * Displays Class ID, Grade/Section, Adviser Name, Student Count.
 */

import { useNavigate } from 'react-router-dom';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSelector } from 'react-redux';

function getAdviserName(teacherId, teacherList) {
  if (teacherId == null) return '—';
  const t = (teacherList ?? []).find((x) => x.id === teacherId);
  return t ? [t.firstName, t.lastName].filter(Boolean).join(' ') || `Teacher ${t.id}` : '—';
}

export default function ClassTable({ classes, studentCountByClassId, onEdit, onDelete }) {
  const navigate = useNavigate();
  const teacherList = useSelector((state) => state.teachers.teacherList) ?? [];
  const list = Array.isArray(classes) ? classes : [];

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/5">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/80">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              ID
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Grade / Section
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Adviser
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Students
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {list.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                No classes found.
              </td>
            </tr>
          ) : (
            list.map((c) => {
              const displayName = c.className || (c.gradeLevel && c.section ? `Grade ${c.gradeLevel}-${c.section}` : `Class ${c.id}`);
              const count = studentCountByClassId?.[c.id] ?? c.studentCount ?? 0;
              return (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {c.id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-900">{displayName}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600">
                    {getAdviserName(c.teacherId, teacherList)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600">{count}</td>
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
                              onClick={() => navigate(`/dashboard/classes/${c.id}`)}
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
                              onClick={() => onEdit?.(c)}
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
                              onClick={() => onDelete?.(c)}
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
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
