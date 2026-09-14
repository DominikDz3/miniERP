import { useMemo } from "react";
import type { SupplierResponse } from "../types/supplier";
import {
    getCoreRowModel,
    flexRender,
    type OnChangeFn,
    type SortingState,
    type PaginationState,
    type ColumnDef,
    useReactTable,
} from "@tanstack/react-table";

interface Props {
    data: SupplierResponse[];
    pageCount: number;
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

export function SupplierTable({
    data,
    pageCount,
    isLoading,
    isFetching,
    totalElements,
    pageNumber,
    totalPages,
    sorting,
    onSortingChange,
    pagination,
    onPaginationChange,
    onRowClick,
}: Props) {
    const columns = useMemo<ColumnDef<SupplierResponse>[]>(() => {
        return [
            {
                accessorKey: "name",
                header: "Nazwa",
            },
            {
                accessorKey: "nip",
                header: "NIP",
                cell: (cell) =>  <span className="font-mono text-xs">{cell.getValue() as string}</span>
            },
            {
                accessorKey: "city",
                header: "Miasto",
            },
            {
                accessorKey: "email",
                header: "E-mail",
                enableSorting: false
            },
            {
                accessorKey: "active",
                header: "Status",
                enableSorting: false,
                cell: (cell) => (cell.getValue() as boolean)
                ? <span className="text-green-700">aktywny</span>
                : <span className="text-gray-400">nieaktywny</span>
            }
        ];
    }, []);

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pageCount,
    state: {
      pagination: pagination,
      sorting: sorting,
    },
    onPaginationChange: onPaginationChange,
    onSortingChange: onSortingChange,
  });

    return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();
                  return (
                    <th key={header.id} className="px-4 py-3 font-medium text-gray-600">
                      {header.isPlaceholder ? null : (
                        <button
                          className={canSort ? "flex items-center gap-1" : ""}
                          onClick={header.column.getToggleSortingHandler()}
                          disabled={!canSort}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortState === "asc" ? " ▲" : sortState === "desc" ? " ▼" : ""}
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
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">Brak dostawców</td></tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => onRowClick(row.original.id)}
                >
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
          Strona {pageNumber + 1} z {Math.max(totalPages, 1)} · {totalElements} dostawców
          {isFetching ? " · odświeżanie…" : ""}
        </span>
        <div className="flex gap-2">
          <button className="border rounded px-3 py-1 disabled:opacity-40"
            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Poprzednia
          </button>
          <button className="border rounded px-3 py-1 disabled:opacity-40"
            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Następna
          </button>
        </div>
      </div>
    </>
  );
}