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

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-5";
const sectionTitleCls = "text-sm font-medium text-gray-500 mb-3";
const thCls = "px-3 py-2 font-medium";

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

  // treść okna potwierdzenia zależna od docelowego statusu
  let confirmMessage = "";
  if (confirmTarget === "PROCESSING") {
    confirmMessage = "Realizacja wyda towar z magazynu i zmniejszy stany. Kontynuować?";
  } else if (confirmTarget === "CANCELLED") {
    confirmMessage = "Zamówienie zostanie anulowane.";
  } else if (confirmTarget) {
    confirmMessage = `Zmienić status na „${STATUS_ACTION_LABELS[confirmTarget]}"?`;
  }

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

        {hasAuthority("SALES_WRITE") && allowed.length > 0 && (
          <div className="ml-auto flex gap-2">
            {allowed.map((target) => {
              let btnCls = "px-4 py-2 text-sm rounded-lg font-medium cursor-pointer disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700";
              if (target === "CANCELLED") {
                btnCls = "px-4 py-2 text-sm rounded-lg cursor-pointer disabled:opacity-50 text-red-600 hover:bg-red-50";
              }
              return (
                <button
                  key={target}
                  onClick={() => setConfirmTarget(target)}
                  disabled={transition.isPending}
                  className={btnCls}>
                  {STATUS_ACTION_LABELS[target]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEWA: dane + pozycje */}
        <div className="lg:col-span-2 space-y-6">
          <section className={cardCls}>
            <h2 className={sectionTitleCls}>Dane</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-gray-500">Klient</dt>
              <dd className="text-gray-800 font-medium">{order.customerName}</dd>
              <dt className="text-gray-500">Adres dostawy</dt>
              <dd className="text-gray-800">{order.receiverAddress}</dd>
              <dt className="text-gray-500">Utworzył</dt>
              <dd className="text-gray-800">{order.createdBy}</dd>
              <dt className="text-gray-500">Data</dt>
              <dd className="text-gray-800">{new Date(order.createdAt).toLocaleString("pl-PL")}</dd>
            </dl>
          </section>

          <section className={`${cardCls} p-0 overflow-hidden`}>
            <h2 className={`${sectionTitleCls} px-5 pt-5`}>Pozycje</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className={`${thCls} pl-5`}>SKU</th>
                  <th className={thCls}>Produkt</th>
                  <th className={`${thCls} text-right`}>Ilość</th>
                  <th className={`${thCls} text-right`}>Cena jedn.</th>
                  <th className={`${thCls} text-right`}>VAT</th>
                  <th className={`${thCls} text-right pr-5`}>Netto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items?.map((it) => (
                  <tr key={it.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2 pl-5 font-mono text-xs text-gray-500">{it.sku}</td>
                    <td className="px-3 py-2 text-gray-800">{it.productName}</td>
                    <td className="px-3 py-2 text-right">{it.quantity}</td>
                    <td className="px-3 py-2 text-right">{it.unitPrice.toFixed(2)} zł</td>
                    <td className="px-3 py-2 text-right text-gray-500">{VAT_LABEL[it.vatRate]}</td>
                    <td className="px-3 py-2 pr-5 text-right">{it.lineNet.toFixed(2)} zł</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* podsumowanie wartości pod tabelą */}
            <div className="border-t border-gray-100 px-5 py-4 text-sm flex flex-col items-end gap-1">
              <div className="flex gap-6">
                <span className="text-gray-500">Netto</span>
                <span className="w-28 text-right">{order.totalNet.toFixed(2)} zł</span>
              </div>
              <div className="flex gap-6">
                <span className="text-gray-500">VAT</span>
                <span className="w-28 text-right">{order.totalVat.toFixed(2)} zł</span>
              </div>
              <div className="flex gap-6 text-base font-semibold text-gray-800">
                <span>Brutto</span>
                <span className="w-28 text-right">{order.totalGross.toFixed(2)} zł</span>
              </div>
            </div>
          </section>
        </div>

        {/* PRAWA: historia statusów */}
        <div>
          <section className={cardCls}>
            <h2 className={sectionTitleCls}>Historia statusów</h2>
            <ol className="space-y-4 text-sm">
              {history?.map((h) => (
                <li key={h.id} className="border-l-2 border-gray-100 pl-3">
                  <div className="flex items-center gap-1 flex-wrap">
                    {h.fromStatus
                      ? <StatusBadge status={h.fromStatus} />
                      : <span className="text-xs text-gray-400">utworzono</span>}
                    <span className="text-gray-300">→</span>
                    <StatusBadge status={h.toStatus} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(h.changedAt).toLocaleString("pl-PL")} · {h.changedBy}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={confirmTarget !== null}
        title="Zmiana statusu"
        message={confirmMessage}
        confirmLabel="Potwierdź"
        danger={confirmTarget === "CANCELLED"}
        loading={transition.isPending}
        onConfirm={() => confirmTarget && runTransition(confirmTarget)}
        onCancel={() => setConfirmTarget(null)}
      />

      <Modal
        open={errorMessage !== null}
        title="Nie można wykonać operacji"
        onClose={() => setErrorMessage(null)}>
        <div className="mb-5 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setErrorMessage(null)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer">
            OK
          </button>
        </div>
      </Modal>
    </div>
  );
}