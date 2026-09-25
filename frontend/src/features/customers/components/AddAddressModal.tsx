import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Modal } from "@/shared/components/Modal";
import { labelCls, inputCls } from "@/shared/components/formStyles";
import { addressFormSchema, type AddressFormValues } from "@/features/customers/schemas/addressForm";
import { useAddPayer, useAddReceiver } from "@/features/customers/hooks/useCustomers";
import { ApiError } from "@/shared/services/apiClient";
import type { AddressRequest } from "@/features/customers/types/customer";

interface Props {
  open: boolean;
  customerId: number;
  type: "payer" | "receiver";
  onClose: () => void;
}

export function AddAddressModal({ open, customerId, type, onClose }: Props) {
  const isReceiver = type === "receiver";
  const addPayer = useAddPayer();
  const addReceiver = useAddReceiver();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema(isReceiver)),
    mode: "onTouched",
  });

  const close = () => { reset(); setServerError(null); onClose(); };

  const onSubmit = async (values: AddressFormValues) => {
    setServerError(null);
    const body: AddressRequest = { ...values };
    try {
      if (isReceiver) await addReceiver.mutateAsync({ id: customerId, body });
      else await addPayer.mutateAsync({ id: customerId, body });
      close();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.detail : "Błąd zapisu adresu");
    }
  };

  return (
    <Modal open={open} title={isReceiver ? "Nowy adres odbiorcy" : "Nowy adres płatnika"} onClose={close}>
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
          <button type="button" onClick={close}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">Anuluj</button>
          <button type="submit" disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
            {isSubmitting ? "Zapisywanie…" : "Dodaj"}
          </button>
        </div>
      </form>
    </Modal>
  );
}