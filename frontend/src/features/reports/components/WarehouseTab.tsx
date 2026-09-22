import { useWarehouseValue, useBelowMinimum } from "../hooks/useReports";

export function WarehouseTab() {
  const { data: values } = useWarehouseValue();
  const { data: low } = useBelowMinimum();

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-medium text-gray-600 mb-3">Wartość magazynów</h2>
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr>
              <th className="py-2 font-medium text-gray-500">Magazyn</th>
              <th className="py-2 font-medium text-gray-500 text-right">Wartość (po cenie zakupu)</th>
            </tr>
          </thead>
          <tbody>
            {values?.map((v) => (
              <tr key={v.warehouseId} className="border-t">
                <td className="py-2">{v.warehouseName}</td>
                <td className="py-2 text-right font-medium">{v.value.toFixed(2)} zł</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="font-medium text-gray-600 mb-3">Produkty poniżej minimum</h2>
        {low && low.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr>
                <th className="py-2 font-medium text-gray-500">SKU</th>
                <th className="py-2 font-medium text-gray-500">Produkt</th>
                <th className="py-2 font-medium text-gray-500">Magazyn</th>
                <th className="py-2 font-medium text-gray-500 text-right">Stan</th>
                <th className="py-2 font-medium text-gray-500 text-right">Minimum</th>
              </tr>
            </thead>
            <tbody>
              {low.map((r) => (
                <tr key={r.productId} className="border-t">
                  <td className="py-2 font-mono text-xs">{r.sku}</td>
                  <td className="py-2">{r.productName}</td>
                  <td className="py-2">{r.warehouseName}</td>
                  <td className="py-2 text-right text-red-600 font-medium">{r.stock}</td>
                  <td className="py-2 text-right">{r.minStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400">Wszystkie produkty powyżej minimum.</p>
        )}
      </section>
    </div>
  );
}