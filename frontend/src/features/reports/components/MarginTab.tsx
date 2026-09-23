import { useMargin } from "../hooks/useReports";

export function MarginTab({ from, to }: { from: string; to: string }) {
  const { data, isLoading, isError } = useMargin(from, to);

  if (isLoading) return <p className="text-gray-500">Ładowanie…</p>;
  if (isError) return <p className="text-red-600">Błąd ładowania raportu.</p>;
  if (!data || data.length === 0) return <p className="text-gray-400">Brak danych w wybranym okresie.</p>;

  const totalMargin = data.reduce((s, r) => s + r.margin, 0);

  return (
    <section className="bg-white rounded-lg shadow p-5">
      <h2 className="font-medium text-gray-600 mb-3">Marża per produkt</h2>
      <table className="w-full text-sm">
        <thead className="text-left">
          <tr>
            <th className="py-2 font-medium text-gray-500">SKU</th>
            <th className="py-2 font-medium text-gray-500">Produkt</th>
            <th className="py-2 font-medium text-gray-500 text-right">Przychód</th>
            <th className="py-2 font-medium text-gray-500 text-right">Koszt</th>
            <th className="py-2 font-medium text-gray-500 text-right">Marża</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.productId} className="border-t">
              <td className="py-2 font-mono text-xs">{r.sku}</td>
              <td className="py-2">{r.productName}</td>
              <td className="py-2 text-right">{r.revenue.toFixed(2)} zł</td>
              <td className="py-2 text-right">{r.cost.toFixed(2)} zł</td>
              <td className="py-2 text-right font-medium">{r.margin.toFixed(2)} zł</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t font-medium">
            <td className="py-2" colSpan={4}>Razem</td>
            <td className="py-2 text-right">{totalMargin.toFixed(2)} zł</td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}