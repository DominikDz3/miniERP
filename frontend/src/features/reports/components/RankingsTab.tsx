import { useTopProducts, useTopCustomers } from "../hooks/useReports";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100";
const sectionTitleCls = "text-sm font-medium text-gray-500";

export function RankingsTab({ from, to }: { from: string; to: string }) {
  const { data: products } = useTopProducts(from, to);
  const { data: customers } = useTopCustomers(from, to);

  return (
    <div className="space-y-6">
      <section className={`${cardCls} overflow-hidden`}>
        <div className="px-5 pt-5 pb-3">
          <h2 className={sectionTitleCls}>Najlepiej sprzedające się produkty</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="w-12 px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">SKU</th>
              <th className="px-5 py-3 font-medium">Produkt</th>
              <th className="px-5 py-3 font-medium text-right">Ilość</th>
              <th className="px-5 py-3 font-medium text-right">Wartość netto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products?.map((r, index) => (
              <tr key={r.productId} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 text-xs text-gray-400 font-mono">{index + 1}.</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{r.sku}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{r.productName}</td>
                <td className="px-5 py-3 text-right font-medium text-gray-800">{r.totalQuantity}</td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900">{r.totalNet.toFixed(2)} zł</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={`${cardCls} overflow-hidden`}>
        <div className="px-5 pt-5 pb-3">
          <h2 className={sectionTitleCls}>Najaktywniejsi klienci</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="w-12 px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Klient</th>
              <th className="px-5 py-3 font-medium text-right">Zamówienia</th>
              <th className="px-5 py-3 font-medium text-right">Wartość brutto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers?.map((r, index) => (
              <tr key={r.customerId} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 text-xs text-gray-400 font-mono">{index + 1}.</td>
                <td className="px-5 py-3 font-medium text-gray-800">{r.customerName}</td>
                <td className="px-5 py-3 text-right font-medium text-gray-800">{r.ordersCount}</td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900">{r.totalGross.toFixed(2)} zł</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}