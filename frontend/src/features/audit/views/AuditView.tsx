import { useState } from "react";
import { useAuditLog } from "../hooks/useAudit";
import { AuditFilters } from "../components/AuditFilters";
import { AuditRow } from "../components/AuditRow";
import type { AuditAction, AuditEntity } from "../types/audit";

export function AuditView() {
    const [page, setPage] = useState(0);
    const [action, setAction] = useState<AuditAction | "">("");
    const [entityType, setEntityType] = useState<AuditEntity | "">("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [applied, setApplied] = useState({
        action: "" as AuditAction | "", entityType: "" as AuditEntity | "", from: "", to: "",
    });
    const [expanded, setExpanded] = useState<number | null>(null);

    const { data, isLoading, isError, isFetching } = useAuditLog({
        action: applied.action || undefined,
        entityType: applied.entityType || undefined,
        from: applied.from || undefined,
        to: applied.to || undefined,
        page,
        size: 20,
        sort: "createdAt,desc",
    });

    const applyFilters = () => {
        setApplied({ action, entityType, from, to });
        setPage(0);
        setExpanded(null);
    };

    const clearFilters = () => {
        setAction("");
        setEntityType("");
        setFrom("");
        setTo("");
        setApplied({ action: "", entityType: "", from: "", to: "" });
        setPage(0);
        setExpanded(null);
    };

    const totalPages = data?.totalPages ?? 0;

    return (
    <div>
        <div className="mb-6">
            <h1 className="text-2xl font-semibold">Dziennik zdarzeń</h1>
            <p className="text-sm text-gray-400 mt-1">Historia operacji w systemie</p>
        </div>

        <AuditFilters
            action={action} entityType={entityType} from={from} to={to}
            onAction={setAction} onEntity={setEntityType} onFrom={setFrom} onTo={setTo}
            onApply={applyFilters}
            onClear={clearFilters}
        />

        {isError && <p className="text-red-600 mb-4">Błąd ładowania dziennika.</p>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Akcja</th>
                <th className="px-5 py-3 font-medium">Obiekt</th>
                <th className="px-5 py-3 font-medium">Szczegóły</th>
                <th className="px-5 py-3 font-medium">Użytkownik</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Ładowanie…</td></tr>
                ) : (data?.content.length ?? 0) === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Brak zdarzeń</td></tr>
                ) : (
                data?.content.map((e) => (
                    <AuditRow
                    key={e.id}
                    entry={e}
                    isOpen={expanded === e.id}
                    onToggle={() => setExpanded(expanded === e.id ? null : e.id)}
                    />
                ))
                )}
            </tbody>
            </table>
        </div>

        {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-gray-500">
                Strona {page + 1} z {totalPages} · {data?.totalElements} zdarzeń
                {isFetching && " · odświeżanie…"}
            </span>
            <div className="flex gap-2">
                <button className="border rounded-lg px-3 py-1 disabled:opacity-40 cursor-pointer"
                disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Poprzednia</button>
                <button className="border rounded-lg px-3 py-1 disabled:opacity-40 cursor-pointer"
                disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Następna</button>
            </div>
            </div>
        )}
    </div>
    );
}