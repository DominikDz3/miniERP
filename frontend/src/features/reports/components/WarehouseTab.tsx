import { useWarehouseValue, useBelowMinimum } from "../hooks/useReports";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100";
const sectionTitleCls = "text-sm font-medium text-gray-500";

export function WarehouseTab() {
  const { data: values } = useWarehouseValue();
  const { data: low } = useBelowMinimum();

  return (
    <div className="space-y-6">
      <section className={`${cardCls} overflow-hidden`}>
        <div className="px-5 pt-5 pb-3">
          <h2 className={sectionTitleCls}>Wartość magazynów</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3 font-medium">Magazyn</th>
              <th className="px-5 py-3 font-medium text-right">Wartość (po cenie zakupu)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {values?.map((v) => (
              <tr key={v.warehouseId} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-800">{v.warehouseName}</td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900">{v.value.toFixed(2)} zł</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={`${cardCls} overflow-hidden`}>
        <div className="px-5 pt-5 pb-3">
          <h2 className={sectionTitleCls}>Produkty poniżej minimum</h2>
        </div>
        {low && low.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">Produkt</th>
                <th className="px-5 py-3 font-medium">Magazyn</th>
                <th className="px-5 py-3 font-medium text-right">Stan</th>
                <th className="px-5 py-3 font-medium text-right">Minimum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {low.map((r) => (
                <tr key={r.productId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{r.sku}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{r.productName}</td>
                  <td className="px-5 py-3 text-gray-600">{r.warehouseName}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                      {r.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-500">{r.minStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-5 pb-5 text-sm text-gray-400">
            Wszystkie produkty powyżej stanu minimalnego.
          </div>
        )}
      </section>
    </div>
  );
}