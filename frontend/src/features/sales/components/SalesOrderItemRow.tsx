import { useState } from "react";
import type { UseFormSetValue, FieldErrors } from "react-hook-form";
import type { SalesOrderFormValues } from "../schemas/salesOrderForm";
import { ProductAutocomplete } from "../../products/components/ProductAutocomplete";

interface Props {
  index: number;
  register: any;                    
  setValue: UseFormSetValue<SalesOrderFormValues>;
  errors: FieldErrors<SalesOrderFormValues>;
  onRemove: () => void;
  canRemove: boolean;
}

const inputCls = "w-full border rounded px-3 py-2";

export function SalesOrderItemRow({ index, register, setValue, errors, onRemove, canRemove }: Props) {
  const [productLabel, setProductLabel] = useState("");

  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1">
        <ProductAutocomplete
          selectedLabel={productLabel}
          onSelect={(id, label) => {
            setValue(`items.${index}.productId`, String(id), { shouldValidate: true });
            setProductLabel(label);
          }}
          error={errors.items?.[index]?.productId?.message}
        />
      </div>
      <div className="w-24">
        <input type="number" className={inputCls} placeholder="ilość"
          {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
        {errors.items?.[index]?.quantity && (
          <p className="text-red-600 text-xs mt-1">{errors.items[index]?.quantity?.message}</p>
        )}
      </div>
      <button type="button" onClick={onRemove} disabled={!canRemove}
        className="px-3 py-2 text-red-600 hover:text-red-800 disabled:opacity-30 cursor-pointer">
        ✕
      </button>
    </div>
  );
}