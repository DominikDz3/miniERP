import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useSupplier, useDeactivateSupplier, useActivateSupplier } from "@/features/suppliers/hooks/useSuppliers";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ConfirmModal } from "@/shared/components/ConfirmModal";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-5";
const sectionTitleCls = "text-sm font-medium text-gray-500 mb-3";

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
    <div className="max-w-4xl">
      <button
        onClick={() => navigate("/suppliers")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
      >
        ← Wróć do listy
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold">{supplier.name}</h1>
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
            supplier.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${supplier.active ? "bg-green-500" : "bg-gray-400"}`} />
          {supplier.active ? "Aktywny" : "Nieaktywny"}
        </span>

        {hasAuthority("SUPPLIER_WRITE") && (
          <div className="ml-auto flex gap-2">
            {supplier.active ? (
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={deactivate.isPending}
                className="px-4 py-2 text-sm rounded-lg cursor-pointer disabled:opacity-50 text-red-600 hover:bg-red-50"
              >
                Dezaktywuj
              </button>
            ) : (
              <button
                onClick={() => activate.mutate(supplier.id)}
                disabled={activate.isPending}
                className="px-4 py-2 text-sm rounded-lg font-medium cursor-pointer disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700"
              >
                Aktywuj
              </button>
            )}
          </div>
        )}
      </div>

      <section className={cardCls}>
        <h2 className={sectionTitleCls}>Dane firmy</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm">
          <dt className="text-gray-500">NIP</dt>
          <dd className="font-mono text-gray-800">{supplier.nip || "—"}</dd>

          <dt className="text-gray-500">E-mail</dt>
          <dd className="text-gray-800">{supplier.email || "—"}</dd>

          <dt className="text-gray-500">Telefon</dt>
          <dd className="text-gray-800">{supplier.phone || "—"}</dd>

          <dt className="text-gray-500">Ulica</dt>
          <dd className="text-gray-800">{supplier.street || "—"}</dd>

          <dt className="text-gray-500">Kod i miasto</dt>
          <dd className="text-gray-800">{supplier.postalCode} {supplier.city}</dd>

          <dt className="text-gray-500">Kraj</dt>
          <dd className="text-gray-800">{supplier.country || "—"}</dd>

          <dt className="text-gray-500">Data utworzenia</dt>
          <dd className="text-gray-800">{new Date(supplier.createdAt).toLocaleString("pl-PL")}</dd>
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