import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useProducts, useTransferProduct } from "@/features/products/hooks/useProducts";
import { useWarehouse, useActiveWarehouses } from "@/features/warehouses/hooks/useWarehouses";
import { ApiError } from "@/shared/services/apiClient";

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
    <div className="max-w-xl">
      <button onClick={() => navigate(`/warehouses/${warehouseId}`)}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        ← Wróć do magazynu
      </button>

      <h1 className="text-2xl font-semibold mb-1">Przesunięcie towaru</h1>
      <p className="text-sm text-gray-500 mb-4">z magazynu: {warehouse?.name}</p>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Produkt</label>
          <select className="w-full border rounded px-3 py-2"
            value={productId}
            onChange={(e) => setProductId(e.target.value ? Number(e.target.value) : "")}>
            <option value="" disabled>wybierz</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.sku} · {p.name} (stan: {p.stock})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Ilość</label>
          <input type="number" min={1} className="w-full border rounded px-3 py-2"
            value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          {selectedProduct && (
            <p className="text-xs text-gray-400 mt-1">Dostępny stan: {selectedProduct.stock}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Magazyn docelowy</label>
          <select className="w-full border rounded px-3 py-2"
            value={targetWarehouseId}
            onChange={(e) => setTargetWarehouseId(e.target.value ? Number(e.target.value) : "")}>
            <option value="" disabled>wybierz</option>
            {warehouses?.filter((w) => w.id !== warehouseId).map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-5">
        <button onClick={() => navigate(`/warehouses/${warehouseId}`)}
          className="px-4 py-2 text-sm border rounded hover:bg-gray-50 cursor-pointer">
          Anuluj
        </button>
        <button onClick={submit} disabled={transfer.isPending}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
          {transfer.isPending ? "…" : "Przenieś"}
        </button>
      </div>
    </div>
  );
}