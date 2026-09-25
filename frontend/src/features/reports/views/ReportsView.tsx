import { useState } from "react";
import type { Granularity } from "../types/reports";
import { SalesTab } from "../components/SalesTab";
import { PurchasesTab } from "../components/PurchaseTab";
import { MarginTab } from "../components/MarginTab";
import { WarehouseTab } from "../components/WarehouseTab";
import { RankingsTab } from "../components/RankingsTab";
import { labelCls, inputCls } from "@/shared/components/formStyles";

type Tab = "sales" | "purchases" | "margin" | "warehouse" | "rankings";

const TABS: { id: Tab; label: string }[] = [
  { id: "sales",     label: "Sprzedaż" },
  { id: "purchases", label: "Zakupy" },
  { id: "margin",    label: "Marża" },
  { id: "warehouse", label: "Magazyn" },
  { id: "rankings",  label: "Rankingi" },
];

export function ReportsView() {
  const [tab, setTab] = useState<Tab>("sales");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [granularity, setGranularity] = useState<Granularity>("month");

  const [applied, setApplied] = useState({ from: "", to: "", granularity: "month" as Granularity });

  const showFilters = tab !== "warehouse";

  function renderTab() {
    switch (tab) {
      case "sales":     return <SalesTab from={applied.from} to={applied.to} granularity={applied.granularity} />;
      case "purchases": return <PurchasesTab from={applied.from} to={applied.to} granularity={applied.granularity} />;
      case "margin":    return <MarginTab from={applied.from} to={applied.to} />;
      case "warehouse": return <WarehouseTab />;
      case "rankings":  return <RankingsTab from={applied.from} to={applied.to} />;
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Raporty i analizy</h1>
        <p className="text-sm text-gray-400 mt-1">Zestawienia sprzedaży, zakupów, rentowności i stanów magazynowych</p>
      </div>

      <div className="flex gap-2 border-b border-gray-100 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              "px-4 py-2.5 text-sm cursor-pointer border-b-2 -mb-px transition-colors " +
              (tab === t.id
                ? "border-blue-600 text-blue-600 font-medium"
                : "border-transparent text-gray-500 hover:text-gray-700")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-44">
              <label className={labelCls}>Od</label>
              <input
                type="date"
                className={inputCls}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="w-44">
              <label className={labelCls}>Do</label>
              <input
                type="date"
                className={inputCls}
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            {(tab === "sales" || tab === "purchases") && (
              <div className="w-48">
                <label className={labelCls}>Grupowanie</label>
                <select
                  className={inputCls}
                  value={granularity}
                  onChange={(e) => setGranularity(e.target.value as Granularity)}
                >
                  <option value="day">Dziennie</option>
                  <option value="week">Tygodniowo</option>
                  <option value="month">Miesięcznie</option>
                </select>
              </div>
            )}

            <button
              onClick={() => setApplied({ from, to, granularity })}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer"
            >
              Filtruj
            </button>
          </div>
        </div>
      )}

      {renderTab()}
    </div>
  );
}