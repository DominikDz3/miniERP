import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useProducts, useTransferProduct } from "@/features/products/hooks/useProducts";
import { useWarehouse, useActiveWarehouses } from "@/features/warehouses/hooks/useWarehouses";
import { ApiError } from "@/shared/services/apiClient";
import { labelCls, inputCls } from "@/shared/components/formStyles";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4";
const sectionTitleCls = "text-sm font-medium text-gray-500";

export function WarehouseTransferView() {
  const { id } = useParams();
  const warehouseId = Number(id);
  const navigate = useNavigate();

  const { data: warehouse } = useWarehouse(warehouseId);
  const transfer = useTransferProduct();

  const { data: productsPage } = useProducts({ active: true, warehouseId, page: 0, size: 1000 });
  const products = productsPage?.content ?? [];

  const { data: warehouses } = useActiveWarehouses();

  const [productId, setProductId] = useState<number | "">("");
  const [quantity, setQuantity] = useState("");
  const [targetWarehouseId, setTargetWarehouseId] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === productId);

  const submit = async () => {
    setError(null);
    const qty = Number(quantity);
    if (productId === "") { setError("Wybierz produkt"); return; }
    if (!Number.isInteger(qty) || qty <= 0) { setError("Podaj ilość większą od zera"); return; }
    if (targetWarehouseId === "") { setError("Wybierz magazyn docelowy"); return; }

    try {
      await transfer.mutateAsync({ id: productId, quantity: qty, targetWarehouseId });
      navigate(`/warehouses/${warehouseId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Nie udało się przenieść towaru");
    }
  };

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate(`/warehouses/${warehouseId}`)}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
      >
        ← Wróć do magazynu
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Przesunięcie towaru</h1>
        <p className="text-sm text-gray-400 mt-1">Z magazynu: <strong className="text-gray-700 font-medium">{warehouse?.name}</strong></p>
      </div>

      {error && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-6"
      >
        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Parametry przesunięcia</h2>
          <div>
            <label className={labelCls}>Produkt</label>
            <select
              className={inputCls}
              value={productId}
              onChange={(e) => setProductId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="" disabled>wybierz produkt</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.sku} · {p.name} (stan: {p.stock})</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Ilość</label>
            <input
              type="number"
              min={1}
              className={inputCls}
              placeholder="ilość"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            {selectedProduct && (
              <p className="text-xs text-gray-400 mt-1">Dostępny stan: <strong className="text-gray-600">{selectedProduct.stock}</strong></p>
            )}
          </div>

          <div>
            <label className={labelCls}>Magazyn docelowy</label>
            <select
              className={inputCls}
              value={targetWarehouseId}
              onChange={(e) => setTargetWarehouseId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="" disabled>wybierz magazyn docelowy</option>
              {warehouses?.filter((w) => w.id !== warehouseId).map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/warehouses/${warehouseId}`)}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={transfer.isPending}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {transfer.isPending ? "Przenoszenie…" : "Przenieś"}
          </button>
        </div>
      </form>
    </div>
  );
}