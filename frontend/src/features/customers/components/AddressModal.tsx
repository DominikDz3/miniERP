import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Modal } from "@/shared/components/Modal";
import { labelCls, inputCls } from "@/shared/components/formStyles";
import { addressFormSchema, type AddressFormValues } from "@/features/customers/schemas/addressForm";
import {
  useAddPayer, useAddReceiver, useUpdatePayer, useUpdateReceiver,
} from "@/features/customers/hooks/useCustomers";
import { ApiError } from "@/shared/services/apiClient";
import type { AddressRequest, AddressResponse } from "@/features/customers/types/customer";

interface Props {
  customerId: number;
  type: "payer" | "receiver";
  address: AddressResponse | null;
  onClose: () => void;
}

export function AddressModal({ customerId, type, address, onClose }: Props) {
  const isReceiver = type === "receiver";
  const isEdit = address !== null;

  const addPayer = useAddPayer();
  const addReceiver = useAddReceiver();
  const updatePayer = useUpdatePayer();
  const updateReceiver = useUpdateReceiver();
  const [serverError, setServerError] = useState<string | null>(null);

  let defaultValues: AddressFormValues | undefined = undefined;
  if (address) {
    defaultValues = {
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone ?? "",
    };
  }

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema(isReceiver)),
    defaultValues,
    mode: "onTouched",
  });

  let title = "Nowy adres płatnika";
  if (isEdit && isReceiver) title = "Edycja adresu odbiorcy";
  if (isEdit && !isReceiver) title = "Edycja adresu płatnika";
  if (!isEdit && isReceiver) title = "Nowy adres odbiorcy";

  const onSubmit = async (values: AddressFormValues) => {
    setServerError(null);
    const body: AddressRequest = { ...values };
    try {
      if (address && isReceiver) {
        await updateReceiver.mutateAsync({ id: customerId, addressId: address.id, body });
      } else if (address) {
        await updatePayer.mutateAsync({ id: customerId, addressId: address.id, body });
      } else if (isReceiver) {
        await addReceiver.mutateAsync({ id: customerId, body });
      } else {
        await addPayer.mutateAsync({ id: customerId, body });
      }
      onClose();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.detail : "Błąd zapisu adresu");
    }
  };

  return (
    <Modal open title={title} onClose={onClose}>
      {serverError && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelCls}>Ulica</label>
          <input className={inputCls} {...register("street")} />
          {errors.street && <p className="text-red-600 text-xs mt-1">{errors.street.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Miasto</label>
            <input className={inputCls} {...register("city")} />
            {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Kod pocztowy</label>
            <input className={inputCls} {...register("postalCode")} />
            {errors.postalCode && <p className="text-red-600 text-xs mt-1">{errors.postalCode.message}</p>}
          </div>
        </div>
        <div>
          <label className={labelCls}>Kraj</label>
          <input className={inputCls} placeholder="Polska" {...register("country")} />
        </div>
        {isReceiver && (
          <div>
            <label className={labelCls}>Telefon</label>
            <input className={inputCls} {...register("phone")} />
            {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">Anuluj</button>
          <button type="submit" disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
            {isSubmitting ? "Zapisywanie…" : isEdit ? "Zapisz zmiany" : "Dodaj"}
          </button>
        </div>
      </form>
    </Modal>
  );
}