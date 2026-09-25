import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  useReactTable, getCoreRowModel, flexRender,
  type ColumnDef, type SortingState, type PaginationState,
} from "@tanstack/react-table";
import { useProducts, useActiveCategories } from "@/features/products/hooks/useProducts";
import type { ProductResponse } from "@/features/products/types/catalog";
import { labelCls, inputCls } from "@/shared/components/formStyles";

function sortArrow(sortState: false | "asc" | "desc") {
  if (sortState === "asc") return " ▲";
  if (sortState === "desc") return " ▼";
  return "";
}

export function WarehouseProducts({ warehouseId }: { warehouseId: number }) {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");

  const { data: categories } = useActiveCategories();

  const sortParam = sorting[0] ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}` : undefined;

  const { data, isLoading, isError, error, isFetching } = useProducts({
    search: search || undefined,
    active: true,
    categoryId: categoryId === "" ? undefined : categoryId,
    warehouseId,
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: sortParam,
  });

  const resetToFirstPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));

  const columns = useMemo<ColumnDef<ProductResponse>[]>(() => [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: (cell) => <span className="font-mono text-xs text-gray-500">{cell.getValue() as string}</span>,
    },
    {
      accessorKey: "name",
      header: "Nazwa",
      cell: (cell) => <span className="font-medium text-gray-800">{cell.getValue() as string}</span>,
    },
    {
      accessorKey: "categoryName",
      header: "Kategoria",
      enableSorting: false,
      cell: (cell) => <span className="text-gray-500">{cell.getValue() as string}</span>,
    },
    {
      accessorKey: "stock",
      header: "Stan",
      cell: (cell) => {
        const stock = cell.getValue() as number;
        const low = stock <= cell.row.original.minStock;
        return (
          <span className={low ? "text-red-600 font-semibold" : "font-medium text-gray-800"}>
            {stock}
          </span>
        );
      },
    },
    {
      accessorKey: "minStock",
      header: "Min. stan",
      enableSorting: false,
      cell: (cell) => <span className="text-gray-500">{cell.getValue() as number}</span>,
    },
    {
      accessorKey: "unit",
      header: "Jedn.",
      enableSorting: false,
      cell: (cell) => <span className="text-gray-500">{cell.getValue() as string}</span>,
    },
  ], []);

  const table = useReactTable({
    data: data?.content ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: data?.totalPages ?? 0,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
  });

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-base font-semibold text-gray-800">Produkty w magazynie</h2>
        <p className="text-xs text-gray-400">Aktualne stany produktowe przypisane do tej lokalizacji</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className={labelCls}>Szukaj</label>
            <input
              className={inputCls}
              placeholder="Szukaj po SKU lub nazwie…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetToFirstPage(); }}
            />
          </div>
          <div className="w-56">
            <label className={labelCls}>Kategoria</label>
            <select
              className={inputCls}
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value ? Number(e.target.value) : ""); resetToFirstPage(); }}
            >
              <option value="">Wszystkie kategorie</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {(search || categoryId !== "") && (
            <button
              type="button"
              onClick={() => { setSearch(""); setCategoryId(""); resetToFirstPage(); }}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              Wyczyść
            </button>
          )}
        </div>
      </div>

      {isError && <p className="text-red-600 mb-4">Błąd ładowania: {(error as Error).message}</p>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();
                  return (
                    <th key={header.id} className="px-5 py-3 font-medium">
                      {header.isPlaceholder ? null : (
                        <button
                          className={canSort ? "flex items-center gap-1 uppercase tracking-wide cursor-pointer" : "uppercase tracking-wide"}
                          onClick={header.column.getToggleSortingHandler()}
                          disabled={!canSort}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortArrow(sortState)}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-gray-400">Ładowanie…</td></tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-gray-400">Brak produktów w tym magazynie</td></tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/products/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-gray-500">
          Strona {pagination.pageIndex + 1} z {Math.max(data?.totalPages ?? 0, 1)} · {data?.totalElements ?? 0} produktów
          {isFetching ? " · odświeżanie…" : ""}
        </span>
        <div className="flex gap-2">
          <button
            className="border rounded-lg px-3 py-1 disabled:opacity-40 cursor-pointer"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Poprzednia
          </button>
          <button
            className="border rounded-lg px-3 py-1 disabled:opacity-40 cursor-pointer"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Następna
          </button>
        </div>
      </div>
    </section>
  );
}