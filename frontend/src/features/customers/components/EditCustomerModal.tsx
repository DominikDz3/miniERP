import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Modal } from "@/shared/components/Modal";
import { labelCls, inputCls } from "@/shared/components/formStyles";
import { customerEditSchema, type CustomerEditValues } from "@/features/customers/schemas/customerForm";
import { useUpdateCustomer } from "@/features/customers/hooks/useCustomers";
import { ApiError } from "@/shared/services/apiClient";
import type { CustomerResponse, CustomerUpdateRequest } from "@/features/customers/types/customer";

interface Props {
  customer: CustomerResponse;
  onClose: () => void;
}

export function EditCustomerModal({ customer, onClose }: Props) {
  const updateCustomer = useUpdateCustomer();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CustomerEditValues>({
    resolver: zodResolver(customerEditSchema),
    defaultValues: {
      name: customer.name,
      nip: customer.nip ?? "",
      email: customer.email,
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: CustomerEditValues) => {
    setServerError(null);
    const body: CustomerUpdateRequest = {
      name: values.name,
      nip: values.nip || undefined,
      email: values.email,
    };
    try {
      await updateCustomer.mutateAsync({ id: customer.id, body });
      onClose();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.detail : "Błąd zapisu klienta");
    }
  };

  return (
    <Modal open title={`Edycja: ${customer.name}`} onClose={onClose}>
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
            <label className={labelCls}>E-mail</label>
            <input className={inputCls} {...register("email")} />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
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