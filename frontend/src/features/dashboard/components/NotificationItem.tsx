interface Props {
  productName: string;
  warehouseName: string;
  stock: number;
  minStock: number;
}

export function NotificationItem({ productName, warehouseName, stock, minStock }: Props) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
      <span className="text-amber-500 text-lg leading-none mt-0.5">⚠</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800">Niski stan magazynowy</div>
        <div className="text-sm text-gray-600 truncate">
          {productName} <span className="text-gray-400">· {warehouseName}</span>
        </div>
        <div className="text-xs text-amber-700 mt-0.5">
          Stan: {stock} / minimum: {minStock}
        </div>
      </div>
    </div>
  );
}