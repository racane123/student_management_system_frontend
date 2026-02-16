/**
 * src/features/teachers/components/DeleteTeacherModal.jsx
 * Confirmation dialog (Headless UI).
 */

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Trash2 } from 'lucide-react';

export default function DeleteTeacherModal({ open, onClose, teacher, onConfirm, isDeleting }) {
  const name = teacher
    ? [teacher.firstName, teacher.lastName].filter(Boolean).join(' ') || 'This teacher'
    : 'This teacher';

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true" />
      <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Delete teacher
              </DialogTitle>
              <p className="mt-1 text-sm text-gray-600">
                Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
