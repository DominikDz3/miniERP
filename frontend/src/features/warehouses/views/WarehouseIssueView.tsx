import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useProducts, useIssueStock } from "@/features/products/hooks/useProducts";
import { useWarehouse } from "@/features/warehouses/hooks/useWarehouses";
import { ApiError } from "@/shared/services/apiClient";
import { labelCls, inputCls } from "@/shared/components/formStyles";

interface Item {
  productId: number;
  productLabel: string;
  quantity: number;
}

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4";
const sectionTitleCls = "text-sm font-medium text-gray-500";

export function WarehouseIssueView() {
  const { id } = useParams();
  const warehouseId = Number(id);
  const navigate = useNavigate();

  const { data: warehouse } = useWarehouse(warehouseId);
  const issue = useIssueStock();

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
      await issue.mutateAsync(items.map((it) => ({ productId: it.productId, quantity: it.quantity })));
      navigate(`/warehouses/${warehouseId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Nie udało się wydać towaru");
    }
  };

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate(`/warehouses/${warehouseId}`)}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
      >
        ← Wróć do magazynu
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Wydanie towaru</h1>
        <p className="text-sm text-gray-400 mt-1">Lokalizacja źródłowa: <strong className="text-gray-700 font-medium">{warehouse?.name}</strong></p>
      </div>

      {error && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Dodaj pozycję do wydania</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[240px]">
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
            <div className="w-28">
              <label className={labelCls}>Ilość</label>
              <input
                type="number"
                min={1}
                className={inputCls}
                placeholder="ilość"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium cursor-pointer"
            >
              + Dodaj
            </button>
          </div>
        </section>

        {items.length > 0 && (
          <section className={`${cardCls} p-0 overflow-hidden`}>
            <div className="px-5 pt-5 pb-2">
              <h2 className={sectionTitleCls}>Pozycje do wydania ({items.length})</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3 font-medium">Produkt</th>
                  <th className="px-5 py-3 font-medium text-right">Ilość</th>
                  <th className="w-16 px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((it) => (
                  <tr key={it.productId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{it.productLabel}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-800">{it.quantity}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => removeItem(it.productId)}
                        className="px-2 py-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Usuń"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/warehouses/${warehouseId}`)}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            Anuluj
          </button>
          <button
            onClick={submit}
            disabled={issue.isPending || items.length === 0}
            className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 cursor-pointer"
          >
            {issue.isPending ? "Zapisywanie…" : "Zatwierdź wydanie"}
          </button>
        </div>
      </div>
    </div>
  );
}