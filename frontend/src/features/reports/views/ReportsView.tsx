import { useState } from "react";
import type { Granularity } from "../types/reports";
import { SalesTab } from "../components/SalesTab";
import { PurchasesTab } from "../components/PurchaseTab";
import { MarginTab } from "../components/MarginTab";
import { WarehouseTab } from "../components/WarehouseTab";
import { RankingsTab } from "../components/RankingsTab";

type Tab = "sales" | "purchases" | "margin" | "warehouse" | "rankings";

const TABS: { id: Tab; label: string }[] = [
  { id: "sales",     label: "Sprzedaż" },
  { id: "purchases", label: "Zakupy" },
  { id: "margin",    label: "Marża" },
  { id: "warehouse", label: "Magazyn" },
  { id: "rankings",  label: "Rankingi" },
];

const inputCls = "border rounded px-3 py-2 text-sm";

export function ReportsView() {
  const [tab, setTab] = useState<Tab>("sales");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [granularity, setGranularity] = useState<Granularity>("month");

  const [applied, setApplied] = useState({from: "", to: "", granularity: "month" as Granularity });

  function renderTab() {
    switch (tab) {
      case "sales":     return <SalesTab from={applied.from} to={applied.to} granularity={granularity} />;
      case "purchases": return <PurchasesTab from={applied.from} to={applied.to} granularity={granularity} />;
      case "margin":    return <MarginTab from={applied.from} to={applied.to} />;
      case "warehouse": return <WarehouseTab />;
      case "rankings":  return <RankingsTab from={applied.from} to={applied.to} />;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Raporty</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="self-center text-gray-400">–</span>
        <input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} />
        <select className={inputCls} value={granularity}
          onChange={(e) => setGranularity(e.target.value as Granularity)}>
          <option value="day">Dziennie</option>
          <option value="week">Tygodniowo</option>
          <option value="month">Miesięcznie</option>
        </select>
        <button
          onClick={() => setApplied({ from, to, granularity })}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm cursor-pointer">
          Filtruj
        </button>
      </div>

      <div className="flex gap-1 border-b mb-4">
        {TABS.map((t) => (
          <button key={t.id}
            onClick={() => setTab(t.id)}
            className={
              "px-4 py-2 text-sm cursor-pointer border-b-2 -mb-px " +
              (tab === t.id
                ? "border-blue-600 text-blue-600 font-medium"
                : "border-transparent text-gray-500 hover:text-gray-700")
            }>
            {t.label}
          </button>
        ))}
      </div>

      {renderTab()}
    </div>
  );
}