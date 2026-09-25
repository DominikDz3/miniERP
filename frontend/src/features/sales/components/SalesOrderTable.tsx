import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type OnChangeFn,
} from "@tanstack/react-table";
import type { SalesOrderResponse } from "../types/sales";
import { StatusBadge } from "./StatusBadge";

interface Props {
  data: SalesOrderResponse[];
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

// strzałka sortowania przy nagłówku
function sortArrow(sortState: false | "asc" | "desc") {
  if (sortState === "asc") return " ▲";
  if (sortState === "desc") return " ▼";
  return "";
}

export function SalesOrderTable({
  data, isLoading, isFetching, totalElements, pageNumber, totalPages,
  sorting, onSortingChange, pagination, onPaginationChange, onRowClick,
}: Props) {
  const columns = useMemo<ColumnDef<SalesOrderResponse>[]>(() => {
    return [
      {
        accessorKey: "id",
        header: "Nr",
        cell: (cell) => <span className="font-mono text-xs text-gray-500">#{cell.getValue() as number}</span>,
      },
      {
        accessorKey: "customerName",
        header: "Klient",
        enableSorting: false,
        cell: (cell) => <span className="font-medium text-gray-800">{cell.getValue() as string}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: (cell) => <StatusBadge status={cell.getValue() as SalesOrderResponse["status"]} />,
      },
      {
        accessorKey: "totalGross",
        header: "Wartość brutto",
        enableSorting: false,
        cell: (cell) => (
          <span className="text-gray-800">{(cell.getValue() as number).toFixed(2)} zł</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Data",
        cell: (cell) => (
          <span className="text-gray-500">{new Date(cell.getValue() as string).toLocaleString("pl-PL")}</span>
        ),
      },
    ];
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
    state: { pagination, sorting },
    onPaginationChange,
    onSortingChange,
  });

  return (
    <>
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
                          disabled={!canSort}>
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
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-gray-400">Ładowanie…</td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-gray-400">Brak zamówień</td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => onRowClick(row.original.id)}>
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
          Strona {pageNumber + 1} z {Math.max(totalPages, 1)} · {totalElements} zamówień
          {isFetching ? " · odświeżanie…" : ""}
        </span>
        <div className="flex gap-2">
          <button
            className="border rounded-lg px-3 py-1 disabled:opacity-40 cursor-pointer"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            Poprzednia
          </button>
          <button
            className="border rounded-lg px-3 py-1 disabled:opacity-40 cursor-pointer"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            Następna
          </button>
        </div>
      </div>
    </>
  );
}