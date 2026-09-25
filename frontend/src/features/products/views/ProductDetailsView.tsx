import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { useProduct, useProductPriceHistory, useDeactivateProduct, useActivateProduct } from "../hooks/useProducts";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { VAT_LABEL } from "../types/catalog";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-5";
const sectionTitleCls = "text-sm font-medium text-gray-500 mb-3";

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
    <div className="max-w-4xl">
      <button
        onClick={() => navigate("/products")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
      >
        ← Wróć do listy
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
            product.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${product.active ? "bg-green-500" : "bg-gray-400"}`} />
          {product.active ? "Aktywny" : "Nieaktywny"}
        </span>

        {hasAuthority("PRODUCT_WRITE") && (
          <div className="ml-auto flex gap-2">
            {product.active ? (
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={deactivate.isPending}
                className="px-4 py-2 text-sm rounded-lg cursor-pointer disabled:opacity-50 text-red-600 hover:bg-red-50"
              >
                Dezaktywuj
              </button>
            ) : (
              <button
                onClick={() => activate.mutate(product.id)}
                disabled={activate.isPending}
                className="px-4 py-2 text-sm rounded-lg font-medium cursor-pointer disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700"
              >
                Aktywuj
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Dane katalogowe</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm">
            <dt className="text-gray-500">SKU</dt>
            <dd className="font-mono text-gray-800">{product.sku}</dd>

            <dt className="text-gray-500">Magazyn</dt>
            <dd className="text-gray-800">{product.warehouseName}</dd>

            <dt className="text-gray-500">Kategoria</dt>
            <dd className="text-gray-800">{product.categoryName}</dd>

            <dt className="text-gray-500">Opis</dt>
            <dd className="text-gray-800">{product.description ?? "—"}</dd>

            <dt className="text-gray-500">Cena zakupu</dt>
            <dd className="text-gray-800">{product.purchasePrice.toFixed(2)} zł</dd>

            <dt className="text-gray-500">Cena sprzedaży</dt>
            <dd className="font-medium text-gray-800">{product.salePrice.toFixed(2)} zł</dd>

            <dt className="text-gray-500">Stawka VAT</dt>
            <dd className="text-gray-800">{VAT_LABEL[product.vatRate]}</dd>

            <dt className="text-gray-500">Jednostka</dt>
            <dd className="text-gray-800">{product.unit}</dd>

            <dt className="text-gray-500">Stan magazynowy</dt>
            <dd className="font-medium text-gray-800">{product.stock} {product.unit}</dd>

            <dt className="text-gray-500">Min. stan magazynowy</dt>
            <dd className="text-gray-800">{product.minStock} {product.unit}</dd>
          </dl>
        </section>

        {priceHistory && priceHistory.length > 0 && (
          <section className={`${cardCls} p-0 overflow-hidden`}>
            <h2 className={`${sectionTitleCls} px-5 pt-5`}>Historia cen</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Zakup (stara → nowa)</th>
                  <th className="px-5 py-3 font-medium">Sprzedaż (stara → nowa)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {priceHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-gray-500">{new Date(h.changedAt).toLocaleString("pl-PL")}</td>
                    <td className="px-5 py-3">
                      <PriceChange oldValue={h.oldPurchasePrice} newValue={h.newPurchasePrice} />
                    </td>
                    <td className="px-5 py-3">
                      <PriceChange oldValue={h.oldSalePrice} newValue={h.newSalePrice} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>

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

  function PriceChange({ oldValue, newValue }: { oldValue: number | null; newValue: number | null }) {
    const changed = oldValue != null && newValue != null && oldValue !== newValue;

    if (!changed) {
      return <span className="text-gray-400">—</span>;
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-sm">
        <span className="text-gray-400 line-through">{oldValue!.toFixed(2)} zł</span>
        <span className="text-gray-300">→</span>
        <span className="font-medium text-gray-800">{newValue!.toFixed(2)} zł</span>
      </span>
    );
  }
}