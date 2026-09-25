import { useState } from "react";
import type { UseFormSetValue, FieldErrors } from "react-hook-form";
import type { SalesOrderFormValues } from "../schemas/salesOrderForm";
import { ProductAutocomplete } from "../../products/components/ProductAutocomplete";
import { inputCls } from "@/shared/components/formStyles";

interface Props {
  index: number;
  register: any;
  setValue: UseFormSetValue<SalesOrderFormValues>;
  errors: FieldErrors<SalesOrderFormValues>;
  onRemove: () => void;
  canRemove: boolean;
}

export function SalesOrderItemRow({ index, register, setValue, errors, onRemove, canRemove }: Props) {
  const [productLabel, setProductLabel] = useState("");

  return (
    <div className="flex gap-2 items-start">
      <span className="w-6 pt-2 text-xs text-gray-400 text-right">{index + 1}.</span>
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
        <input type="number" min={1} className={inputCls} placeholder="ilość"
          {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
        {errors.items?.[index]?.quantity && (
          <p className="text-red-600 text-xs mt-1">{errors.items[index]?.quantity?.message}</p>
        )}
      </div>
      <button type="button" onClick={onRemove} disabled={!canRemove}
        title="Usuń pozycję"
        className="px-2.5 py-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer">
        ✕
      </button>
    </div>
  );
}