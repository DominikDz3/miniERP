import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { warehouseFormSchema, type WarehouseFormValues } from "@/features/warehouses/schemas/warehouseForm";
import { useCreateWarehouse } from "@/features/warehouses/hooks/useWarehouses";
import type { WarehouseRequest } from "@/features/warehouses/types/warehouses";
import { ApiError } from "@/shared/services/apiClient";
import { labelCls, inputCls } from "@/shared/components/formStyles";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4";
const sectionTitleCls = "text-sm font-medium text-gray-500";

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
    <div className="max-w-2xl">
      <button
        onClick={() => navigate("/warehouses")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
      >
        ← Wróć do listy
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Nowy magazyn</h1>
        <p className="text-sm text-gray-400 mt-1">Wprowadź dane lokalizacyjne i kontaktowe nowego magazynu</p>
      </div>

      {serverError && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Dane podstawowe</h2>
          <div>
            <label className={labelCls}>Nazwa magazynu</label>
            <input className={inputCls} placeholder="np. Magazyn Główny" {...register("name")} />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Telefon</label>
            <input className={inputCls} placeholder="np. +48 123 456 789" {...register("phone")} />
            {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
          </div>
        </section>

        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Adres lokalizacji</h2>
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
            onClick={() => navigate("/warehouses")}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Zapisywanie…" : "Utwórz magazyn"}
          </button>
        </div>
      </form>
    </div>
  );
}