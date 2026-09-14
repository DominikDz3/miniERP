import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useSupplier, useDeactivateSupplier, useActivateSupplier } from "@/features/suppliers/hooks/useSuppliers";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ConfirmModal } from "@/shared/components/ConfirmModal";

export function SupplierDetailsView() {
  const { id } = useParams();
  const supplierId = Number(id);
  const navigate = useNavigate();
  const { hasAuthority } = useAuth();

  const { data: supplier, isLoading, isError } = useSupplier(supplierId);
  const activate = useActivateSupplier();
  const deactivate = useDeactivateSupplier();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const onConfirmDeactivate = () => {
    if (!supplier) return;
    deactivate.mutate(supplier.id, { onSuccess: () => setConfirmOpen(false) });
  };

  if (isLoading) return <p className="text-gray-500">Ładowanie…</p>;
  if (isError || !supplier) return <p className="text-red-600">Nie znaleziono dostawcy.</p>;

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate("/suppliers")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        ← Wróć do listy
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold">{supplier.name}</h1>
        {supplier.active
          ? <span className="text-green-700 text-sm">aktywny</span>
          : <span className="text-gray-400 text-sm">nieaktywny</span>}

        {hasAuthority("SUPPLIER_WRITE") && supplier.active && (
          <button
            onClick={() => setConfirmOpen(true)}
            className="ml-auto text-red-600 hover:text-red-800 text-sm border border-red-300 rounded px-3 py-1 cursor-pointer">
            Dezaktywuj
          </button>
        )}

        {hasAuthority("SUPPLIER_WRITE") && !supplier.active && (
          <button
            onClick={() => activate.mutate(supplier.id)}
            disabled={activate.isPending}
            className="ml-auto text-green-700 hover:text-green-900 text-sm border border-green-300 rounded px-3 py-1 disabled:opacity-40 cursor-pointer">
            Aktywuj
          </button>
        )}
        
      </div>

      <section className="bg-white rounded-lg shadow p-5 mb-6">
        <h2 className="font-medium text-gray-600 mb-3">Dane</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-500">NIP</dt>
          <dd className="font-mono">{supplier.nip}</dd>
          <dt className="text-gray-500">E-mail</dt>
          <dd>{supplier.email}</dd>
          <dt className="text-gray-500">Telefon</dt>
          <dd>{supplier.phone}</dd>
          <dt className="text-gray-500">Adres</dt>
          <dd>{supplier.street}</dd>
          <dt className="text-gray-500">Kod / miasto</dt>
          <dd>{supplier.postalCode} {supplier.city}</dd>
          <dt className="text-gray-500">Kraj</dt>
          <dd>{supplier.country}</dd>
          <dt className="text-gray-500">Utworzono</dt>
          <dd>{new Date(supplier.createdAt).toLocaleString("pl-PL")}</dd>
        </dl>
      </section>

      <ConfirmModal
        open={confirmOpen}
        title="Dezaktywować dostawcę?"
        message={`Dostawca „${supplier.name}" zostanie oznaczony jako nieaktywny.`}
        confirmLabel="Dezaktywuj"
        danger
        loading={deactivate.isPending}
        onConfirm={onConfirmDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}