import { useState, useEffect } from "react";
import { useCustomers } from "@/features/customers/hooks/useCustomers";

interface Props {
  value: number | null;
  selectedName: string;
  onSelect: (id: number, name: string) => void;
  error?: string;
}

const inputCls = "w-full border rounded px-3 py-2";

export function CustomerAutocomplete({ value, selectedName, onSelect, error }: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useCustomers({
    search: debounced.length >= 2 ? debounced : undefined,
    active: true,
    page: 0,
    size: 10,
  });

  const canSearch = debounced.length >= 2;
  const results = canSearch ? (data?.content ?? []) : [];
  const showList = open && canSearch && !isFetching && results.length > 0;

  return (
    <div className="relative">
      <input
        className={inputCls}
        placeholder={value ? selectedName : "Szukaj klienta (min. 2 znaki)…"}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}

      {showList && (
        <ul className="absolute z-10 w-full bg-white border rounded mt-1 shadow max-h-60 overflow-auto">
          {results.map((c) => (
            <li
              key={c.id}
              onMouseDown={() => {
                onSelect(c.id, c.name);
                setQuery("");
                setOpen(false);
              }}
              className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
            >
              {c.name}{c.nip ? ` · NIP ${c.nip}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}