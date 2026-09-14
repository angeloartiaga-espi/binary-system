import Modal from './Modal';

// Generic yes/no confirmation — used here for delete, but reusable for
// any destructive action later.
export default function ConfirmDialog({ title = 'Are you sure?', message, confirmLabel = 'Confirm', onConfirm, onCancel, loading }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-md disabled:opacity-50"
        >
          {loading ? 'Removing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}