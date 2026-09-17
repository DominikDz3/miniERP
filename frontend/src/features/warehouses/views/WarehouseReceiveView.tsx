import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useProducts, useReceiveStock } from "@/features/products/hooks/useProducts";
import { useWarehouse } from "@/features/warehouses/hooks/useWarehouses";
import { ApiError } from "@/shared/services/apiClient";

interface Item {
  productId: number;
  productLabel: string;
  quantity: number;
}

export function WarehouseReceiveView() {
  const { id } = useParams();
  const warehouseId = Number(id);
  const navigate = useNavigate();

  const { data: warehouse } = useWarehouse(warehouseId);
  const receive = useReceiveStock();

  const { data: productsPage } = useProducts({ active: true, warehouseId, page: 0, size: 1000 });
  const products = productsPage?.content ?? [];

  const [productId, setProductId] = useState<number | "">("");
  const [quantity, setQuantity] = useState("");

  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addItem = () => {
    setError(null);
    const qty = Number(quantity);
    if (productId === "") { setError("Wybierz produkt"); return; }
    if (!Number.isInteger(qty) || qty <= 0) { setError("Podaj ilość większą od zera"); return; }

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existing = items.find((it) => it.productId === productId);
    if (existing) {
      setItems(items.map((it) =>
        it.productId === productId ? { ...it, quantity: it.quantity + qty } : it
      ));
    } else {
      setItems([...items, { productId, productLabel: `${product.sku} · ${product.name}`, quantity: qty }]);
    }

    setProductId("");
    setQuantity("");
  };

  const removeItem = (pid: number) => setItems(items.filter((it) => it.productId !== pid));

  const submit = async () => {
    setError(null);
    if (items.length === 0) { setError("Dodaj przynajmniej jedną pozycję"); return; }

    try {
      await receive.mutateAsync(items.map((it) => ({ productId: it.productId, quantity: it.quantity })));
      navigate(`/warehouses/${warehouseId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Nie udało się przyjąć towaru");
    }
  };

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(`/warehouses/${warehouseId}`)}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        ← Wróć do magazynu
      </button>

      <h1 className="text-2xl font-semibold mb-1">Przyjęcie towaru</h1>
      <p className="text-sm text-gray-500 mb-4">{warehouse?.name}</p>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <div className="flex gap-3 items-end mb-4">
        <div className="flex-1">
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
        <div className="w-28">
          <label className="block text-sm text-gray-500 mb-1">Ilość</label>
          <input type="number" min={1} className="w-full border rounded px-3 py-2"
            value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <button onClick={addItem}
          className="px-4 py-2 text-sm border rounded hover:bg-gray-50 cursor-pointer">
          Dodaj
        </button>
      </div>

      {items.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium text-gray-600">Produkt</th>
                <th className="px-4 py-2 font-medium text-gray-600">Ilość</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.productId} className="border-t">
                  <td className="px-4 py-2">{it.productLabel}</td>
                  <td className="px-4 py-2">{it.quantity}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => removeItem(it.productId)}
                      className="text-red-600 hover:text-red-800 text-xs">
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button onClick={() => navigate(`/warehouses/${warehouseId}`)}
          className="px-4 py-2 text-sm border rounded hover:bg-gray-50 cursor-pointer">
          Anuluj
        </button>
        <button onClick={submit} disabled={receive.isPending || items.length === 0}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {receive.isPending ? "…" : "Zatwierdź przyjęcie"}
        </button>
      </div>
    </div>
  );
}