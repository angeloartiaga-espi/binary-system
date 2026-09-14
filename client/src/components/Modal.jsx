// Generic overlay + centered panel. Any CRUD form or confirmation dialog
// can drop its content in as children.
export default function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // don't close when clicking inside the panel
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-serif text-xl text-brand-dark">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}