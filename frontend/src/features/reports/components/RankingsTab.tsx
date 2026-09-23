import { useTopProducts, useTopCustomers } from "../hooks/useReports";

export function RankingsTab({ from, to }: { from: string; to: string }) {
  const { data: products } = useTopProducts(from, to);
  const { data: customers } = useTopCustomers(from, to);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-medium text-gray-600 mb-3">Najlepiej sprzedające się produkty</h2>
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr>
              <th className="py-2 font-medium text-gray-500">SKU</th>
              <th className="py-2 font-medium text-gray-500">Produkt</th>
              <th className="py-2 font-medium text-gray-500 text-right">Ilość</th>
              <th className="py-2 font-medium text-gray-500 text-right">Wartość netto</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((r) => (
              <tr key={r.productId} className="border-t">
                <td className="py-2 font-mono text-xs">{r.sku}</td>
                <td className="py-2">{r.productName}</td>
                <td className="py-2 text-right">{r.totalQuantity}</td>
                <td className="py-2 text-right">{r.totalNet.toFixed(2)} zł</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-medium text-gray-600 mb-3">Najaktywniejsi klienci</h2>
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr>
              <th className="py-2 font-medium text-gray-500">Klient</th>
              <th className="py-2 font-medium text-gray-500 text-right">Zamówienia</th>
              <th className="py-2 font-medium text-gray-500 text-right">Wartość brutto</th>
            </tr>
          </thead>
          <tbody>
            {customers?.map((r) => (
              <tr key={r.customerId} className="border-t">
                <td className="py-2">{r.customerName}</td>
                <td className="py-2 text-right">{r.ordersCount}</td>
                <td className="py-2 text-right">{r.totalGross.toFixed(2)} zł</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}