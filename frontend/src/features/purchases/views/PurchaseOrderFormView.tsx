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
import { labelCls, inputCls } from "@/shared/components/formStyles";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4";
const sectionTitleCls = "text-sm font-medium text-gray-500";

export function PurchaseOrderFormView() {
  const navigate = useNavigate();
  const createOrder = useCreatePurchaseOrder();
  const { data: warehouses } = useActiveWarehouses();
  const [serverError, setServerError] = useState<string | null>(null);
  const [supplierName, setSupplierName] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: { supplierId: "", warehouseId: "", items: [{ productId: "", quantity: 1 }] },
    mode: "onBlur",
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
    <div className="max-w-3xl">
      <button
        onClick={() => navigate("/purchase-orders")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
      >
        ← Wróć do listy
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Nowe zamówienie zakupu</h1>
        <p className="text-sm text-gray-400 mt-1">Wybierz dostawcę, magazyn docelowy i dodaj pozycje</p>
      </div>

      {serverError && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Dostawca i magazyn</h2>
          <div>
            <label className={labelCls}>Dostawca</label>
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
            <label className={labelCls}>Magazyn docelowy</label>
            <select
              className={inputCls}
              {...register("warehouseId")}
              onChange={(e) => {
                setValue("warehouseId", e.target.value, { shouldValidate: true });
                // zmiana magazynu resetuje pozycje — produkty zależą od magazynu
                setValue("items", [{ productId: "", quantity: 1 }]);
              }}
            >
              <option value="" disabled>wybierz magazyn</option>
              {warehouses?.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            {errors.warehouseId && (
              <p className="text-red-600 text-xs mt-1">{errors.warehouseId.message}</p>
            )}
          </div>
        </section>

        <section className={cardCls}>
          <div className="flex items-center justify-between">
            <h2 className={sectionTitleCls}>Pozycje ({fields.length})</h2>
            <button
              type="button"
              onClick={() => append({ productId: "", quantity: 1 })}
              disabled={!warehouseId}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-40 cursor-pointer"
            >
              + Dodaj pozycję
            </button>
          </div>

          {typeof errors.items?.message === "string" && (
            <p className="text-red-600 text-xs">{errors.items.message}</p>
          )}

          {!warehouseId ? (
            <p className="text-gray-400 text-sm">Najpierw wybierz magazyn, aby móc dodać pozycje.</p>
          ) : (
            <>
              <div className="flex gap-2 text-xs uppercase tracking-wide text-gray-400">
                <span className="w-6" />
                <span className="flex-1">Produkt</span>
                <span className="w-24">Ilość</span>
                <span className="w-9" />
              </div>

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
            </>
          )}
        </section>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/purchase-orders")}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Zapisywanie…" : "Utwórz zamówienie"}
          </button>
        </div>
      </form>
    </div>
  );
}