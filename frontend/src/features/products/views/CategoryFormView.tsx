import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { categoryFormSchema, type CategoryFormValues } from "@/features/products/schemas/categoryForm";
import { useCreateCategory } from "@/features/products/hooks/useProducts";
import type { CategoryRequest } from "@/features/products/types/catalog";
import { ApiError } from "@/shared/services/apiClient";
import { labelCls, inputCls } from "@/shared/components/formStyles";

const cardCls = "bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4";
const sectionTitleCls = "text-sm font-medium text-gray-500";

export function CategoryFormView() {
  const navigate = useNavigate();
  const createCategory = useCreateCategory();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    mode: "onBlur",
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
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
      >
        ← Wróć do listy
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Nowa kategoria</h1>
        <p className="text-sm text-gray-400 mt-1">Dodaj kategorię do kategoryzacji produktów w katalogu</p>
      </div>

      {serverError && (
        <div className="mb-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-700 text-sm">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className={cardCls}>
          <h2 className={sectionTitleCls}>Dane kategorii</h2>
          <div>
            <label className={labelCls}>Nazwa kategorii</label>
            <input className={inputCls} placeholder="np. Elektronika" {...register("name")} />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Zapisywanie…" : "Zapisz kategorię"}
          </button>
        </div>
      </form>
    </div>
  );
}