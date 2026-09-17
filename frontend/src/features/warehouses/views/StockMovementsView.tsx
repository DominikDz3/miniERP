import { useState } from "react";
import { useStockMovements} from "@/features/warehouses/hooks/useStockMovements";
import { useActiveWarehouses } from "@/features/warehouses/hooks/useWarehouses";
import type { MovementType } from "@/features/warehouses/types/warehouses"

const inputCls = "border rounded px-3 py-2 text-sm";

const TYPE_LABELS: Record<MovementType, string> = {
  PRZYJECIE: "Przyjęcie",
  WYDANIE: "Wydanie",
  PRZESUNIECIE: "Przesunięcie",
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

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Ruchy magazynowe</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <select className={inputCls} value={warehouseId}
          onChange={(e) => { setWarehouseId(e.target.value ? Number(e.target.value) : ""); resetPage(); }}>
          <option value="">Wszystkie magazyny</option>
          {warehouses?.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>

        <select className={inputCls} value={type}
          onChange={(e) => { setType(e.target.value as MovementType | ""); resetPage(); }}>
          <option value="">Wszystkie typy</option>
          <option value="PRZYJECIE">Przyjęcie</option>
          <option value="WYDANIE">Wydanie</option>
          <option value="PRZESUNIECIE">Przesunięcie</option>
        </select>

        <input type="date" className={inputCls} value={from}
          onChange={(e) => { setFrom(e.target.value); resetPage(); }} />
        <input type="date" className={inputCls} value={to}
          onChange={(e) => { setTo(e.target.value); resetPage(); }} />
      </div>

      {isError && <p className="text-red-600 mb-4">Błąd ładowania historii.</p>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Data</th>
              <th className="px-4 py-3 font-medium text-gray-600">Typ</th>
              <th className="px-4 py-3 font-medium text-gray-600">Produkt</th>
              <th className="px-4 py-3 font-medium text-gray-600">Magazyn</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Ilość</th>
              <th className="px-4 py-3 font-medium text-gray-600">Wykonał</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Ładowanie…</td></tr>
            ) : (data?.content.length ?? 0) === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Brak ruchów</td></tr>
            ) : (
              data?.content.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-3">{new Date(m.createdAt).toLocaleString("pl-PL")}</td>
                  <td className="px-4 py-3">{TYPE_LABELS[m.type]}</td>
                  <td className="px-4 py-3">{m.productName ?? "—"}</td>
                  <td className="px-4 py-3">
                    {m.warehouseName ?? "—"}
                    {m.targetWarehouseName && <span className="text-gray-400"> → {m.targetWarehouseName}</span>}
                  </td>
                  <td className="px-4 py-3 text-right">{m.quantity}</td>
                  <td className="px-4 py-3 text-gray-600">{m.performedBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-gray-500">
            Strona {page + 1} z {totalPages} ({data?.totalElements} ruchów)
            {isFetching && " · odświeżanie…"}
          </span>
          <div className="flex gap-2">
            <button className="border rounded px-3 py-1 disabled:opacity-40"
              disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Poprzednia
            </button>
            <button className="border rounded px-3 py-1 disabled:opacity-40"
              disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Następna
            </button>
          </div>
        </div>
      )}
    </div>
  );
}