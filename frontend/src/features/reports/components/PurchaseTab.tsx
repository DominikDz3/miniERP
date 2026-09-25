import { usePurchaseReport } from "../hooks/useReports";
import type { Granularity } from "../types/reports";
import { formatPeriod } from "../utils/formatPeriod";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-5";
const sectionTitleCls = "text-sm font-medium text-gray-500 mb-4";

export function PurchasesTab({ from, to, granularity }: { from: string; to: string; granularity: Granularity }) {
  const { data, isLoading, isError } = usePurchaseReport(from, to, granularity);

  if (isLoading) return <p className="text-gray-500">Ładowanie…</p>;
  if (isError) return <p className="text-red-600">Błąd ładowania raportu.</p>;
  if (!data || data.length === 0) return <p className="text-gray-400">Brak danych w wybranym okresie.</p>;

  const chartData = data.map((r) => ({
    period: formatPeriod(r.period, granularity),
    brutto: r.totalGross,
  }));

  return (
    <div className="space-y-6">
      <section className={cardCls}>
        <h2 className={sectionTitleCls}>Zakupy brutto w czasie</h2>
        <div className="pt-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="period" stroke="#9ca3af" fontSize={12} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "0.75rem", border: "1px solid #f3f4f6", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                formatter={(v) => [`${Number(v).toFixed(2)} zł`, "Brutto"]}
              />
              <Bar dataKey="brutto" fill="#16a34a" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={`${cardCls} p-0 overflow-hidden`}>
        <h2 className={`${sectionTitleCls} px-5 pt-5 mb-2`}>Szczegóły</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3 font-medium">Okres</th>
              <th className="px-5 py-3 font-medium text-right">Zamówienia</th>
              <th className="px-5 py-3 font-medium text-right">Netto</th>
              <th className="px-5 py-3 font-medium text-right">Brutto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-800">{formatPeriod(r.period, granularity)}</td>
                <td className="px-5 py-3 text-right text-gray-600">{r.ordersCount}</td>
                <td className="px-5 py-3 text-right text-gray-800">{r.totalNet.toFixed(2)} zł</td>
                <td className="px-5 py-3 text-right font-medium text-gray-900">{r.totalGross.toFixed(2)} zł</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}