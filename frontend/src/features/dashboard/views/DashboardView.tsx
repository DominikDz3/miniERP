import { useDashboardSummary } from "../hooks/useDashboard";
import { useSalesReport, useBelowMinimum } from "@/features/reports/hooks/useReports";
import { useStockMovements } from "@/features/warehouses/hooks/useStockMovements";
import { Card } from "../components/Card";
import { NotificationItem } from "../components/NotificationItem";
import { MovementItem } from "../components/MovementItem";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

function monthRange(): { from: string; to: string } {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(first), to: iso(now) };
}

export function DashboardView() {
  const { data: summary, isLoading } = useDashboardSummary();
  const { from, to } = monthRange();
  const { data: sales } = useSalesReport(from, to, "day");
  const { data: low } = useBelowMinimum();
  const { data: movements } = useStockMovements({ page: 0, size: 5, sort: "createdAt,desc" });

  const monthLabel = new Date().toLocaleDateString("pl-PL", { month: "long", year: "numeric" });

  if (isLoading || !summary) return <p className="text-gray-500">Ładowanie…</p>;

  const chartData = (sales ?? []).map((r) => ({
    period: new Date(r.period).toLocaleDateString("pl-PL"),
    brutto: r.totalGross,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Pulpit</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Klienci" value={String(summary.customersCount)} />
        <Card label="Produkty" value={String(summary.productsCount)} />
        <Card label="Aktywne zamówienia" value={String(summary.activeOrdersCount)} />
        <Card label="Wartość magazynu" value={`${summary.warehouseValue.toFixed(2)} zł`} />
        <Card label="Sprzedaż" value={`${summary.salesValueThisMonth.toFixed(2)} zł`} hint={monthLabel} />
        <Card label="Zakupy" value={`${summary.purchasesValueThisMonth.toFixed(2)} zł`} hint={monthLabel} />
        <Card label="Produkty poniżej minimum" value={String(summary.lowStockCount)} />
      </div>

      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-medium text-gray-600 mb-3 flex items-center gap-2">
        Powiadomienia
          {low && low.length > 0 && (
            <span className="ml-auto text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5 font-medium">
              {low.length}
            </span>
          )}
        </h2>
        {low && low.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-auto">
            {low.slice(0, 10).map((r) => (
              <NotificationItem
                key={r.productId}
                productName={r.productName}
                warehouseName={r.warehouseName}
                stock={r.stock}
                minStock={r.minStock}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-3xl mb-2">✓</div>
            <p className="text-sm">Brak powiadomień</p>
          </div>
        )}
      </section>

       <section className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-gray-600">Sprzedaż w tym miesiącu</h2>
          <div className="text-right">
            <div className="text-xs text-gray-400">Łącznie ({monthLabel})</div>
            <div className="text-lg font-semibold text-gray-800">
              {summary.salesValueThisMonth.toFixed(2)} zł
            </div>
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v} zł`}
              />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                formatter={(v) => [`${Number(v).toFixed(2)} zł`, "Brutto"]}
              />
              <Bar dataKey="brutto" fill="url(#salesGradient)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm">Brak sprzedaży w tym miesiącu.</p>
          </div>
        )}
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-medium text-gray-600 mb-3">Ostatnie operacje magazynowe</h2>
        {movements && movements.content.length > 0 ? (
          <div className="divide-y">
            {movements.content.map((m) => (
              <MovementItem
                key={m.id}
                type={m.type}
                productName={m.productName}
                quantity={m.quantity}
                createdAt={m.createdAt}
                performedBy={m.performedBy}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Brak operacji.</p>
        )}
      </section>
    </div>
  );
}