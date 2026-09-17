import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { warehouseFormSchema, type WarehouseFormValues } from "@/features/warehouses/schemas/warehouseForm";
import { useCreateWarehouse } from "@/features/warehouses/hooks/useWarehouses";
import type { WarehouseRequest } from "@/features/warehouses/types/warehouses";
import { ApiError } from "@/shared/services/apiClient";

const inputCls = "w-full border rounded px-3 py-2";

export function WarehouseFormView() {
  const navigate = useNavigate();
  const createWarehouse = useCreateWarehouse();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    mode: "onTouched",
    defaultValues: { country: "Polska" },
  });

  const onSubmit = async (values: WarehouseFormValues) => {
    setServerError(null);

    const body: WarehouseRequest = {
      name: values.name,
      phone: values.phone,
      street: values.street,
      city: values.city,
      postalCode: values.postalCode,
      country: values.country || undefined,
    };

    try {
      const created = await createWarehouse.mutateAsync(body);
      navigate(`/warehouses/${created.id}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.detail : "Błąd zapisu magazynu");
    }
  };

  return (
    <div className="max-w-xl">
      <button onClick={() => navigate("/warehouses")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
        ← Wróć do listy
      </button>

      <h1 className="text-2xl font-semibold mb-4">Nowy magazyn</h1>

      {serverError && <p className="text-red-600 text-sm mb-3">{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Nazwa</label>
          <input className={inputCls} {...register("name")} />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Telefon</label>
          <input className={inputCls} {...register("phone")} />
          {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
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
          <button type="button" onClick={() => navigate("/warehouses")}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
            Anuluj
          </button>
          <button type="submit" disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? "Zapisywanie…" : "Zapisz"}
          </button>
        </div>
      </form>
    </div>
  );
}