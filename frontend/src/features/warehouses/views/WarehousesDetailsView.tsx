import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useWarehouse, useDeactivateWarehouse } from "@/features/warehouses/hooks/useWarehouses";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { ApiError } from "@/shared/services/apiClient";
import { WarehouseProducts } from "../components/WarehouseProducts";

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
    <div>
      <button onClick={() => navigate("/warehouses")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        ← Wróć do listy
      </button>

      <div className="flex items-center gap-3 mb-6 max-w-3xl">
        <h1 className="text-2xl font-semibold">{warehouse.name}</h1>
        {warehouse.active
          ? <span className="text-green-700 text-sm">aktywny</span>
          : <span className="text-gray-400 text-sm">nieaktywny</span>}

        {hasAuthority("WAREHOUSE_MANAGE") && warehouse.active && (
          <button
            onClick={() => { setDeactivateError(null); setConfirmOpen(true); }}
            className="ml-auto text-red-600 hover:text-red-800 text-sm border border-red-300 rounded px-3 py-1 cursor-pointer">
            Dezaktywuj
          </button>
        )}
      </div>

      <section className="bg-white rounded-lg shadow p-5 mb-6 max-w-3xl">
        <h2 className="font-medium text-gray-600 mb-3">Dane</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-500">Telefon</dt>
          <dd>{warehouse.phone}</dd>
          <dt className="text-gray-500">Adres</dt>
          <dd>{warehouse.street}</dd>
          <dt className="text-gray-500">Kod / miasto</dt>
          <dd>{warehouse.postalCode} {warehouse.city}</dd>
          <dt className="text-gray-500">Kraj</dt>
          <dd>{warehouse.country}</dd>
        </dl>
      </section>

      {hasAuthority("WAREHOUSE_OPERATE") && warehouse.active && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => navigate(`/warehouses/${warehouse.id}/receive`)}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
            Przyjmij towar
          </button>

          <button
            onClick={() => navigate(`/warehouses/${warehouse.id}/issue`)}
            className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 cursor-pointer">
            Wydaj towar
          </button>

          <button
            onClick={() => navigate(`/warehouses/${warehouse.id}/transfer`)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
            Przenieś towar
          </button>
        </div>
      )}

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