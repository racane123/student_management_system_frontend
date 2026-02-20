/**
 * src/features/exams/components/ExamTable.jsx
 * Exam ID, Name, Class/Subject combo, Date, status-colored badge (Scheduled, Ongoing, Completed).
 */

import { useNavigate } from 'react-router-dom';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSelector } from 'react-redux';

function getClassLabel(c) {
  if (!c) return '—';
  return [c.gradeLevel, c.section, c.className].filter(Boolean).join(' ') || `Class ${c.id}`;
}

function getSubjectName(s) {
  return s?.name ?? s?.code ?? '—';
}

function StatusBadge({ status }) {
  const s = (status ?? '').toString();
  const styles = {
    Scheduled: 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20',
    Ongoing: 'bg-amber-100 text-amber-800 ring-1 ring-amber-600/20',
    Completed: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20',
  };
  const cls = styles[s] ?? 'bg-gray-100 text-gray-700 ring-1 ring-gray-400/20';
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>
      {s || '—'}
    </span>
  );
}

export default function ExamTable({ exams, onEdit, onDelete }) {
  const navigate = useNavigate();
  const classList = useSelector((state) => state.classes.classList) ?? [];
  const subjectList = useSelector((state) => state.subjects.subjectList) ?? [];
  const list = Array.isArray(exams) ? exams : [];

  const getClassById = (id) => classList.find((c) => c.id === id);
  const getSubjectById = (id) => subjectList.find((s) => s.id === id);

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
              Class / Subject
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              Date
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
                No exams found.
              </td>
            </tr>
          ) : (
            list.map((exam) => {
              const cls = getClassById(exam.classId ?? exam.class);
              const subj = getSubjectById(exam.subjectId ?? exam.subject);
              const classLabel = getClassLabel(cls) || `Class ${exam.classId ?? exam.class}`;
              const subjectLabel = getSubjectName(subj) || `Subject ${exam.subjectId ?? exam.subject}`;
              return (
                <tr key={exam.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-mono font-medium text-gray-900">
                    {exam.id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-900">{exam.name ?? '—'}</td>
                  <td className="px-3 py-3 text-sm text-gray-600">
                    <span className="font-medium">{classLabel}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span>{subjectLabel}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600">
                    {exam.examDate ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <StatusBadge status={exam.status} />
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
                              onClick={() => navigate(`/dashboard/exams/${exam.id}`)}
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
                              onClick={() => onEdit?.(exam)}
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
                              onClick={() => onDelete?.(exam)}
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
