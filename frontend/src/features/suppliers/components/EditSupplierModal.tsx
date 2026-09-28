import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/Modal";
import { labelCls, inputCls } from "@/shared/components/formStyles";
import { supplierFormSchema, type SupplierFormValues } from "@/features/suppliers/schemas/supplierForm";
import { useUpdateSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { ApiError } from "@/shared/services/apiClient";
import type { SupplierRequest, SupplierResponse } from "@/features/suppliers/types/supplier";

interface Props {
  supplier: SupplierResponse;
  onClose: () => void;
}

export function EditSupplierModal({ supplier, onClose }: Props) {
  const updateSupplier = useUpdateSuppliers();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: supplier.name,
      nip: supplier.nip,
      email: supplier.email,
      phone: supplier.phone,
      street: supplier.street,
      city: supplier.city,
      postalCode: supplier.postalCode,
      country: supplier.country,
    },
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
      await updateSupplier.mutateAsync({ id: supplier.id, body });
      onClose();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.detail : "Błąd zapisu dostawcy");
    }
  };

  return (
    <Modal open title={`Edycja: ${supplier.name}`} onClose={onClose}>
      {serverError && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelCls}>Nazwa</label>
          <input className={inputCls} {...register("name")} />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>NIP</label>
            <input className={inputCls} maxLength={10} {...register("nip")} />
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

        <div>
          <label className={labelCls}>Ulica i numer</label>
          <input className={inputCls} {...register("street")} />
          {errors.street && <p className="text-red-600 text-xs mt-1">{errors.street.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
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

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">Anuluj</button>
          <button type="submit" disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
            {isSubmitting ? "Zapisywanie…" : "Zapisz zmiany"}
          </button>
        </div>
      </form>
    </Modal>
  );
}