import { useState, useEffect } from "react";
import { useProducts } from "@/features/products/hooks/useProducts";

interface Props {
  selectedLabel: string;             
  onSelect: (id: number, label: string) => void;
  error?: string;
}

const inputCls = "w-full border rounded px-3 py-2";

export function ProductAutocomplete({ selectedLabel, onSelect, error }: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useProducts({
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
        placeholder={selectedLabel || "Szukaj produktu (SKU / nazwa)…"}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}

      {showList && (
        <ul className="absolute z-10 w-full bg-white border rounded mt-1 shadow max-h-60 overflow-auto">
          {results.map((p) => (
            <li
              key={p.id}
              onMouseDown={() => {
                onSelect(p.id, `${p.sku} — ${p.name}`);
                setQuery("");
                setOpen(false);
              }}
              className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
            >
              {p.sku} — {p.name}
              <span className="text-gray-400"> ({p.warehouseName}, stan {p.stock})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}