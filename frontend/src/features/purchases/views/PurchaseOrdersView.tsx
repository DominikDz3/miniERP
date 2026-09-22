import { useState } from "react";
import { useNavigate } from "react-router";
import type { SortingState, PaginationState } from "@tanstack/react-table";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { PurchaseOrderFilters } from "../components/PurchaseOrderFilters";
import { PurchaseOrderTable } from "../components/PurchaseOrderTable";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { PurchaseOrderStatus } from "../types/purchase";

export function PurchaseOrdersView() {
  const navigate = useNavigate();
  const { hasAuthority } = useAuth();

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([{ id: "id", desc: true }]);
  const [applied, setApplied] = useState<{ status: PurchaseOrderStatus | ""; from: string; to: string }>({
    status: "", from: "", to: "",
  });

  const sortParam = sorting[0] ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}` : undefined;

  const { data, isLoading, isError, error, isFetching } = usePurchaseOrders({
    status: applied.status === "" ? undefined : applied.status,
    from: applied.from ? `${applied.from}T00:00:00` : undefined,
    to: applied.to ? `${applied.to}T23:59:59` : undefined,
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: sortParam,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Zamówienia zakupu</h1>
        {hasAuthority("PURCHASE_WRITE") && (
          <button onClick={() => navigate("/purchase-orders/new")}
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm cursor-pointer">
            Nowe zamówienie
          </button>
        )}
      </div>

      <PurchaseOrderFilters
        onApply={(f) => {
          setApplied(f);
          setPagination((p) => ({ ...p, pageIndex: 0 }));   // nowy filtr -> strona 1
        }}
      />

      {isError && <p className="text-red-600 mb-4">Błąd ładowania: {(error as Error).message}</p>}

      <PurchaseOrderTable
        data={data?.content ?? []}
        isLoading={isLoading} isFetching={isFetching}
        totalElements={data?.totalElements ?? 0}
        pageNumber={data?.number ?? 0}
        totalPages={data?.totalPages ?? 0}
        sorting={sorting} onSortingChange={setSorting}
        pagination={pagination} onPaginationChange={setPagination}
        onRowClick={(id) => navigate(`/purchase-orders/${id}`)}
      />
    </div>
  );
}