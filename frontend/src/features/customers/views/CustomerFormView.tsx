import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { useState } from "react";
import { customerFormSchema, type CustomerFormValues } from "@/features/customers/schemas/customerForm";
import { useCreateCustomer } from "@/features/customers/hooks/useCustomers";
import type { CustomerRequest } from "@/features/customers/types/customer";
import { ApiError } from "@/shared/services/apiClient";

const inputCls = "w-full border rounded px-3 py-2";

export function CustomerFormView() {
  const navigate = useNavigate();
  const createCustomer = useCreateCustomer();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register, handleSubmit, watch, formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: { sameAsPayer: true },
    mode: "onTouched",
  });

  const errAny = errors as any;
  const sameAsPayer = watch("sameAsPayer");

  const onSubmit = async (values: CustomerFormValues) => {
    setServerError(null);

    const receiverAddress = values.sameAsPayer
      ? { ...values.payer, phone: values.receiverPhone }
      : values.receiver;

    const body: CustomerRequest = {
      name: values.name,
      nip: values.nip || undefined,
      email: values.email,
      payerAddresses: [values.payer],
      receiverAddresses: [receiverAddress],
    };

    try {
      const created = await createCustomer.mutateAsync(body);
      navigate(`/customers/${created.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.detail : "Błąd zapisu klienta");
    }
  };

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate("/customers")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        ← Wróć do listy
      </button>

      <h1 className="text-2xl font-semibold mb-6">Nowy klient</h1>

      {serverError && <p className="text-red-600 mb-4">{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="bg-white rounded-lg shadow p-5 space-y-4">
          <h2 className="font-medium text-gray-600">Dane</h2>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Nazwa</label>
            <input className={inputCls} {...register("name")} />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">NIP</label>
            <input className={inputCls} {...register("nip")} />
            {errAny.nip && <p className="text-red-600 text-xs mt-1">{errAny.nip.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">E-mail</label>
            <input className={inputCls} {...register("email")} />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-5 space-y-4">
          <h2 className="font-medium text-gray-600">Adres płatnika</h2>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Ulica</label>
            <input className={inputCls} {...register("payer.street")} />
            {errAny.payer?.street && <p className="text-red-600 text-xs mt-1">{errAny.payer.street.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Miasto</label>
              <input className={inputCls} {...register("payer.city")} />
              {errAny.payer?.city && <p className="text-red-600 text-xs mt-1">{errAny.payer.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Kod pocztowy</label>
              <input className={inputCls} {...register("payer.postalCode")} />
              {errAny.payer?.postalCode && <p className="text-red-600 text-xs mt-1">{errAny.payer.postalCode.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Kraj</label>
            <input className={inputCls} placeholder="Polska" {...register("payer.country")} />
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-5 space-y-4">
          <h2 className="font-medium text-gray-600">Adres odbiorcy</h2>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("sameAsPayer")} />
            Taki sam jak adres płatnika
          </label>

          {sameAsPayer ? (
            <div>
              <label className="block text-sm text-gray-500 mb-1">Telefon odbiorcy</label>
              <input className={inputCls} {...register("receiverPhone")} />
              {errAny.receiverPhone && <p className="text-red-600 text-xs mt-1">{errAny.receiverPhone.message}</p>}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Ulica</label>
                <input className={inputCls} {...register("receiver.street")} />
                {errAny.receiver?.street && <p className="text-red-600 text-xs mt-1">{errAny.receiver.street.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Miasto</label>
                  <input className={inputCls} {...register("receiver.city")} />
                  {errAny.receiver?.city && <p className="text-red-600 text-xs mt-1">{errAny.receiver.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Kod pocztowy</label>
                  <input className={inputCls} {...register("receiver.postalCode")} />
                  {errAny.receiver?.postalCode && <p className="text-red-600 text-xs mt-1">{errAny.receiver.postalCode.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Kraj</label>
                <input className={inputCls} placeholder="Polska" {...register("receiver.country")} />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Telefon odbiorcy</label>
                <input className={inputCls} {...register("receiver.phone")} />
                {errAny.receiver?.phone && <p className="text-red-600 text-xs mt-1">{errAny.receiver.phone.message}</p>}
              </div>
            </>
          )}
        </section>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Zapisywanie…" : "Zapisz klienta"}
          </button>
        </div>
      </form>
    </div>
  );
}