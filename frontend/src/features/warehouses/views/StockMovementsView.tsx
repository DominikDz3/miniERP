import { useState } from "react";
import { useStockMovements } from "@/features/warehouses/hooks/useStockMovements";
import { useActiveWarehouses } from "@/features/warehouses/hooks/useWarehouses";
import type { MovementType } from "@/features/warehouses/types/warehouses";
import { labelCls, inputCls } from "@/shared/components/formStyles";

const TYPE_CONFIG: Record<MovementType, { label: string; style: string; dot: string }> = {
  PRZYJECIE: {
    label: "Przyjęcie",
    style: "bg-green-50 text-green-700",
    dot: "bg-green-500",
  },
  WYDANIE: {
    label: "Wydanie",
    style: "bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  PRZESUNIECIE: {
    label: "Przesunięcie",
    style: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
};

export function StockMovementsView() {
  const [page, setPage] = useState(0);
  const [warehouseId, setWarehouseId] = useState<number | "">("");
  const [type, setType] = useState<MovementType | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data: warehouses } = useActiveWarehouses();

  const { data, isLoading, isError, isFetching } = useStockMovements({
    warehouseId: warehouseId === "" ? undefined : warehouseId,
    type: type === "" ? undefined : type,
    from: from ? `${from}T00:00:00` : undefined,
    to: to ? `${to}T23:59:59` : undefined,
    page,
    size: 20,
    sort: "createdAt,desc",
  });

  const resetPage = () => setPage(0);
  const totalPages = data?.totalPages ?? 0;

  const clearAll = () => {
    setWarehouseId("");
    setType("");
    setFrom("");
    setTo("");
    resetPage();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Ruchy magazynowe</h1>
        <p className="text-sm text-gray-400 mt-1">{data?.totalElements ?? 0} operacji zarejestrowanych w systemie</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-52">
            <label className={labelCls}>Magazyn</label>
            <select
              className={inputCls}
              value={warehouseId}
              onChange={(e) => { setWarehouseId(e.target.value ? Number(e.target.value) : ""); resetPage(); }}
            >
              <option value="">Wszystkie magazyny</option>
              {warehouses?.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div className="w-48">
            <label className={labelCls}>Typ ruchu</label>
            <select
              className={inputCls}
              value={type}
              onChange={(e) => { setType(e.target.value as MovementType | ""); resetPage(); }}
            >
              <option value="">Wszystkie typy</option>
              <option value="PRZYJECIE">Przyjęcie</option>
              <option value="WYDANIE">Wydanie</option>
              <option value="PRZESUNIECIE">Przesunięcie</option>
            </select>
          </div>

          <div className="w-44">
            <label className={labelCls}>Od</label>
            <input
              type="date"
              className={inputCls}
              value={from}
              onChange={(e) => { setFrom(e.target.value); resetPage(); }}
            />
          </div>

          <div className="w-44">
            <label className={labelCls}>Do</label>
            <input
              type="date"
              className={inputCls}
              value={to}
              onChange={(e) => { setTo(e.target.value); resetPage(); }}
            />
          </div>

          {(warehouseId !== "" || type !== "" || from || to) && (
            <button
              type="button"
              onClick={clearAll}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              Wyczyść
            </button>
          )}
        </div>
      </div>

      {isError && <p className="text-red-600 mb-4">Błąd ładowania historii.</p>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3 font-medium">Data</th>
              <th className="px-5 py-3 font-medium">Typ</th>
              <th className="px-5 py-3 font-medium">Produkt</th>
              <th className="px-5 py-3 font-medium">Magazyn</th>
              <th className="px-5 py-3 font-medium text-right">Ilość</th>
              <th className="px-5 py-3 font-medium">Wykonał</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">Ładowanie…</td></tr>
            ) : (data?.content.length ?? 0) === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">Brak ruchów</td></tr>
            ) : (
              data?.content.map((m) => {
                const conf = TYPE_CONFIG[m.type];
                return (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-gray-500">{new Date(m.createdAt).toLocaleString("pl-PL")}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${conf.style}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                        {conf.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">{m.productName ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-800">
                      {m.warehouseName ?? "—"}
                      {m.targetWarehouseName && <span className="text-gray-400"> → {m.targetWarehouseName}</span>}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-gray-800">{m.quantity}</td>
                    <td className="px-5 py-3 text-gray-500">{m.performedBy}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-gray-500">
          Strona {page + 1} z {Math.max(totalPages, 1)} · {data?.totalElements ?? 0} ruchów
          {isFetching ? " · odświeżanie…" : ""}
        </span>
        <div className="flex gap-2">
          <button
            className="border rounded-lg px-3 py-1 disabled:opacity-40 cursor-pointer"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Poprzednia
          </button>
          <button
            className="border rounded-lg px-3 py-1 disabled:opacity-40 cursor-pointer"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Następna
          </button>
        </div>
      </div>
    </div>
  );
}