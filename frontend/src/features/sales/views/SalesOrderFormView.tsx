import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { salesOrderFormSchema, type SalesOrderFormValues } from "../schemas/salesOrderForm";
import { useCreateSalesOrder } from "../hooks/useSalesOrders";
import { useReceiverAddresses } from "@/features/customers/hooks/useCustomers";
import { CustomerAutocomplete } from "../../customers/components/CustomerAutocomplete";
import type { SalesOrderRequest } from "../types/sales";
import { ApiError } from "@/shared/services/apiClient";
import { SalesOrderItemRow } from "../components/SalesOrderItemRow"

const inputCls = "w-full border rounded px-3 py-2";

export function SalesOrderFormView() {
  const navigate = useNavigate();
  const createOrder = useCreateSalesOrder();
  const [serverError, setServerError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");

  const {
    register, handleSubmit, control, setValue,
    formState: { errors, isSubmitting },
  } = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderFormSchema),
    defaultValues: { customerId: "", receiverAddressId: "", items: [{ productId: "", quantity: 1 }] },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const customerId = useWatch({ control, name: "customerId" });
  const { data: addresses } = useReceiverAddresses(customerId ? Number(customerId) : null);

  const onSubmit = async (values: SalesOrderFormValues) => {
    setServerError(null);
    const body: SalesOrderRequest = {
      customerId: Number(values.customerId),
      receiverAddressId: Number(values.receiverAddressId),
      items: values.items.map((it) => ({
        productId: Number(it.productId),
        quantity: it.quantity,
      })),
    };
    try {
      const created = await createOrder.mutateAsync(body);
      navigate(`/sales-orders/${created.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.detail : "Błąd zapisu zamówienia");
    }
  };

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate("/sales-orders")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        ← Wróć do listy
      </button>
      <h1 className="text-2xl font-semibold mb-4">Nowe zamówienie</h1>

      {serverError && <p className="text-red-600 text-sm mb-3">{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Klient</label>
          <CustomerAutocomplete
            value={customerId ? Number(customerId) : null}
            selectedName={customerName}
            onSelect={(id, name) => {
              setValue("customerId", String(id), { shouldValidate: true });
              setValue("receiverAddressId", "");
              setCustomerName(name);
            }}
            error={errors.customerId?.message}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Adres dostawy</label>
         <select
            className={`${inputCls} ${!customerId ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
            {...register("receiverAddressId")}
            disabled={!customerId}>
            <option value="" disabled>wybierz</option>
            {addresses?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.street}, {a.postalCode} {a.city}
              </option>
            ))}
          </select>
          {errors.receiverAddressId && <p className="text-red-600 text-xs mt-1">{errors.receiverAddressId.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-500">Pozycje</label>
            <button type="button"
              onClick={() => append({ productId: "", quantity: 1 })}
              className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
              + Dodaj pozycję
            </button>
          </div>

          {typeof errors.items?.message === "string" && (
            <p className="text-red-600 text-xs mb-2">{errors.items.message}</p>
          )}

            <div className="space-y-2">
            {fields.map((field, index) => (
              <SalesOrderItemRow
                key={field.id}
                index={index}
                register={register}
                setValue={setValue}
                errors={errors}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate("/sales-orders")}
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