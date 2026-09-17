import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { useProduct, useProductPriceHistory, useDeactivateProduct, useActivateProduct } from "../hooks/useProducts";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ConfirmModal } from "@/shared/components/ConfirmModal";

export function ProductDetailsView() {
  const { id } = useParams();
  const productId = Number(id);
  const navigate = useNavigate();
  const { hasAuthority } = useAuth();

  const { data: product, isLoading, isError } = useProduct(productId);
  const { data: priceHistory } = useProductPriceHistory(productId);
  const deactivate = useDeactivateProduct();
  const activate = useActivateProduct();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const onConfirmDeactivate = () => {
    if (!product) return;
    deactivate.mutate(product.id, { onSuccess: () => setConfirmOpen(false) });
  };

  if (isLoading) return <p className="text-gray-500">Ładowanie…</p>;
  if (isError || !product) return <p className="text-red-600">Nie znaleziono produktu.</p>;

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate("/products")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        ← Wróć do listy
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        {product.active
          ? <span className="text-green-700 text-sm">aktywny</span>
          : <span className="text-gray-400 text-sm">nieaktywny</span>}

        {hasAuthority("PRODUCT_WRITE") && product.active && (
          <button
            onClick={() => setConfirmOpen(true)}
            className="ml-auto text-red-600 hover:text-red-800 text-sm border border-red-300 rounded px-3 py-1 cursor-pointer">
            Dezaktywuj
          </button>
        )}
        {hasAuthority("PRODUCT_WRITE") && !product.active && (
            <button
            onClick={() => activate.mutate(product.id)}
            disabled={activate.isPending}
            className="ml-auto text-green-700 hover:text-green-900 text-sm border border-green-300 rounded px-3 py-1 disabled:opacity-40" cursor-pointer>
            Aktywuj
          </button>
        )}
      </div>

      <section className="bg-white rounded-lg shadow p-5 mb-6">
        <h2 className="font-medium text-gray-600 mb-3">Dane</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-500">SKU</dt>
          <dd className="font-mono">{product.sku}</dd>
          <dt className="text-gray-500">Magazyn</dt>
          <dd>{product.warehouseName}</dd>
          <dt className="text-gray-500">Kategoria</dt>
          <dd>{product.categoryName}</dd>
          <dt className="text-gray-500">Opis</dt>
          <dd>{product.description ?? "—"}</dd>
          <dt className="text-gray-500">Cena zakupu</dt>
          <dd>{product.purchasePrice.toFixed(2)} zł</dd>
          <dt className="text-gray-500">Cena sprzedaży</dt>
          <dd>{product.salePrice.toFixed(2)} zł</dd>
          <dt className="text-gray-500">VAT</dt>
          <dd>{product.vatRate}%</dd>
          <dt className="text-gray-500">Jednostka</dt>
          <dd>{product.unit}</dd>
          <dt className="text-gray-500">Stan</dt>
          <dd>{product.stock}</dd>
          <dt className="text-gray-500">Min. stan</dt>
          <dd>{product.minStock}</dd>
        </dl>
      </section>

      {priceHistory && priceHistory.length > 0 && (
        <section className="bg-white rounded-lg shadow p-5 mb-6">
          <h2 className="font-medium text-gray-600 mb-3">Historia cen</h2>
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr>
                <th className="py-2 font-medium text-gray-500">Data</th>
                <th className="py-2 font-medium text-gray-500">Zakup (stara → nowa)</th>
                <th className="py-2 font-medium text-gray-500">Sprzedaż (stara → nowa)</th>
              </tr>
            </thead>
            <tbody>
              {priceHistory.map((h) => (
                <tr key={h.id} className="border-t">
                  <td className="py-2">{new Date(h.changedAt).toLocaleString("pl-PL")}</td>
                  <td className="py-2">
                    <PriceChange oldValue={h.oldPurchasePrice} newValue={h.newPurchasePrice} />
                  </td>
                  <td className="py-2">
                    <PriceChange oldValue={h.oldSalePrice} newValue={h.newSalePrice} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Dezaktywować produkt?"
        message={`Produkt „${product.name}" zostanie oznaczony jako nieaktywny.`}
        confirmLabel="Dezaktywuj"
        danger
        loading={deactivate.isPending}
        onConfirm={onConfirmDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );

  function PriceChange({oldValue, newValue}: {oldValue: number | null; newValue: number | null }) {
    const changed = oldValue != null && newValue != null && oldValue !== newValue;

    if (!changed) {
          return <span className="text-gray-900">-</span>;
    }

      return (
    <span>
      <span className="text-gray-400 line-through">{oldValue!.toFixed(2)} zł</span>
      {" → "}
      <span className="font-medium">{newValue!.toFixed(2)} zł</span>
    </span>
  );
  }
}