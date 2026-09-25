import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { supplierFormSchema, type SupplierFormValues } from "@/features/suppliers/schemas/supplierForm";
import { useCreateSupplier } from "@/features/suppliers/hooks/useSuppliers";
import type { SupplierRequest } from "@/features/suppliers/types/supplier";
import { ApiError } from "@/shared/services/apiClient";
import { labelCls, inputCls } from "@/shared/components/formStyles";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4";
const sectionTitleCls = "text-sm font-medium text-gray-500";

export function SupplierFormView() {
  const navigate = useNavigate();
  const createSupplier = useCreateSupplier();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: { country: "Polska" },
    mode: "onBlur",
  });

  const onSubmit = async (values: SupplierFormValues) => {
    setServerError(null);

    const body: SupplierRequest = {
      name: values.name,
      nip: values.nip,
      email: values.email,
      phone: values.phone,
      street: values.street,
      city: values.city,
      postalCode: values.postalCode,
      country: values.country || undefined,
    };

    try {
      const created = await createSupplier.mutateAsync(body);
      navigate(`/suppliers/${created.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.detail : "Błąd zapisu dostawcy");
    }
  };

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate("/suppliers")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
      >
        ← Wróć do listy
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Nowy dostawca</h1>
        <p className="text-sm text-gray-400 mt-1">Uzupełnij dane identyfikacyjne i adresowe dostawcy</p>
      </div>

      {serverError && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Dane podstawowe i kontaktowe</h2>
          <div>
            <label className={labelCls}>Nazwa</label>
            <input className={inputCls} {...register("name")} />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>NIP</label>
              <input className={inputCls} {...register("nip")} />
              {errors.nip && <p className="text-red-600 text-xs mt-1">{errors.nip.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Telefon</label>
              <input className={inputCls} {...register("phone")} />
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls}>E-mail</label>
            <input className={inputCls} type="email" {...register("email")} />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
          </div>
        </section>

        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Adres siedziby</h2>
          <div>
            <label className={labelCls}>Ulica i numer</label>
            <input className={inputCls} {...register("street")} />
            {errors.street && <p className="text-red-600 text-xs mt-1">{errors.street.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Kod pocztowy</label>
              <input className={inputCls} {...register("postalCode")} />
              {errors.postalCode && <p className="text-red-600 text-xs mt-1">{errors.postalCode.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Miasto</label>
              <input className={inputCls} {...register("city")} />
              {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Kraj</label>
              <input className={inputCls} {...register("country")} />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/suppliers")}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Zapisywanie…" : "Dodaj dostawcę"}
          </button>
        </div>
      </form>
    </div>
  );
}