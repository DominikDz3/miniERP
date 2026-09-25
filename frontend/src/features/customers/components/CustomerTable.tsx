import { useMemo } from "react";
import {
  useReactTable, getCoreRowModel, flexRender,
  type ColumnDef, type SortingState, type PaginationState, type OnChangeFn,
} from "@tanstack/react-table";
import type { CustomerResponse } from "@/features/customers/types/customer";

interface Props {
  data: CustomerResponse[];
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

export function CustomerTable({
  data, pageCount, isLoading, isFetching, totalElements, pageNumber, totalPages,
  sorting, onSortingChange, pagination, onPaginationChange, onRowClick,
}: Props) {
  const columns = useMemo<ColumnDef<CustomerResponse>[]>(() => [
    { accessorKey: "name", header: "Nazwa",
      cell: (c) => <span className="font-medium text-gray-800">{c.getValue() as string}</span> },
    { accessorKey: "nip", header: "NIP",
      cell: (c) => <span className="font-mono text-xs text-gray-500">{(c.getValue() as string) ?? "—"}</span> },
    { accessorKey: "email", header: "E-mail", cell: (c) => <span className="text-gray-600">{c.getValue() as string}</span> },
    {
      accessorKey: "active", header: "Status", enableSorting: false,
      cell: (c) => (c.getValue() as boolean) ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Aktywny
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Nieaktywny
        </span>
      ),
    },
  ], []);

  const table = useReactTable({
    data, columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, manualSorting: true, pageCount,
    state: { pagination, sorting },
    onPaginationChange, onSortingChange,
  });

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-5 py-3 font-medium">
                    {h.isPlaceholder ? null : (
                      <button
                        className={h.column.getCanSort() ? "flex items-center gap-1 uppercase tracking-wide cursor-pointer" : "uppercase tracking-wide"}
                        onClick={h.column.getToggleSortingHandler()}
                        disabled={!h.column.getCanSort()}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {{ asc: " ▲", desc: " ▼" }[h.column.getIsSorted() as string] ?? ""}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-gray-400">Ładowanie…</td></tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-gray-400">Brak klientów</td></tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}
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
          {`Strona ${pageNumber + 1} z ${Math.max(totalPages, 1)} · ${totalElements} klientów`}
          {isFetching && " · odświeżanie..."}
        </span>
        <div className="flex gap-2">
          <button className="border rounded-lg px-3 py-1 disabled:opacity-40 cursor-pointer"
            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Poprzednia</button>
          <button className="border rounded-lg px-3 py-1 disabled:opacity-40 cursor-pointer"
            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Następna</button>
        </div>
      </div>
    </>
  );
}