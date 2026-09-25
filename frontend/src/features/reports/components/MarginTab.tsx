import { useMargin } from "../hooks/useReports";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100";
const sectionTitleCls = "text-sm font-medium text-gray-500";

export function MarginTab({ from, to }: { from: string; to: string }) {
  const { data, isLoading, isError } = useMargin(from, to);

  if (isLoading) return <p className="text-gray-500">Ładowanie…</p>;
  if (isError) return <p className="text-red-600">Błąd ładowania raportu.</p>;
  if (!data || data.length === 0) return <p className="text-gray-400">Brak danych w wybranym okresie.</p>;

  const totalMargin = data.reduce((s, r) => s + r.margin, 0);
  const totalRevenue = data.reduce((s, r) => s + r.revenue, 0);
  const totalCost = data.reduce((s, r) => s + r.cost, 0);

  return (
    <section className={`${cardCls} overflow-hidden`}>
      <div className="px-5 pt-5 pb-3">
        <h2 className={sectionTitleCls}>Marża per produkt</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
            <th className="px-5 py-3 font-medium">SKU</th>
            <th className="px-5 py-3 font-medium">Produkt</th>
            <th className="px-5 py-3 font-medium text-right">Przychód</th>
            <th className="px-5 py-3 font-medium text-right">Koszt</th>
            <th className="px-5 py-3 font-medium text-right">Marża</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((r) => (
            <tr key={r.productId} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3 font-mono text-xs text-gray-500">{r.sku}</td>
              <td className="px-5 py-3 font-medium text-gray-800">{r.productName}</td>
              <td className="px-5 py-3 text-right text-gray-800">{r.revenue.toFixed(2)} zł</td>
              <td className="px-5 py-3 text-right text-gray-600">{r.cost.toFixed(2)} zł</td>
              <td className="px-5 py-3 text-right font-semibold text-gray-900">{r.margin.toFixed(2)} zł</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-100 bg-gray-50/50 font-semibold text-gray-800">
            <td className="px-5 py-3" colSpan={2}>Razem</td>
            <td className="px-5 py-3 text-right">{totalRevenue.toFixed(2)} zł</td>
            <td className="px-5 py-3 text-right">{totalCost.toFixed(2)} zł</td>
            <td className="px-5 py-3 text-right text-blue-600">{totalMargin.toFixed(2)} zł</td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}