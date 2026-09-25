import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useWarehouse, useDeactivateWarehouse } from "@/features/warehouses/hooks/useWarehouses";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { ApiError } from "@/shared/services/apiClient";
import { WarehouseProducts } from "../components/WarehouseProducts";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-5";
const sectionTitleCls = "text-sm font-medium text-gray-500 mb-3";

export function WarehousesDetailsView() {
  const { id } = useParams();
  const warehouseId = Number(id);
  const navigate = useNavigate();
  const { hasAuthority } = useAuth();

  const { data: warehouse, isLoading, isError } = useWarehouse(warehouseId);
  const deactivate = useDeactivateWarehouse();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const onConfirmDeactivate = () => {
    if (!warehouse) return;
    setDeactivateError(null);
    deactivate.mutate(warehouse.id, {
      onSuccess: () => setConfirmOpen(false),
      onError: (err) => setDeactivateError(err instanceof ApiError ? err.detail : "Nie udało się dezaktywować magazynu"),
    });
  };

  if (isLoading) return <p className="text-gray-500">Ładowanie…</p>;
  if (isError || !warehouse) return <p className="text-red-600">Nie znaleziono magazynu.</p>;

  return (
    <div className="max-w-5xl">
      <button
        onClick={() => navigate("/warehouses")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
      >
        ← Wróć do listy
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold">{warehouse.name}</h1>
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
            warehouse.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${warehouse.active ? "bg-green-500" : "bg-gray-400"}`} />
          {warehouse.active ? "Aktywny" : "Nieaktywny"}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {hasAuthority("WAREHOUSE_OPERATE") && warehouse.active && (
            <>
              <button
                onClick={() => navigate(`/warehouses/${warehouse.id}/receive`)}
                className="px-3.5 py-2 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 cursor-pointer shadow-sm"
              >
                Przyjmij towar
              </button>
              <button
                onClick={() => navigate(`/warehouses/${warehouse.id}/issue`)}
                className="px-3.5 py-2 text-sm bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 cursor-pointer shadow-sm"
              >
                Wydaj towar
              </button>
              <button
                onClick={() => navigate(`/warehouses/${warehouse.id}/transfer`)}
                className="px-3.5 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer shadow-sm"
              >
                Przenieś towar
              </button>
            </>
          )}

          {hasAuthority("WAREHOUSE_MANAGE") && warehouse.active && (
            <button
              onClick={() => { setDeactivateError(null); setConfirmOpen(true); }}
              className="px-3.5 py-2 text-sm rounded-lg cursor-pointer text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
            >
              Dezaktywuj
            </button>
          )}
        </div>
      </div>

      <div className="mb-8">
        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Dane lokalizacji</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm">
            <dt className="text-gray-500">Telefon</dt>
            <dd className="text-gray-800">{warehouse.phone || "—"}</dd>

            <dt className="text-gray-500">Adres</dt>
            <dd className="text-gray-800">{warehouse.street || "—"}</dd>

            <dt className="text-gray-500">Kod i miasto</dt>
            <dd className="text-gray-800">{warehouse.postalCode} {warehouse.city}</dd>

            <dt className="text-gray-500">Kraj</dt>
            <dd className="text-gray-800">{warehouse.country || "—"}</dd>
          </dl>
        </section>
      </div>

      <WarehouseProducts warehouseId={warehouse.id} />

      <ConfirmModal
        open={confirmOpen}
        title="Dezaktywować magazyn?"
        message={`Magazyn „${warehouse.name}" zostanie oznaczony jako nieaktywny.`}
        confirmLabel="Dezaktywuj"
        danger
        loading={deactivate.isPending}
        error={deactivateError}
        onConfirm={onConfirmDeactivate}
        onCancel={() => { setConfirmOpen(false); setDeactivateError(null); }}
      />
    </div>
  );
}