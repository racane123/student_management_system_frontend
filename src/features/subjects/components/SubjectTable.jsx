/**
 * src/features/subjects/components/SubjectTable.jsx
 * Code, Name, chips for Teachers (distinct color), count of assigned Classes.
 */

import { useNavigate } from 'react-router-dom';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSelector } from 'react-redux';

function getTeacherName(teacherId, teacherList) {
  if (teacherId == null) return '—';
  const t = (teacherList ?? []).find((x) => x.id === teacherId);
  return t ? [t.firstName, t.lastName].filter(Boolean).join(' ') : `Teacher ${teacherId}`;
}

export default function SubjectTable({ subjects, classCountBySubjectId, onEdit, onDelete }) {
  const navigate = useNavigate();
  const teacherList = useSelector((state) => state.teachers.teacherList) ?? [];
  const list = Array.isArray(subjects) ? subjects : [];

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/5">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/80">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Code
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Name
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Teachers
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Classes
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
                No subjects found.
              </td>
            </tr>
          ) : (
            list.map((sub) => {
              const teacherIds = Array.isArray(sub.teacherIds) ? sub.teacherIds : [];
              const classCount = classCountBySubjectId?.[sub.id] ?? (Array.isArray(sub.classIds) ? sub.classIds.length : 0);
              return (
                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-mono font-medium text-gray-900">
                    {sub.code || '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-900">{sub.name || '—'}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {teacherIds.length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        teacherIds.slice(0, 3).map((tid) => (
                          <span
                            key={tid}
                            className="inline-flex rounded-md bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 ring-1 ring-violet-600/20"
                          >
                            {getTeacherName(tid, teacherList)}
                          </span>
                        ))
                      )}
                      {teacherIds.length > 3 && (
                        <span className="text-xs text-gray-500">+{teacherIds.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600">{classCount}</td>
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
                              onClick={() => navigate(`/dashboard/subjects/${sub.id}`)}
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
                              onClick={() => onEdit?.(sub)}
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
                              onClick={() => onDelete?.(sub)}
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
