import { useState, useEffect } from "react";
import { useProducts } from "@/features/products/hooks/useProducts";
import { inputCls } from "@/shared/components/formStyles";

interface Props {
  selectedLabel: string;
  warehouseId?: number | null;
  onSelect: (id: number, label: string) => void;
  error?: string;
}

export function ProductAutocomplete({ selectedLabel, warehouseId, onSelect, error }: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);

  // Synchronizacja wartości w inpucie z aktualnie wybranym produktem
  useEffect(() => {
    if (selectedLabel) {
      setQuery(selectedLabel);
    } else {
      setQuery("");
    }
  }, [selectedLabel]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const isAlreadySelected = Boolean(selectedLabel && query === selectedLabel);
  const canSearch = debounced.length >= 1 && !isAlreadySelected;

  const { data, isFetching } = useProducts({
    search: canSearch ? debounced : undefined,
    active: true,
    warehouseId: warehouseId ?? undefined,
    page: 0,
    size: 10,
  });

  const results = canSearch ? (data?.content ?? []) : [];
  const showList = open && canSearch && !isFetching && results.length > 0;

  const handleClear = () => {
    onSelect(0, "");
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          className={`${inputCls} pr-8 text-gray-800 ${selectedLabel ? "font-medium" : ""}`}
          placeholder="Szukaj produktu (SKU / nazwa)…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => {
              setOpen(false);
              // W razie kliknięcia obok bez wybrania nowej pozycji, przywracamy poprzedni produkt
              if (selectedLabel) {
                setQuery(selectedLabel);
              }
            }, 180);
          }}
        />

        {selectedLabel ? (
          <button
            type="button"
            onClick={handleClear}
            tabIndex={-1}
            title="Usuń wybór"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer transition-colors"
          >
            ✕
          </button>
        ) : null}
      </div>

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}

      {showList && (
        <ul className="absolute z-10 w-full bg-white border border-gray-100 rounded-xl mt-1 shadow-lg max-h-60 overflow-auto divide-y divide-gray-50">
          {results.map((p) => (
            <li
              key={p.id}
              onMouseDown={() => {
                const label = `${p.sku} — ${p.name}`;
                onSelect(p.id, label);
                setQuery(label);
                setOpen(false);
              }}
              className="px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer text-gray-700"
            >
              <div className="flex items-center justify-between">
                <span>
                  <strong className="font-mono text-xs font-semibold text-gray-500 mr-1.5">[{p.sku}]</strong>
                  <span className="font-medium text-gray-800">{p.name}</span>
                </span>
                <span className="text-xs text-gray-400">
                  {p.warehouseName} · stan: <strong className="text-gray-600 font-semibold">{p.stock}</strong>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}