/**
 * src/features/subjects/components/DeleteSubjectModal.jsx
 * Confirmation with warning about linked Exams/Results.
 */

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteSubjectModal({ open, onClose, subject, onConfirm, isDeleting }) {
  const name = subject?.name ?? subject?.code ?? 'This subject';

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true" />
      <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Delete subject
              </DialogTitle>
              <p className="mt-1 text-sm text-gray-600">
                Are you sure you want to delete <strong>{name}</strong>?
              </p>
              <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
                This subject may be linked to <strong>Exams</strong> and <strong>Results</strong>. Deleting it can affect those records. Do you want to continue?
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" /> {isDeleting ? 'Deleting…' : 'Delete anyway'}
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
