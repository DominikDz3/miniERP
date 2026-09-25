import { useNavigate } from "react-router";
import { useActiveWarehouses } from "@/features/warehouses/hooks/useWarehouses";
import { useAuth } from "@/features/auth/context/AuthContext";

export function WarehousesView() {
  const navigate = useNavigate();
  const { hasAuthority } = useAuth();
  const { data: warehouses, isLoading, isError } = useActiveWarehouses();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Magazyny</h1>
          <p className="text-sm text-gray-400 mt-1">{warehouses?.length ?? 0} aktywnych lokalizacji magazynowych</p>
        </div>
        {hasAuthority("WAREHOUSE_MANAGE") && (
          <button
            onClick={() => navigate("/warehouses/new")}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 cursor-pointer flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> Nowy magazyn
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
            className="text-left bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="text-lg font-semibold text-gray-800">{w.name}</h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                    w.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${w.active ? "bg-green-500" : "bg-gray-400"}`} />
                  {w.active ? "Aktywny" : "Nieaktywny"}
                </span>
              </div>
              <p className="text-gray-500 text-sm">{w.city}</p>
              {w.phone && <p className="text-xs text-gray-400 mt-1">tel. {w.phone}</p>}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-blue-600 font-medium">
              <span>Zobacz szczegóły</span>
            </div>
          </button>
        ))}
      </div>

      {warehouses && warehouses.length === 0 && (
        <p className="text-gray-400">Brak magazynów.</p>
      )}
    </div>
  );
}