import { useState } from "react";
import { useNavigate } from "react-router";
import type { SortingState, PaginationState } from "@tanstack/react-table";
import { useSalesOrders } from "@/features/sales/hooks/useSalesOrders";
import { SalesOrderTable } from "@/features/sales/components/SalesOrderTable";

interface Props {
  customerId: number;
}

export function CustomerOrderHistory({ customerId }: Props) {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([{ id: "id", desc: true }]);

  const sortParam = sorting[0] ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}` : undefined;

  const { data, isLoading, isError, error, isFetching } = useSalesOrders({
    customerId,
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: sortParam,
  });

  return (
    <div className="mt-6">
      <h2 className="text-sm font-medium text-gray-500 mb-3">Historia zamówień</h2>

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