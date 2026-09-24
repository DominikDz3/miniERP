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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex gap-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
            danger || error ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
          }`}>
            <span className="text-lg">{danger || error ? "⚠" : "?"}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-800">{title}</h2>
            <p className="text-gray-500 text-sm mt-1">{error ?? message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer disabled:opacity-50"
            onClick={onCancel}
            disabled={loading}
          >
            {error ? "Zamknij" : cancelLabel}
          </button>

          {!error && (
            <button
              className={`px-4 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-50 cursor-pointer ${
                danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Przetwarzanie…" : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}