import { useMemo } from "react";
import {
  useReactTable, getCoreRowModel, flexRender,
  type ColumnDef, type SortingState, type PaginationState, type OnChangeFn,
} from "@tanstack/react-table";
import type { PurchaseOrderResponse } from "../types/purchase";
import { StatusBadge } from "./StatusBadge";

interface Props {
  data: PurchaseOrderResponse[];
  isLoading: boolean;
  isFetching: boolean;
  totalElements: number;
  pageNumber: number;
  totalPages: number;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onRowClick: (id: number) => void;
}

export function PurchaseOrderTable({
  data, isLoading, isFetching, totalElements, pageNumber, totalPages,
  sorting, onSortingChange, pagination, onPaginationChange, onRowClick,
}: Props) {
  const columns = useMemo<ColumnDef<PurchaseOrderResponse>[]>(() => [
    {
      accessorKey: "id", header: "Nr",
      cell: (c) => <span className="font-mono text-xs">#{c.getValue() as number}</span>,
    },
    { accessorKey: "supplierName", header: "Dostawca", enableSorting: false },
    { accessorKey: "warehouseName", header: "Magazyn", enableSorting: false },
    {
      accessorKey: "status", header: "Status", enableSorting: false,
      cell: (c) => <StatusBadge status={c.getValue() as PurchaseOrderResponse["status"]} />,
    },
    {
      accessorKey: "totalGross", header: "Wartość brutto", enableSorting: false,
      cell: (c) => (c.getValue() as number).toFixed(2) + " zł",
    },
    {
      accessorKey: "createdAt", header: "Data",
      cell: (c) => new Date(c.getValue() as string).toLocaleString("pl-PL"),
    },
  ], []);

  const table = useReactTable({
    data, columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, manualSorting: true,
    pageCount: totalPages,
    state: { pagination, sorting },
    onPaginationChange, onSortingChange,
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const canSort = h.column.getCanSort();
                  const s = h.column.getIsSorted();
                  return (
                    <th key={h.id} className="px-4 py-3 font-medium text-gray-600">
                      {h.isPlaceholder ? null : (
                        <button className={canSort ? "flex items-center gap-1" : ""}
                          onClick={h.column.getToggleSortingHandler()} disabled={!canSort}>
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {s === "asc" ? " ▲" : s === "desc" ? " ▼" : ""}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">Ładowanie…</td></tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">Brak zamówień</td></tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => onRowClick(row.original.id)}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
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
          Strona {pageNumber + 1} z {Math.max(totalPages, 1)} · {totalElements} zamówień
          {isFetching ? " · odświeżanie…" : ""}
        </span>
        <div className="flex gap-2">
          <button className="border rounded px-3 py-1 disabled:opacity-40"
            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Poprzednia</button>
          <button className="border rounded px-3 py-1 disabled:opacity-40"
            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Następna</button>
        </div>
      </div>
    </>
  );
}