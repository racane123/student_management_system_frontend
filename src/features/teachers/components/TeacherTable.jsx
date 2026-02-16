/**
 * src/features/teachers/components/TeacherTable.jsx
 * Table: ID, Name, Subjects (chips), Classes, Status.
 */

import { useNavigate } from 'react-router-dom';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import TeacherStatusBadge from './TeacherStatusBadge';
import { SUBJECT_OPTIONS, CLASS_OPTIONS } from '../constants';

const subjectIdToLabel = (id) => SUBJECT_OPTIONS.find((o) => o.value === id)?.label ?? `Subject ${id}`;
const classIdToLabel = (id) => CLASS_OPTIONS.find((o) => o.value === id)?.label ?? `Class ${id}`;

export default function TeacherTable({ teachers, onEdit, onDelete }) {
  const navigate = useNavigate();
  const list = Array.isArray(teachers) ? teachers : [];

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/5">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/80">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              ID
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Name
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Subjects
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Classes
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Status
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {list.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                No teachers found.
              </td>
            </tr>
          ) : (
            list.map((t) => {
              const subjectIds = Array.isArray(t.subjects) ? t.subjects : [];
              const classIds = Array.isArray(t.classes) ? t.classes : [];
              const name = [t.firstName, t.lastName].filter(Boolean).join(' ') || '—';
              return (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {t.id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-900">{name}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {subjectIds.length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        subjectIds.slice(0, 3).map((id) => (
                          <span
                            key={id}
                            className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20"
                          >
                            {subjectIdToLabel(id)}
                          </span>
                        ))
                      )}
                      {subjectIds.length > 3 && (
                        <span className="text-xs text-gray-500">+{subjectIds.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {classIds.length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        classIds.slice(0, 2).map((id) => (
                          <span
                            key={id}
                            className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-gray-400/30"
                          >
                            {classIdToLabel(id)}
                          </span>
                        ))
                      )}
                      {classIds.length > 2 && (
                        <span className="text-xs text-gray-500">+{classIds.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <TeacherStatusBadge status={t.status} />
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
                              onClick={() => navigate(`/dashboard/teachers/${t.id}`)}
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
                              onClick={() => onEdit?.(t)}
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
                              onClick={() => onDelete?.(t)}
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
