import { useNavigate } from "react-router";
import { useActiveWarehouses } from "@/features/warehouses/hooks/useWarehouses";
import { useAuth } from "@/features/auth/context/AuthContext";

export function WarehousesView() {
  const navigate = useNavigate();
  const { hasAuthority } = useAuth();
  const { data: warehouses, isLoading, isError } = useActiveWarehouses();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Magazyny</h1>
        {hasAuthority("WAREHOUSE_MANAGE") && (
          <button
            onClick={() => navigate("/warehouses/new")}
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm">
            Dodaj magazyn
          </button>
        )}
      </div>

      {isError && <p className="text-red-600 mb-4">Błąd ładowania magazynów.</p>}
      {isLoading && <p className="text-gray-400">Ładowanie…</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses?.map((w) => (
          <button
            key={w.id}
            onClick={() => navigate(`/warehouses/${w.id}`)}
            className="text-left bg-white rounded-lg shadow p-5 hover:shadow-md transition cursor-pointer"
          >
            <h2 className="text-lg font-semibold mb-1">{w.name}</h2>
            <p className="text-gray-500 text-sm">{w.city}</p>
            <span className="inline-block mt-3 text-xs">
              {w.active
                ? <span className="text-green-700">aktywny</span>
                : <span className="text-gray-400">nieaktywny</span>}
            </span>
          </button>
        ))}
      </div>

      {warehouses && warehouses.length === 0 && (
        <p className="text-gray-400">Brak magazynów.</p>
      )}
    </div>
  );
}