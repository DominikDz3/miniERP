import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { supplierFormSchema, type SupplierFormValues } from "@/features/suppliers/schemas/supplierForm";
import { useCreateSupplier } from "@/features/suppliers/hooks/useSuppliers";
import type { SupplierRequest } from "@/features/suppliers/types/supplier";
import { ApiError } from "@/shared/services/apiClient";

const inputCls = "w-full border rounded px-3 py-2";

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
    <div className="max-w-xl">
      <button onClick={() => navigate("/suppliers")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        ← Wróć do listy
      </button>

      <h1 className="text-2xl font-semibold mb-4">Nowy dostawca</h1>

      {serverError && <p className="text-red-600 text-sm mb-3">{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Nazwa</label>
          <input className={inputCls} {...register("name")} />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-500 mb-1">NIP</label>
            <input className={inputCls} {...register("nip")} />
            {errors.nip && <p className="text-red-600 text-xs mt-1">{errors.nip.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Telefon</label>
            <input className={inputCls} {...register("phone")} />
            {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">E-mail</label>
          <input className={inputCls} {...register("email")} />
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Ulica</label>
          <input className={inputCls} {...register("street")} />
          {errors.street && <p className="text-red-600 text-xs mt-1">{errors.street.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Kod pocztowy</label>
            <input className={inputCls} {...register("postalCode")} />
            {errors.postalCode && <p className="text-red-600 text-xs mt-1">{errors.postalCode.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Miasto</label>
            <input className={inputCls} {...register("city")} />
            {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Kraj</label>
            <input className={inputCls} {...register("country")} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate("/suppliers")}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50 cursor-pointer">
            Anuluj
          </button>
          <button type="submit" disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
            {isSubmitting ? "Zapisywanie…" : "Zapisz"}
          </button>
        </div>
      </form>
    </div>
  );
}