import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { purchaseOrderFormSchema, type PurchaseOrderFormValues } from "../schemas/purchaseOrderForm";
import { useCreatePurchaseOrder } from "../hooks/usePurchaseOrders";
import { useActiveWarehouses } from "@/features/warehouses/hooks/useWarehouses";
import { SupplierAutocomplete } from "@/features/suppliers/components/SupplierAutocomplete";
import { PurchaseOrderItemRow } from "../components/PurchaseOrderItemRow";
import type { PurchaseOrderRequest } from "../types/purchase";
import { ApiError } from "@/shared/services/apiClient";

const inputCls = "w-full border rounded px-3 py-2";

export function PurchaseOrderFormView() {
  const navigate = useNavigate();
  const createOrder = useCreatePurchaseOrder();
  const { data: warehouses } = useActiveWarehouses();
  const [serverError, setServerError] = useState<string | null>(null);
  const [supplierName, setSupplierName] = useState("");

  const {
    register, handleSubmit, control, setValue,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: { supplierId: "", warehouseId: "", items: [{ productId: "", quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const supplierId = useWatch({ control, name: "supplierId" });
  const warehouseId = useWatch({ control, name: "warehouseId" });

  const onSubmit = async (values: PurchaseOrderFormValues) => {
    setServerError(null);
    const body: PurchaseOrderRequest = {
      supplierId: Number(values.supplierId),
      warehouseId: Number(values.warehouseId),
      items: values.items.map((it) => ({
        productId: Number(it.productId),
        quantity: it.quantity,
      })),
    };
    try {
      const created = await createOrder.mutateAsync(body);
      navigate(`/purchase-orders/${created.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.detail : "Błąd zapisu zamówienia");
    }
  };

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate("/purchase-orders")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        ← Wróć do listy
      </button>
      <h1 className="text-2xl font-semibold mb-4">Nowe zamówienie zakupu</h1>

      {serverError && <p className="text-red-600 text-sm mb-3">{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Dostawca</label>
          <SupplierAutocomplete
            value={supplierId ? Number(supplierId) : null}
            selectedName={supplierName}
            onSelect={(id, name) => {
              setValue("supplierId", String(id), { shouldValidate: true });
              setSupplierName(name);
            }}
            error={errors.supplierId?.message}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Magazyn docelowy</label>
          <select
            className={inputCls}
            {...register("warehouseId")}
            onChange={(e) => {
              setValue("warehouseId", e.target.value, { shouldValidate: true });
              // zmiana magazynu resetuje pozycje — produkty zaleza od magazynu
              setValue("items", [{ productId: "", quantity: 1 }]);
            }}
          >
            <option value="" disabled>wybierz</option>
            {warehouses?.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          {errors.warehouseId && <p className="text-red-600 text-xs mt-1">{errors.warehouseId.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-500">Pozycje</label>
            <button type="button"
              onClick={() => append({ productId: "", quantity: 1 })}
              disabled={!warehouseId}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-40 cursor-pointer">
              + Dodaj pozycję
            </button>
          </div>

          {typeof errors.items?.message === "string" && (
            <p className="text-red-600 text-xs mb-2">{errors.items.message}</p>
          )}

          {!warehouseId && (
            <p className="text-gray-400 text-sm">Najpierw wybierz magazyn.</p>
          )}

          {warehouseId && (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <PurchaseOrderItemRow
                  key={field.id}
                  index={index}
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  warehouseId={Number(warehouseId)}
                  onRemove={() => remove(index)}
                  canRemove={fields.length > 1}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate("/purchase-orders")}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50 cursor-pointer">
            Anuluj
          </button>
          <button type="submit" disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
            {isSubmitting ? "Zapisywanie…" : "Utwórz zamówienie"}
          </button>
        </div>
      </form>
    </div>
  );
}