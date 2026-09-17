interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  error?: string | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open, title, message,
  confirmLabel = "Potwierdź", cancelLabel = "Anuluj",
  danger = false, error = null, loading = false,
  onConfirm, onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-96 p-6"
        onClick={(e) => e.stopPropagation()}
      >
<h2 className="text-lg font-semibold mb-2">{title}</h2>

        {error
          ? <p className="text-gray-600 text-sm mb-4">{error}</p>
          : <p className="text-gray-600 text-sm mb-4">{message}</p>}

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50 cursor-pointer"
            onClick={onCancel}
            disabled={loading}
          >
            {error ? "Zamknij" : cancelLabel}
          </button>

          {!error && (
            <button
              className={`px-4 py-2 text-sm text-white rounded disabled:opacity-50 cursor-pointer ${
                danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "…" : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}