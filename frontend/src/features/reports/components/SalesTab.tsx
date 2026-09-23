import { useSalesReport } from "../hooks/useReports";
import type { Granularity } from "../types/reports";
import { formatPeriod } from "../utils/formatPeriod";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export function SalesTab({ from, to, granularity }: { from: string; to: string; granularity: Granularity }) {
  const { data, isLoading, isError } = useSalesReport(from, to, granularity);

  if (isLoading) return <p className="text-gray-500">Ładowanie…</p>;
  if (isError) return <p className="text-red-600">Błąd ładowania raportu.</p>;
  if (!data || data.length === 0) return <p className="text-gray-400">Brak danych w wybranym okresie.</p>;

  const chartData = data.map((r) => ({
    period: formatPeriod(r.period, granularity),
    brutto: r.totalGross,
  }));

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-medium text-gray-600 mb-3">Sprzedaż brutto w czasie</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={(v) => `${Number(v).toFixed(2)} zł`} />
            <Bar dataKey="brutto" fill="#2563eb" maxBarSize={80} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-medium text-gray-600 mb-3">Szczegóły</h2>
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr>
              <th className="py-2 font-medium text-gray-500">Okres</th>
              <th className="py-2 font-medium text-gray-500 text-right">Zamówienia</th>
              <th className="py-2 font-medium text-gray-500 text-right">Netto</th>
              <th className="py-2 font-medium text-gray-500 text-right">Brutto</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="py-2">{formatPeriod(r.period, granularity)}</td>
                <td className="py-2 text-right">{r.ordersCount}</td>
                <td className="py-2 text-right">{r.totalNet.toFixed(2)} zł</td>
                <td className="py-2 text-right">{r.totalGross.toFixed(2)} zł</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}