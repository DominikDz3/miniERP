import { useState } from "react";
import { useNavigate } from "react-router";
import type { SortingState, PaginationState } from "@tanstack/react-table";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { SupplierFilters, type ActiveFilter } from "@/features/suppliers/components/SupplierFilters";
import { SupplierTable } from "@/features/suppliers/components/SupplierTable";
import { useAuth } from "@/features/auth/context/AuthContext";

export function SuppliersView() {
  const navigate = useNavigate();
  const { hasAuthority } = useAuth();

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("active");

  const sortParam = sorting[0] ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}` : undefined;
  const activeParam = activeFilter === "all" ? undefined : activeFilter === "active";

  const { data, isLoading, isError, error, isFetching } = useSuppliers({
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
          <h1 className="text-2xl font-semibold">Dostawcy</h1>
          <p className="text-sm text-gray-400 mt-1">{data?.totalElements ?? 0} dostawców w kartotece</p>
        </div>
        {hasAuthority("SUPPLIER_WRITE") && (
          <button
            onClick={() => navigate("/suppliers/new")}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 cursor-pointer flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> Nowy dostawca
          </button>
        )}
      </div>

      <SupplierFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); resetToFirstPage(); }}
        activeFilter={activeFilter}
        onActiveChange={(v) => { setActiveFilter(v); resetToFirstPage(); }}
      />

      {isError && (
        <p className="text-red-600 mb-4">Błąd ładowania: {(error as Error).message}</p>
      )}

      <SupplierTable
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
        onRowClick={(id) => navigate(`/suppliers/${id}`)}
      />
    </div>
  );
}