import type { MovementType } from "@/features/warehouses/types/warehouses";

const TYPE_CONFIG: Record<MovementType, { label: string; icon: string; color: string }> = {
  PRZYJECIE:    { label: "Przyjęcie",   icon: "↓", color: "text-green-600 bg-green-50" },
  WYDANIE:      { label: "Wydanie",     icon: "↑", color: "text-red-600 bg-red-50" },
  PRZESUNIECIE: { label: "Przesunięcie", icon: "⇄", color: "text-blue-600 bg-blue-50" },
};

interface Props {
  type: MovementType;
  productName: string | null;
  quantity: number;
  createdAt: string;
  performedBy: string;
}

export function MovementItem({ type, productName, quantity, createdAt, performedBy }: Props) {
  const cfg = TYPE_CONFIG[type];
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={`flex items-center justify-center w-10 h-10 rounded-full text-xl font-bold ${cfg.color}`}>
        {cfg.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-800 truncate">
          <span className="font-medium">{cfg.label}</span> · {productName ?? "—"}
        </div>
        <div className="text-xs text-gray-400">
          {performedBy} · {new Date(createdAt).toLocaleString("pl-PL")}
        </div>
      </div>
      <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
        {quantity} szt
      </div>
    </div>
  );
}