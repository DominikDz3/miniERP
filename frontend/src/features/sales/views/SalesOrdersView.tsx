import { useState } from "react";
import { useNavigate } from "react-router";
import type { SortingState, PaginationState } from "@tanstack/react-table";
import { useSalesOrders } from "../hooks/useSalesOrders";
import { SalesOrderFilters } from "../components/SalesOrderFilters";
import { SalesOrderTable } from "../components/SalesOrderTable";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { SalesOrderStatus } from "../types/sales";

export function SalesOrdersView() {
  const navigate = useNavigate();
  const { hasAuthority } = useAuth();

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([{ id: "id", desc: true }]);
  const [status, setStatus] = useState<SalesOrderStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const sortParam = sorting[0] ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}` : undefined;

  const { data, isLoading, isError, error, isFetching } = useSalesOrders({
    status: status === "" ? undefined : status,
    from: from ? `${from}T00:00:00` : undefined,
    to: to ? `${to}T23:59:59` : undefined,
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: sortParam,
  });

  const resetToFirstPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Zamówienia</h1>
        {hasAuthority("SALES_WRITE") && (
          <button
            onClick={() => navigate("/sales-orders/new")}
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm cursor-pointer">
            Nowe zamówienie
          </button>
        )}
      </div>

      <SalesOrderFilters
        status={status}
        onStatusChange={(v) => { setStatus(v); resetToFirstPage(); }}
        from={from}
        onFromChange={(v) => { setFrom(v); resetToFirstPage(); }}
        to={to}
        onToChange={(v) => { setTo(v); resetToFirstPage(); }}
      />

      {isError && (
        <p className="text-red-600 mb-4">Błąd ładowania: {(error as Error).message}</p>
      )}

      <SalesOrderTable
        data={data?.content ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        totalElements={data?.totalElements ?? 0}
        pageNumber={data?.number ?? 0}
        totalPages={data?.totalPages ?? 0}
        sorting={sorting}
        onSortingChange={setSorting}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(id) => navigate(`/sales-orders/${id}`)}
      />
    </div>
  );
}