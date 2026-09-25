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
import { SalesOrderItemRow } from "../components/SalesOrderItemRow";
import { labelCls, inputCls } from "@/shared/components/formStyles";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4";
const sectionTitleCls = "text-sm font-medium text-gray-500";

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

  // select adresu nieaktywny, dopóki nie wybrano klienta
  let addressSelectCls = inputCls;
  if (!customerId) {
    addressSelectCls = `${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`;
  }

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
    <div className="max-w-3xl">
      <button
        onClick={() => navigate("/sales-orders")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        ← Wróć do listy
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Nowe zamówienie</h1>
        <p className="text-sm text-gray-400 mt-1">Wybierz klienta, adres dostawy i dodaj pozycje</p>
      </div>

      {serverError && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Klient i dostawa</h2>
          <div>
            <label className={labelCls}>Klient</label>
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
            <label className={labelCls}>Adres dostawy</label>
            <select className={addressSelectCls} {...register("receiverAddressId")} disabled={!customerId}>
              <option value="" disabled>
                {customerId ? "wybierz adres" : "najpierw wybierz klienta"}
              </option>
              {addresses?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.street}, {a.postalCode} {a.city}
                </option>
              ))}
            </select>
            {errors.receiverAddressId && (
              <p className="text-red-600 text-xs mt-1">{errors.receiverAddressId.message}</p>
            )}
          </div>
        </section>

        <section className={cardCls}>
          <div className="flex items-center justify-between">
            <h2 className={sectionTitleCls}>Pozycje ({fields.length})</h2>
            <button type="button"
              onClick={() => append({ productId: "", quantity: 1 })}
              className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
              + Dodaj pozycję
            </button>
          </div>

          {typeof errors.items?.message === "string" && (
            <p className="text-red-600 text-xs">{errors.items.message}</p>
          )}

          <div className="flex gap-2 text-xs uppercase tracking-wide text-gray-400">
            <span className="w-6" />
            <span className="flex-1">Produkt</span>
            <span className="w-24">Ilość</span>
            <span className="w-9" />
          </div>

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
        </section>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate("/sales-orders")}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
            Anuluj
          </button>
          <button type="submit" disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
            {isSubmitting ? "Zapisywanie…" : "Utwórz zamówienie"}
          </button>
        </div>
      </form>
    </div>
  );
}