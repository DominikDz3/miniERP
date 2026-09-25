import { useState, useEffect } from "react";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { inputCls } from "@/shared/components/formStyles";

interface Props {
  value: number | null;
  selectedName: string;
  onSelect: (id: number, name: string) => void;
  error?: string;
}

export function CustomerAutocomplete({ value, selectedName, onSelect, error }: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);

  // Synchronizacja wartości inputa z wybranym klientem
  useEffect(() => {
    if (value && selectedName) {
      setQuery(selectedName);
    } else if (!value) {
      setQuery("");
    }
  }, [value, selectedName]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const canSearch = debounced.length >= 2 && debounced !== selectedName;

  const { data, isFetching } = useCustomers({
    search: canSearch ? debounced : undefined,
    active: true,
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
          className={`${inputCls} pr-8 text-gray-800 ${value ? "font-medium" : ""}`}
          placeholder="Szukaj klienta (min. 2 znaki)…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => {
              setOpen(false);
              // Gdy kliknięto poza input, przywracamy wybraną wcześniej nazwę klienta
              if (value && selectedName) {
                setQuery(selectedName);
              }
            }, 180);
          }}
        />

        {value ? (
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
          {results.map((c) => (
            <li
              key={c.id}
              onMouseDown={() => {
                onSelect(c.id, c.name);
                setQuery(c.name);
                setOpen(false);
              }}
              className="px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer text-gray-700"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{c.name}</span>
                {c.nip ? <span className="font-mono text-xs text-gray-400">NIP {c.nip}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}