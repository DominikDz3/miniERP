import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { categoryFormSchema, type CategoryFormValues } from "@/features/products/schemas/categoryForm";
import { useCreateCategory } from "@/features/products/hooks/useProducts";
import type { CategoryRequest } from "@/features/products/types/catalog";
import { ApiError } from "@/shared/services/apiClient";

const inputCls = "w-full border rounded px-3 py-2";

export function CategoryFormView() {
  const navigate = useNavigate();
  const createCategory = useCreateCategory();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema)
  });

  const onSubmit = async (values: CategoryFormValues) => {
    setServerError(null);

    const body: CategoryRequest = {
        name: values.name,
    };

    try {
      await createCategory.mutateAsync(body);
      navigate(`/products`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.detail : "Błąd zapisu kategorii");
    }
  };

  return (
    <div className="max-w-xl">
        <button
            onClick={() => navigate("/products")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer">
            ← Wróć do listy
        </button>
      <h1 className="text-2xl font-semibold mb-4">Nowa kategoria</h1>

      {serverError && <p className="text-red-600 text-sm mb-3">{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Nazwa</label>
          <input className={inputCls} {...register("name")} />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate("/products")}
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