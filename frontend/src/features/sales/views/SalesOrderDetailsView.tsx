import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { useSalesOrder, useSalesOrderItems, useSalesOrderHistory, useSalesOrderTransition } from "../hooks/useSalesOrders";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "../components/StatusBadge";
import { ALLOWED_TRANSITIONS, STATUS_ACTION_LABELS } from "../types/statusTransitions";
import type { SalesOrderStatus } from "../types/sales";
import { ApiError } from "@/shared/services/apiClient";
import { VAT_LABEL } from "@/features/products/types/catalog";

export function SalesOrderDetailsView() {
  const { id } = useParams();
  const orderId = Number(id);
  const navigate = useNavigate();
  const { hasAuthority } = useAuth();

  const { data: order, isLoading, isError } = useSalesOrder(orderId);
  const { data: items } = useSalesOrderItems(orderId);
  const { data: history } = useSalesOrderHistory(orderId);
  const transition = useSalesOrderTransition();

  const [confirmTarget, setConfirmTarget] = useState<SalesOrderStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isLoading) return <p className="text-gray-500">Ładowanie…</p>;
  if (isError || !order) return <p className="text-red-600">Nie znaleziono zamówienia.</p>;

  const allowed = ALLOWED_TRANSITIONS[order.status];

  const runTransition = (target: SalesOrderStatus) => {
    transition.mutate(
      { id: order.id, target },
      {
        onSuccess: () => setConfirmTarget(null),
        onError: (err) => {
          setConfirmTarget(null);
          setErrorMessage(err instanceof ApiError ? err.detail : "Błąd zmiany statusu");
        },
      },
    );
  };

  return (
    <div className="max-w-5xl">
      <button
        onClick={() => navigate("/sales-orders")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        ← Wróć do listy
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Zamówienie #{order.id}</h1>
        <StatusBadge status={order.status} />
      </div>

      {hasAuthority("SALES_WRITE") && allowed.length > 0 && (
        <div className="flex gap-2 mb-6">
          {allowed.map((target) => {
            const danger = target === "CANCELLED";
            return (
              <button
                key={target}
                onClick={() => setConfirmTarget(target)}
                disabled={transition.isPending}
                className={
                  "px-4 py-2 text-sm rounded cursor-pointer disabled:opacity-50 " +
                  (danger
                    ? "border border-red-300 text-red-600 hover:bg-red-50"
                    : "bg-blue-600 text-white hover:bg-blue-700")
                }>
                {STATUS_ACTION_LABELS[target]}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* LEWA: dane + pozycje */}
        <div className="col-span-2 space-y-6">
          <section className="bg-white rounded-lg shadow p-5">
            <h2 className="font-medium text-gray-600 mb-3">Dane</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-gray-500">Klient</dt>
              <dd>{order.customerName}</dd>
              <dt className="text-gray-500">Adres dostawy</dt>
              <dd>{order.receiverAddress}</dd>
              <dt className="text-gray-500">Utworzył</dt>
              <dd>{order.createdBy}</dd>
              <dt className="text-gray-500">Data</dt>
              <dd>{new Date(order.createdAt).toLocaleString("pl-PL")}</dd>
              <dt className="text-gray-500">Wartość netto</dt>
              <dd>{order.totalNet.toFixed(2)} zł</dd>
              <dt className="text-gray-500">VAT</dt>
              <dd>{order.totalVat.toFixed(2)} zł</dd>
              <dt className="text-gray-500">Wartość brutto</dt>
              <dd className="font-medium">{order.totalGross.toFixed(2)} zł</dd>
            </dl>
          </section>

          <section className="bg-white rounded-lg shadow p-5">
            <h2 className="font-medium text-gray-600 mb-3">Pozycje</h2>
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr>
                  <th className="py-2 font-medium text-gray-500">SKU</th>
                  <th className="py-2 font-medium text-gray-500">Produkt</th>
                  <th className="py-2 font-medium text-gray-500">Ilość</th>
                  <th className="py-2 font-medium text-gray-500">Cena jedn.</th>
                  <th className="py-2 font-medium text-gray-500">VAT</th>
                  <th className="py-2 font-medium text-gray-500">Wartość netto</th>
                </tr>
              </thead>
              <tbody>
                {items?.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="py-2 font-mono text-xs">{it.sku}</td>
                    <td className="py-2">{it.productName}</td>
                    <td className="py-2">{it.quantity}</td>
                    <td className="py-2">{it.unitPrice.toFixed(2)} zł</td>
                    <td className="py-2">{VAT_LABEL[it.vatRate]}</td>
                    <td className="py-2">{it.lineNet.toFixed(2)} zł</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* PRAWA: historia statusów */}
        <div className="col-span-1">
          <section className="bg-white rounded-lg shadow p-5">
            <h2 className="font-medium text-gray-600 mb-3">Historia statusów</h2>
            <ol className="space-y-3 text-sm">
              {history?.map((h) => (
                <li key={h.id} className="border-l-2 border-gray-200 pl-3">
                  <div className="flex items-center gap-1 flex-wrap">
                    {h.fromStatus
                      ? <StatusBadge status={h.fromStatus} />
                      : <span className="text-gray-400">utworzono</span>}
                    <span className="text-gray-400">→</span>
                    <StatusBadge status={h.toStatus} />
                  </div>
                  <div className="text-gray-500 mt-1">
                    {new Date(h.changedAt).toLocaleString("pl-PL")}
                  </div>
                  <div className="text-gray-400">{h.changedBy}</div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={confirmTarget !== null}
        title="Zmiana statusu"
        message={
          confirmTarget === "PROCESSING"
            ? "Realizacja wyda towar z magazynu i zmniejszy stany. Kontynuować?"
            : confirmTarget === "CANCELLED"
            ? "Zamówienie zostanie anulowane."
            : `Zmienić status na „${confirmTarget ? STATUS_ACTION_LABELS[confirmTarget] : ""}"?`
        }
        confirmLabel="Potwierdź"
        danger={confirmTarget === "CANCELLED"}
        loading={transition.isPending}
        onConfirm={() => confirmTarget && runTransition(confirmTarget)}
        onCancel={() => setConfirmTarget(null)}
      />

      <Modal
        open={errorMessage !== null}
        title="Nie można wykonać operacji"
        onClose={() => setErrorMessage(null)}
      >
        <div className="flex gap-3 mb-5">
          <span className="text-red-500 text-2xl leading-none">⚠</span>
          <p className="text-sm text-gray-800">{errorMessage}</p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setErrorMessage(null)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
            OK
          </button>
        </div>
      </Modal>
    </div>
  );
}