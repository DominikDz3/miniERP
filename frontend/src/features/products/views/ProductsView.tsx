import { useState } from "react";
import { useNavigate } from "react-router";
import type { SortingState, PaginationState } from "@tanstack/react-table";
import { useProducts, useActiveCategories } from "@/features/products/hooks/useProducts";
import { ProductFilters, type ActiveFilter } from "@/features/products/components/ProductFilters";
import { ProductTable } from "@/features/products/components/ProductTable";
import { useAuth } from "@/features/auth/context/AuthContext";

export function ProductsView() {
  const navigate = useNavigate();
  const { hasAuthority } = useAuth();

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("active");
  const [categoryId, setCategoryId] = useState<number | "">("");

  const { data: categories } = useActiveCategories();

  const sortParam = sorting[0] ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}` : undefined;
  const activeParam = activeFilter === "all" ? undefined : activeFilter === "active";

  const { data, isLoading, isError, error, isFetching } = useProducts({
    search: search || undefined,
    active: activeParam,
    categoryId: categoryId === "" ? undefined : categoryId,
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: sortParam,
  });

  const resetToFirstPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Produkty</h1>
        <div className="flex gap-3 items-right">
        {hasAuthority("PRODUCT_WRITE") && (
          <button
            onClick={() => navigate("/categories/new")}
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm cursor-pointer">
            Dodaj kategorię
          </button>
        )}

        {hasAuthority("PRODUCT_WRITE") && (
          <button
            onClick={() => navigate("/products/new")}
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm cursor-pointer">
            Dodaj produkt
          </button>
        )}
        </div>     
      </div>

      <ProductFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); resetToFirstPage(); }}
        activeFilter={activeFilter}
        onActiveChange={(v) => { setActiveFilter(v); resetToFirstPage(); }}
        categoryId={categoryId}
        onCategoryChange={(v) => { setCategoryId(v); resetToFirstPage(); }}
        categories={categories ?? []}
      />

      {isError && (
        <p className="text-red-600 mb-4">Błąd ładowania: {(error as Error).message}</p>
      )}

      <ProductTable
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
        onRowClick={(id) => navigate(`/products/${id}`)}
      />
    </div>
  );
}