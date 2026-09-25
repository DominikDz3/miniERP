import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { useState } from "react";
import { customerFormSchema, type CustomerFormValues } from "@/features/customers/schemas/customerForm";
import { useCreateCustomer } from "@/features/customers/hooks/useCustomers";
import type { CustomerRequest } from "@/features/customers/types/customer";
import { ApiError } from "@/shared/services/apiClient";
import { labelCls, inputCls } from "@/shared/components/formStyles";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4";
const sectionTitleCls = "text-sm font-medium text-gray-500";
const errorCls = "text-red-600 text-xs mt-1";

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
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        ← Wróć do listy
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Nowy klient</h1>
        <p className="text-sm text-gray-400 mt-1">Dane kontrahenta oraz adresy płatnika i odbiorcy</p>
      </div>

      {serverError && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Dane</h2>
          <div>
            <label className={labelCls}>Nazwa</label>
            <input className={inputCls} {...register("name")} />
            {errors.name && <p className={errorCls}>{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>NIP</label>
              <input className={inputCls} maxLength={10} {...register("nip")} />
              {errAny.nip && <p className={errorCls}>{errAny.nip.message}</p>}
            </div>
            <div>
              <label className={labelCls}>E-mail</label>
              <input className={inputCls} {...register("email")} />
              {errors.email && <p className={errorCls}>{errors.email.message}</p>}
            </div>
          </div>
        </section>

        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Adres płatnika</h2>
          <div>
            <label className={labelCls}>Ulica</label>
            <input className={inputCls} {...register("payer.street")} />
            {errAny.payer?.street && <p className={errorCls}>{errAny.payer.street.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Miasto</label>
              <input className={inputCls} {...register("payer.city")} />
              {errAny.payer?.city && <p className={errorCls}>{errAny.payer.city.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Kod pocztowy</label>
              <input className={inputCls} {...register("payer.postalCode")} />
              {errAny.payer?.postalCode && <p className={errorCls}>{errAny.payer.postalCode.message}</p>}
            </div>
          </div>
          <div>
            <label className={labelCls}>Kraj</label>
            <input className={inputCls} placeholder="Polska" {...register("payer.country")} />
          </div>
        </section>

        <section className={cardCls}>
          <div className="flex items-center justify-between">
            <h2 className={sectionTitleCls}>Adres odbiorcy</h2>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" {...register("sameAsPayer")} />
              Taki sam jak adres płatnika
            </label>
          </div>

          {sameAsPayer ? (
            <div>
              <label className={labelCls}>Telefon odbiorcy</label>
              <input className={inputCls} {...register("receiverPhone")} />
              {errAny.receiverPhone && <p className={errorCls}>{errAny.receiverPhone.message}</p>}
            </div>
          ) : (
            <>
              <div>
                <label className={labelCls}>Ulica</label>
                <input className={inputCls} {...register("receiver.street")} />
                {errAny.receiver?.street && <p className={errorCls}>{errAny.receiver.street.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Miasto</label>
                  <input className={inputCls} {...register("receiver.city")} />
                  {errAny.receiver?.city && <p className={errorCls}>{errAny.receiver.city.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Kod pocztowy</label>
                  <input className={inputCls} {...register("receiver.postalCode")} />
                  {errAny.receiver?.postalCode && <p className={errorCls}>{errAny.receiver.postalCode.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Kraj</label>
                  <input className={inputCls} placeholder="Polska" {...register("receiver.country")} />
                </div>
                <div>
                  <label className={labelCls}>Telefon odbiorcy</label>
                  <input className={inputCls} {...register("receiver.phone")} />
                  {errAny.receiver?.phone && <p className={errorCls}>{errAny.receiver.phone.message}</p>}
                </div>
              </div>
            </>
          )}
        </section>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
            {isSubmitting ? "Zapisywanie…" : "Zapisz klienta"}
          </button>
        </div>
      </form>
    </div>
  );
}