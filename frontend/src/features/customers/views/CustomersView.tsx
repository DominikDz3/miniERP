import { useState } from "react";
import { useNavigate } from "react-router";
import type { SortingState, PaginationState } from "@tanstack/react-table";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { CustomerFilters, type ActiveFilter } from "@/features/customers/components/CustomerFilters";
import { CustomerTable } from "@/features/customers/components/CustomerTable";

export function CustomersView() {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("active");

  const sortParam = sorting[0] ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}` : undefined;
  const activeParam = activeFilter === "all" ? undefined : activeFilter === "active";

  const { data, isLoading, isError, error, isFetching } = useCustomers({
    search: search || undefined,
    active: activeParam,
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: sortParam,
  });

  const resetToFirstPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Klienci</h1>
          <p className="text-sm text-gray-400 mt-1">{data?.totalElements ?? 0} kontrahentów</p>
        </div>
        <button
          onClick={() => navigate("/customers/new")}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 cursor-pointer flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Dodaj klienta
        </button>
      </div>

      <CustomerFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); resetToFirstPage(); }}
        activeFilter={activeFilter}
        onActiveChange={(v) => { setActiveFilter(v); resetToFirstPage(); }}
      />

      {isError && (
        <p className="text-red-600 mb-4">Błąd ładowania: {(error as Error).message}</p>
      )}

      <CustomerTable
        data={data?.content ?? []}
        pageCount={data?.totalPages ?? 0}
        isLoading={isLoading}
        isFetching={isFetching}
        totalElements={data?.totalElements ?? 0}
        pageNumber={data?.number ?? 0}
        totalPages={data?.totalPages ?? 0}
        sorting={sorting}
        onSortingChange={setSorting}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(id) => navigate(`/customers/${id}`)}
      />
    </div>
  );
}