import { useState, useEffect } from "react";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";

interface Props {
  value: number | null;
  selectedName: string;
  onSelect: (id: number, name: string) => void;
  error?: string;
}

const inputCls = "w-full border rounded px-3 py-2";

export function SupplierAutocomplete({ value, selectedName, onSelect, error }: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useSuppliers({
    search: debounced.length >= 1 ? debounced : undefined,
    active: true,
    page: 0,
    size: 10,
  });

  const canSearch = debounced.length >= 1;
  const results = canSearch ? (data?.content ?? []) : [];
  const showList = open && canSearch && !isFetching && results.length > 0;

  return (
    <div className="relative">
      <input
        className={inputCls}
        placeholder={value ? selectedName : "Szukaj dostawcy…"}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}

      {showList && (
        <ul className="absolute z-10 w-full bg-white border rounded mt-1 shadow max-h-60 overflow-auto">
          {results.map((s) => (
            <li
              key={s.id}
              onMouseDown={() => {
                onSelect(s.id, s.name);
                setQuery("");
                setOpen(false);
              }}
              className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
            >
              {s.name}{s.nip ? ` · NIP ${s.nip}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}